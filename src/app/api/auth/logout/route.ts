// src/app/api/auth/logout/route.ts
// Encerra a sessão limpando o cookie httpOnly

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { auditLog, getClientIp } from '@/lib/audit'

export async function POST(request: NextRequest) {
  // Registrar quem está saindo antes de limpar o cookie
  const auth = await requireAuth()
  if (!(auth instanceof NextResponse)) {
    await auditLog({
      userEmail: auth.email,
      action: 'LOGOUT',
      resourceType: 'session',
      ip: getClientIp(request),
    })
  }

  const response = NextResponse.json({ success: true })
  response.cookies.set('admin_token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}
