import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Listar landing pages
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') // 'active', 'inactive', 'all'

    let query = supabase
      .from('landing_pages')
      .select('*', { count: 'exact' })

    // Filtro por status
    if (status === 'active') {
      query = query.eq('is_active', true)
    } else if (status === 'inactive') {
      query = query.eq('is_active', false)
    }

    // Filtro por busca
    if (search) {
      query = query.or(`title.ilike.%${search}%,hero_title.ilike.%${search}%,slug.ilike.%${search}%`)
    }

    // Paginação
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .range(from, to)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar landing pages:', error)
      return NextResponse.json(
        { error: 'Erro ao buscar landing pages' },
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
    console.error('Erro na API de landing pages:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar nova landing page
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validações básicas
    if (!body.title || !body.slug || !body.hero_title) {
      return NextResponse.json(
        { error: 'Título, slug e título do hero são obrigatórios' },
        { status: 400 }
      )
    }

    // Gerar slug se não fornecido
    if (!body.slug) {
      body.slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
        .trim()
    }

    // Verificar se o slug já existe
    const { data: existingPage } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('slug', body.slug)
      .single()

    if (existingPage) {
      return NextResponse.json(
        { error: 'Já existe uma landing page com este slug' },
        { status: 400 }
      )
    }

    // Preparar dados para inserção
    const landingPageData = {
      title: body.title,
      slug: body.slug,
      subtitle: body.subtitle || null,
      description: body.description || null,
      template: body.template || 'default',
      primary_color: body.primary_color || '#1E3A8A',
      secondary_color: body.secondary_color || '#3B82F6',
      hero_title: body.hero_title,
      hero_subtitle: body.hero_subtitle || null,
      hero_description: body.hero_description || null,
      hero_image: body.hero_image || null,
      hero_cta_text: body.hero_cta_text || 'Entre em Contato',
      about_title: body.about_title || null,
      about_content: body.about_content || null,
      about_image: body.about_image || null,
      services_title: body.services_title || 'Nossos Serviços',
      services: body.services || [],
      testimonials_title: body.testimonials_title || 'Depoimentos',
      testimonials: body.testimonials || [],
      contact_title: body.contact_title || 'Entre em Contato',
      contact_description: body.contact_description || null,
      contact_phone: body.contact_phone || null,
      contact_email: body.contact_email || null,
      contact_address: body.contact_address || null,
      contact_whatsapp: body.contact_whatsapp || null,
      social_facebook: body.social_facebook || null,
      social_instagram: body.social_instagram || null,
      social_linkedin: body.social_linkedin || null,
      social_twitter: body.social_twitter || null,
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.description,
      meta_keywords: body.meta_keywords || null,
      og_image: body.og_image || null,
      is_active: body.is_active !== undefined ? body.is_active : true,
      show_header: body.show_header !== undefined ? body.show_header : true,
      show_footer: body.show_footer !== undefined ? body.show_footer : true,
      custom_css: body.custom_css || null,
      custom_js: body.custom_js || null,
    }

    const { data, error } = await supabase
      .from('landing_pages')
      .insert(landingPageData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar landing page:', error)
      return NextResponse.json(
        { error: 'Erro ao criar landing page' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Erro na API de criação de landing page:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
