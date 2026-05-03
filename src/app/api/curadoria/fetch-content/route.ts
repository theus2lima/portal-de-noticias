// src/app/api/curadoria/fetch-content/route.ts
// Busca e extrai o texto de um artigo a partir da URL.
// Usado pelo painel esquerdo da página de reescrita para mostrar o original.

import { NextRequest, NextResponse } from 'next/server'
import * as cheerio from 'cheerio'
import { requireAuth } from '@/lib/auth'
import { validateExternalUrl, SsrfBlockedError } from '@/lib/ssrf'

const ARTICLE_SELECTORS = [
  'article .content', 'article .post-content', 'article .entry-content',
  'article .article-body', '.article-content', '.post-body',
  '.entry-content', '.content-body', '[itemprop="articleBody"]',
  'article', 'main article', '.main-content', 'main',
]

async function extractText(url: string): Promise<{ text: string; finalUrl: string }> {
  validateExternalUrl(url)

  const isGoogleNews = url.includes('news.google.com')

  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'pt-BR,pt;q=0.9',
      // Referer ajuda no redirect do Google News
      ...(isGoogleNews ? { Referer: 'https://news.google.com/' } : {}),
    },
    redirect: 'follow',
    signal: AbortSignal.timeout(10000),
  })

  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const finalUrl = res.url
  const html = await res.text()
  const $ = cheerio.load(html)

  $('script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar, .widget, .comments, .related, [class*="cookie"], [class*="popup"], [id*="popup"], [class*="newsletter"], [class*="subscribe"]').remove()

  // Tenta seletores específicos de artigo primeiro
  for (const sel of ARTICLE_SELECTORS) {
    const el = $(sel).first()
    if (el.length) {
      const text = el.find('p')
        .map((_: any, p: any) => $(p).text().trim())
        .get()
        .filter((t: string) => t.length > 40)
        .join('\n\n')
      if (text.length > 300) return { text, finalUrl }
    }
  }

  // Fallback: todos os <p> da página
  const text = $('p')
    .map((_: any, el: any) => $(el).text().trim())
    .get()
    .filter((t: string) => t.length > 60)
    .join('\n\n')

  return { text, finalUrl }
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { url } = await request.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ success: false, error: 'URL obrigatória' }, { status: 400 })
  }

  try {
    validateExternalUrl(url)
  } catch (err) {
    if (err instanceof SsrfBlockedError) {
      return NextResponse.json({ success: false, error: err.message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: 'URL inválida' }, { status: 400 })
  }

  try {
    const { text, finalUrl } = await extractText(url)

    if (!text || text.length < 100) {
      return NextResponse.json({
        success: false,
        error: 'Conteúdo não encontrado — o site pode exigir JavaScript ou bloquear leitura automática.',
        finalUrl,
      })
    }

    return NextResponse.json({
      success: true,
      content: text.substring(0, 8000),
      finalUrl,
    })
  } catch (err: any) {
    const msg = err?.message || 'Erro ao buscar conteúdo'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
