import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/lib/auth'
import { auditLog, getClientIp } from '@/lib/audit'

// GET - Buscar banner por ID
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: 'Banner não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar banner' }, { status: 500 })
  }
}

// PUT - Atualizar banner (requer autenticação)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('banners')
      .update({ ...body, updated_at: new Date().toISOString() })
      .eq('id', params.id)
      .select()
      .single()

    if (error) throw error

    // 📋 Audit log
    await auditLog({
      userEmail: auth.email,
      action: 'UPDATE_BANNER',
      resourceType: 'banner',
      resourceId: params.id,
      ip: getClientIp(request),
    })

    return NextResponse.json({ data })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao atualizar banner' }, { status: 500 })
  }
}

// DELETE - Deletar banner (requer autenticação)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = await createClient()
    const { error } = await supabase
      .from('banners')
      .delete()
      .eq('id', params.id)

    if (error) throw error

    // 📋 Audit log
    await auditLog({
      userEmail: auth.email,
      action: 'DELETE_BANNER',
      resourceType: 'banner',
      resourceId: params.id,
      ip: getClientIp(request),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao deletar banner' }, { status: 500 })
  }
}
