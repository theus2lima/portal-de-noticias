import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// POST - Criar novo lead de landing page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validações básicas
    if (!body.landing_page_id || !body.name || !body.phone) {
      return NextResponse.json(
        { error: 'Landing page ID, nome e telefone são obrigatórios' },
        { status: 400 }
      )
    }

    // Verificar se a landing page existe
    const { data: landingPage } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('id', body.landing_page_id)
      .single()

    if (!landingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // Preparar dados do lead
    const leadData = {
      landing_page_id: body.landing_page_id,
      name: body.name.trim(),
      phone: body.phone.trim(),
      email: body.email?.trim() || null,
      city: body.city?.trim() || null,
      message: body.message?.trim() || null,
      source: body.source || 'landing_page',
      utm_source: body.utm_source || null,
      utm_medium: body.utm_medium || null,
      utm_campaign: body.utm_campaign || null,
      is_contacted: false
    }

    // Inserir lead
    const { data, error } = await supabase
      .from('landing_page_leads')
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar lead:', error)
      return NextResponse.json(
        { error: 'Erro ao salvar lead' },
        { status: 500 }
      )
    }

    // Incrementar contador de leads na landing page
    await supabase
      .from('landing_pages')
      .update({ 
        leads_count: supabase.raw('leads_count + 1') 
      })
      .eq('id', body.landing_page_id)

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro na API de leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// GET - Listar leads de landing pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const landingPageId = searchParams.get('landing_page_id')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // 'contacted', 'not_contacted', 'all'

    let query = supabase
      .from('landing_page_leads')
      .select(`
        *,
        landing_pages (
          title,
          slug
        )
      `, { count: 'exact' })

    // Filtro por landing page
    if (landingPageId) {
      query = query.eq('landing_page_id', landingPageId)
    }

    // Filtro por status
    if (status === 'contacted') {
      query = query.eq('is_contacted', true)
    } else if (status === 'not_contacted') {
      query = query.eq('is_contacted', false)
    }

    // Filtro por busca
    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%,email.ilike.%${search}%,city.ilike.%${search}%`)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar leads:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar leads' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('Erro na API de leads:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
