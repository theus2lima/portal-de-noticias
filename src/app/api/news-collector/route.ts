import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import Parser from 'rss-parser'
import * as cheerio from 'cheerio'

// Configuração do parser RSS
const rssParser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'description', 'content:encoded']
  },
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'application/rss+xml, application/atom+xml, application/xml, text/xml, text/html',
      'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache'
    }
  }
})

// POST - Executar coleta de notícias
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { sourceId, forceRefresh = false } = body

    if (sourceId) {
      // Coletar de uma fonte específica
      const result = await collectFromSource(supabase, sourceId, forceRefresh)
      return NextResponse.json(result)
    } else {
      // Coletar de todas as fontes ativas
      const result = await collectFromAllSources(supabase, forceRefresh)
      return NextResponse.json(result)
    }

  } catch (error) {
    console.error('Erro na coleta de notícias:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// GET - Status da coleta e estatísticas
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'

    // Calcular timestamp base
    const hoursAgo = timeframe === '24h' ? 24 : 
                     timeframe === '7d' ? 168 : 
                     timeframe === '30d' ? 720 : 24

    const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000).toISOString()

    // Buscar estatísticas
    const [sourcesResult, newsResult, curationResult] = await Promise.all([
      // Fontes ativas
      supabase
        .from('news_sources')
        .select('id, name, url, is_active, last_fetch')
        .eq('is_active', true),

      // Notícias coletadas
      supabase
        .from('scraped_news')
        .select('id, created_at')
        .gte('created_at', since),

      // Status de curadoria
      supabase
        .from('news_curation')
        .select('status')
        .gte('created_at', since)
    ])

    const sources = sourcesResult.data || []
    const totalNews = newsResult.data?.length || 0
    const curationStats = (curationResult.data || []).reduce((acc: any, item: any) => {
      acc[item.status] = (acc[item.status] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        sources: {
          total: sources.length,
          active: sources.filter((s: any) => s.is_active).length,
          list: sources
        },
        collection: {
          timeframe,
          total_collected: totalNews,
          pending_curation: curationStats.pending || 0,
          approved: curationStats.approved || 0,
          rejected: curationStats.rejected || 0,
          published: curationStats.published || 0
        }
      }
    })

  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função para coletar de todas as fontes ativas
async function collectFromAllSources(supabase: any, forceRefresh: boolean) {
  const { data: sources, error } = await supabase
    .from('news_sources')
    .select('*')
    .eq('is_active', true)

  if (error) {
    throw new Error(`Erro ao buscar fontes: ${error.message}`)
  }

  const results: any[] = []
  let totalCollected = 0
  let totalErrors = 0

  for (const source of sources) {
    try {
      const result = await collectFromSource(supabase, source.id, forceRefresh)
      results.push({
        source: source.name,
        ...result.data
      })
      totalCollected += result.data?.collected || 0
    } catch (error) {
      console.error(`Erro ao coletar da fonte ${source.name}:`, error)
      results.push({
        source: source.name,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
      totalErrors++
    }
  }

  return {
    success: totalErrors === 0,
    data: {
      total_sources: sources.length,
      total_collected: totalCollected,
      total_errors: totalErrors,
      results
    }
  }
}

// Função para coletar de uma fonte específica
async function collectFromSource(supabase: any, sourceId: string, forceRefresh: boolean) {
  // Buscar dados da fonte
  const { data: source, error: sourceError } = await supabase
    .from('news_sources')
    .select('*')
    .eq('id', sourceId)
    .single()

  if (sourceError || !source) {
    return {
      success: false,
      error: 'Fonte não encontrada'
    }
  }

  // Verificar se precisa atualizar (evitar spam)
  if (!forceRefresh && source.last_fetch) {
    const lastFetch = new Date(source.last_fetch)
    const now = new Date()
    const diffHours = (now.getTime() - lastFetch.getTime()) / (1000 * 60 * 60)
    
    if (diffHours < (source.fetch_frequency || 3600) / 3600) {
      return {
        success: true,
        data: {
          collected: 0,
          message: 'Fonte atualizada recentemente',
          next_fetch: new Date(lastFetch.getTime() + (source.fetch_frequency || 3600) * 1000)
        }
      }
    }
  }

  let newsItems: any[] = []

  try {
    if (source.type === 'rss') {
      newsItems = await collectFromRSS(source)
    } else if (source.type === 'scraping') {
      newsItems = await collectFromScraping(source)
    } else {
      throw new Error(`Tipo de fonte não suportado: ${source.type}`)
    }

    // Salvar notícias no banco
    let savedCount = 0
    for (const item of newsItems) {
      try {
        const saved = await saveNewsItem(supabase, item, source.id)
        if (saved) savedCount++
      } catch (error) {
        console.error('Erro ao salvar notícia:', error)
      }
    }

    // Atualizar timestamp da fonte
    await supabase
      .from('news_sources')
      .update({ last_fetch: new Date().toISOString() })
      .eq('id', sourceId)

    return {
      success: true,
      data: {
        collected: savedCount,
        total_found: newsItems.length,
        duplicates_skipped: newsItems.length - savedCount
      }
    }

  } catch (error) {
    console.error('Erro na coleta:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }
  }
}

// Função para coletar via RSS
async function collectFromRSS(source: any) {
  const feed = await rssParser.parseURL(source.url)
  const newsItems: any[] = []

  for (const item of feed.items.slice(0, 20)) { // Limitar a 20 itens por vez
    const imageUrl = extractImageFromRSS(item)
    
    newsItems.push({
      title: item.title || '',
      summary: item.contentSnippet || item.summary || '',
      content: item.content || item['content:encoded'] || item.contentSnippet || '',
      published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
      original_url: item.link || '',
      guid: item.guid || item.link,
      image_url: imageUrl,
      author: item.creator || (item as any).author || null
    })
  }

  return newsItems
}

// Função para extrair imagem do RSS
function extractImageFromRSS(item: any): string | null {
  // Tentar diferentes campos de imagem
  if (item['media:content'] && item['media:content'].$ && item['media:content'].$.url) {
    return item['media:content'].$.url
  }
  
  if (item.enclosure && item.enclosure.url) {
    return item.enclosure.url
  }

  // Buscar imagem no conteúdo HTML
  if (item.content || item['content:encoded']) {
    const content = item.content || item['content:encoded']
    const $ = cheerio.load(content)
    const img = $('img').first()
    const src = img.attr('src')
    if (src) {
      return src
    }
  }

  return null
}

// Função para coletar via scraping
async function collectFromScraping(source: any) {
  // Headers mais robustos para contornar proteções anti-bot
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
    'Accept-Language': 'pt-BR,pt;q=0.9,en;q=0.8',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1'
  }

  const response = await fetch(source.url, { headers })
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}. Site pode estar protegido por Cloudflare ou similar.`)
  }
  
  const html = await response.text()
  
  // Verificar se foi bloqueado por Cloudflare
  if (html.includes('cloudflare') && (html.includes('challenge') || html.includes('cf-mitigated'))) {
    throw new Error('Site protegido por Cloudflare. Acesso bloqueado para bots.')
  }
  
  const $ = cheerio.load(html)
  
  const newsItems: any[] = []
  const config = source.scraping_config || {}

  // Usar seletores configurados ou padrões
  const articleSelector = config.article_selector || 'article, .post, .news-item'
  const titleSelector = config.title_selector || 'h1, h2, .title'
  const summarySelector = config.summary_selector || '.summary, .excerpt, p'
  const linkSelector = config.link_selector || 'a'
  const imageSelector = config.image_selector || 'img'

  $(articleSelector).each((index, element) => {
    if (index >= 20) return false // Limitar a 20 itens

    const $el = $(element)
    const title = $el.find(titleSelector).first().text().trim()
    const summary = $el.find(summarySelector).first().text().trim()
    const link = $el.find(linkSelector).first().attr('href')
    const image = $el.find(imageSelector).first().attr('src')

    if (title && link) {
      // Converter URL relativa para absoluta
      const fullUrl = link.startsWith('http') ? link : new URL(link, source.url).href
      const fullImageUrl = image && !image.startsWith('http') ? new URL(image, source.url).href : image

      newsItems.push({
        title,
        summary: summary.substring(0, 500), // Limitar tamanho
        content: summary,
        published_at: new Date().toISOString(),
        original_url: fullUrl,
        guid: fullUrl,
        image_url: fullImageUrl,
        author: null
      })
    }
  })

  return newsItems
}

// Função para salvar notícia no banco
async function saveNewsItem(supabase: any, item: any, sourceId: string) {
  // Verificar se já existe
  const { data: existing } = await supabase
    .from('scraped_news')
    .select('id')
    .eq('original_url', item.original_url)
    .eq('source_id', sourceId)
    .single()

  if (existing) {
    return false // Já existe
  }

  // Inserir nova notícia
  const { error } = await supabase
    .from('scraped_news')
    .insert({
      ...item,
      source_id: sourceId
    })

  if (error) {
    console.error('Erro ao inserir notícia:', error)
    return false
  }

  return true
}
