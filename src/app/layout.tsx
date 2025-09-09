import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { generateSEO, generateOrganizationSchema } from '@/lib/seo'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = generateSEO({
  title: 'Portal de Notícias',
  description: 'Fique por dentro das principais notícias de política, economia, esportes, cultura e cidades do Brasil. Portal de notícias confiável com informações atualizadas em tempo real.',
  keywords: ['notícias brasil', 'política brasileira', 'economia brasil', 'esportes', 'cultura', 'cidades', 'jornalismo', 'informação', 'notícias atualizadas', 'breaking news'],
  url: 'https://portal-de-noticias.vercel.app',
  type: 'website'
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#16A34A',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const organizationSchema = generateOrganizationSchema()
  
  return (
    <html lang="pt-BR">
      <head>
        {/* Favicon and Icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-icon.svg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Color */}
        <meta name="theme-color" content="#16A34A" />
        <meta name="msapplication-TileColor" content="#1E3A8A" />
        
        {/* JSON-LD Schema */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        
        {/* DNS Prefetch */}
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      </head>
      <body className={`${inter.className} bg-neutral-50`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1" role="main">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
