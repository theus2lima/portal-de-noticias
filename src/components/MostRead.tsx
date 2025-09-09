'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Eye, Clock, FileText } from 'lucide-react'

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

const MostRead = () => {
  const [mostReadArticles, setMostReadArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar artigos mais lidos da API
  useEffect(() => {
    const fetchMostRead = async () => {
      try {
        const response = await fetch('/api/articles?status=published&limit=10')
        if (response.ok) {
          const data = await response.json()
          // Ordenar por views_count (mais visualizados primeiro)
          const sortedArticles = (data.data || []).sort((a: Article, b: Article) => 
            (b.views_count || 0) - (a.views_count || 0)
          )
          setMostReadArticles(sortedArticles.slice(0, 5)) // Pegar apenas os 5 mais lidos
        }
      } catch (error) {
        console.error('Erro ao buscar artigos mais lidos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMostRead()
  }, [])

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

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
      'Política': 'text-primary-900',
      'Economia': 'text-secondary-600',
      'Esportes': 'text-accent-500',
      'Cultura': 'text-primary-500',
      'Cidades': 'text-secondary-700',
      'Tecnologia': 'text-primary-600'
    }
    return colors[category] || 'text-primary-900'
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900'
    return 'bg-primary-500 text-white'
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <TrendingUp className="text-secondary-600" size={32} />
            <h2 className="text-3xl lg:text-4xl font-bold text-gradient">
              Mais Lidas
            </h2>
          </div>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            As notícias que mais despertaram o interesse dos nossos leitores
          </p>
        </div>

        {/* Featured Article (Rank #1) */}
        {loading ? (
          <div className="mb-12">
            <div className="relative bg-gradient-to-br from-primary-900 to-secondary-600 rounded-xl overflow-hidden shadow-2xl animate-pulse">
              <div className="grid lg:grid-cols-3 gap-0">
                <div className="lg:col-span-2 relative h-64 lg:h-96 bg-neutral-300"></div>
                <div className="p-6 lg:p-8 text-white flex flex-col justify-center">
                  <div className="h-4 bg-white/20 rounded mb-4 w-20"></div>
                  <div className="h-8 bg-white/20 rounded mb-4 w-3/4"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-white/20 rounded w-24"></div>
                    <div className="h-4 bg-white/20 rounded w-16"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : mostReadArticles.length > 0 ? (
          <div className="mb-12">
            <Link href={`/noticia/${mostReadArticles[0].slug}`} className="block group">
              <div className="relative bg-gradient-to-br from-primary-900 to-secondary-600 rounded-xl overflow-hidden shadow-2xl">
                <div className="grid lg:grid-cols-3 gap-0">
                  <div className="lg:col-span-2 relative h-64 lg:h-96">
                    {mostReadArticles[0].featured_image ? (
                      <Image
                        src={mostReadArticles[0].featured_image}
                        alt={mostReadArticles[0].title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                        <FileText className="h-16 w-16 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                    
                    {/* Rank Badge */}
                    <div className="absolute top-4 left-4">
                      <div className={`${getRankColor(1)} w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                        #1
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 lg:p-8 text-white flex flex-col justify-center">
                    <span className={`inline-block text-sm font-semibold mb-4 text-secondary-300`}>
                      {mostReadArticles[0].category_name}
                    </span>
                    
                    <h3 className="text-xl lg:text-2xl font-bold mb-4 group-hover:text-secondary-300 transition-colors duration-200">
                      {mostReadArticles[0].title}
                    </h3>
                    
                    <div className="flex items-center space-x-4 text-sm text-white/80">
                      <div className="flex items-center space-x-1">
                        <Eye size={16} />
                        <span>{formatViews(mostReadArticles[0].views_count)} visualizações</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock size={16} />
                        <span>{formatDate(mostReadArticles[0].created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ) : null}

        {/* Other Articles Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white border border-neutral-200 rounded-lg overflow-hidden animate-pulse">
                <div className="h-40 bg-neutral-200"></div>
                <div className="p-4">
                  <div className="h-3 bg-neutral-200 rounded mb-2 w-16"></div>
                  <div className="h-4 bg-neutral-200 rounded mb-3"></div>
                  <div className="h-3 bg-neutral-200 rounded w-20"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {mostReadArticles.slice(1).map((article, index) => (
              <Link 
                key={article.id}
                href={`/noticia/${article.slug}`}
                className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group animate-fadeInUp"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="relative h-40">
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
                  
                  {/* Rank Badge */}
                  <div className="absolute top-3 left-3">
                    <div className={`${getRankColor(index + 2)} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg`}>
                      #{index + 2}
                    </div>
                  </div>
                  
                  {/* Views Overlay */}
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                    <Eye size={12} />
                    <span>{formatViews(article.views_count)}</span>
                  </div>
                </div>
                
                <div className="p-4">
                  <span className={`text-xs font-semibold ${getCategoryColor(article.category_name)} mb-2 block`}>
                    {article.category_name}
                  </span>
                  
                  <h3 className="font-bold text-sm mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-3 leading-tight">
                    {article.title}
                  </h3>
                  
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span>{formatDate(article.created_at)}</span>
                    <div className="flex items-center space-x-1">
                      <TrendingUp size={12} />
                      <span>Trending</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Stats Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-900 to-secondary-600 rounded-xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-sm text-white/80">Leitores mensais</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1.2M+</div>
              <div className="text-sm text-white/80">Páginas vistas</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">350+</div>
              <div className="text-sm text-white/80">Artigos publicados</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-sm text-white/80">Cobertura contínua</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MostRead
