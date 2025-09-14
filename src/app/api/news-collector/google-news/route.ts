import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Interface para estruturar as notícias coletadas
interface GoogleNewsItem {
  title: string
  link: string
  pubDate: string
  description?: string
  source: string
  imageUrl?: string
}

// POST - Coletar notícias do Google News
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    const { 
      query = 'Brasil', // Termo de busca
      language = 'pt-BR',
      country = 'BR',
      limit = 20,
      category = null, // economia, esportes, entretenimento, saude, ciencia, tecnologia
      timeRange = 'today' // today, week, month
    } = body

    // Construir URL do Google News RSS
    const googleNewsUrl = buildGoogleNewsUrl(query, language, country, category, timeRange)
    
    console.log('Buscando notícias do Google News:', googleNewsUrl)

    // Fazer request para o Google News RSS
    const response = await fetch(googleNewsUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    })

    if (!response.ok) {
      throw new Error(`Erro ao acessar Google News: ${response.status}`)
    }

    const xmlData = await response.text()
    const newsItems = parseGoogleNewsXML(xmlData)

    if (newsItems.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          collected: 0,
          message: 'Nenhuma notícia encontrada para os critérios especificados'
        }
      })
    }

    // Limitar resultados
    const limitedNews = newsItems.slice(0, limit)

    // Verificar se já existe fonte para Google News
    let googleNewsSource = await getOrCreateGoogleNewsSource(supabase)

    const results = []
    let successCount = 0
    let duplicateCount = 0
    let errorCount = 0

    // Processar cada notícia
    for (const item of limitedNews) {
      try {
        // Verificar se já existe notícia com esta URL
        const { data: existing } = await supabase
          .from('scraped_news')
          .select('id')
          .eq('original_url', item.link)
          .single()

        if (existing) {
          duplicateCount++
          results.push({
            title: item.title,
            url: item.link,
            status: 'duplicate',
            message: 'Notícia já existe na base de dados'
          })
          continue
        }

        // Extrair conteúdo da notícia (resumo do Google News)
        const content = await extractNewsContent(item)

        // Salvar notícia na base de dados
        const { data: savedNews, error: saveError } = await supabase
          .from('scraped_news')
          .insert({
            title: item.title,
            summary: item.description || content.summary,
            content: content.fullText || item.description,
            original_url: item.link,
            published_at: new Date(item.pubDate).toISOString(),
            image_url: item.imageUrl,
            author: item.source,
            tags: extractTags(item.title, item.description),
            source_id: googleNewsSource.id,
            metadata: {
              google_news: true,
              query: query,
              category: category,
              original_source: item.source
            }
          })
          .select()
          .single()

        if (saveError) {
          console.error('Erro ao salvar notícia:', saveError)
          errorCount++
          results.push({
            title: item.title,
            url: item.link,
            status: 'error',
            error: 'Erro ao salvar na base de dados'
          })
          continue
        }

        successCount++
        results.push({
          id: savedNews.id,
          title: item.title,
          url: item.link,
          source: item.source,
          status: 'success'
        })

      } catch (error) {
        console.error('Erro ao processar notícia:', error)
        errorCount++
        results.push({
          title: item.title,
          url: item.link,
          status: 'error',
          error: error instanceof Error ? error.message : 'Erro desconhecido'
        })
      }
    }

    // Atualizar estatísticas da fonte
    await supabase
      .from('news_sources')
      .update({ 
        last_fetch: new Date().toISOString()
      })
      .eq('id', googleNewsSource.id)

    return NextResponse.json({
      success: errorCount === 0,
      data: {
        query,
        category,
        time_range: timeRange,
        total_found: newsItems.length,
        total_processed: limitedNews.length,
        collected: successCount,
        duplicates: duplicateCount,
        errors: errorCount,
        source_id: googleNewsSource.id,
        results: results.slice(0, 10) // Limitar resultado para não sobrecarregar
      }
    })

  } catch (error) {
    console.error('Erro na coleta do Google News:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

// GET - Obter configurações e estatísticas do Google News
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '7')

    // Buscar fonte do Google News
    const { data: source } = await supabase
      .from('news_sources')
      .select('*')
      .eq('name', 'Google News')
      .single()

    if (!source) {
      return NextResponse.json({
        success: true,
        data: {
          configured: false,
          message: 'Fonte Google News não configurada'
        }
      })
    }

    // Estatísticas dos últimos dias
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: newsStats } = await supabase
      .from('scraped_news')
      .select('id, title, published_at, created_at')
      .eq('source_id', source.id)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false })

    // Agrupar por dia
    const statsByDay = (newsStats || []).reduce((acc: any, news: any) => {
      const day = new Date(news.created_at).toISOString().split('T')[0]
      acc[day] = (acc[day] || 0) + 1
      return acc
    }, {})

    return NextResponse.json({
      success: true,
      data: {
        configured: true,
        source,
        period: {
          days,
          start_date: startDate.toISOString(),
          end_date: new Date().toISOString()
        },
        stats: {
          total_collected: newsStats?.length || 0,
          by_day: Object.entries(statsByDay).map(([date, count]) => ({
            date,
            count
          })),
          last_fetch: source.last_fetch,
          last_results: 0
        },
        available_categories: [
          { value: null, label: 'Todas as categorias' },
          { value: 'business', label: 'Negócios' },
          { value: 'entertainment', label: 'Entretenimento' },
          { value: 'health', label: 'Saúde' },
          { value: 'science', label: 'Ciência' },
          { value: 'sports', label: 'Esportes' },
          { value: 'technology', label: 'Tecnologia' }
        ]
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

// Função para construir URL do Google News RSS
function buildGoogleNewsUrl(query: string, language: string, country: string, category: string | null, timeRange: string): string {
  const baseUrl = 'https://news.google.com/rss'
  
  if (category) {
    // URL para categoria específica
    return `${baseUrl}/topics/CAAqJggKIiBDQkFTRWdvSUwyMHZNRFZxYUdjU0FuQjBHZ0pDVWlnQVAB?hl=${language}&gl=${country}&ceid=${country}:${language}`
  } else {
    // URL para busca por termos
    const encodedQuery = encodeURIComponent(query)
    return `${baseUrl}/search?q=${encodedQuery}&hl=${language}&gl=${country}&ceid=${country}:${language}`
  }
}

// Função para fazer parse do XML do Google News
function parseGoogleNewsXML(xmlData: string): GoogleNewsItem[] {
  const items: GoogleNewsItem[] = []
  
  try {
    // Regex simples para extrair itens do RSS
    const itemRegex = /<item>([\s\S]*?)<\/item>/g
    const matches = xmlData.match(itemRegex)

    if (!matches) return items

    for (const match of matches) {
      const title = extractXMLTag(match, 'title')
      const link = extractXMLTag(match, 'link')
      const pubDate = extractXMLTag(match, 'pubDate')
      const description = extractXMLTag(match, 'description')
      
      // Extrair fonte do título (formato típico: "Título - Fonte")
      const source = title.includes(' - ') ? 
        title.split(' - ').pop()?.trim() || 'Google News' : 
        'Google News'

      if (title && link && pubDate) {
        items.push({
          title: title.replace(` - ${source}`, '').trim(),
          link: link.replace(/^https:\/\/news\.google\.com\/.*?url=/, '').split('&')[0],
          pubDate,
          description: description?.replace(/<[^>]*>/g, ''), // Remove HTML tags
          source
        })
      }
    }
  } catch (error) {
    console.error('Erro ao fazer parse do XML:', error)
  }

  return items
}

// Função auxiliar para extrair tags XML
function extractXMLTag(xml: string, tag: string): string {
  const regex = new RegExp(`<${tag}[^>]*>(.*?)<\/${tag}>`, 's')
  const match = xml.match(regex)
  return match ? match[1].trim() : ''
}

// Função para extrair conteúdo da notícia
async function extractNewsContent(item: GoogleNewsItem): Promise<{ summary: string, fullText: string }> {
  // Para o Google News RSS, normalmente temos apenas o título e descrição básica
  // Aqui podemos implementar lógica para extrair mais conteúdo se necessário
  return {
    summary: item.description || item.title,
    fullText: item.description || item.title
  }
}

// Função para extrair tags da notícia
function extractTags(title: string, description?: string): string[] {
  const text = `${title} ${description || ''}`.toLowerCase()
  const tags: string[] = []

  // Lista de palavras-chave para identificar tags
  const keywords = [
    'política', 'economia', 'esporte', 'futebol', 'saúde', 'tecnologia',
    'educação', 'covid', 'vacina', 'eleição', 'governo', 'brasil',
    'são paulo', 'rio de janeiro', 'presidente', 'ministro', 'congresso'
  ]

  keywords.forEach(keyword => {
    if (text.includes(keyword)) {
      tags.push(keyword)
    }
  })

  return tags
}

// Função para obter ou criar fonte do Google News
async function getOrCreateGoogleNewsSource(supabase: any) {
  // Verificar se já existe
  const { data: existing } = await supabase
    .from('news_sources')
    .select('*')
    .eq('name', 'Google News')
    .single()

  if (existing) {
    return existing
  }

  // Criar nova fonte
  const { data: newSource, error } = await supabase
    .from('news_sources')
    .insert({
      name: 'Google News',
      url: 'https://news.google.com',
      type: 'rss',
      is_active: true
    })
    .select()
    .single()

  if (error) {
    throw new Error('Erro ao criar fonte Google News: ' + error.message)
  }

  return newSource
}
