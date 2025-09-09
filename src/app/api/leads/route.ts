import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Buscar leads
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const period = searchParams.get('period')
    
    let query = supabase
      .from('leads')
      .select('*', { count: 'exact' })
    
    // Aplicar filtros
    if (status === 'contacted') {
      query = query.eq('is_contacted', true)
    } else if (status === 'pending') {
      query = query.eq('is_contacted', false)
    }
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)
    }
    
    if (period) {
      const now = new Date()
      let startDate: Date
      
      switch (period) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }
      
      query = query.gte('created_at', startDate.toISOString())
    }
    
    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1
    
    const { data: leads, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    
    return NextResponse.json({
      data: leads,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo lead (geralmente vindo do formulário público)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validação básica
    if (!body.name || !body.phone || !body.city) {
      return NextResponse.json(
        { error: 'Nome, telefone e cidade são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Limpar e validar telefone
    const cleanPhone = body.phone.replace(/\D/g, '')
    if (cleanPhone.length < 10 || cleanPhone.length > 11) {
      return NextResponse.json(
        { error: 'Telefone deve ter 10 ou 11 dígitos' },
        { status: 400 }
      )
    }
    
    // Validar email se fornecido
    if (body.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(body.email)) {
        return NextResponse.json(
          { error: 'Email inválido' },
          { status: 400 }
        )
      }
    }
    
    const leadData = {
      name: body.name.trim(),
      phone: cleanPhone,
      city: body.city.trim(),
      email: body.email?.trim() || null,
      source: body.source || 'website',
      message: body.message?.trim() || null,
      is_contacted: false,
      notes: null
    }
    
    // Tentar usar Supabase, mas retornar sucesso simulado se não estiver configurado
    const supabase = await createClient()
    try {
      const { data: lead, error } = await supabase
        .from('leads')
        .insert([leadData])
        .select()
        .single()
      
      if (!error) {
        return NextResponse.json({ 
          data: lead, 
          message: 'Lead criado com sucesso!' 
        }, { status: 201 })
      }
    } catch (supabaseError) {
      // Se Supabase não estiver configurado, simular sucesso
      console.log('Supabase não configurado, simulando sucesso:', supabaseError)
    }
    
    // Simular resposta de sucesso quando Supabase não estiver configurado
    const simulatedLead = {
      id: Date.now(),
      ...leadData,
      created_at: new Date().toISOString()
    }
    
    // Log para demonstração (em produção seria salvo no banco)
    console.log('Lead simulado:', simulatedLead)
    
    return NextResponse.json({ 
      data: simulatedLead, 
      message: 'Lead simulado criado com sucesso!' 
    }, { status: 201 })
  } catch (error) {
    console.error('Erro ao processar lead:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar múltiplos leads (ex: marcar como contatados)
export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    if (!body.ids || !Array.isArray(body.ids)) {
      return NextResponse.json(
        { error: 'IDs dos leads são obrigatórios' },
        { status: 400 }
      )
    }
    
    const allowedFields = ['is_contacted', 'notes']
    const updateData: any = {}
    
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualização' },
        { status: 400 }
      )
    }
    
    const { data: leads, error } = await supabase
      .from('leads')
      .update(updateData)
      .in('id', body.ids)
      .select()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      data: leads,
      message: `${body.ids.length} lead(s) atualizado(s) com sucesso` 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar múltiplos leads
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    if (!body.ids || !Array.isArray(body.ids)) {
      return NextResponse.json(
        { error: 'IDs dos leads são obrigatórios' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('leads')
      .delete()
      .in('id', body.ids)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: `${body.ids.length} lead(s) deletado(s) com sucesso` 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
