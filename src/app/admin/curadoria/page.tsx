"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { fetchJSON } from "@/utils/http"
import { CurationItem, Pagination } from "@/types/curation"
import { Bot, Check, ExternalLink, Loader2, ThumbsDown, Activity } from "lucide-react"

export default function CurationDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState<CurationItem[]>([])
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, pages: 0 })
  const [status, setStatus] = useState("pending")
  const [error, setError] = useState<string | null>(null)

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

      {loading ? (
        <div className="flex items-center gap-2 text-neutral-600"><Loader2 className="animate-spin" size={18} /> Carregando...</div>
      ) : error ? (
        <div className="text-red-600 text-sm">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-neutral-600 text-sm">Nenhuma notícia encontrada.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white border rounded-lg p-4 space-y-3">
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

              <div className="flex gap-2">
                <button onClick={() => onApprove(item.id)} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-green-600 text-white rounded hover:bg-green-700">
                  <Check size={16} className="mr-1" /> Aprovar
                </button>
                <button onClick={() => onReject(item.id)} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-red-600 text-white rounded hover:bg-red-700">
                  <ThumbsDown size={16} className="mr-1" /> Rejeitar
                </button>
                <Link href={`/admin/curadoria/${item.id}`} className="inline-flex items-center px-2.5 py-1.5 text-sm bg-neutral-200 text-neutral-800 rounded hover:bg-neutral-300">
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

