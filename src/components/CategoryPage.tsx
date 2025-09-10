'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, Clock, User, Eye, ArrowLeft, ChevronLeft, ChevronRight, FileText } from 'lucide-react'

interface Article {
  id: string
  title: string
  excerpt: string
  featured_image?: string
  slug: string
  author_name: string
  created_at: string
  views_count: number
}

interface CategoryPageProps {
  category: string
  categoryColor: string
  description: string
  categoryId?: string
  categorySlug?: string
}

const CategoryPage = ({ category, categoryColor, description, categoryId, categorySlug }: CategoryPageProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [allArticles, setAllArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const articlesPerPage = 9

  // Carregar artigos da API
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        let url = '/api/articles?status=published&limit=100'
        
        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          let articles = data.data || []
          
          // Filtrar artigos por categoria se categoryId estiver disponível
          if (categoryId) {
            articles = articles.filter((article: any) => article.category_id === categoryId)
          } else if (categorySlug) {
            // Fallback: filtrar por nome da categoria se não tiver ID
            articles = articles.filter((article: any) => 
              article.category?.toLowerCase() === category.toLowerCase() ||
              article.category_name?.toLowerCase() === category.toLowerCase()
            )
          }
          
          setAllArticles(articles)
        }
      } catch (error) {
        console.error('Erro ao buscar artigos da categoria:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [categoryId, categorySlug, category])

  // Filtrar artigos baseado na busca
  const filteredArticles = allArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Paginação
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage)

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

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header da Categoria */}
      <section className={`${categoryColor} text-white py-16`}>
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Voltar ao início</span>
          </Link>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {category}
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 text-neutral-600">
              <Filter size={20} />
              <span className="font-medium">
                {filteredArticles.length} artigo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Buscar nesta categoria..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset para primeira página ao buscar
                }}
                className="w-full pl-10 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Artigos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="news-card animate-pulse">
                  <div className="h-48 bg-neutral-200 mb-4"></div>
                  <div className="p-6">
                    <div className="h-6 bg-neutral-200 rounded mb-3"></div>
                    <div className="h-4 bg-neutral-200 rounded mb-2"></div>
                    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-4"></div>
                    <div className="flex justify-between">
                      <div className="h-4 bg-neutral-200 rounded w-20"></div>
                      <div className="h-4 bg-neutral-200 rounded w-16"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : currentArticles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentArticles.map((article, index) => (
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
                          <FileText className="h-12 w-12 text-neutral-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-neutral-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-neutral-500">
                        <div className="flex items-center space-x-2">
                          <User size={16} />
                          <span>{article.author_name}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{formatDate(article.created_at)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={16} />
                            <span>{article.views_count}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft size={20} />
                    <span>Anterior</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          currentPage === page
                            ? `${categoryColor} text-white`
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <span>Próxima</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            // Estado vazio quando não há resultados
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Search className="mx-auto text-neutral-400 mb-4" size={64} />
                <h3 className="text-2xl font-bold text-neutral-800 mb-4">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-neutral-600 mb-6">
                  Não encontramos artigos que correspondem à sua busca &quot;{searchQuery}&quot;.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-primary"
                >
                  Limpar busca
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CategoryPage
