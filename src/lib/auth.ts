// src/lib/auth.ts
// Utilitário de autenticação — lê cookie httpOnly e valida JWT
// Usado em todas as API routes protegidas

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export interface AdminPayload {
  userId: string
  email: string
  role: string
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
 * Verifica se a requisição está autenticada lendo o cookie httpOnly.
 * Retorna o payload do JWT se válido, ou um NextResponse 401 se não.
 *
 * USO em qualquer route.ts:
 *   const auth = await requireAuth()
 *   if (auth instanceof NextResponse) return auth
 *   // auth.email, auth.role, etc.
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

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as AdminPayload
    return decoded
  } catch {
    return NextResponse.json(
      { error: 'Sessão inválida ou expirada. Faça login novamente.' },
      { status: 401 }
    )
  }
}
