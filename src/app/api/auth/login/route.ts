import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@/utils/supabase/server'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { auditLog, getClientIp } from '@/lib/audit'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('JWT_SECRET não configurado nas variáveis de ambiente')

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

export async function POST(request: NextRequest) {
  // Verificar rate limit
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'

  if (ratelimit) {
    const { success: rateLimitOk, reset } = await ratelimit.limit(ip)
    if (!rateLimitOk) {
      const retryAfter = Math.ceil((reset - Date.now()) / 1000)
      return NextResponse.json(
        { error: `Muitas tentativas. Aguarde ${Math.ceil(retryAfter / 60)} minutos.` },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }
  }

  try {
    const { email, password } = await request.json()
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email e senha são obrigatórios' },
        { status: 400 }
      )
    }

    // Criar cliente Supabase
    const supabase = await createClient()

    // Buscar usuário no banco de dados
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .eq('is_active', true)
      .single()
    
    if (error || !user) {
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
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
      return NextResponse.json(
        { error: 'Credenciais inválidas' },
        { status: 401 }
      )
    }

    // 🔐 MFA: se o usuário tem totp_secret, exigir segundo fator
    if (user.totp_secret) {
      // Emitir token temporário de MFA (5 minutos, sem cookie de sessão)
      const mfaTempToken = jwt.sign(
        { type: 'mfa_pending', userId: user.id, email: user.email, role: user.role },
        JWT_SECRET,
        { expiresIn: '5m' }
      )
      return NextResponse.json({ mfaRequired: true, mfaTempToken })
    }

    // Sem MFA — emitir sessão completa normalmente
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '8h' }
    )

    const { password_hash, ...userWithoutPassword } = user

    const response = NextResponse.json({
      user: userWithoutPassword,
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
