import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { createScraperForSite } from '@/utils/smart-scraper'

// POST - Coleta histórica por período para fontes externas selecionadas
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { startDate, endDate, sourceIds = [], limitPerSource = 100 } = body

    if (!startDate || !endDate) {
      return NextResponse.json({ success: false, error: 'Período (startDate, endDate) é obrigatório' }, { status: 400 })
    }

    // Buscar fontes
    let q = supabase.from('news_sources').select('*').eq('is_active', true)
    if (sourceIds.length) q = q.in('id', sourceIds)
    const { data: sources, error: srcErr } = await q
    if (srcErr) throw new Error(srcErr.message)

    const start = new Date(startDate)
    const end = new Date(endDate)

    const summary: any[] = []
    let grandTotal = 0

    for (const source of (sources || [])) {
      try {
        // Criar scraper inteligente para o site
        const scraper = createScraperForSite(source.url)
        
        // Se há configuração personalizada, aplicar
        if (source.scraping_config) {
          // Merge configuração personalizada
          Object.assign(scraper['config'], source.scraping_config)
        }
        
        // Fazer scraping do período
        const articles = await scraper.scrapeByPeriod(start, end, limitPerSource)
        
        let insertedForSource = 0
        
        // Inserir artigos no banco
        for (const article of articles) {
          const { data: existing } = await supabase
            .from('scraped_news')
            .select('id')
            .eq('original_url', article.original_url)
            .eq('source_id', source.id)
            .single()

          if (existing) continue

          const { error: insErr } = await supabase
            .from('scraped_news')
            .insert({ 
              ...article,
              source_id: source.id,
              created_at: new Date().toISOString()
            })

          if (!insErr) {
            insertedForSource++
            grandTotal++
          }
        }
        
        summary.push({ 
          source: source.name, 
          inserted: insertedForSource, 
          checked: articles.length,
          archive_pages: 1 // SmartScraper gerencia internamente
        })
        
      } catch (sourceError) {
        console.error('Erro ao processar fonte:', source.name, sourceError)
        summary.push({ 
          source: source.name, 
          inserted: 0, 
          checked: 0,
          archive_pages: 0,
          error: sourceError instanceof Error ? sourceError.message : 'Erro desconhecido'
        })
      }
    }

    return NextResponse.json({ success: true, data: { total_inserted: grandTotal, sources: summary } })
  } catch (error) {
    console.error('Erro na coleta histórica de portais:', error)
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// GET - Estatísticas simples
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: sources } = await supabase.from('news_sources').select('id, name, url, type, is_active').eq('is_active', true)
    return NextResponse.json({ success: true, data: { active_sources: sources || [] } })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Erro interno do servidor' }, { status: 500 })
  }
}

