'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Eye, FileText } from 'lucide-react'

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

interface ArticleClientProps {
  initialArticle: Article
}

export default function ArticleClient({ initialArticle }: ArticleClientProps) {
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([])
  const [moreArticles, setMoreArticles] = useState<Article[]>([])
  const [showMoreArticles, setShowMoreArticles] = useState(false)
  const [isLoadingMore, setIsLoadingMore] = useState(false)

  // Buscar artigos relacionados
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      if (initialArticle.category_id) {
        try {
          const response = await fetch(`/api/articles?status=published&category=${initialArticle.category_id}&limit=3`)
          if (response.ok) {
            const data = await response.json()
            setRelatedArticles(data.data?.filter((a: Article) => a.id !== initialArticle.id) || [])
          }
        } catch (error) {
          console.error('Erro ao buscar artigos relacionados:', error)
        }
      }
    }

    fetchRelatedArticles()
  }, [initialArticle])

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
  }, [showMoreArticles, isLoadingMore, moreArticles, relatedArticles])

  // Função para carregar mais artigos
  const loadMoreArticles = async () => {
    try {
      // Buscar artigos recentes, excluindo o atual e os relacionados
      const excludeIds = [initialArticle.id, ...relatedArticles.map(a => a.id)]
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

  return (
    <>
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

      {/* Mais Artigos - carregados ao rolar a página */}
      {(showMoreArticles || isLoadingMore) && (
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-neutral-900 mb-4">
                  Mais Artigos para Você
                </h2>
                <p className="text-neutral-600">
                  Continue navegando e descubra mais conteúdo interessante
                </p>
              </div>
              
              {isLoadingMore ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg border border-neutral-200 p-4 animate-pulse">
                      <div className="h-48 bg-neutral-200 rounded-lg mb-4"></div>
                      <div className="h-4 bg-neutral-200 rounded mb-2 w-1/4"></div>
                      <div className="h-6 bg-neutral-200 rounded mb-2"></div>
                      <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {moreArticles.map(moreArticle => (
                    <Link 
                      key={moreArticle.id}
                      href={`/noticia/${moreArticle.slug}`}
                      className="group bg-white rounded-lg border border-neutral-200 overflow-hidden hover:shadow-lg transition-all duration-300"
                    >
                      <div className="relative h-48">
                        {moreArticle.featured_image ? (
                          <Image
                            src={moreArticle.featured_image}
                            alt={moreArticle.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                            <FileText className="h-12 w-12 text-neutral-400" />
                          </div>
                        )}
                        <div className="absolute top-3 left-3">
                          <span className={`px-2 py-1 text-xs font-semibold text-white rounded ${getCategoryColor(moreArticle.category_name)}`}>
                            {moreArticle.category_name}
                          </span>
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-bold text-neutral-900 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2 mb-2">
                          {moreArticle.title}
                        </h3>
                        <p className="text-neutral-600 text-sm line-clamp-3 mb-3">
                          {moreArticle.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-neutral-500">
                          <div className="flex items-center space-x-1">
                            <Clock size={12} />
                            <span>{moreArticle.reading_time} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={12} />
                            <span>{moreArticle.views_count.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
