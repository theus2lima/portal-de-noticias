// src/app/api/curadoria/buscar/route.ts
// Busca notícias de 3 fontes: Google News RSS, Sites do Paraná (hardcoded), Fontes RSS do banco
// 🔐 Exige autenticação de admin

import { NextRequest, NextResponse } from 'next/server'
import Parser from 'rss-parser'
import * as cheerio from 'cheerio'
import { createClient } from '@supabase/supabase-js'
import { requireAuth } from '@/lib/auth'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const rssParser = new Parser({
  customFields: {
    item: ['media:content', 'enclosure', 'source', 'description', 'content:encoded'],
  },
})

// Fontes RSS fixas do Paraná
const PARANA_RSS_SOURCES = [
  { name: 'Bem Paraná',        url: 'https://www.bemparana.com.br/feed/' },
  { name: 'Banda B',           url: 'https://bandab.com.br/feed/' },
  { name: 'Paraná Portal',     url: 'https://paranaportal.uol.com.br/feed/' },
  { name: 'G1 Paraná',         url: 'https://g1.globo.com/rss/g1/parana/' },
  { name: 'Folha de Londrina', url: 'https://www.folhadelondrina.com.br/rss.xml' },
  { name: 'Tribuna do Paraná', url: 'https://tribunapr.uol.com.br/feed/' },
  { name: 'Ric Mais',          url: 'https://ricmais.com.br/feed/' },
  { name: 'RPC',               url: 'https://g1.globo.com/rss/g1/pr/parana/' },
]

// Timeout real usando Promise.race — o rss-parser não suporta AbortController
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout após ${ms}ms`)), ms)
  )
  return Promise.race([promise, timeout])
}

function extractImage(item: any): string | null {
  if (item['media:content']?.$?.url) return item['media:content'].$.url
  if (item.enclosure?.url && /\.(jpg|jpeg|png|webp)/i.test(item.enclosure.url)) return item.enclosure.url
  const html = item['content:encoded'] || item.content || item.description || ''
  const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
  if (match?.[1] && !match[1].includes('pixel') && !match[1].includes('tracking')) return match[1]
  return null
}

function cleanSummary(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .substring(0, 400)
}

async function parseRSSFeed(url: string, timeoutMs = 7000) {
  return withTimeout(
    rssParser.parseURL(url),
    timeoutMs
  )
}

function buildItem(item: any, sourceName: string, sourceUrl: string, origin: 'google' | 'parana' | 'rss') {
  return {
    id: item.guid || item.link || Math.random().toString(36),
    title: (item.title || '').replace(/\s*-\s*[^-]+$/, '').trim(),
    url: item.link || '',
    summary: cleanSummary(item.contentSnippet || item.summary || item.description || ''),
    source_name: sourceName,
    source_url: sourceUrl,
    published_at: item.pubDate
      ? new Date(item.pubDate).toISOString()
      : new Date().toISOString(),
    image_url: extractImage(item),
    origin,
  }
}

export async function GET(request: NextRequest) {
  // 🔐 Apenas admins autenticados
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { searchParams } = new URL(request.url)
  const query = searchParams.get('q') || 'Noroeste do Paraná'
  const source = searchParams.get('source') || 'google'

  const results: any[] = []
  const errors: string[] = []

  // ── 1. Google News RSS ────────────────────────────────────────────────────────
  if (source === 'google' || source === 'all') {
    try {
      const googleUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=pt-BR&gl=BR&ceid=BR:pt-BR`
      const feed = await parseRSSFeed(googleUrl, 10000)

      for (const item of (feed.items || []).slice(0, 25)) {
        const sourceName =
          (item as any).source?._ ||
          (item as any).source?.name ||
          'Google News'
        results.push(buildItem(item, sourceName, '', 'google'))
      }
    } catch (err: any) {
      errors.push(`Google News: ${err.message}`)
      console.error('Google News RSS error:', err.message)
    }
  }

  // ── 2. Sites do Paraná (RSS fixos) ────────────────────────────────────────────
  if (source === 'parana' || source === 'all') {
    const promises = PARANA_RSS_SOURCES.map(async (src) => {
      try {
        const feed = await parseRSSFeed(src.url, 7000)
        return (feed.items || []).slice(0, 6).map((item) =>
          buildItem(item, src.name, src.url, 'parana')
        )
      } catch (err: any) {
        errors.push(`${src.name}: ${err.message}`)
        return []
      }
    })

    const allItems = (await Promise.allSettled(promises))
      .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
      .flatMap((r) => r.value)

    results.push(...allItems)
  }

  // ── 3. Fontes RSS do banco (Supabase) ─────────────────────────────────────────
  if (source === 'rss' || source === 'all') {
    try {
      const { data: dbSources, error } = await supabase
        .from('news_sources')
        .select('id, name, url')
        .eq('is_active', true)
        .eq('type', 'rss')
        .limit(15)

      if (error) {
        // Tabela ainda não existe — silencia o erro
        if (error.code !== '42P01') {
          errors.push(`Fontes RSS (banco): ${error.message}`)
        }
      } else if (dbSources && dbSources.length > 0) {
        const promises = dbSources.map(async (src: any) => {
          try {
            const feed = await parseRSSFeed(src.url, 7000)
            return (feed.items || []).slice(0, 5).map((item) =>
              buildItem(item, src.name, src.url, 'rss')
            )
          } catch (err: any) {
            errors.push(`${src.name}: ${err.message}`)
            return []
          }
        })

        const allItems = (await Promise.allSettled(promises))
          .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
          .flatMap((r) => r.value)

        results.push(...allItems)
      } else if (source === 'rss') {
        // Nenhuma fonte cadastrada ainda — mostra as fixas do Paraná como fallback
        const promises = PARANA_RSS_SOURCES.map(async (src) => {
          try {
            const feed = await parseRSSFeed(src.url, 7000)
            return (feed.items || []).slice(0, 4).map((item) =>
              buildItem(item, src.name, src.url, 'rss')
            )
          } catch {
            return []
          }
        })

        const allItems = (await Promise.allSettled(promises))
          .filter((r): r is PromiseFulfilledResult<any[]> => r.status === 'fulfilled')
          .flatMap((r) => r.value)

        results.push(...allItems)
      }
    } catch (err: any) {
      errors.push(`Fontes RSS: ${err.message}`)
    }
  }

  // Deduplica por URL e ordena por data desc
  const seen = new Set<string>()
  const unique = results
    .filter((item) => item.url && item.title)
    .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
    .filter((item) => {
      if (seen.has(item.url)) return false
      seen.add(item.url)
      return true
    })

  return NextResponse.json({
    success: true,
    data: unique,
    total: unique.length,
    ...(errors.length > 0 ? { errors } : {}),
  })
}
