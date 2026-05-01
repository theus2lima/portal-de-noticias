/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },

  async headers() {
    // CSP para o painel /admin — mais restritivo
    const adminCsp = [
      "default-src 'self'",
      // Scripts: apenas o próprio domínio + Next.js inline (necessário para RSC/hydration)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      // Estilos: self + inline (Tailwind gera estilos inline)
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      // Fontes
      "font-src 'self' https://fonts.gstatic.com",
      // Imagens: self + data URIs + blob + qualquer https (uploads de imagem)
      "img-src 'self' data: blob: https:",
      // Conexões API: apenas o próprio domínio
      "connect-src 'self'",
      // Frames: nenhum (admin não usa iframes)
      "frame-src 'none'",
      // Objetos: nenhum
      "object-src 'none'",
      // Base URI: apenas self
      "base-uri 'self'",
      // Form actions: apenas self
      "form-action 'self'",
    ].join('; ')

    // CSP para páginas públicas — mais permissivo (widgets, embeds, etc.)
    const publicCsp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.google-analytics.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https:",
      "connect-src 'self' https://www.google-analytics.com https://analytics.google.com",
      "frame-src 'self' https://www.youtube.com https://www.youtube-nocookie.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ')

    return [
      // ✅ CORS explícito para API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: 'https://radarnoroestepr.com.br' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
        ],
      },
      // ✅ Bloquear indexação do /admin + CSP restritivo
      {
        source: '/admin/:path*',
        headers: [
          { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Content-Security-Policy', value: adminCsp },
        ],
      },
      // ✅ Headers de segurança gerais + CSP para páginas públicas
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Content-Security-Policy', value: publicCsp },
        ],
      },
    ]
  },
}

module.exports = nextConfig
