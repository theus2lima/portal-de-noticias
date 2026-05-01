// src/lib/auth.ts
// Utilitário de autenticação — lê cookie httpOnly, valida JWT e verifica estado do usuário no DB
// Usado em todas as API routes protegidas

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export interface AdminPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

/**
 * Retorna JWT_SECRET validado em runtime.
 * Chamado dentro das funções (não no nível do módulo) para evitar
 * erros durante o build do Next.js, quando as envs ainda não estão disponíveis.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (!secret) throw new Error('JWT_SECRET não configurado nas variáveis de ambiente')
  return secret
}

/**
 * Cliente Supabase com service_role para verificações de estado de sessão.
 * NÃO exposto no bundle — usado apenas no servidor (API routes).
 * Instanciado lazy para evitar erros de build.
 */
function getServiceRoleClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Supabase service role não configurado')
  }
  return createClient(url, key, {
    auth: { persistSession: false },
  })
}

/**
 * Verifica se a requisição está autenticada lendo o cookie httpOnly.
 *
 * Realiza verificação em duas etapas:
 * 1. Valida assinatura JWT (falha rápida, sem I/O)
 * 2. Verifica estado real do usuário no DB via service_role (fail-closed):
 *    - is_active = true
 *    - iat do token >= sessions_invalidated_at (logout invalidou sessões antigas)
 *
 * FAIL-CLOSED: qualquer erro de I/O retorna 401 — nunca assume válido.
 *
 * USO em qualquer route.ts:
 *   const auth = await requireAuth()
 *   if (auth instanceof NextResponse) return auth
 *   // auth.email, auth.role, auth.userId
 */
export async function requireAuth(): Promise<AdminPayload | NextResponse> {
  const cookieStore = cookies()
  const token = cookieStore.get('admin_token')?.value

  if (!token) {
    return NextResponse.json(
      { error: 'Não autorizado. Faça login para continuar.' },
      { status: 401 }
    )
  }

  // Passo 1: validar assinatura JWT
  let decoded: AdminPayload
  try {
    decoded = jwt.verify(token, getJwtSecret()) as AdminPayload
  } catch {
    return NextResponse.json(
      { error: 'Sessão inválida ou expirada. Faça login novamente.' },
      { status: 401 }
    )
  }

  // Passo 2: verificar estado do usuário no banco (fail-closed)
  try {
    const supabase = getServiceRoleClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, is_active, sessions_invalidated_at')
      .eq('id', decoded.userId)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado. Faça login novamente.' },
        { status: 401 }
      )
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'Conta desativada. Contate o administrador.' },
        { status: 403 }
      )
    }

    // Verificar se o token foi emitido antes da invalidação de sessão (logout)
    if (user.sessions_invalidated_at && decoded.iat) {
      const invalidatedAt = new Date(user.sessions_invalidated_at).getTime() / 1000
      if (decoded.iat < invalidatedAt) {
        return NextResponse.json(
          { error: 'Sessão encerrada. Faça login novamente.' },
          { status: 401 }
        )
      }
    }
  } catch {
    // Fail-closed: qualquer erro de I/O rejeita a requisição
    return NextResponse.json(
      { error: 'Erro ao verificar sessão. Tente novamente.' },
      { status: 401 }
    )
  }

  return decoded
}
