import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ArticleContent from './ArticleContent'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  content: string
  excerpt: string
  featured_image?: string
  image_alt?: string
  category_id?: string
  category_name: string
  author_name: string
  created_at: string
  updated_at?: string
  views_count: number
  reading_time: number
  keywords?: string[]
  published_at: string
}

async function getArticle(slug: string): Promise<Article | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                   process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                   'http://localhost:3000'

    const response = await fetch(`${baseUrl}/api/articles/by-slug/${slug}`, {
      next: { revalidate: 60 } // Cache por 1 minuto para artigos atualizados
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    return null
  }
}

export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug)

  if (!article) {
    return {
      title: 'Artigo não encontrado',
      description: 'O artigo solicitado não foi encontrado.'
    }
  }

  const siteName = 'Radar Noroeste PR'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radarnoroestepr.com.br'
  const articleUrl = `${siteUrl}/noticia/${article.slug}`
  
  // Usar imagem do artigo ou imagem padrão
  const ogImage = article.featured_image || `${siteUrl}/default-og-image.png`
  
  // Garantir que a imagem seja uma URL absoluta
  const fullImageUrl = ogImage.startsWith('http') ? ogImage : `${siteUrl}${ogImage}`

  return {
    title: `${article.title} - ${siteName}`,
    description: article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no ${siteName}`,
    keywords: article.keywords?.join(', ') || `${article.category_name}, notícias, ${siteName.toLowerCase()}`,
    
    // Open Graph para WhatsApp, Facebook, etc.
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no ${siteName}`,
      url: articleUrl,
      siteName: siteName,
      locale: 'pt_BR',
      
      // IMPORTANTE: Configuração da imagem para WhatsApp
      images: [
        {
          url: fullImageUrl,
          width: 1200,
          height: 630,
          alt: article.image_alt || article.title,
        }
      ],
      
      // Meta dados específicos do artigo
      publishedTime: article.published_at,
      authors: [article.author_name],
      section: article.category_name,
      tags: article.keywords || [],
    },

    // Twitter Card
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no ${siteName}`,
      images: [fullImageUrl],
    },

    // Meta tags adicionais
    other: {
      'article:author': article.author_name,
      'article:published_time': article.published_at,
      'article:section': article.category_name,
      ...(article.keywords && article.keywords.reduce((acc, keyword, index) => ({
        ...acc,
        [`article:tag_${index}`]: keyword
      }), {}))
    }
  }
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return <ArticleContent article={article} />
}
