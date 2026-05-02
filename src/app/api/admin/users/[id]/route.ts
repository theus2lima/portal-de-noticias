import { NextRequest, NextResponse } from 'next/server'
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

// PUT - Atualizar usuário
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const ip = getClientIp(request)

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

    const supabase = getServiceRoleClient()

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

    // Detectar se houve mudança de role
    const action = updatedUser.role !== auth.role ? 'CHANGE_ROLE' : 'UPDATE_USER'
    await auditLog({
      userEmail: auth.email,
      action,
      resourceType: 'user',
      resourceId: userId,
      ip,
      metadata: { updatedEmail: email, role },
    })

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
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth
  const ip = getClientIp(request)

  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    // Não permitir que o usuário delete a si mesmo
    if (userId === auth.userId) {
      return NextResponse.json(
        { error: 'Não é possível deletar sua própria conta' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()

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

    await auditLog({
      userEmail: auth.email,
      action: 'DELETE_USER',
      resourceType: 'user',
      resourceId: userId,
      ip,
      metadata: { deletedName: existingUser.name },
    })

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
export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const userId = params.id
    
    if (!userId) {
      return NextResponse.json(
        { error: 'ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const supabase = getServiceRoleClient()
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
