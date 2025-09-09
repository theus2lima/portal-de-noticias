import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { createClient } from '@/utils/supabase/server'

// Configurar runtime para edge (opcional, mas otimiza performance)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7) // Remove 'Bearer '

    // Verificar e decodificar JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Buscar dados atualizados do usuário
    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role, created_at, is_active')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (error || !user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 401 }
      )
    }

    // Verificar se ainda é admin
    if (user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado' },
        { status: 403 }
      )
    }

    return NextResponse.json({ user })

  } catch (error) {
    console.error('Erro na verificação do token:', error)
    return NextResponse.json(
      { error: 'Token inválido' },
      { status: 401 }
    )
  }
}
