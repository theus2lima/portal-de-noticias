import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import * as cheerio from 'cheerio'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

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

    $('script, style, nav, header, footer, aside, .ad, .advertisement, .sidebar, .widget, .comments, .related, [class*="cookie"], [class*="popup"], [id*="popup"]').remove()

    const selectors = [
      'article .content', 'article .post-content', 'article .entry-content',
      'article .article-body', '.article-content', '.post-body',
      '.entry-content', '.content-body', '[itemprop="articleBody"]',
      'article', 'main article', '.main-content', 'main',
    ]

    for (const sel of selectors) {
      const el = $(sel).first()
      if (el.length) {
        const text = el.find('p')
          .map((_: any, p: any) => $(p).text().trim())
          .get()
          .filter((t: string) => t.length > 40)
          .join('\n\n')
        if (text.length > 300) return text
      }
    }

    return $('p')
      .map((_: any, el: any) => $(el).text().trim())
      .get()
      .filter((t: string) => t.length > 60)
      .join('\n\n')
  } catch (err) {
    console.error('Fetch article error:', err)
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { success: false, error: 'GEMINI_API_KEY não configurada. Adicione em Variáveis de Ambiente no Vercel.' },
        { status: 400 }
      )
    }

    const { title, summary, url } = await request.json()

    if (!title) {
      return NextResponse.json({ success: false, error: 'Título obrigatório' }, { status: 400 })
    }

    // Tentar buscar conteúdo completo do artigo
    let content = summary || ''
    if (url && (!content || content.length < 400)) {
      const fetched = await fetchArticleContent(url)
      if (fetched.length > content.length) content = fetched
    }

    const prompt = `Você é um jornalista experiente do portal de notícias regional do Noroeste do Paraná.
Reescreva a notícia abaixo em linguagem jornalística brasileira contemporânea: clara, objetiva, sem cópias do original.

Regras:
- Mínimo de 4 parágrafos bem desenvolvidos
- Use linguagem acessível ao leitor regional
- Mantenha todos os fatos, dados, nomes e lugares importantes
- Adapte para o contexto do Noroeste do Paraná quando possível
- NÃO copie frases do original — reescreva com suas próprias palavras

Título original: ${title}

${content ? `Conteúdo original:\n${content.substring(0, 4000)}` : `Resumo: ${summary || 'Sem conteúdo disponível'}`}

Responda APENAS com um objeto JSON válido, sem texto antes ou depois, neste formato:
{
  "title": "título reescrito atrativo e jornalístico",
  "content": "conteúdo HTML com parágrafos em tags <p>, mínimo 4 parágrafos",
  "excerpt": "resumo de 2-3 frases para exibição na home",
  "keywords": ["palavra-chave-1", "palavra-chave-2", "palavra-chave-3", "palavra-chave-4"]
}`

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      generationConfig: {
        responseMimeType: 'application/json',
        maxOutputTokens: 2500,
        temperature: 0.7,
      },
    })

    const result = await model.generateContent(prompt)
    const raw = result.response.text()

    // Extrair JSON mesmo se vier com texto ao redor
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ success: false, error: 'Resposta da IA fora do formato esperado' }, { status: 500 })
    }

    let parsed: any
    try {
      parsed = JSON.parse(jsonMatch[0])
    } catch {
      return NextResponse.json({ success: false, error: 'Erro ao processar resposta da IA' }, { status: 500 })
    }

    if (!parsed.title || !parsed.content) {
      return NextResponse.json({ success: false, error: 'IA não retornou título ou conteúdo válido' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        title: parsed.title,
        content: parsed.content,
        excerpt: parsed.excerpt || '',
        keywords: parsed.keywords || [],
      },
    })
  } catch (error: any) {
    console.error('Rewrite error:', error)
    const msg = error?.message || 'Erro interno'
    return NextResponse.json({ success: false, error: msg }, { status: 500 })
  }
}
