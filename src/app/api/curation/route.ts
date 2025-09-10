import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Listar notícias pendentes de curadoria
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'pending'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = (page - 1) * limit

    // Buscar notícias pendentes de curadoria
    const { data: curationList, error } = await supabase
      .from('news_curation')
      .select(`
        id,
        status,
        ai_confidence,
        ai_category_reasoning,
        curator_notes,
        created_at,
        updated_at,
        scraped_news:scraped_news_id (
          id,
          title,
          summary,
          content,
          published_at,
          image_url,
          original_url,
          news_sources:source_id (
            name,
            url
          )
        ),
        suggested_category:suggested_category_id (
          id,
          name,
          color
        ),
        manual_category:manual_category_id (
          id,
          name,
          color
        ),
        curator:curator_id (
          name,
          email
        )
      `)
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Erro ao buscar curadoria:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar notícias para curadoria'
      }, { status: 500 })
    }

    // Buscar contagem total
    const { count, error: countError } = await supabase
      .from('news_curation')
      .select('*', { count: 'exact', head: true })
      .eq('status', status)

    if (countError) {
      console.error('Erro ao contar curadoria:', countError)
    }

    return NextResponse.json({
      success: true,
      data: curationList || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    })

  } catch (error) {
    console.error('Erro na API de curadoria:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST - Ação de curadoria (aprovar, rejeitar, editar)
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, curationId, data } = body

    // Buscar usuário atual (simplificado - em produção use auth real)
    const { data: user } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin')
      .limit(1)
      .single()

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Usuário não autorizado'
      }, { status: 401 })
    }

    switch (action) {
      case 'approve':
        return await handleApprove(supabase, curationId, user.id, data)
      case 'reject':
        return await handleReject(supabase, curationId, user.id, data)
      case 'edit':
        return await handleEdit(supabase, curationId, user.id, data)
      case 'publish':
        return await handlePublish(supabase, curationId, user.id, data)
      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na ação de curadoria:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função para aprovar notícia
async function handleApprove(supabase: any, curationId: string, userId: string, data: any) {
  const { error } = await supabase
    .from('news_curation')
    .update({
      status: 'approved',
      curator_id: userId,
      approved_at: new Date().toISOString(),
      curator_notes: data.notes || null,
      manual_category_id: data.categoryId || null
    })
    .eq('id', curationId)

  if (error) {
    console.error('Erro ao aprovar:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao aprovar notícia'
    }, { status: 500 })
  }

  // Log da ação
  await supabase
    .from('curation_logs')
    .insert({
      curation_id: curationId,
      user_id: userId,
      action: 'approved',
      details: { notes: data.notes, categoryId: data.categoryId }
    })

  return NextResponse.json({
    success: true,
    message: 'Notícia aprovada com sucesso'
  })
}

// Função para rejeitar notícia
async function handleReject(supabase: any, curationId: string, userId: string, data: any) {
  const { error } = await supabase
    .from('news_curation')
    .update({
      status: 'rejected',
      curator_id: userId,
      curator_notes: data.reason || 'Rejeitada pelo curador'
    })
    .eq('id', curationId)

  if (error) {
    console.error('Erro ao rejeitar:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao rejeitar notícia'
    }, { status: 500 })
  }

  // Log da ação
  await supabase
    .from('curation_logs')
    .insert({
      curation_id: curationId,
      user_id: userId,
      action: 'rejected',
      details: { reason: data.reason }
    })

  return NextResponse.json({
    success: true,
    message: 'Notícia rejeitada'
  })
}

// Função para editar notícia
async function handleEdit(supabase: any, curationId: string, userId: string, data: any) {
  const { error } = await supabase
    .from('news_curation')
    .update({
      status: 'editing',
      curator_id: userId,
      curated_title: data.title,
      curated_summary: data.summary,
      curated_content: data.content,
      manual_category_id: data.categoryId,
      curator_notes: data.notes
    })
    .eq('id', curationId)

  if (error) {
    console.error('Erro ao editar:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro ao salvar edição'
    }, { status: 500 })
  }

  // Log da ação
  await supabase
    .from('curation_logs')
    .insert({
      curation_id: curationId,
      user_id: userId,
      action: 'edited',
      details: { changes: data }
    })

  return NextResponse.json({
    success: true,
    message: 'Edições salvas com sucesso'
  })
}

// Função para publicar como artigo
async function handlePublish(supabase: any, curationId: string, userId: string, data: any) {
  try {
    // Buscar dados da curadoria
    const { data: curation, error: curationError } = await supabase
      .from('news_curation')
      .select(`
        *,
        scraped_news:scraped_news_id (
          title,
          summary,
          content,
          image_url,
          original_url
        )
      `)
      .eq('id', curationId)
      .single()

    if (curationError || !curation) {
      return NextResponse.json({
        success: false,
        error: 'Curadoria não encontrada'
      }, { status: 404 })
    }

    // Criar artigo na tabela articles
    const articleData = {
      title: curation.curated_title || curation.scraped_news.title,
      summary: curation.curated_summary || curation.scraped_news.summary,
      slug: generateSlug(curation.curated_title || curation.scraped_news.title),
      content: curation.curated_content || curation.scraped_news.content,
      category_id: curation.manual_category_id || curation.suggested_category_id,
      author_id: userId,
      featured_image: curation.scraped_news.image_url,
      status: 'published',
      is_featured: false,
      published_at: new Date().toISOString()
    }

    const { data: article, error: articleError } = await supabase
      .from('articles')
      .insert(articleData)
      .select()
      .single()

    if (articleError) {
      console.error('Erro ao criar artigo:', articleError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao publicar artigo'
      }, { status: 500 })
    }

    // Atualizar curadoria com ID do artigo publicado
    await supabase
      .from('news_curation')
      .update({
        status: 'published',
        published_article_id: article.id
      })
      .eq('id', curationId)

    // Log da ação
    await supabase
      .from('curation_logs')
      .insert({
        curation_id: curationId,
        user_id: userId,
        action: 'published',
        details: { article_id: article.id }
      })

    return NextResponse.json({
      success: true,
      message: 'Artigo publicado com sucesso',
      article_id: article.id
    })

  } catch (error) {
    console.error('Erro ao publicar:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função utilitária para gerar slug
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^\w\s-]/g, '') // Remove caracteres especiais
    .replace(/\s+/g, '-') // Substitui espaços por hífens
    .replace(/-+/g, '-') // Remove hífens duplos
    .trim()
}
