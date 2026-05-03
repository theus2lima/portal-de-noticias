// src/app/api/news-sources/route.ts
// CRUD para fontes RSS customizadas
// 🔐 Todos os endpoints exigem autenticação de admin

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'

// Usa service role key para ignorar RLS e ter acesso completo
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET — lista todas as fontes
export async function GET(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const isActive = searchParams.get('active')
  const type = searchParams.get('type')

  let query = supabase
    .from('news_sources')
    .select('id, name, url, type, description, is_active, crawl_interval, last_crawled, created_at')
    .order('name')

  if (isActive !== null) query = query.eq('is_active', isActive === 'true')
  if (type) query = query.eq('type', type)

  const { data, error } = await query

  if (error) {
    // Tabela não existe ainda — retorna lista vazia em vez de 500
    if (error.code === '42P01') {
      return NextResponse.json({ success: true, data: [], hint: 'Execute o SQL de setup no Supabase.' })
    }
    console.error('news-sources GET error:', error)
    return NextResponse.json({ success: false, error: 'Erro ao buscar fontes' }, { status: 500 })
  }

  return NextResponse.json({ success: true, data: data || [] })
}

// POST — cria nova fonte
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { name, url, type, description, crawl_interval, is_active } = body

  if (!name || !url) {
    return NextResponse.json({ success: false, error: 'Nome e URL são obrigatórios' }, { status: 400 })
  }

  if (type && !['rss', 'scraping'].includes(type)) {
    return NextResponse.json({ success: false, error: 'Tipo deve ser "rss" ou "scraping"' }, { status: 400 })
  }

  try { new URL(url) } catch {
    return NextResponse.json({ success: false, error: 'URL inválida' }, { status: 400 })
  }

  // Checa duplicata
  const { data: existing } = await supabase
    .from('news_sources')
    .select('id')
    .eq('url', url)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: false, error: 'Já existe uma fonte com esta URL' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('news_sources')
    .insert({ name, url, type: type || 'rss', description: description || null, crawl_interval: crawl_interval || 1, is_active: is_active !== false })
    .select()
    .single()

  if (error) {
    if (error.code === '42P01') {
      return NextResponse.json({ success: false, error: 'Tabela news_sources não existe. Execute o SQL de setup no Supabase.' }, { status: 500 })
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true, data, message: 'Fonte criada com sucesso!' })
}

// PUT — atualiza fonte
export async function PUT(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const body = await request.json()
  const { id, name, url, type, description, crawl_interval, is_active } = body

  if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 })

  const updates: Record<string, any> = {}
  if (name !== undefined) updates.name = name
  if (url !== undefined) updates.url = url
  if (type !== undefined) updates.type = type
  if (description !== undefined) updates.description = description
  if (crawl_interval !== undefined) updates.crawl_interval = crawl_interval
  if (is_active !== undefined) updates.is_active = is_active

  const { data, error } = await supabase
    .from('news_sources')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, data, message: 'Fonte atualizada com sucesso!' })
}

// DELETE — remove ou desativa fonte
export async function DELETE(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) return NextResponse.json({ success: false, error: 'ID obrigatório' }, { status: 400 })

  const { error } = await supabase
    .from('news_sources')
    .delete()
    .eq('id', id)

  if (error) return NextResponse.json({ success: false, error: error.message }, { status: 500 })

  return NextResponse.json({ success: true, message: 'Fonte removida com sucesso!' })
}
