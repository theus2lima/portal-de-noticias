import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST - Coletar notícias históricas das fontes externas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { 
      startDate, 
      endDate, 
      sourceIds = [], // IDs das fontes específicas ou vazio para todas
      status = 'any', // 'any', 'processed', 'unprocessed'
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

    // Construir query para buscar notícias das fontes externas
    let query = supabase
      .from('scraped_news')
      .select(`
        id,
        title,
        summary,
        content,
        original_url,
        published_at,
        created_at,
        image_url,
        author,
        tags,
        source_id,
        news_sources (
          id,
          name,
          url,
          type
        )
      `)
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })
      .limit(limit)

    // Filtrar por fontes específicas se fornecidas
    if (sourceIds.length > 0) {
      query = query.in('source_id', sourceIds)
    }

    const { data: scrapedNews, error: newsError } = await query

    if (newsError) {
      console.error('Erro ao buscar notícias das fontes:', newsError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar notícias históricas das fontes'
      }, { status: 500 })
    }

    if (!scrapedNews || scrapedNews.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          processed: 0,
          message: 'Nenhuma notícia encontrada no período especificado'
        }
      })
    }

    // Se o status for específico, filtrar por processamento
    let filteredNews = scrapedNews
    if (status !== 'any') {
      // Buscar quais notícias já foram processadas
      const scrapedIds = scrapedNews.map((n: any) => n.id)
      const { data: existingCurations } = await supabase
        .from('news_curation')
        .select('scraped_news_id')
        .in('scraped_news_id', scrapedIds)

      const processedIds = new Set(existingCurations?.map((c: any) => c.scraped_news_id) || [])

      if (status === 'processed') {
        filteredNews = scrapedNews.filter((n: any) => processedIds.has(n.id))
      } else if (status === 'unprocessed') {
        filteredNews = scrapedNews.filter((n: any) => !processedIds.has(n.id))
      }
    }

    if (filteredNews.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          processed: 0,
          message: `Nenhuma notícia ${status === 'processed' ? 'processada' : 'não processada'} encontrada no período`
        }
      })
    }

    const results = []
    let successCount = 0
    let errorCount = 0

    // Processar cada notícia
    for (const news of filteredNews) {
      try {
        // Verificar se já existe curadoria para esta notícia
        const { data: existingCuration } = await supabase
          .from('news_curation')
          .select('id')
          .eq('scraped_news_id', news.id)
          .single()

        if (existingCuration && status !== 'processed') {
          // Se já existe e não estamos reprocessando especificamente, pular
          results.push({
            news_id: news.id,
            title: news.title,
            success: false,
            error: 'Já processada anteriormente',
            skipped: true
          })
          continue
        }

        // Se já existe curadoria, atualizar; senão, criar nova
        let curationData = {
          scraped_news_id: news.id,
          status: 'pending',
          suggested_category_id: null, // Será preenchido pela IA
          ai_confidence: null,
          ai_category_reasoning: `Reprocessamento histórico de fonte externa: ${news.news_sources?.name}`,
          curator_notes: `Coleta histórica - Fonte: ${news.news_sources?.name}, Tipo: ${reprocessType}, Período: ${startDate} a ${endDate}`
        }

        let curationResult
        if (existingCuration) {
          // Atualizar curadoria existente
          curationResult = await supabase
            .from('news_curation')
            .update({
              ...curationData,
              curator_notes: curationData.curator_notes + ' (Reprocessado)',
              updated_at: new Date().toISOString()
            })
            .eq('id', existingCuration.id)
        } else {
          // Criar nova curadoria
          curationResult = await supabase
            .from('news_curation')
            .insert(curationData)
        }

        if (curationResult.error) {
          console.error('Erro ao criar/atualizar curadoria:', curationResult.error)
          errorCount++
          results.push({
            news_id: news.id,
            title: news.title,
            success: false,
            error: 'Erro ao criar entrada de curadoria'
          })
        } else {
          successCount++
          results.push({
            news_id: news.id,
            title: news.title,
            source: news.news_sources?.name,
            success: true,
            action: existingCuration ? 'updated' : 'created'
          })
        }

      } catch (error) {
        console.error('Erro ao processar notícia:', error)
        errorCount++
        results.push({
          news_id: news.id,
          title: news.title,
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    return NextResponse.json({
      success: errorCount === 0,
      data: {
        total_found: scrapedNews.length,
        total_filtered: filteredNews.length,
        processed: successCount,
        errors: errorCount,
        period: { startDate, endDate },
        reprocess_type: reprocessType,
        filter_status: status,
        sources_summary: getSourcesSummary(filteredNews),
        results: results.slice(0, 15) // Limitar resultado
      }
    })

  } catch (error) {
    console.error('Erro na coleta histórica de fontes:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// GET - Estatísticas das fontes externas para reprocessamento
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6')

    // Calcular data inicial
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    // Buscar estatísticas das fontes
    const [sourcesResult, newsStatsResult, curationStatsResult] = await Promise.all([
      // Fontes ativas com contagem de notícias
      supabase
        .from('news_sources')
        .select(`
          id,
          name,
          url,
          type,
          is_active,
          last_fetch,
          created_at
        `)
        .eq('is_active', true),

      // Notícias por fonte no período
      supabase
        .from('scraped_news')
        .select(`
          id,
          source_id,
          created_at,
          news_sources (
            name
          )
        `)
        .gte('created_at', startDate.toISOString()),

      // Status de curadoria das notícias
      supabase
        .from('news_curation')
        .select(`
          id,
          status,
          scraped_news_id,
          created_at
        `)
        .gte('created_at', startDate.toISOString())
    ])

    const sources = sourcesResult.data || []
    const newsStats = newsStatsResult.data || []
    const curationStats = curationStatsResult.data || []

    // Processar estatísticas por fonte
    const sourceStats = sources.map((source: any) => {
      const sourceNews = newsStats.filter((news: any) => news.source_id === source.id)
      const sourceCurations = curationStats.filter((curation: any) => 
        sourceNews.some((news: any) => news.id === curation.scraped_news_id)
      )

      return {
        ...source,
        total_news: sourceNews.length,
        processed_news: sourceCurations.length,
        unprocessed_news: sourceNews.length - sourceCurations.length,
        last_news: sourceNews.length > 0 ? 
          Math.max(...sourceNews.map((n: any) => new Date(n.created_at).getTime())) : null
      }
    })

    // Estatísticas gerais
    const totalNews = newsStats.length
    const totalProcessed = curationStats.length
    const totalUnprocessed = totalNews - totalProcessed

    // Notícias por mês
    const newsByMonth = newsStats.reduce((acc: any, news: any) => {
      const month = new Date(news.created_at).toISOString().substr(0, 7) // YYYY-MM
      acc[month] = (acc[month] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        period: {
          months,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString()
        },
        summary: {
          total_sources: sources.length,
          total_news: totalNews,
          processed_news: totalProcessed,
          unprocessed_news: totalUnprocessed,
          processing_rate: totalNews > 0 ? Math.round((totalProcessed / totalNews) * 100) : 0
        },
        sources: sourceStats,
        news_by_month: Object.entries(newsByMonth).map(([month, count]) => ({
          month,
          count
        })).sort((a, b) => a.month.localeCompare(b.month))
      }
    })

  } catch (error) {
    console.error('Erro ao buscar estatísticas de fontes:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função auxiliar para resumo das fontes
function getSourcesSummary(news: any[]) {
  const sourceCounts = news.reduce((acc: any, item: any) => {
    const sourceName = item.news_sources?.name || 'Fonte Desconhecida'
    acc[sourceName] = (acc[sourceName] || 0) + 1
    return acc
  }, {})

  return Object.entries(sourceCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a: any, b: any) => b.count - a.count)
}
