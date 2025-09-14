'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Head from 'next/head'
import ShareButtons from '@/components/ShareButtons'
import { useSiteConfig } from '@/hooks/useSiteConfig'
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Eye, 
  Share2, 
  Calendar,
  FileText
} from 'lucide-react'

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

export default function ArticlePage({ params }: ArticlePageProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const { config } = useSiteConfig()

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/api/articles/by-slug/${params.slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            setError('Artigo não encontrado')
          } else {
            setError('Erro ao carregar artigo')
          }
          return
        }
        const data = await response.json()
        setArticle(data.data)
        
        // Buscar artigos relacionados da mesma categoria
        if (data.data.category_id) {
          const relatedResponse = await fetch(`/api/articles?status=published&category=${data.data.category_id}&limit=3`)
          if (relatedResponse.ok) {
            const relatedData = await relatedResponse.json()
            setRelatedArticles(relatedData.data?.filter((a: Article) => a.id !== data.data.id) || [])
          }
        }
      } catch (err) {
        setError('Erro ao carregar artigo')
        console.error('Erro ao buscar artigo:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [params.slug])

  // Atualizar meta tags dinamicamente
  useEffect(() => {
    if (typeof document !== 'undefined' && article) {
      // Atualizar título da página
      document.title = `${article.title} - ${config.siteName}`
      
      // Função auxiliar para atualizar ou criar meta tag
      const updateMetaTag = (property: string, content: string, isProperty = true) => {
        const selector = isProperty ? `meta[property="${property}"]` : `meta[name="${property}"]`
        let meta = document.querySelector(selector) as HTMLMetaElement
        
        if (!meta) {
          meta = document.createElement('meta')
          if (isProperty) {
            meta.setAttribute('property', property)
          } else {
            meta.setAttribute('name', property)
          }
          document.head.appendChild(meta)
        }
        meta.setAttribute('content', content)
      }
      
      // Meta tags básicas
      updateMetaTag('description', article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no ${config.siteName}`, false)
      updateMetaTag('keywords', article.keywords?.join(', ') || '', false)
      
      // Open Graph tags
      const baseUrl = config.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '')
      const shareUrl = `${baseUrl}/noticia/${article.slug}`
      const ogImage = article.featured_image || `${baseUrl}/default-og-image.png`
      
      updateMetaTag('og:type', 'article')
      updateMetaTag('og:title', article.title)
      updateMetaTag('og:description', article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no ${config.siteName}`)
      updateMetaTag('og:url', shareUrl)
      updateMetaTag('og:image', ogImage)
      updateMetaTag('og:image:width', '1200')
      updateMetaTag('og:image:height', '630')
      updateMetaTag('og:site_name', config.siteName)
      updateMetaTag('og:locale', 'pt_BR')
      
      // Twitter Card tags
      updateMetaTag('twitter:card', 'summary_large_image', false)
      updateMetaTag('twitter:title', article.title, false)
      updateMetaTag('twitter:description', article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no ${config.siteName}`, false)
      updateMetaTag('twitter:image', ogImage, false)
      
      // Article specific tags
      updateMetaTag('article:author', article.author_name)
      updateMetaTag('article:published_time', article.published_at)
      updateMetaTag('article:section', article.category_name)
      if (article.keywords) {
        article.keywords.forEach(tag => {
          const meta = document.createElement('meta')
          meta.setAttribute('property', 'article:tag')
          meta.setAttribute('content', tag)
          document.head.appendChild(meta)
        })
      }
    }
  }, [article, config])

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto animate-pulse">
            <div className="h-8 bg-neutral-200 rounded mb-4 w-1/4"></div>
            <div className="h-12 bg-neutral-200 rounded mb-4"></div>
            <div className="h-6 bg-neutral-200 rounded mb-8 w-3/4"></div>
            <div className="h-96 bg-neutral-200 rounded mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded"></div>
              <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-neutral-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <FileText className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
            <h1 className="text-2xl font-bold text-neutral-900 mb-2">
              {error || 'Artigo não encontrado'}
            </h1>
            <p className="text-neutral-600 mb-6">
              O artigo que você está procurando não existe ou foi removido.
            </p>
            <Link href="/" className="btn-primary">
              <ArrowLeft size={16} className="mr-2" />
              Voltar ao início
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Política': 'bg-primary-900',
      'Economia': 'bg-secondary-600',
      'Esportes': 'bg-accent-500',
      'Cultura': 'bg-primary-500',
      'Cidades': 'bg-secondary-700'
    }
    return colors[category] || 'bg-primary-900'
  }

  // Construir URL pública correta com fallback para desenvolvimento
  const getBaseUrl = () => {
    // Se estivermos no browser
    if (typeof window !== 'undefined') {
      const currentOrigin = window.location.origin
      const currentHost = window.location.hostname
      
      // Em desenvolvimento (localhost) sempre usar a origem atual
      if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
        return currentOrigin
      }
    }
    
    // Usar configuração ou fallback
    let url = config.siteUrl || (typeof window !== 'undefined' ? window.location.origin : '')
    
    // Garantir protocolo HTTPS em produção e remover barra final
    if (url && !url.includes('localhost')) {
      url = url.replace(/^http:/, 'https:')
    }
    
    // Remover barra final se existir
    return url.replace(/\/$/, '')
  }
  
  const baseUrl = getBaseUrl()
  const shareUrl = `${baseUrl}/noticia/${article.slug}`
  const shareText = `${article.title} - ${config.siteName}`
  
  // Meta dados para Open Graph
  const ogTitle = article.title
  const ogDescription = article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no ${config.siteName}`
  const ogImage = article.featured_image || `${baseUrl}/default-og-image.png`

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              Início
            </Link>
            <span className="text-neutral-400">/</span>
            <Link 
              href={`/categoria/${article.category_name.toLowerCase()}`} 
              className="text-primary-600 hover:text-primary-700"
            >
              {article.category_name}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-600 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <article className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <header className="mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                <span>Voltar ao início</span>
              </Link>

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${getCategoryColor(article.category_name)}`}>
                  {article.category_name}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                {article.title}
              </h1>

              <p className="text-xl text-neutral-600 mb-6 leading-relaxed">
                {article.subtitle}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-neutral-500 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {article.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{article.author_name}</p>
                    <p className="text-sm">Autor</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{article.reading_time} min de leitura</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={16} />
                    <span>{article.views_count.toLocaleString()} visualizações</span>
                  </div>
                </div>
              </div>

              {/* Social sharing */}
              <ShareButtons 
                url={shareUrl}
                title={article.title}
                articleId={article.id}
                excerpt={article.excerpt}
                categoryName={article.category_name}
                featuredImage={article.featured_image}
                imageAlt={article.image_alt}
              />
            </header>

            {/* Featured image */}
            {article.featured_image ? (
              <div className="relative h-96 lg:h-[500px] mb-8 rounded-xl overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.image_alt || article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="relative h-96 lg:h-[500px] mb-8 rounded-xl overflow-hidden bg-neutral-200 flex items-center justify-center">
                <FileText className="h-24 w-24 text-neutral-400" />
              </div>
            )}

            {/* Article content */}
            <div className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:text-justify prose-a:text-primary-600 prose-strong:text-neutral-900 prose-blockquote:border-primary-600 prose-blockquote:bg-neutral-50 prose-blockquote:rounded-lg prose-blockquote:p-6">
              {(article.content && article.content.includes('<')) ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <div className="whitespace-pre-wrap">
                  {(article.content || '').split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ) : null
                  ))}
                </div>
              )}
            </div>

            {/* Tags */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-lg font-semibold mb-4">Tags relacionadas:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-sm hover:bg-neutral-300 transition-colors duration-200 cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-2xl font-bold mb-6">Leia também</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedArticles.map(related => (
                    <Link 
                      key={related.id}
                      href={`/noticia/${related.slug}`}
                      className="flex space-x-4 p-4 bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0">
                        {related.featured_image ? (
                          <Image
                            src={related.featured_image}
                            alt={related.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 rounded-lg flex items-center justify-center">
                            <FileText className="h-8 w-8 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900 line-clamp-3">
                          {related.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </article>
    </div>
  )
}
