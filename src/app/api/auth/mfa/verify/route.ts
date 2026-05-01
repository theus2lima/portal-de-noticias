// src/app/api/auth/mfa/verify/route.ts
// Segundo passo do login — verifica o código TOTP e emite o cookie de sessão.
// Proteção anti-replay: código TOTP usado é registrado no Redis por 90s,
// impedindo reutilização do mesmo código na mesma janela de tempo.

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { Redis } from '@upstash/redis'
import speakeasy from 'speakeasy'
import jwt from 'jsonwebtoken'
import { auditLog, getClientIp } from '@/lib/audit'
import { getJwtSecret } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
)

// Redis para proteção anti-replay (só instancia se Upstash estiver configurado)
const redis = process.env.UPSTASH_REDIS_REST_URL ? Redis.fromEnv() : null

// TTL anti-replay: window: 1 aceita ±30s → código válido por até 90s
const TOTP_REPLAY_TTL_SECONDS = 90

export async function POST(request: NextRequest) {
  const { code, mfaTempToken } = await request.json()

  if (!code || !mfaTempToken) {
    return NextResponse.json({ error: 'Código e token são obrigatórios.' }, { status: 400 })
  }

  // Verificar token temporário de MFA
  let pendingPayload: { type: string; userId: string; email: string; role: string }
  try {
    pendingPayload = jwt.verify(mfaTempToken, getJwtSecret()) as typeof pendingPayload
    if (pendingPayload.type !== 'mfa_pending') throw new Error('Token inválido')
  } catch {
    return NextResponse.json(
      { error: 'Sessão expirada. Faça login novamente.' },
      { status: 401 }
    )
  }

  // Buscar segredo TOTP do usuário
  const { data: user, error } = await supabase
    .from('users')
    .select('id, email, role, name, totp_secret')
    .eq('id', pendingPayload.userId)
    .eq('is_active', true)
    .single()

  if (error || !user?.totp_secret) {
    return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 401 })
  }

  // ── Proteção anti-replay ──────────────────────────────────────────────────
  // Verificar se este código já foi usado recentemente por este usuário
  if (redis) {
    const replayKey = `totp_replay:${user.id}:${code}`
    const alreadyUsed = await redis.get(replayKey)
    if (alreadyUsed) {
      return NextResponse.json(
        { error: 'Código já utilizado. Aguarde o próximo código TOTP.' },
        { status: 401 }
      )
    }
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Verificar código TOTP
  const isValid = speakeasy.totp.verify({
    secret: user.totp_secret,
    encoding: 'base32',
    token: code,
    window: 1,
  })

  if (!isValid) {
    return NextResponse.json(
      { error: 'Código inválido ou expirado. Tente novamente.' },
      { status: 401 }
    )
  }

  // ── Registrar código como usado no Redis (anti-replay) ────────────────────
  if (redis) {
    const replayKey = `totp_replay:${user.id}:${code}`
    // SET com EX — expira após TOTP_REPLAY_TTL_SECONDS (90s)
    await redis.set(replayKey, '1', { ex: TOTP_REPLAY_TTL_SECONDS })
  }
  // ─────────────────────────────────────────────────────────────────────────

  // Código correto — emitir sessão completa
  const sessionToken = jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    getJwtSecret(),
    { expiresIn: '8h' }
  )

  const response = NextResponse.json({
    success: true,
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
  })

  response.cookies.set('admin_token', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
    path: '/',
  })

  await auditLog({
    userEmail: user.email,
    action: 'LOGIN',
    resourceType: 'session',
    ip: getClientIp(request),
    metadata: { method: 'mfa_totp' },
  })

  return response
}
