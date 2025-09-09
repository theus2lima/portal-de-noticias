'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Clock, User, Eye, FileText, Filter } from 'lucide-react'

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

interface SearchFilters {
  category: string
  sortBy: 'relevance' | 'newest' | 'oldest' | 'mostViewed'
}

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState(query)
  const [filters, setFilters] = useState<SearchFilters>({
    category: '',
    sortBy: 'relevance'
  })
  const [categories, setCategories] = useState<{id: string, name: string}[]>([])
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })

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

  // Buscar artigos quando query ou filtros mudarem
  useEffect(() => {
    const searchArticles = async () => {
      if (!searchTerm.trim()) {
        setArticles([])
        setPagination(prev => ({ ...prev, total: 0, totalPages: 0 }))
        return
      }
      
      setLoading(true)
      try {
        const params = new URLSearchParams({
          search: searchTerm,
          page: pagination.page.toString(),
          limit: pagination.limit.toString(),
          status: 'published',
        })

        if (filters.category) {
          params.set('category', filters.category)
        }

        const response = await fetch(`/api/articles?${params}`)
        if (response.ok) {
          const data = await response.json()
          let fetchedArticles = data.data || []
          
          // Aplicar ordenação
          switch (filters.sortBy) {
            case 'newest':
              fetchedArticles.sort((a: Article, b: Article) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
              )
              break
            case 'oldest':
              fetchedArticles.sort((a: Article, b: Article) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
              break
            case 'mostViewed':
              fetchedArticles.sort((a: Article, b: Article) => 
                (b.views_count || 0) - (a.views_count || 0)
              )
              break
            default: // relevance
              // A API já retorna por relevância quando há termo de busca
              break
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
    
    searchArticles()
  }, [searchTerm, filters, pagination.page, pagination.limit])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return
    
    setLoading(true)
    try {
      const params = new URLSearchParams({
        search: searchTerm,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        status: 'published',
      })

      if (filters.category) {
        params.set('category', filters.category)
      }

      const response = await fetch(`/api/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        let fetchedArticles = data.data || []
        
        // Aplicar ordenação
        switch (filters.sortBy) {
          case 'newest':
            fetchedArticles.sort((a: Article, b: Article) => 
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
            break
          case 'oldest':
            fetchedArticles.sort((a: Article, b: Article) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            )
            break
          case 'mostViewed':
            fetchedArticles.sort((a: Article, b: Article) => 
              (b.views_count || 0) - (a.views_count || 0)
            )
            break
          default: // relevance
            // A API já retorna por relevância quando há termo de busca
            break
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
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

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPagination(prev => ({ ...prev, page: 1 }))
    // O useEffect já vai detectar a mudança e fazer a busca
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }))
    setPagination(prev => ({ ...prev, page: 1 }))
  }

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const highlightText = (text: string, term: string) => {
    if (!term.trim()) return text
    
    const regex = new RegExp(`(${term})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900 px-1 rounded">$1</mark>')
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold text-neutral-900 mb-6">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Buscar Notícias'}
            </h1>
            
            {/* Formulário de busca */}
            <form onSubmit={handleSearchSubmit} className="mb-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Digite sua busca..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 text-lg border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors duration-200"
                  autoFocus
                />
              </div>
            </form>

            {/* Filtros */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors duration-200"
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
                onChange={(e) => handleFilterChange('sortBy', e.target.value as SearchFilters['sortBy'])}
                className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-600 focus:border-primary-600 transition-colors duration-200"
              >
                <option value="relevance">Mais relevantes</option>
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigas</option>
                <option value="mostViewed">Mais vistas</option>
              </select>
            </div>

            {/* Estatísticas de busca */}
            {searchTerm && !loading && (
              <p className="text-neutral-600 mb-6">
                {pagination.total > 0 ? (
                  <>Encontrados <strong>{pagination.total}</strong> resultados em <strong>0.1s</strong></>
                ) : (
                  'Nenhum resultado encontrado'
                )}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
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
                      <h3 
                        className="text-lg font-bold mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(article.title, searchTerm) 
                        }}
                      />
                      <p 
                        className="text-neutral-600 text-sm mb-4 line-clamp-3"
                        dangerouslySetInnerHTML={{ 
                          __html: highlightText(article.excerpt, searchTerm) 
                        }}
                      />
                      
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
          ) : searchTerm && !loading ? (
            <div className="text-center py-12">
              <Search className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <h3 className="text-xl font-medium text-neutral-900 mb-2">
                Nenhum resultado encontrado
              </h3>
              <p className="text-neutral-600 mb-6">
                Tente buscar por outros termos ou ajustar os filtros.
              </p>
              <div className="space-y-2 text-sm text-neutral-500">
                <p>Sugestões:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Verifique a ortografia das palavras</li>
                  <li>Tente palavras-chave mais gerais</li>
                  <li>Use menos palavras na busca</li>
                  <li>Remova filtros de categoria</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <Search className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
              <h3 className="text-xl font-medium text-neutral-900 mb-2">
                Digite algo para buscar
              </h3>
              <p className="text-neutral-600">
                Use o campo de busca acima para encontrar notícias.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BuscarPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-center">
          <Search className="mx-auto h-16 w-16 text-neutral-400 mb-4" />
          <p className="text-neutral-600">Carregando busca...</p>
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  )
}
