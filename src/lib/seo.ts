import { Metadata } from 'next'

interface SEOProps {
  title?: string
  description?: string
  keywords?: string[]
  image?: string
  url?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  author?: string
  category?: string
  tags?: string[]
}

export function generateSEO({
  title = 'Portal de Notícias',
  description = 'Fique por dentro das principais notícias de política, economia, esportes, cultura e cidades. Portal de notícias confiável e atualizado.',
  keywords = ['notícias', 'política', 'economia', 'esportes', 'cultura', 'cidades', 'jornalismo', 'brasil'],
  image = '/og-image.svg',
  url = 'https://portal-de-noticias.vercel.app',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  category,
  tags = []
}: SEOProps = {}): Metadata {
  
  const fullTitle = title === 'Portal de Notícias' 
    ? 'Portal de Notícias - Sua fonte confiável de informação'
    : `${title} - Portal de Notícias`

  const allKeywords = [...keywords, ...tags].join(', ')

  const metadata: Metadata = {
    metadataBase: new URL('https://portal-de-noticias.vercel.app'),
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: 'Portal de Notícias' }],
    creator: 'Portal de Notícias',
    publisher: 'Portal de Notícias',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: type as any,
      locale: 'pt_BR',
      url,
      siteName: 'Portal de Notícias',
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@portalnoticias',
      site: '@portalnoticias',
    },
    verification: {
      google: 'google-site-verification-token', // Substituir pelo token real
      yandex: 'yandex-verification-token', // Substituir pelo token real
    },
  }

  // Adicionar dados específicos para artigos
  if (type === 'article') {
    metadata.openGraph = {
      ...metadata.openGraph,
      type: 'article',
      publishedTime,
      modifiedTime,
      authors: author ? [author] : undefined,
      section: category,
      tags,
    }
  }

  return metadata
}

// JSON-LD Schema para SEO estruturado
export function generateArticleSchema({
  headline,
  description,
  image,
  datePublished,
  dateModified,
  author,
  category,
  url,
}: {
  headline: string
  description: string
  image: string
  datePublished: string
  dateModified?: string
  author: string
  category: string
  url: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    image: [image],
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: author,
      url: 'https://portal-de-noticias.vercel.app/autor/' + author.toLowerCase().replace(' ', '-'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Portal de Notícias',
      url: 'https://portal-de-noticias.vercel.app',
      logo: {
        '@type': 'ImageObject',
        url: 'https://portal-de-noticias.vercel.app/icon.svg',
        width: 60,
        height: 60,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: category,
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Portal de Notícias',
    alternateName: 'Portal Notícias',
    description: 'Sua fonte confiável de informação sobre política, economia, esportes, cultura e cidades',
    url: 'https://portal-de-noticias.vercel.app',
    logo: {
      '@type': 'ImageObject',
      url: 'https://portal-de-noticias.vercel.app/icon.svg',
      width: 60,
      height: 60,
    },
    sameAs: [
      'https://facebook.com/portalnoticias',
      'https://twitter.com/portalnoticias',
      'https://instagram.com/portalnoticias',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      email: 'contato@portalnoticias.com.br',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      addressLocality: 'São Paulo',
      addressRegion: 'SP',
    },
    knowsAbout: [
      'política brasileira',
      'economia',
      'esportes',
      'cultura',
      'notícias locais',
    ],
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
