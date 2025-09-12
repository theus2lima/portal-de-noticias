'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Search, Eye, Edit, Trash2, ExternalLink, BarChart3 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LandingPage {
  id: string
  title: string
  slug: string
  hero_title: string
  template: string
  is_active: boolean
  views_count: number
  leads_count: number
  created_at: string
  updated_at: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export default function LandingPagesAdmin() {
  const [landingPages, setLandingPages] = useState<LandingPage[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchLandingPages = async (page = 1, searchTerm = '', status = 'all') => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
        search: searchTerm,
        status
      })

      const response = await fetch(`/api/landing-pages?${params}`)
      if (!response.ok) throw new Error('Erro ao carregar landing pages')

      const data = await response.json()
      setLandingPages(data.data)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Erro ao carregar landing pages:', error)
      toast.error('Erro ao carregar landing pages')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLandingPages()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchLandingPages(1, search, statusFilter)
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Tem certeza que deseja excluir a landing page "${title}"?`)) {
      return
    }

    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao excluir landing page')
      }

      toast.success('Landing page excluída com sucesso!')
      fetchLandingPages(pagination.page, search, statusFilter)
    } catch (error) {
      console.error('Erro ao excluir:', error)
      toast.error('Erro ao excluir landing page')
    }
  }

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/landing-pages/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      })

      if (!response.ok) {
        throw new Error('Erro ao alterar status')
      }

      toast.success('Status alterado com sucesso!')
      fetchLandingPages(pagination.page, search, statusFilter)
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      toast.error('Erro ao alterar status')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTemplateLabel = (template: string) => {
    const templates: Record<string, string> = {
      default: 'Padrão',
      business: 'Empresarial',
      minimal: 'Minimalista',
      bold: 'Ousado',
      modern: 'Moderno'
    }
    return templates[template] || template
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Landing Pages</h1>
          <p className="text-gray-600">Gerencie suas páginas de conversão</p>
        </div>
        <Link
          href="/admin/landing-pages/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus size={16} />
          <span>Nova Landing Page</span>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Buscar por título, slug ou hero..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">Todos os status</option>
            <option value="active">Ativas</option>
            <option value="inactive">Inativas</option>
          </select>
          <button
            type="submit"
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Filtrar
          </button>
        </form>
      </div>

      {/* Lista de Landing Pages */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Carregando landing pages...
          </div>
        ) : landingPages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhuma landing page encontrada
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-900">Título</th>
                    <th className="text-left p-4 font-medium text-gray-900">Slug</th>
                    <th className="text-left p-4 font-medium text-gray-900">Template</th>
                    <th className="text-left p-4 font-medium text-gray-900">Status</th>
                    <th className="text-left p-4 font-medium text-gray-900">Analytics</th>
                    <th className="text-left p-4 font-medium text-gray-900">Data</th>
                    <th className="text-left p-4 font-medium text-gray-900">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {landingPages.map((page) => (
                    <tr key={page.id} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-4">
                        <div>
                          <div className="font-medium text-gray-900">{page.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {page.hero_title}
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {page.slug}
                        </code>
                      </td>
                      <td className="p-4">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                          {getTemplateLabel(page.template)}
                        </span>
                      </td>
                      <td className="p-4">
                        <button
                          onClick={() => toggleStatus(page.id, page.is_active)}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            page.is_active
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {page.is_active ? 'Ativa' : 'Inativa'}
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Eye size={14} className="mr-1" />
                            {page.views_count}
                          </span>
                          <span className="flex items-center">
                            <BarChart3 size={14} className="mr-1" />
                            {page.leads_count}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {formatDate(page.created_at)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <a
                            href={`/landing/${page.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-blue-600"
                            title="Visualizar"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <Link
                            href={`/admin/landing-pages/${page.id}/edit`}
                            className="text-gray-400 hover:text-yellow-600"
                            title="Editar"
                          >
                            <Edit size={16} />
                          </Link>
                          <button
                            onClick={() => handleDelete(page.id, page.title)}
                            className="text-gray-400 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginação */}
            {pagination.totalPages > 1 && (
              <div className="p-4 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  Mostrando {landingPages.length} de {pagination.total} landing pages
                </div>
                <div className="flex space-x-2">
                  {pagination.page > 1 && (
                    <button
                      onClick={() => fetchLandingPages(pagination.page - 1, search, statusFilter)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Anterior
                    </button>
                  )}
                  {pagination.page < pagination.totalPages && (
                    <button
                      onClick={() => fetchLandingPages(pagination.page + 1, search, statusFilter)}
                      className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50"
                    >
                      Próximo
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
