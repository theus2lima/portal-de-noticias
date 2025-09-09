'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, User, Eye, ArrowRight, FileText } from 'lucide-react'

interface Article {
  id: string
  title: string
  excerpt: string
  featured_image?: string
  slug: string
  category_name: string
  author_name: string
  created_at: string
  views_count: number
}

const NewsSection = () => {
  const [recentNews, setRecentNews] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles?status=published&limit=6')
        if (response.ok) {
          const data = await response.json()
          setRecentNews(data.data || [])
        }
      } catch (error) {
        console.error('Erro ao buscar artigos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `há ${diffInHours}h`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Política': 'category-politica',
      'Economia': 'category-economia',
      'Esportes': 'category-esportes',
      'Cultura': 'category-cultura',
      'Cidades': 'category-cidades',
      'Tecnologia': 'bg-primary-600'
    }
    return colors[category] || 'category-politica'
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gradient mb-4">
              Notícias Recentes
            </h2>
            <p className="text-lg text-neutral-600">
              Fique por dentro das últimas novidades
            </p>
          </div>
          <Link 
            href="/noticias" 
            className="btn-primary hidden md:inline-flex items-center space-x-2"
          >
            <span>Ver todas</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Featured Article */}
        {loading ? (
          <div className="mb-12">
            <div className="grid lg:grid-cols-2 gap-8 bg-white rounded-xl overflow-hidden shadow-lg animate-pulse">
              <div className="h-64 lg:h-full bg-neutral-200"></div>
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <div className="h-8 bg-neutral-200 rounded mb-4"></div>
                <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                <div className="h-4 bg-neutral-200 rounded w-3/4 mb-6"></div>
                <div className="flex items-center space-x-4">
                  <div className="h-4 bg-neutral-200 rounded w-20"></div>
                  <div className="h-4 bg-neutral-200 rounded w-16"></div>
                  <div className="h-4 bg-neutral-200 rounded w-12"></div>
                </div>
              </div>
            </div>
          </div>
        ) : recentNews.length > 0 ? (
          <div className="mb-12">
            <Link href={`/noticia/${recentNews[0].slug}`} className="block group">
              <div className="grid lg:grid-cols-2 gap-8 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="relative h-64 lg:h-full">
                  {recentNews[0].featured_image ? (
                    <Image
                      src={recentNews[0].featured_image}
                      alt={recentNews[0].title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                      <FileText className="h-12 w-12 text-neutral-400" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <span className={`category-badge ${getCategoryColor(recentNews[0].category_name)}`}>
                      {recentNews[0].category_name}
                    </span>
                  </div>
                </div>
                <div className="p-6 lg:p-8 flex flex-col justify-center">
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary-600 transition-colors duration-200">
                    {recentNews[0].title}
                  </h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    {recentNews[0].excerpt}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-neutral-500">
                    <div className="flex items-center space-x-1">
                      <User size={16} />
                      <span>{recentNews[0].author_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{formatDate(recentNews[0].created_at)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye size={16} />
                      <span>{recentNews[0].views_count.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : null}

        {/* News Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden animate-pulse">
                <div className="h-48 bg-neutral-200"></div>
                <div className="p-6">
                  <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-4 bg-neutral-200 rounded w-2/3 mb-4"></div>
                  <div className="h-3 bg-neutral-200 rounded mb-2"></div>
                  <div className="h-3 bg-neutral-200 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentNews.slice(1).map((article, index) => (
              <Link 
                key={article.id} 
                href={`/noticia/${article.slug}`}
                className="news-card group animate-fadeInUp"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 mb-4">
                  {article.featured_image ? (
                    <Image
                      src={article.featured_image}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                      <FileText className="h-8 w-8 text-neutral-400" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className={`category-badge ${getCategoryColor(article.category_name)}`}>
                      {article.category_name}
                    </span>
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-lg font-bold mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <div className="flex items-center space-x-2">
                      <User size={14} />
                      <span>{article.author_name}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Clock size={14} />
                        <span>{formatDate(article.created_at)}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye size={14} />
                        <span>{article.views_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Mobile View All Button */}
        <div className="text-center mt-8 md:hidden">
          <Link href="/noticias" className="btn-primary inline-flex items-center space-x-2">
            <span>Ver todas as notícias</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewsSection
