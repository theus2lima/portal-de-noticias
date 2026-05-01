// src/app/api/auth/mfa/verify/route.ts
// Segundo passo do login — verifica o código TOTP e emite o cookie de sessão

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import speakeasy from 'speakeasy'
import jwt from 'jsonwebtoken'
import { auditLog, getClientIp } from '@/lib/audit'
import { getJwtSecret } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)


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
