import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { createClient } from '@/utils/supabase/server'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

// Middleware para verificar autenticação
async function verifyAuth(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, JWT_SECRET) as any

    const supabase = await createClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, name, role')
      .eq('id', decoded.userId)
      .eq('is_active', true)
      .single()

    if (error || !user || user.role !== 'admin') {
      return null
    }

    return user
  } catch {
    return null
  }
}

// PUT - Atualizar usuário
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const { email, name, role } = await request.json()

    if (!email || !name || !role) {
      return NextResponse.json(
        { error: 'Email, nome e role são obrigatórios' },
        { status: 400 }
      )
    }

    // Validar role
    if (!['admin', 'editor', 'author'].includes(role)) {
      return NextResponse.json(
        { error: 'Role inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar se email já existe em outro usuário
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .neq('id', userId)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso por outro usuário' },
        { status: 400 }
      )
    }

    // Atualizar usuário
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        email,
        name,
        role,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select('id, email, name, role, is_active, created_at, updated_at')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ user: updatedUser })

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Remover usuário
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Não permitir que o usuário delete a si mesmo
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'Não é possível deletar sua própria conta' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Verificar se o usuário existe
    const { data: existingUser, error: fetchError } = await supabase
      .from('users')
      .select('id, name')
      .eq('id', userId)
      .single()

    if (fetchError || !existingUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Deletar usuário
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)

    if (error) {
      throw error
    }

    return NextResponse.json({ 
      message: `Usuário ${existingUser.name} removido com sucesso` 
    })

  } catch (error) {
    console.error('Erro ao deletar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Buscar usuário específico
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    const { data: foundUser, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, created_at, updated_at')
      .eq('id', userId)
      .single()

    if (error || !foundUser) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({ user: foundUser })

  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
