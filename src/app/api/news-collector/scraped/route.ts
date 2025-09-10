import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const after = searchParams.get('after')
    const source_id = searchParams.get('source_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

    // Construir query
    let query = supabase
      .from('scraped_news')
      .select(`
        id,
        title,
        summary,
        original_url,
        image_url,
        published_at,
        created_at,
        source_id,
        news_sources (
          id,
          name,
          url
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filtros
    if (after) {
      query = query.gte('created_at', after)
    }

    if (source_id) {
      query = query.eq('source_id', source_id)
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,summary.ilike.%${search}%`)
    }

    const { data: news, error } = await query

    if (error) {
      console.error('Erro ao buscar notícias coletadas:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar notícias'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: news || []
    })

  } catch (error) {
    console.error('Erro na API de notícias coletadas:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST - Ações em lote nas notícias coletadas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, news_ids } = body

    if (!action || !news_ids || !Array.isArray(news_ids)) {
      return NextResponse.json({
        success: false,
        error: 'Parâmetros inválidos'
      }, { status: 400 })
    }

    switch (action) {
      case 'delete':
        // Deletar notícias selecionadas
        const { error: deleteError } = await supabase
          .from('scraped_news')
          .delete()
          .in('id', news_ids)

        if (deleteError) throw deleteError

        return NextResponse.json({
          success: true,
          data: { deleted: news_ids.length }
        })

      case 'send_to_curation':
        // Criar entradas de curadoria para as notícias selecionadas
        const curationEntries = news_ids.map(id => ({
          scraped_news_id: id,
          status: 'pending',
          curator_notes: 'Enviado do scraping histórico'
        }))

        const { error: curationError } = await supabase
          .from('news_curation')
          .insert(curationEntries)

        if (curationError) throw curationError

        return NextResponse.json({
          success: true,
          data: { sent_to_curation: news_ids.length }
        })

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na ação em lote:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
