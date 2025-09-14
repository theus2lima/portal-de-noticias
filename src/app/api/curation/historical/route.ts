import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST - Coletar artigos já publicados para reprocessamento
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { 
      startDate, 
      endDate, 
      categoryId, 
      status = 'published',
      limit = 50,
      reprocessType = 'reclassify' // 'reclassify', 'improve', 'redistribute'
    } = body

    // Validações
    if (!startDate || !endDate) {
      return NextResponse.json({
        success: false,
        error: 'Data inicial e final são obrigatórias'
      }, { status: 400 })
    }

    // Buscar artigos no período especificado
    let query = supabase
      .from('articles')
      .select(`
        id,
        title,
        summary,
        content,
        slug,
        category_id,
        author_id,
        featured_image,
        status,
        published_at,
        created_at,
        categories (
          id,
          name,
          color
        ),
        users:author_id (
          name,
          email
        )
      `)
      .eq('status', status)
      .gte('published_at', startDate)
      .lte('published_at', endDate)
      .order('published_at', { ascending: false })
      .limit(limit)

    // Filtrar por categoria se especificado
    if (categoryId) {
      query = query.eq('category_id', categoryId)
    }

    const { data: articles, error: articlesError } = await query

    if (articlesError) {
      console.error('Erro ao buscar artigos:', articlesError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar artigos históricos'
      }, { status: 500 })
    }

    if (!articles || articles.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          processed: 0,
          message: 'Nenhum artigo encontrado no período especificado'
        }
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // Processar cada artigo
    for (const article of articles) {
      try {
        // Criar entrada de notícia "scraped" para reprocessamento
        const scrapedNewsData = {
          source_id: await getOrCreateHistoricalSource(supabase),
          original_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/artigo/${article.slug}`,
          title: article.title,
          summary: article.summary || '',
          content: article.content || '',
          author: (Array.isArray((article as any).users) ? (article as any).users[0]?.name : (article as any).users?.name) || 'Sistema',
          published_at: article.published_at || article.created_at,
          image_url: article.featured_image,
          tags: [],
          raw_data: {
            original_article_id: article.id,
            reprocess_type: reprocessType,
            original_category: (article as any).categories?.name,
            original_author: (article as any).users?.name
          },
          content_hash: generateContentHash(article.title + article.content)
        }

        // Inserir como notícia scraped
        const { data: scrapedNews, error: scrapedError } = await supabase
          .from('scraped_news')
          .insert(scrapedNewsData)
          .select()
          .single()

        if (scrapedError) {
          console.error('Erro ao criar scraped news:', scrapedError)
          errorCount++
          results.push({
            article_id: article.id,
            title: article.title,
            success: false,
            error: 'Erro ao inserir notícia para reprocessamento'
          })
          continue
        }

        // Criar entrada de curadoria
        const curationData = {
          scraped_news_id: scrapedNews.id,
          status: 'pending',
          suggested_category_id: article.category_id, // Categoria original como sugestão
          ai_confidence: null, // Será preenchido pela IA
          ai_category_reasoning: `Artigo histórico reprocessado. Categoria original: ${(article as any).categories?.name}`,
          curator_notes: `Reprocessamento histórico - Tipo: ${reprocessType}, Período: ${startDate} a ${endDate}`
        }

        const { error: curationError } = await supabase
          .from('news_curation')
          .insert(curationData)

        if (curationError) {
          console.error('Erro ao criar curadoria:', curationError)
          errorCount++
          results.push({
            article_id: article.id,
            title: article.title,
            success: false,
            error: 'Erro ao criar entrada de curadoria'
          })
        } else {
          successCount++
          results.push({
            article_id: article.id,
            title: article.title,
            success: true,
            scraped_news_id: scrapedNews.id
          })
        }

      } catch (error) {
        console.error('Erro ao processar artigo:', error)
        errorCount++
        results.push({
          article_id: article.id,
          title: article.title,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    return NextResponse.json({
      success: errorCount === 0,
      data: {
        total_found: articles.length,
        processed: successCount,
        errors: errorCount,
        period: { startDate, endDate },
        reprocess_type: reprocessType,
        results: results.slice(0, 10) // Limitar resultado para não sobrecarregar
      }
    })

  } catch (error) {
    console.error('Erro na coleta histórica:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// GET - Estatísticas dos artigos disponíveis para reprocessamento
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '12')

    // Calcular data inicial (X meses atrás)
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Buscar estatísticas
    const [articlesResult, categoriesResult] = await Promise.all([
      // Artigos por mês
      supabase
        .rpc('get_articles_by_month', { 
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString()
        }),

      // Artigos por categoria
      supabase
        .from('articles')
        .select(`
          category_id,
          categories (name),
          count
        `)
        .eq('status', 'published')
        .gte('published_at', startDate.toISOString())
    ])

    return NextResponse.json({
      success: true,
      data: {
        period: {
          months,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString()
        },
        articles_by_month: articlesResult.data || [],
        total_articles: articlesResult.data?.reduce((sum: number, month: any) => sum + (month.count || 0), 0) || 0,
        available_categories: categoriesResult.data || []
      }
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função auxiliar para criar/obter fonte "histórica"
async function getOrCreateHistoricalSource(supabase: any) {
  const sourceName = 'Artigos Históricos'
  
  // Verificar se já existe
  const { data: existing } = await supabase
    .from('news_sources')
    .select('id')
    .eq('name', sourceName)
    .single()

  if (existing) {
    return existing.id
  }

  // Criar nova fonte
  const { data: newSource } = await supabase
    .from('news_sources')
    .insert({
      name: sourceName,
      url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
      type: 'api',
      description: 'Fonte virtual para reprocessamento de artigos históricos do próprio portal',
      is_active: true,
      fetch_frequency: 86400 // 24 horas
    })
    .select()
    .single()

  return newSource.id
}

// Função auxiliar para gerar hash do conteúdo
function generateContentHash(content: string): string {
  // Simples hash baseado no conteúdo (em produção, use crypto)
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16)
}
