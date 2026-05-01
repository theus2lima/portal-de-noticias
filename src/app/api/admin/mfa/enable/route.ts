// src/app/api/admin/mfa/enable/route.ts
// Confirma o código TOTP e salva o segredo no banco — ativa o MFA

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'
import * as OTPLib from 'otplib'
const authenticator = OTPLib.authenticator
import { auditLog, getClientIp } from '@/lib/audit'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { code, secret } = await request.json()

  if (!code || !secret) {
    return NextResponse.json({ error: 'Código e segredo são obrigatórios.' }, { status: 400 })
  }

  // Verificar se o código está correto antes de salvar
  const isValid = authenticator.verify({ token: code, secret })

  if (!isValid) {
    return NextResponse.json(
      { error: 'Código inválido. Verifique se o relógio do celular está sincronizado.' },
      { status: 400 }
    )
  }

  // Salvar o segredo no banco
  const { error } = await supabase
    .from('users')
    .update({ totp_secret: secret })
    .eq('email', auth.email)

  if (error) {
    return NextResponse.json({ error: 'Erro ao salvar configuração de MFA.' }, { status: 500 })
  }

  await auditLog({
    userEmail: auth.email,
    action: 'LOGIN',
    resourceType: 'mfa',
    ip: getClientIp(request),
    metadata: { event: 'mfa_enabled' },
  })

  return NextResponse.json({ success: true, message: 'MFA ativado com sucesso!' })
}
