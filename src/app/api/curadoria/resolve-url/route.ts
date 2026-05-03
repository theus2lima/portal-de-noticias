// src/app/api/curadoria/resolve-url/route.ts
// Segue redirects server-side e retorna a URL final do artigo.
// Usado para resolver links do Google News (que são redirects) antes de exibir no iframe.

import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth'
import { validateExternalUrl, SsrfBlockedError } from '@/lib/ssrf'

export async function POST(request: NextRequest) {
  // 🔐 Apenas admins autenticados podem usar este endpoint
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  const { url } = await request.json()

  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'URL obrigatória' }, { status: 400 })
  }

  try {
    validateExternalUrl(url)
  } catch (err) {
    if (err instanceof SsrfBlockedError) {
      return NextResponse.json({ error: err.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'URL inválida' }, { status: 400 })
  }

  try {
    // Faz HEAD request seguindo todos os redirects — retorna a URL final
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(8000),
    })

    const resolvedUrl = res.url

    // Valida a URL resolvida também (proteção contra redirect para IP interno)
    try {
      validateExternalUrl(resolvedUrl)
    } catch {
      return NextResponse.json({ error: 'URL resolvida inválida ou interna' }, { status: 400 })
    }

    return NextResponse.json({ resolvedUrl })
  } catch (err: any) {
    console.error('resolve-url error:', err?.message)
    // Retorna a URL original como fallback — o iframe tentará mesmo assim
    return NextResponse.json({ resolvedUrl: url })
  }
}
