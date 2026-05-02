import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'
import { auditLog, getClientIp } from '@/lib/audit'

// Usa service_role pois a tabela users tem RLS bloqueando leitura anônima
function getServiceRoleClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )
}

// GET - Listar usuários
export async function GET(_request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = getServiceRoleClient()
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
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const ip = getClientIp(request)

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

    const supabase = getServiceRoleClient()

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

    await auditLog({
      userEmail: auth.email,
      action: 'CREATE_USER',
      resourceType: 'user',
      resourceId: newUser.id,
      ip,
      metadata: { createdEmail: email, role },
    })

    return NextResponse.json({ user: newUser }, { status: 201 })

  } catch (error) {
    console.error('Erro ao criar usuário:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
