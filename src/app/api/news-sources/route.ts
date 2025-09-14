import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Listar fontes de notícias
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const isActive = searchParams.get('active')
    const type = searchParams.get('type')

    let query = supabase
      .from('news_sources')
      .select('*')
      .order('name')

    if (isActive !== null) {
      query = query.eq('is_active', isActive === 'true')
    }

    if (type) {
      query = query.eq('type', type)
    }

    const { data: sources, error } = await query

    if (error) {
      console.error('Erro ao buscar fontes:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar fontes'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: sources || []
    })

  } catch (error) {
    console.error('Erro na API de fontes:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST - Criar nova fonte
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      name, 
      url, 
      type, 
      description,
      crawl_interval,
      scraping_config,
      is_active = true
    } = body

    // Validações básicas
    if (!name || !url || !type) {
      return NextResponse.json({
        success: false,
        error: 'Nome, URL e tipo são obrigatórios'
      }, { status: 400 })
    }

    if (!['rss', 'scraping'].includes(type)) {
      return NextResponse.json({
        success: false,
        error: 'Tipo deve ser "rss" ou "scraping"'
      }, { status: 400 })
    }

    // Verificar se URL já existe
    const { data: existing } = await supabase
      .from('news_sources')
      .select('id')
      .eq('url', url)
      .single()

    if (existing) {
      return NextResponse.json({
        success: false,
        error: 'Já existe uma fonte com esta URL'
      }, { status: 409 })
    }

    // Criar nova fonte
    const { data: newSource, error } = await supabase
      .from('news_sources')
      .insert({
        name,
        url,
        type,
        description,
        crawl_interval: crawl_interval || 1,
        scraping_config: scraping_config || {},
        is_active
      })
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar fonte:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar fonte'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: newSource,
      message: 'Fonte criada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar criação:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// PUT - Atualizar fonte
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      id,
      name, 
      url, 
      type, 
      description,
      crawl_interval,
      scraping_config,
      is_active
    } = body

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID da fonte é obrigatório'
      }, { status: 400 })
    }

    // Verificar se fonte existe
    const { data: existing, error: existingError } = await supabase
      .from('news_sources')
      .select('id')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({
        success: false,
        error: 'Fonte não encontrada'
      }, { status: 404 })
    }

    // Atualizar fonte
    const updateData: any = {}
    if (name) updateData.name = name
    if (url) updateData.url = url
    if (type) updateData.type = type
    if (description !== undefined) updateData.description = description
    if (crawl_interval) updateData.crawl_interval = crawl_interval
    if (scraping_config) updateData.scraping_config = scraping_config
    if (is_active !== undefined) updateData.is_active = is_active

    const { data: updatedSource, error } = await supabase
      .from('news_sources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar fonte:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao atualizar fonte'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: updatedSource,
      message: 'Fonte atualizada com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar atualização:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// DELETE - Remover fonte
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({
        success: false,
        error: 'ID da fonte é obrigatório'
      }, { status: 400 })
    }

    // Verificar se fonte existe
    const { data: existing, error: existingError } = await supabase
      .from('news_sources')
      .select('id, name')
      .eq('id', id)
      .single()

    if (existingError || !existing) {
      return NextResponse.json({
        success: false,
        error: 'Fonte não encontrada'
      }, { status: 404 })
    }

    // Verificar se há notícias associadas
    const { count: newsCount } = await supabase
      .from('scraped_news')
      .select('id', { count: 'exact', head: true })
      .eq('source_id', id)

    if (newsCount && newsCount > 0) {
      // Não deletar, apenas desativar
      const { error: deactivateError } = await supabase
        .from('news_sources')
        .update({ is_active: false })
        .eq('id', id)

      if (deactivateError) {
        console.error('Erro ao desativar fonte:', deactivateError)
        return NextResponse.json({
          success: false,
          error: 'Erro ao desativar fonte'
        }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Fonte desativada (possui notícias associadas)'
      })
    }

    // Deletar fonte
    const { error } = await supabase
      .from('news_sources')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar fonte:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao deletar fonte'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Fonte removida com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar remoção:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
