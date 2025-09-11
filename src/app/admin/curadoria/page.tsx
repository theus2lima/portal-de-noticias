"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { fetchJSON } from "@/utils/http"
import { CurationItem, Pagination } from "@/types/curation"
import { Bot, Check, ExternalLink, Loader2, ThumbsDown, Activity, Send, Trash2 } from "lucide-react"

export default function CurationDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CurationItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [status, setStatus] = useState("pending")
  const [error, setError] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async (page = 1, statusFilter = status) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchJSON<{ success: boolean; data: CurationItem[]; pagination: Pagination }>(
        `/api/curation?status=${statusFilter}&page=${page}&limit=${pagination.limit}`
      )
      if (res.success) {
        setItems(res.data)
        setPagination(res.pagination)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(1, status)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  const onApprove = async (curationId: string) => {
    await fetchJSON(`/api/curation`, {
      method: "POST",
      body: JSON.stringify({ action: "approve", curationId, data: {} })
    })
    fetchData(pagination.page)
  }

  const onReject = async (curationId: string) => {
    await fetchJSON(`/api/curation`, {
      method: "POST",
      body: JSON.stringify({ action: "reject", curationId, data: { reason: "Rejeitado pelo curador" } })
    })
    fetchData(pagination.page)
  }

  const onPublish = async (curationId: string, item: CurationItem) => {
    try {
      await fetchJSON(`/api/curation/${curationId}`, {
        method: "PUT",
        body: JSON.stringify({ 
          action: "publish", 
          data: {
            title: item.scraped_news.title,
            summary: item.scraped_news.summary || "",
            content: item.scraped_news.content || "",
            categoryId: item.suggested_category?.id || null
          }
        })
      })
      fetchData(pagination.page)
    } catch (error) {
      console.error('Erro ao publicar:', error)
    }
  }

  const onDelete = async (curationId: string, item: CurationItem) => {
    // Não permitir deletar itens publicados
    if (item.status === 'published') {
      alert('Não é possível excluir notícias já publicadas')
      return
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir a notícia "${item.scraped_news.title}"?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    try {
      await fetchJSON(`/api/curation/${curationId}`, {
        method: "DELETE"
      })
      // Remover da seleção se estiver selecionado
      setSelectedItems(prev => {
        const newSet = new Set(prev)
        newSet.delete(curationId)
        return newSet
      })
      fetchData(pagination.page)
    } catch (error: any) {
      console.error('Erro ao excluir:', error)
      alert(`Erro ao excluir notícia: ${error.message || 'Erro desconhecido'}`)
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev)
      if (checked) {
        newSet.add(itemId)
      } else {
        newSet.delete(itemId)
      }
      return newSet
    })
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      // Selecionar apenas itens que podem ser excluídos (não publicados)
      const selectableItems = items.filter(item => item.status !== 'published')
      setSelectedItems(new Set(selectableItems.map(item => item.id)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const onBulkDelete = async () => {
    if (selectedItems.size === 0) return

    const selectedItemsData = items.filter(item => selectedItems.has(item.id))
    const publishedItems = selectedItemsData.filter(item => item.status === 'published')
    
    if (publishedItems.length > 0) {
      alert(`${publishedItems.length} item(ns) não pode(m) ser excluído(s) pois já foi(ram) publicado(s).`)
      return
    }

    const confirmed = window.confirm(
      `Tem certeza que deseja excluir ${selectedItems.size} notícia(s) selecionada(s)?\n\nEsta ação não pode ser desfeita.`
    )

    if (!confirmed) return

    setIsDeleting(true)
    try {
      // Excluir todos os itens selecionados
      const deletePromises = Array.from(selectedItems).map(itemId => 
        fetchJSON(`/api/curation/${itemId}`, { method: "DELETE" })
      )
      
      await Promise.all(deletePromises)
      setSelectedItems(new Set())
      fetchData(pagination.page)
    } catch (error: any) {
      console.error('Erro na exclusão em lote:', error)
      alert(`Erro ao excluir notícias: ${error.message || 'Erro desconhecido'}`)
    } finally {
      setIsDeleting(false)
    }
  }

  // Limpar seleções quando mudar de status
  useEffect(() => {
    setSelectedItems(new Set())
  }, [status])

  const selectableItems = items.filter(item => item.status !== 'published')
  const allSelectableSelected = selectableItems.length > 0 && selectableItems.every(item => selectedItems.has(item.id))

  const statusTabs = useMemo(() => [
    { key: "pending", label: "Pendentes" },
    { key: "approved", label: "Aprovadas" },
    { key: "rejected", label: "Rejeitadas" },
    { key: "published", label: "Publicadas" }
  ], [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Curadoria de Notícias</h1>
        <div className="flex items-center gap-2">
          <Link href="/admin/curadoria/fontes" className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700">Gerenciar Fontes</Link>
          <Link href="/admin/curadoria/historico" className="inline-flex items-center px-3 py-1.5 text-sm bg-secondary-600 text-white rounded-md hover:bg-secondary-700">
            <Activity size={16} className="mr-1" /> Coleta Histórica
          </Link>
          <button
            onClick={async () => {
              await fetchJSON(`/api/news-collector`, { method: "POST", body: JSON.stringify({}) })
              fetchData()
            }}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-neutral-800 text-white rounded-md hover:bg-neutral-900"
          >
            <Bot size={16} className="mr-1" /> Coletar Agora
          </button>
        </div>
      </div>

      <div className="flex gap-2 border-b">
        {statusTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatus(tab.key)}
            className={`px-3 py-2 text-sm -mb-px border-b-2 ${status === tab.key ? "border-primary-600 text-primary-700" : "border-transparent text-neutral-500 hover:text-neutral-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Barra de ações em lote */}
      {selectableItems.length > 0 && (
        <div className="bg-white border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allSelectableSelected}
                onChange={(e) => handleSelectAll(e.target.checked)}
                className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
              />
              <span className="text-sm font-medium text-neutral-700">
                {selectedItems.size > 0 
                  ? `${selectedItems.size} de ${selectableItems.length} selecionado(s)` 
                  : `Selecionar todos (${selectableItems.length})`
                }
              </span>
            </label>
          </div>
          
          {selectedItems.size > 0 && (
            <button
              onClick={onBulkDelete}
              disabled={isDeleting}
              className="inline-flex items-center px-4 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? (
                <>
                  <Loader2 size={16} className="mr-2 animate-spin" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 size={16} className="mr-2" />
                  Excluir Selecionados ({selectedItems.size})
                </>
              )}
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-600"><Loader2 className="animate-spin" size={18} /> Carregando...</div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-neutral-600 text-sm">Nenhuma notícia encontrada.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => {
            const canSelect = item.status !== 'published'
            const isSelected = selectedItems.has(item.id)
            
            return (
            <div key={item.id} className={`bg-white border rounded-lg p-4 space-y-3 transition-all ${
              isSelected ? 'ring-2 ring-primary-500 border-primary-300' : ''
            }`}>
              {/* Checkbox de seleção */}
              {canSelect && (
                <div className="flex justify-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                      className="w-4 h-4 text-primary-600 border-neutral-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-xs text-neutral-500">Selecionar</span>
                  </label>
                </div>
              )}
              
              <div className="flex gap-3">
                {item.scraped_news.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.scraped_news.image_url} alt="thumb" className="w-24 h-24 object-cover rounded" />
                ) : (
                  <div className="w-24 h-24 bg-neutral-100 rounded" />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-neutral-900 line-clamp-2">{item.scraped_news.title}</h3>
                  <p className="text-xs text-neutral-500 line-clamp-2">{item.scraped_news.summary}</p>
                  <div className="text-xs text-neutral-500 mt-1">Fonte: {item.scraped_news.news_sources?.name}</div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <a href={item.scraped_news.original_url} target="_blank" className="text-xs text-primary-700 hover:underline inline-flex items-center">
                  Ver original <ExternalLink size={14} className="ml-1" />
                </a>
                {item.ai_confidence != null && (
                  <span className="text-xs bg-primary-50 text-primary-700 px-2 py-0.5 rounded">IA {Math.round((item.ai_confidence || 0) * 100)}%</span>
                )}
              </div>

              <div className="flex gap-2 flex-wrap">
                {status === 'pending' && (
                  <>
                    <button onClick={() => onApprove(item.id)} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                      <Check size={16} className="mr-1" /> Aprovar
                    </button>
                    <button onClick={() => onReject(item.id)} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                      <ThumbsDown size={16} className="mr-1" /> Rejeitar
                    </button>
                    <button onClick={() => onPublish(item.id, item)} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                      <Send size={16} className="mr-1" /> Publicar
                    </button>
                  </>
                )}
                {(status === 'approved' || status === 'editing') && (
                  <button onClick={() => onPublish(item.id, item)} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700">
                    <Send size={16} className="mr-1" /> Publicar
                  </button>
                )}
                <Link href={`/admin/curadoria/${item.id}`} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-neutral-200 text-neutral-800 rounded hover:bg-neutral-300">
                  {status === 'published' ? 'Ver Detalhes' : 'Editar'}
                </Link>
                {/* Botão de excluir - só exibir se não for publicado */}
                {item.status !== 'published' && (
                  <button 
                    onClick={() => onDelete(item.id, item)} 
                    className="inline-flex items-center px-2.5 py-1.5 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 border border-red-200"
                    title="Excluir notícia"
                  >
                    <Trash2 size={16} className="mr-1" /> Excluir
                  </button>
                )}
              </div>
            </div>
          )}
          )}
        </div>
      )}
    </div>
  )
}

