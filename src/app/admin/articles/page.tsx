'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  MoreHorizontal,
  FileText,
  X,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import WhatsAppSendButton from '@/components/WhatsAppSendButton'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  featured_image?: string
  image_alt?: string
  category_id: string
  category_name: string
  author_name: string
  status: 'published' | 'draft'
  views_count: number
  created_at: string
  updated_at?: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface PaginationInfo {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [filteredArticles, setFilteredArticles] = useState<Article[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [articleToDelete, setArticleToDelete] = useState<Article | null>(null)
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })
  const [deleting, setDeleting] = useState(false)

  // Função para buscar dados
  const fetchData = useCallback(async (page?: number, search?: string, category?: string, status?: string) => {
    setLoading(true)
    try {
      // Usar valores dos parâmetros ou fallback para o estado atual
      const currentPage = page || pagination.page
      const currentSearch = search !== undefined ? search : searchTerm
      const currentCategory = category !== undefined ? category : selectedCategory
      const currentStatus = status !== undefined ? status : selectedStatus
      
      // Construir query string para filtros
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pagination.limit.toString(),
        ...(currentSearch && { search: currentSearch }),
        ...(currentCategory && { category: currentCategory }),
        ...(currentStatus && { status: currentStatus })
      })

      const response = await fetch(`/api/articles?${params}`)
      if (response.ok) {
        const data = await response.json()
        console.log('API Response:', data)
        console.log('Articles data:', data.data)
        setArticles(data.data || [])
        setPagination({
          page: data.pagination?.page || 1,
          limit: data.pagination?.limit || 10,
          total: data.pagination?.total || 0,
          totalPages: data.pagination?.totalPages || 1
        })
      } else {
        console.error('Erro ao carregar artigos da API:', response.status)
        setArticles([])
        setPagination({
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 1
        })
        toast.error('Erro ao carregar artigos')
      }
      
      // Buscar categorias da API
      try {
        const categoriesResponse = await fetch('/api/categories')
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json()
          setCategories(categoriesData.data || [])
        }
      } catch (error) {
        console.error('Erro ao buscar categorias:', error)
        setCategories([])
        toast.error('Erro ao carregar categorias')
      }
      
    } catch (error) {
      console.log('Erro ao buscar dados:', error)
      toast.error('Erro ao carregar artigos')
    } finally {
      setLoading(false)
    }
  }, [pagination.page, searchTerm, selectedCategory, selectedStatus, pagination.limit])


  // Aplicar filtros localmente quando a busca não funcionar via API
  useEffect(() => {
    let filtered = [...articles]
    
    if (searchTerm) {
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(article => article.category_id === selectedCategory)
    }
    
    if (selectedStatus) {
      filtered = filtered.filter(article => article.status === selectedStatus)
    }
    
    setFilteredArticles(filtered)
  }, [articles, searchTerm, selectedCategory, selectedStatus])
  
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Função para lidar com mudanças de filtro
  const handleFilterChange = () => {
    fetchData(1, searchTerm, selectedCategory, selectedStatus)
  }

  // Função para deletar artigo
  const handleDeleteClick = (article: Article) => {
    setArticleToDelete(article)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!articleToDelete) return
    
    setDeleting(true)
    try {
      const response = await fetch(`/api/articles/${articleToDelete.id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        toast.success('Artigo excluído com sucesso!')
        fetchData(pagination.page, searchTerm, selectedCategory, selectedStatus)
        setShowDeleteModal(false)
        setArticleToDelete(null)
      } else {
        toast.error('Erro ao excluir artigo')
      }
    } catch (error) {
      console.error('Erro ao deletar:', error)
      toast.error('Erro ao excluir artigo')
    } finally {
      setDeleting(false)
    }
  }

  // Função para alternar status do artigo
  const handleStatusToggle = async (article: Article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published'
    
    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: newStatus
        })
      })
      
      if (response.ok) {
        toast.success(
          newStatus === 'published' 
            ? 'Artigo publicado com sucesso!' 
            : 'Artigo salvo como rascunho!'
        )
        fetchData(pagination.page, searchTerm, selectedCategory, selectedStatus)
      } else {
        toast.error('Erro ao alterar status do artigo')
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status do artigo')
    }
  }

  // Função para mudar página
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchData(newPage, searchTerm, selectedCategory, selectedStatus)
    }
  }

  const displayArticles = filteredArticles.length > 0 ? filteredArticles : articles
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-neutral-900">Artigos</h1>
          <div className="h-10 w-32 bg-neutral-200 rounded animate-pulse"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 bg-neutral-200 rounded-xl animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Artigos</h1>
          <p className="text-neutral-600">Gerencie todos os artigos do portal</p>
        </div>
        <Link
          href="/admin/articles/new"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Artigo</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar artigos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Category Filter */}
          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todas as categorias</option>
            {categories?.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Todos os status</option>
            <option value="published">Publicado</option>
            <option value="draft">Rascunho</option>
          </select>

          <button className="btn-outline flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Articles Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Artigo
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Ações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Autor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Visualizações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Data
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {displayArticles && displayArticles.length > 0 ? (
                displayArticles.map((article: any) => (
                  <tr key={article.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {article.featured_image ? (
                          <div className="relative h-12 w-12 rounded-lg overflow-hidden mr-4">
                            <Image
                              src={article.featured_image}
                              alt={article.image_alt || ''}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-neutral-200 flex items-center justify-center mr-4">
                            <FileText className="h-6 w-6 text-neutral-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-neutral-900 truncate">
                            {article.title}
                          </p>
                          <p className="text-sm text-neutral-500 truncate">
                            {article.excerpt}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1">
                        {/* Ver artigo publicado */}
                        {article.status === 'published' && (
                          <Link
                            href={`/noticia/${article.slug}`}
                            className="inline-flex items-center justify-center w-8 h-8 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-all duration-200"
                            title="Ver artigo"
                            target="_blank"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                        )}
                        
                        {/* Editar artigo */}
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="inline-flex items-center justify-center w-8 h-8 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded-full transition-all duration-200"
                          title="Editar artigo"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        
                        {/* Ação de status - Publicar/Arquivar */}
                        <button
                          onClick={() => handleStatusToggle(article)}
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
                            article.status === 'published'
                              ? 'text-yellow-600 hover:text-yellow-900 hover:bg-yellow-50'
                              : 'text-green-600 hover:text-green-900 hover:bg-green-50'
                          }`}
                          title={article.status === 'published' ? 'Salvar como rascunho' : 'Publicar artigo'}
                        >
                          {article.status === 'published' ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                          )}
                        </button>
                        
                        {/* WhatsApp - Enviar para WhatsApp se for publicado */}
                        {article.status === 'published' && (
                          <div className="flex items-center justify-center">
                            <WhatsAppSendButton 
                              article={{
                                id: article.id,
                                title: article.title,
                                excerpt: article.excerpt,
                                slug: article.slug,
                                category_name: article.category_name,
                                featured_image: article.featured_image,
                                author_name: article.author_name,
                                published_at: article.created_at
                              }}
                              variant="icon-only"
                              className="w-8 h-8 rounded-full"
                              onSuccess={() => {
                                toast.success('Artigo enviado para WhatsApp!')
                              }}
                              onError={(error) => {
                                toast.error(error)
                              }}
                            />
                          </div>
                        )}
                        
                        {/* Excluir artigo */}
                        <button
                          onClick={() => handleDeleteClick(article)}
                          className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-full transition-all duration-200"
                          title="Excluir artigo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {article.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      {article.author_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        article.status === 'published'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                      <div className="flex items-center">
                        <Eye className="h-4 w-4 text-neutral-400 mr-1" />
                        {article.views_count || 0}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      {new Date(article.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <FileText className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">
                      Nenhum artigo encontrado
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Comece criando seu primeiro artigo.
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/admin/articles/new"
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Novo Artigo</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {articles && articles.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 px-4 py-3 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button className="btn-outline">Anterior</button>
            <button className="btn-outline">Próximo</button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-neutral-700">
                Mostrando <span className="font-medium">1</span> até{' '}
                <span className="font-medium">{articles.length}</span> de{' '}
                <span className="font-medium">{articles.length}</span> resultados
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                  <span className="sr-only">Anterior</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                <button className="bg-primary-50 border-primary-500 text-primary-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-neutral-300 bg-white text-sm font-medium text-neutral-500 hover:bg-neutral-50">
                  <span className="sr-only">Próximo</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mr-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-lg font-medium text-neutral-900">
                Confirmar Exclusão
              </h3>
            </div>
            
            <p className="text-neutral-600 mb-6">
              Tem certeza que deseja excluir o artigo{' '}
              <span className="font-medium text-neutral-900">
                &quot;{articleToDelete?.title}&quot;
              </span>
              ? Esta ação não pode ser desfeita.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false)
                  setArticleToDelete(null)
                }}
                className="btn-outline"
                disabled={deleting}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="btn-danger flex items-center space-x-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    <span>Excluir</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
