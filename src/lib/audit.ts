// src/lib/audit.ts
// Registra ações administrativas na tabela audit_logs do Supabase
// Chamado de dentro das API routes após operações sensíveis

import { createClient } from '@supabase/supabase-js'

// Usar service role para garantir que o log sempre grave,
// independente de RLS ou permissões do usuário
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'CREATE_ARTICLE'
  | 'UPDATE_ARTICLE'
  | 'DELETE_ARTICLE'
  | 'CREATE_BANNER'
  | 'UPDATE_BANNER'
  | 'DELETE_BANNER'
  | 'UPLOAD_FILE'
  | 'REWRITE_AI'
  | 'DISABLE_MFA'
  | 'CREATE_USER'
  | 'DELETE_USER'
  | 'UPDATE_USER'
  | 'CHANGE_ROLE'
  | 'UPDATE_SETTINGS'
  | 'UPDATE_WHATSAPP_SETTINGS'
  | 'CREATE_LANDING_PAGE'
  | 'UPDATE_LANDING_PAGE'
  | 'DELETE_LANDING_PAGE'

export interface AuditOptions {
  userEmail: string
  action: AuditAction
  resourceType: string
  resourceId?: string
  ip?: string | null
  metadata?: Record<string, unknown>
}

/**
 * Registra uma ação no audit log.
 * Falhas silenciosas — nunca bloqueia a operação principal.
 */
export async function auditLog(options: AuditOptions): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_email: options.userEmail,
      action: options.action,
      resource_type: options.resourceType,
      resource_id: options.resourceId ?? null,
      ip_address: options.ip ?? null,
      metadata: options.metadata ?? null,
    })
  } catch (err) {
    // Log silencioso — nunca deixar falha no audit quebrar a operação
    console.error('[audit] Falha ao registrar log:', err)
  }
}

/**
 * Extrai o IP real da requisição considerando proxies (Vercel/CDN)
 */
export function getClientIp(request: Request): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    'unknown'
  )
}
