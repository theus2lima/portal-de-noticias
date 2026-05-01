// src/app/api/auth/logout/route.ts
// Encerra a sessão: limpa o cookie httpOnly E invalida sessões no banco.
// Após logout, requireAuth() rejeita tokens antigos deste usuário (sessions_invalidated_at).

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'
import { auditLog, getClientIp } from '@/lib/audit'

function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

export async function POST(request: NextRequest) {
  // Registrar quem está saindo antes de limpar o cookie
  const auth = await requireAuth()

  if (!(auth instanceof NextResponse)) {
    // Setar sessions_invalidated_at = NOW() — invalida todos os tokens emitidos antes deste momento
    try {
      const supabase = getServiceRoleClient()
      await supabase
        .from('users')
        .update({ sessions_invalidated_at: new Date().toISOString() })
        .eq('id', auth.userId)
    } catch (err) {
      // Logar o erro mas não bloquear o logout — o cookie ainda será limpo
      console.error('[logout] Erro ao invalidar sessão no banco:', err)
    }

    await auditLog({
      userEmail: auth.email,
      action: 'LOGOUT',
      resourceType: 'session',
      ip: getClientIp(request),
      metadata: { userId: auth.userId },
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
