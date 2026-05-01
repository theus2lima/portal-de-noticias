// src/middleware.ts
// Proteção server-side de todas as rotas /admin
// Roda no Edge runtime — usa jose (compatível com Edge, sem Node.js APIs)

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteger todas as rotas /admin, exceto a página de login
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = request.cookies.get('admin_token')?.value

    if (!token) {
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }

    try {
      const jwtSecret = process.env.JWT_SECRET
      if (!jwtSecret) {
        const loginUrl = new URL('/admin/login', request.url)
        return NextResponse.redirect(loginUrl)
      }
      const secret = new TextEncoder().encode(jwtSecret)
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      // Token inválido ou expirado
      const loginUrl = new URL('/admin/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      const response = NextResponse.redirect(loginUrl)
      response.cookies.delete('admin_token')
      return response
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
