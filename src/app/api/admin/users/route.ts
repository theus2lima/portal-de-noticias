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

// GET - Listar usuários
export async function GET(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const supabase = await createClient()
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, name, role, is_active, created_at, updated_at')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Erro ao buscar usuários:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo usuário
export async function POST(request: NextRequest) {
  const user = await verifyAuth(request)
  if (!user) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { email, password, name, role = 'admin' } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, senha e nome são obrigatórios' },
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

    // Verificar se email já existe
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email já está em uso' },
        { status: 400 }
      )
    }

    // Hash da senha
    const saltRounds = 10
    const password_hash = await bcrypt.hash(password, saltRounds)

    // Inserir novo usuário
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        name,
        role,
        is_active: true
      }])
      .select('id, email, name, role, is_active, created_at')
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ user: newUser }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
