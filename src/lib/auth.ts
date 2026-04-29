// src/lib/auth.ts
// Utilitário de autenticação — lê cookie httpOnly e valida JWT
// Usado em todas as API routes protegidas

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { NextResponse } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export interface AdminPayload {
  userId: string
  email: string
  role: string
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
    const decoded = jwt.verify(token, JWT_SECRET) as AdminPayload
    return decoded
  } catch {
    return NextResponse.json(
      { error: 'Sessão inválida ou expirada. Faça login novamente.' },
      { status: 401 }
    )
  }
}
