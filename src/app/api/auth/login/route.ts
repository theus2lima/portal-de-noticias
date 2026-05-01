import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@supabase/supabase-js'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { auditLog, getClientIp } from '@/lib/audit'
import { getJwtSecret } from '@/lib/auth'

// Rate limit: 5 tentativas por IP a cada 15 minutos
// Só ativa se UPSTASH_REDIS_REST_URL estiver configurado
const ratelimit =
  process.env.UPSTASH_REDIS_REST_URL
    ? new Ratelimit({
        redis: Redis.fromEnv(),
        limiter: Ratelimit.slidingWindow(5, '15 m'),
        prefix: 'login_limit',
      })
    : null

// Cliente com service_role para autenticação:
// A tabela users tem RLS bloqueando leitura anônima (inclusive password_hash e totp_secret).
// O login precisa de service_role — nunca exposto no bundle JS pois está em API route (server-only).
function getAuthClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  // Verificar rate limit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  let remainingAttempts: number | null = null

  if (ratelimit) {
    const { success: rateLimitOk, reset, remaining } = await ratelimit.limit(ip)
    if (!rateLimitOk) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Tente novamente em ${Math.ceil(retryAfter / 60)} minuto(s).`, retryAfter },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }
    remainingAttempts = remaining
  }

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Buscar usuário com service_role (RLS bloqueia anon na tabela users)
    const supabase = getAuthClient()

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      await auditLog({
        userEmail: email,
        action: 'LOGIN_FAILED',
        resourceType: 'session',
        ip,
        metadata: { reason: 'user_not_found' },
      })
      return NextResponse.json(
        { error: 'Credenciais inválidas', remaining: remainingAttempts },
        { status: 401 }
      )
    }

    // Verificar se o usuário tem permissão de admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Apenas administradores podem fazer login.' },
        { status: 403 }
      )
    }

    // Verificar senha via bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password_hash)

    if (!isValidPassword) {
      await auditLog({
        userEmail: email,
        action: 'LOGIN_FAILED',
        resourceType: 'session',
        ip,
        metadata: { reason: 'invalid_password' },
      })
      return NextResponse.json(
        { error: 'Credenciais inválidas', remaining: remainingAttempts },
        { status: 401 }
      )
    }

    // 🔐 MFA: se o usuário tem totp_secret, exigir segundo fator
    if (user.totp_secret) {
      // Emitir token temporário de MFA (5 minutos, sem cookie de sessão)
      const mfaTempToken = jwt.sign(
        { type: 'mfa_pending', userId: user.id, email: user.email, role: user.role },
        getJwtSecret(),
        { expiresIn: '5m' }
      )
      return NextResponse.json({ mfaRequired: true, mfaTempToken })
    }

    // Sem MFA — emitir sessão completa normalmente
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      getJwtSecret(),
      { expiresIn: '8h' }
    )

    const { password_hash, totp_secret, ...userWithoutSecrets } = user

    const response = NextResponse.json({
      user: userWithoutSecrets,
    })

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
      path: '/',
    })

    // 📋 Audit log
    await auditLog({
      userEmail: user.email,
      action: 'LOGIN',
      resourceType: 'session',
      ip: getClientIp(request),
      metadata: { role: user.role },
    })

    return response

  } catch (error) {
    console.error('Erro no login:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
