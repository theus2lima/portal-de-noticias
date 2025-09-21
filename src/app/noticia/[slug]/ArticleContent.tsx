'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ShareButtons from '@/components/ShareButtons'
import LeadForm from '@/components/LeadForm'
import GoogleAd from '@/components/GoogleAd'
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

interface ArticleContentProps {
  article: Article
}

export default function ArticleContent({ article }: ArticleContentProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [moreArticles, setMoreArticles] = useState<Article[]>([])
  const [showMoreArticles, setShowMoreArticles] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const { config } = useSiteConfig()

  useEffect(() => {
    // Buscar artigos relacionados
    const fetchRelatedArticles = async () => {
      if (article.category_id) {
        try {
          const response = await fetch(`/api/articles?status=published&category=${article.category_id}&limit=3`)
          if (response.ok) {
            const data = await response.json()
            setRelatedArticles(data.data?.filter((a: Article) => a.id !== article.id) || [])
          }
        } catch (error) {
          console.error('Erro ao buscar artigos relacionados:', error)
        }
      }
    }

    fetchRelatedArticles()
  }, [article])

  // Registrar visualização do artigo
  useEffect(() => {
    const trackView = async () => {
      try {
        await fetch(`/api/articles/track-view`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ articleId: article.id }),
        })
      } catch (error) {
        console.error('Erro ao rastrear visualização:', error)
      }
    }

    trackView()
  }, [article.id])

  // Hook para detectar scroll e carregar mais artigos
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollPercentage = (scrollPosition / documentHeight) * 100

      // Quando o usuário rolar 70% da página, mostrar mais artigos
      if (scrollPercentage > 70 && !showMoreArticles && !isLoadingMore && moreArticles.length === 0) {
        setIsLoadingMore(true)
        loadMoreArticles()
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [article, showMoreArticles, isLoadingMore, moreArticles, relatedArticles])

  // Função para carregar mais artigos
  const loadMoreArticles = async () => {
    try {
      // Buscar artigos recentes, excluindo o atual e os relacionados
      const excludeIds = [article.id, ...relatedArticles.map(a => a.id)]
      const response = await fetch(`/api/articles?status=published&limit=6`)
      
      if (response.ok) {
        const data = await response.json()
        const filteredArticles = data.data?.filter((a: Article) => !excludeIds.includes(a.id)) || []
        setMoreArticles(filteredArticles.slice(0, 6))
        setShowMoreArticles(true)
      }
    } catch (error) {
      console.error('Erro ao carregar mais artigos:', error)
    } finally {
      setIsLoadingMore(false)
    }
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
          <div className="max-w-7xl mx-auto flex gap-8">
            {/* Anúncio Sidebar - Fixo durante a leitura */}
            <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 w-160px z-10">
              <GoogleAd 
                slot="3456789012"
                format="vertical"
                style={{ width: '160px', height: '600px' }}
                className="shadow-lg rounded-lg overflow-hidden"
              />
            </div>
            
            {/* Conteúdo principal */}
            <div className="flex-1 max-w-4xl">
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

                {article.subtitle && (
                  <p className="text-xl text-neutral-600 mb-6 leading-relaxed">
                    {article.subtitle}
                  </p>
                )}

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
              
              {/* Anúncio 1 - Após header, antes da imagem */}
              <div className="mb-8">
                <GoogleAd 
                  slot="1234567890"
                  format="auto"
                  className="text-center"
                />
              </div>

              {/* Featured Image */}
              {article.featured_image && (
                <div className="mb-8">
                  <div className="relative aspect-video rounded-lg overflow-hidden shadow-lg">
                    <Image
                      src={article.featured_image}
                      alt={article.image_alt || article.title}
                      fill
                      className="object-cover"
                      priority
                    />
                  </div>
                  {article.image_alt && (
                    <p className="text-sm text-neutral-500 mt-2 text-center italic">
                      {article.image_alt}
                    </p>
                  )}
                </div>
              )}

              {/* Article Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  dangerouslySetInnerHTML={{ __html: article.content }}
                />
              </div>

              {/* Anúncio 2 - Após conteúdo */}
              <div className="my-12">
                <GoogleAd 
                  slot="0987654321"
                  format="rectangle"
                  className="text-center"
                />
              </div>

              {/* Tags */}
              {article.keywords && article.keywords.length > 0 && (
                <div className="mt-8 pt-8 border-t border-neutral-200">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {article.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-neutral-100 text-neutral-700 text-sm rounded-full hover:bg-neutral-200 transition-colors"
                      >
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Share again */}
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Gostou? Compartilhe!</h3>
                <ShareButtons 
                  url={shareUrl}
                  title={article.title}
                  articleId={article.id}
                  excerpt={article.excerpt}
                  categoryName={article.category_name}
                  featuredImage={article.featured_image}
                  imageAlt={article.image_alt}
                />
              </div>

              {/* Lead Form */}
              <div className="mt-12">
                <LeadForm source="article" />
              </div>

              {/* Artigos Relacionados */}
              {relatedArticles.length > 0 && (
                <section className="mt-16">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-8">Artigos Relacionados</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedArticles.slice(0, 3).map((related) => (
                      <Link
                        key={related.id}
                        href={`/noticia/${related.slug}`}
                        className="news-card group"
                      >
                        <div className="relative h-48 mb-4">
                          {related.featured_image ? (
                            <Image
                              src={related.featured_image}
                              alt={related.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                            {related.title}
                          </h3>
                          <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                            {related.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>{new Date(related.created_at).toLocaleDateString('pt-BR')}</span>
                            <span>{related.views_count} visualizações</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Loading mais artigos */}
              {isLoadingMore && (
                <div className="mt-16 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-neutral-600">Carregando mais artigos...</p>
                </div>
              )}

              {/* Mais Artigos */}
              {showMoreArticles && moreArticles.length > 0 && (
                <section className="mt-16">
                  <h2 className="text-2xl font-bold text-neutral-900 mb-8">Continue Lendo</h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {moreArticles.slice(0, 6).map((more) => (
                      <Link
                        key={more.id}
                        href={`/noticia/${more.slug}`}
                        className="news-card group"
                      >
                        <div className="relative h-48 mb-4">
                          {more.featured_image ? (
                            <Image
                              src={more.featured_image}
                              alt={more.title}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                              <FileText className="h-12 w-12 text-neutral-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="p-6">
                          <h3 className="text-lg font-bold mb-2 group-hover:text-primary-600 transition-colors line-clamp-2">
                            {more.title}
                          </h3>
                          <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                            {more.excerpt}
                          </p>
                          
                          <div className="flex items-center justify-between text-xs text-neutral-500">
                            <span>{new Date(more.created_at).toLocaleDateString('pt-BR')}</span>
                            <span>{more.views_count} visualizações</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
