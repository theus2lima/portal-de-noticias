// src/app/api/admin/mfa/disable/route.ts
// Desativa o MFA limpando o segredo do banco

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { auditLog, getClientIp } from '@/lib/audit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { code } = await request.json()

  if (!code) {
    return NextResponse.json({ error: 'Código de verificação é obrigatório.' }, { status: 400 })
  }

  // Buscar o segredo atual
  const { data: user } = await supabase
    .from('users')
    .select('totp_secret')
    .eq('email', auth.email)
    .single()

  if (!user?.totp_secret) {
    return NextResponse.json({ error: 'MFA não está ativo.' }, { status: 400 })
  }

  // Verificar código antes de desativar
  const isValid = speakeasy.totp.verify({
    secret: user.totp_secret,
    encoding: 'base32',
    token: code,
    window: 1,
  })

  if (!isValid) {
    return NextResponse.json({ error: 'Código inválido.' }, { status: 400 })
  }

  // Limpar o segredo
  const { error } = await supabase
    .from('users')
    .update({ totp_secret: null })
    .eq('email', auth.email)

  if (error) {
    return NextResponse.json({ error: 'Erro ao desativar MFA.' }, { status: 500 })
  }

  await auditLog({
    userEmail: auth.email,
    action: 'DISABLE_MFA',
    resourceType: 'mfa',
    ip: getClientIp(request),
  })

  return NextResponse.json({ success: true, message: 'MFA desativado.' })
}
