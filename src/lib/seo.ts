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
  title = 'Radar Noroeste PR',
  description = 'Fique por dentro das principais notícias de política, economia, esportes, cultura e cidades do Noroeste do Paraná. Portal de notícias confiável e atualizado.',
  keywords = ['notícias', 'política', 'economia', 'esportes', 'cultura', 'cidades', 'jornalismo', 'paraná', 'noroeste'],
  image = '/og-image.svg',
  url = 'https://radarnoroestepr.com.br',
  type = 'website',
  publishedTime,
  modifiedTime,
  author,
  category,
  tags = []
}: SEOProps = {}): Metadata {
  
  const fullTitle = title === 'Radar Noroeste PR' 
    ? 'Radar Noroeste PR - Sua fonte confiável de informação'
    : `${title} - Radar Noroeste PR`

  const allKeywords = [...keywords, ...tags].join(', ')

  // Garantir que a URL base não seja duplicada
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radarnoroestepr.com.br'
  const cleanUrl = url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? url : '/' + url}`
  
  const metadata: Metadata = {
    metadataBase: new URL(baseUrl),
    title: fullTitle,
    description,
    keywords: allKeywords,
    authors: author ? [{ name: author }] : [{ name: 'Radar Noroeste PR' }],
    creator: 'Radar Noroeste PR',
    publisher: 'Radar Noroeste PR',
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
      canonical: cleanUrl,
    },
    openGraph: {
      type: type as any,
      locale: 'pt_BR',
      url: cleanUrl,
      siteName: 'Radar Noroeste PR',
      title: fullTitle,
      description,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title || 'Radar Noroeste PR - Notícias',
          type: image.endsWith('.png') ? 'image/png' : image.endsWith('.jpg') || image.endsWith('.jpeg') ? 'image/jpeg' : 'image/svg+xml',
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@radarnoroestepr',
      site: '@radarnoroestepr',
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
      url: 'https://radarnoroestepr.com.br/autor/' + author.toLowerCase().replace(' ', '-'),
    },
    publisher: {
      '@type': 'Organization',
      name: 'Radar Noroeste PR',
      url: 'https://radarnoroestepr.com.br',
      logo: {
        '@type': 'ImageObject',
        url: 'https://radarnoroestepr.com.br/icon.svg',
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
    name: 'Radar Noroeste PR',
    alternateName: 'Radar Noroeste',
    description: 'Sua fonte confiável de informação sobre política, economia, esportes, cultura e cidades do Noroeste do Paraná',
    url: 'https://radarnoroestepr.com.br',
    logo: {
      '@type': 'ImageObject',
      url: 'https://radarnoroestepr.com.br/icon.svg',
      width: 60,
      height: 60,
    },
    sameAs: [
      'https://facebook.com/radarnoroestepr',
      'https://twitter.com/radarnoroestepr',
      'https://instagram.com/radarnoroestepr',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'editorial',
      email: 'contato@radarnoroestepr.com.br',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'BR',
      addressLocality: 'Paranavaí',
      addressRegion: 'PR',
    },
    knowsAbout: [
      'política brasileira',
      'economia',
      'esportes',
      'cultura',
      'notícias do noroeste do paraná',
      'Paranavaí',
      'região noroeste',
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
