import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Footer from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Portal de Notícias - Sua fonte confiável de informação',
  description: 'Fique por dentro das principais notícias de política, economia, esportes, cultura e cidades. Portal de notícias confiável e atualizado.',
  keywords: 'notícias, política, economia, esportes, cultura, cidades, jornalismo',
  authors: [{ name: 'Portal de Notícias' }],
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    title: 'Portal de Notícias',
    description: 'Sua fonte confiável de informação',
    siteName: 'Portal de Notícias',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Portal de Notícias',
    description: 'Sua fonte confiável de informação',
  }
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-neutral-50`}>
        <div className="min-h-screen flex flex-col">
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  )
}
