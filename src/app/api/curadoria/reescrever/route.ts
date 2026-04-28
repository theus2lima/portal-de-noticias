import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import * as cheerio from 'cheerio'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || '' })

async function fetchArticleContent(url: string): Promise<string> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      signal: AbortSignal.timeout(8000),
      redirect: 'follow',
    })

    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    const $ = cheerio.load(html)

    // Remove noise elements
    $('script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar, .widget, .comments, .related, [class*="cookie"], [class*="popup"], [id*="popup"]').remove()

    // Try common content selectors in order of preference
    const selectors = [
      'article .content',
      'article .post-content',
      'article .entry-content',
      'article .article-body',
      '.article-content',
      '.post-body',
      '.entry-content',
      '.content-body',
      '[itemprop="articleBody"]',
      'article',
      'main article',
      '.main-content',
      'main',
    ]

    for (const sel of selectors) {
      const el = $(sel).first()
      if (el.length) {
        const text = el
          .find('p')
          .map((_: any, p: any) => $(p).text().trim())
          .get()
          .filter((t: string) => t.length > 40)
          .join('\n\n')
        if (text.length > 300) return text
      }
    }

    // Fallback: all paragraphs with substantial text
    const paragraphs = $('p')
      .map((_: any, el: any) => $(el).text().trim())
      .get()
      .filter((t: string) => t.length > 60)

    return paragraphs.join('\n\n')
  } catch (err) {
    console.error('Fetch article error:', err)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'OPENAI_API_KEY não configurada. Adicione em Variáveis de Ambiente no Vercel.' },
        { status: 400 }
      )
    }

    const { title, summary, url } = await request.json()

    if (!title) {
      return NextResponse.json({ success: false, error: 'Título obrigatório' }, { status: 400 })
    }

    // Try to fetch full article content
    let content = summary || ''
    if (url && (!content || content.length < 400)) {
      const fetched = await fetchArticleContent(url)
      if (fetched.length > content.length) {
        content = fetched
      }
    }

    // Build prompt
    const prompt = `Você é um jornalista experiente do portal de notícias regional do Noroeste do Paraná.
Sua missão é reescrever a notícia abaixo em linguagem jornalística brasileira contemporânea: clara, objetiva, sem cópias do original.

Regras:
- Mínimo de 4 parágrafos bem desenvolvidos
- Use linguagem acessível ao leitor regional
- Mantenha todos os fatos e dados importantes
- Se houver nomes, lugares e números, preserve-os
- Adapte o contexto para o público do Noroeste do Paraná quando possível
- NÃO copie frases do original — reescreva com suas palavras

Título original: ${title}

${content ? `Conteúdo original:\n${content.substring(0, 4000)}` : `Resumo: ${summary || 'Sem conteúdo disponível'}`}

Responda APENAS com JSON válido neste formato exato:
{
  "title": "título reescrito (atrativo e jornalístico)",
  "content": "conteúdo HTML com parágrafos em tags <p>, mínimo 4 parágrafos",
  "excerpt": "resumo de 2-3 frases para exibição na home",
  "keywords": ["palavra-chave-1", "palavra-chave-2", "palavra-chave-3", "palavra-chave-4"]
}`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      max_tokens: 2500,
      temperature: 0.7,
    })

    const raw = completion.choices[0]?.message?.content || '{}'
    let result: any

    try {
      result = JSON.parse(raw)
    } catch {
      return NextResponse.json(
        { success: false, error: 'Erro ao processar resposta da IA' },
        { status: 500 }
      )
    }

    if (!result.title || !result.content) {
      return NextResponse.json(
        { success: false, error: 'IA não retornou título ou conteúdo válido' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        title: result.title,
        content: result.content,
        excerpt: result.excerpt || '',
        keywords: result.keywords || [],
      },
    })
  } catch (error: any) {
    console.error('Rewrite error:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Erro interno' },
      { status: 500 }
    )
  }
}
