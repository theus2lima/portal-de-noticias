import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Listar banners
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const position = searchParams.get('position')
    const active = searchParams.get('active')

    let query = supabase
      .from('banners')
      .select('*')
      .order('created_at', { ascending: false })

    if (position) {
      query = query.eq('position', position)
    }

    if (active === 'true') {
      const today = new Date().toISOString().split('T')[0]
      query = query
        .eq('active', true)
        .or(`start_date.is.null,start_date.lte.${today}`)
        .or(`end_date.is.null,end_date.gte.${today}`)
    }

    const { data, error } = await query

    if (error) throw error

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Erro ao buscar banners:', error)
    return NextResponse.json({ error: 'Erro ao buscar banners' }, { status: 500 })
  }
}

// POST - Criar banner
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { title, image_url, link_url, position, active, start_date, end_date } = body

    if (!title || !image_url || !link_url || !position) {
      return NextResponse.json({ error: 'Campos obrigatórios: title, image_url, link_url, position' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('banners')
      .insert({
        title,
        image_url,
        link_url,
        position,
        active: active ?? true,
        start_date: start_date || null,
        end_date: end_date || null,
      })
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ data }, { status: 201 })
  } catch (error) {
    console.error('Erro ao criar banner:', error)
    return NextResponse.json({ error: 'Erro ao criar banner' }, { status: 500 })
  }
}
