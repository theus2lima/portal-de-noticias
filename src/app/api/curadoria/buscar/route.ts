import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import * as cheerio from 'cheerio'

const rssParser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'source', 'description', 'content:encoded'],
  },
  requestOptions: {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml',
      'Accept-Language': 'pt-BR,pt;q=0.9',
    },
  },
})

// Fontes RSS fixas do Paraná com seus feeds
const PARANA_RSS_SOURCES = [
  { name: 'Bem Paraná', url: 'https://www.bemparana.com.br/feed/' },
  { name: 'Banda B', url: 'https://bandab.com.br/feed/' },
  { name: 'Paraná Portal', url: 'https://paranaportal.uol.com.br/feed/' },
  { name: 'Ric Mais', url: 'https://ricmais.com.br/feed/' },
  { name: 'G1 Paraná', url: 'https://g1.globo.com/rss/g1/parana/' },
  { name: 'CBN Maringá', url: 'https://cbncascavel.com.br/feed/' },
  { name: 'Folha de Londrina', url: 'https://www.folhadelondrina.com.br/rss.xml' },
  { name: 'Tribuna do Paraná', url: 'https://tribunapr.uol.com.br/feed/' },
]

function extractImage(item: any): string | null {
  if (item['media:content']?.$?.url) return item['media:content'].$.url
  if (item.enclosure?.url && item.enclosure.url.match(/\.(jpg|jpeg|png|webp)/i)) return item.enclosure.url
  const html = item['content:encoded'] || item.content || item.description || ''
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (match?.[1] && !match[1].includes('pixel') && !match[1].includes('tracking')) return match[1]
  return null
}

function cleanSummary(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 300)
}

async function fetchWithTimeout(url: string, timeoutMs = 6000): Promise<any> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await rssParser.parseURL(url)
  } finally {
    clearTimeout(timer)
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || 'Paraná Noroeste'
  const source = searchParams.get('source') || 'google' // google | parana | rss | all

  const results: any[] = []
  const errors: string[] = []

  // ── Google News RSS ──────────────────────────────────────────────────────────
  if (source === 'google' || source === 'all') {
    try {
      const googleUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-BR&num=30`
      const feed = await fetchWithTimeout(googleUrl, 8000)

      for (const item of (feed.items || []).slice(0, 25)) {
        const sourceName = (item as any).source?._
          || (item as any).source?.name
          || 'Google News'

        results.push({
          id: item.guid || item.link || Math.random().toString(),
          title: (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim(), // remove source suffix
          url: item.link || '',
          summary: cleanSummary(item.contentSnippet || item.summary || ''),
          source_name: sourceName,
          source_url: '',
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
          image_url: extractImage(item),
          origin: 'google',
        })
      }
    } catch (err: any) {
      errors.push(`Google News: ${err.message}`)
      console.error('Google News RSS error:', err.message)
    }
  }

  // ── Sites do Paraná (RSS fixos) ──────────────────────────────────────────────
  if (source === 'parana' || source === 'all') {
    const promises = PARANA_RSS_SOURCES.map(async (src) => {
      try {
        const feed = await fetchWithTimeout(src.url, 6000)
        const items = []
        for (const item of (feed.items || []).slice(0, 6)) {
          items.push({
            id: item.guid || item.link || Math.random().toString(),
            title: item.title || '',
            url: item.link || '',
            summary: cleanSummary(item.contentSnippet || item.summary || ''),
            source_name: src.name,
            source_url: src.url,
            published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
            image_url: extractImage(item),
            origin: 'parana',
          })
        }
        return items
      } catch (err: any) {
        errors.push(`${src.name}: ${err.message}`)
        return []
      }
    })

    const allItems = await Promise.all(promises)
    results.push(...allItems.flat())
  }

  // ── Fontes RSS do banco (Supabase) ───────────────────────────────────────────
  if (source === 'rss' || source === 'all') {
    try {
      const { createClient } = await import('@/utils/supabase/server')
      const supabase = await createClient()
      const { data: dbSources } = await supabase
        .from('news_sources')
        .select('id, name, url, type')
        .eq('is_active', true)
        .eq('type', 'rss')
        .limit(10)

      if (dbSources && dbSources.length > 0) {
        const promises = dbSources.map(async (src: any) => {
          try {
            const feed = await fetchWithTimeout(src.url, 6000)
            const items = []
            for (const item of (feed.items || []).slice(0, 5)) {
              items.push({
                id: item.guid || item.link || Math.random().toString(),
                title: item.title || '',
                url: item.link || '',
                summary: cleanSummary(item.contentSnippet || item.summary || ''),
                source_name: src.name,
                source_url: src.url,
                published_at: item.pubDate ? new Date(item.pubDate).toISOString() : new Date().toISOString(),
                image_url: extractImage(item),
                origin: 'rss',
              })
            }
            return items
          } catch (err: any) {
            return []
          }
        })
        const allItems = await Promise.all(promises)
        results.push(...allItems.flat())
      }
    } catch (err) {
      // Supabase not needed for basic fetching
    }
  }

  // Sort by date descending, deduplicate by URL
  const seen = new Set<string>()
  const unique = results
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .filter((item) => {
      if (!item.url || seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })

  return NextResponse.json({
    success: true,
    data: unique,
    total: unique.length,
    errors: errors.length > 0 ? errors : undefined,
  })
}
