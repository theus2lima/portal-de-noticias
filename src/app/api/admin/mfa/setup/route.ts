// src/app/api/admin/mfa/setup/route.ts
// Gera um segredo TOTP e retorna o QR code para escanear no autenticador
// O segredo ainda NÃO é salvo — só depois de confirmar com o código

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'
const otplibModule = require('otplib') as any // eslint-disable-line
const authenticator = otplibModule.authenticator as {
  generateSecret(): string
  keyuri(email: string, service: string, secret: string): string
}
import QRCode from 'qrcode'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  // Verificar se já tem MFA ativo
  const { data: user } = await supabase
    .from('users')
    .select('totp_secret')
    .eq('email', auth.email)
    .single()

  if (user?.totp_secret) {
    return NextResponse.json({ error: 'MFA já está ativo. Desative primeiro.' }, { status: 400 })
  }

  // Gerar segredo novo
  const secret = authenticator.generateSecret()
  const appName = 'Radar Noroeste PR'
  const otpauthUrl = authenticator.keyuri(auth.email, appName, secret)

  // Gerar QR code em base64
  const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl)

  return NextResponse.json({
    secret,
    qrCode: qrCodeDataUrl,
    manualEntry: secret, // Para quem não conseguir escanear
  })
}
