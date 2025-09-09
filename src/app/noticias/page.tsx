'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, Clock, User, Eye, ArrowRight, FileText } from 'lucide-react'

interface Article {
  id: string
  title: string
  excerpt: string
  featured_image?: string
  slug: string
  category_name: string
  category_id: string
  author_name: string
  created_at: string
  views_count: number
  reading_time: number
}

interface Filters {
  search: string
  category: string
  sortBy: 'newest' | 'oldest' | 'mostViewed'
}

export default function NoticiasPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    category: '',
    sortBy: 'newest'
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Buscar categorias
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
      }
    }
    fetchCategories()
  }, [])

  // Buscar artigos
  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          status: 'published',
        })

        if (filters.search) {
          params.set('search', filters.search)
        }
        if (filters.category) {
          params.set('category', filters.category)
        }

        const response = await fetch(`/api/articles?${params}`)
        if (response.ok) {
          const data = await response.json()
          let fetchedArticles = data.data || []
          
          // Aplicar ordenação
          if (filters.sortBy === 'oldest') {
            fetchedArticles.sort((a: Article, b: Article) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
          } else if (filters.sortBy === 'mostViewed') {
            fetchedArticles.sort((a: Article, b: Article) => b.views_count - a.views_count)
          }
          
          setArticles(fetchedArticles)
          if (data.pagination) {
            setPagination(prev => ({
              ...prev,
              total: data.pagination.total,
              totalPages: data.pagination.totalPages
            }))
          }
        }
      } catch (error) {
        console.error('Erro ao buscar artigos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [filters, pagination.page, pagination.limit])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `há ${diffInHours}h`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl font-bold text-gradient mb-4">
              Todas as Notícias
            </h1>
            <p className="text-xl text-neutral-600">
              Fique por dentro de tudo que acontece
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Filtros */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Busca */}
              <form onSubmit={handleSearch} className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  <input
                    type="text"
                    placeholder="Buscar notícias..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors duration-200"
                  />
                </div>
              </form>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors duration-200"
                >
                  <option value="">Todas as categorias</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value as 'newest' | 'oldest' | 'mostViewed')}
                  className="px-4 py-3 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors duration-200"
                >
                  <option value="newest">Mais recentes</option>
                  <option value="oldest">Mais antigas</option>
                  <option value="mostViewed">Mais vistas</option>
                </select>
              </div>
            </div>

            {/* Limpar filtros */}
            {(filters.search || filters.category) && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <button
                  onClick={() => {
                    setFilters({ search: '', category: '', sortBy: 'newest' })
                    setPagination(prev => ({ ...prev, page: 1 }))
                  }}
                  className="text-primary-600 hover:text-primary-700 text-sm font-medium transition-colors duration-200"
                >
                  Limpar filtros
                </button>
              </div>
            )}
          </div>

          {/* Resultados */}
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
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
          ) : articles.length > 0 ? (
            <>
              {/* Lista de artigos */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {articles.map((article, index) => (
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

              {/* Paginação */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-4 py-2 bg-white border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors duration-200"
                  >
                    Anterior
                  </button>
                  
                  {[...Array(pagination.totalPages)].map((_, index) => {
                    const page = index + 1
                    const isCurrentPage = page === pagination.page
                    const isNearCurrentPage = Math.abs(page - pagination.page) <= 2
                    
                    if (pagination.totalPages <= 7 || isNearCurrentPage || page === 1 || page === pagination.totalPages) {
                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 border rounded-lg transition-colors duration-200 ${
                            isCurrentPage
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white border-neutral-300 hover:bg-neutral-50'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (
                      (page === 2 && pagination.page > 4) ||
                      (page === pagination.totalPages - 1 && pagination.page < pagination.totalPages - 3)
                    ) {
                      return <span key={page} className="px-2">...</span>
                    }
                    return null
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="px-4 py-2 bg-white border border-neutral-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50 transition-colors duration-200"
                  >
                    Próxima
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <FileText className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <h3 className="text-xl font-medium text-neutral-900 mb-2">
                Nenhuma notícia encontrada
              </h3>
              <p className="text-neutral-600 mb-6">
                Tente ajustar os filtros ou buscar por outros termos.
              </p>
              <Link href="/" className="btn-primary">
                Voltar ao início
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
