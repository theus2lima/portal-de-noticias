"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchJSON } from "@/utils/http"
import { Rss, Plus, Edit3, Trash2, Globe, Activity, PlayCircle } from "lucide-react"

type NewsSource = {
  id: string
  name: string
  url: string
  type: "rss" | "scraping"
  description?: string
  is_active: boolean
  last_crawled?: string
  crawl_interval?: number
  created_at: string
}

type NewSourceForm = {
  name: string
  url: string
  type: "rss" | "scraping"
  description?: string
  is_active: boolean
  crawl_interval: number
}

export default function FontesPage() {
  const [sources, setSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null)
  const [form, setForm] = useState<NewSourceForm>({
    name: "",
    url: "",
    type: "rss",
    description: "",
    is_active: true,
    crawl_interval: 1
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const fetchSources = async () => {
    setLoading(true)
    try {
      const res = await fetchJSON<{ success: boolean; data: NewsSource[] }>("/api/news-sources")
      if (res.success) {
        setSources(res.data)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSources()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    
    try {
      const method = editingSource ? "PUT" : "POST"
      const payload = editingSource ? { ...form, id: editingSource.id } : form
      
      const res = await fetchJSON<{ success: boolean; message: string }>("/api/news-sources", {
        method,
        body: JSON.stringify(payload)
      })
      
      if (res.success) {
        setSuccess(res.message)
        setForm({ name: "", url: "", type: "rss", description: "", is_active: true, crawl_interval: 1 })
        setShowForm(false)
        setEditingSource(null)
        fetchSources()
      }
    } catch (e: any) {
      setError(e.message)
    }
  }

  const handleEdit = (source: NewsSource) => {
    setEditingSource(source)
    setForm({
      name: source.name,
      url: source.url,
      type: source.type,
      description: source.description || "",
      is_active: source.is_active,
      crawl_interval: source.crawl_interval || 1
    })
    setShowForm(true)
  }

  const handleDelete = async (source: NewsSource) => {
    if (!confirm(`Deseja remover a fonte "${source.name}"?`)) return
    
    try {
      await fetchJSON(`/api/news-sources?id=${source.id}`, { method: "DELETE" })
      setSuccess("Fonte removida com sucesso")
      fetchSources()
    } catch (e: any) {
      setError(e.message)
    }
  }

  const collectNow = async (sourceId: string) => {
    try {
      await fetchJSON("/api/news-collector", {
        method: "POST",
        body: JSON.stringify({ sourceId, forceRefresh: true })
      })
      setSuccess("Coleta iniciada com sucesso")
    } catch (e: any) {
      setError(e.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Fontes de Notícias</h1>
        <div className="flex gap-2">
          <Link href="/admin/curadoria" className="px-3 py-1.5 text-sm text-neutral-700 border rounded-md hover:bg-neutral-50">
            ← Voltar
          </Link>
          <button
            onClick={() => {
              setShowForm(true)
              setEditingSource(null)
              setForm({ name: "", url: "", type: "rss", description: "", is_active: true, crawl_interval: 1 })
            }}
            className="inline-flex items-center px-3 py-1.5 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            <Plus size={16} className="mr-1" /> Nova Fonte
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {showForm && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4">
            {editingSource ? "Editar Fonte" : "Nova Fonte"}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Nome</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Ex: G1 Notícias"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL</label>
                <input
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm(prev => ({ ...prev, url: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://g1.globo.com/rss/g1/"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Tipo</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm(prev => ({ ...prev, type: e.target.value as "rss" | "scraping" }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="rss">RSS Feed</option>
                  <option value="scraping">Web Scraping</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Intervalo (horas)</label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={form.crawl_interval}
                  onChange={(e) => setForm(prev => ({ ...prev, crawl_interval: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="flex items-center pt-6">
                  <input
                    type="checkbox"
                    checked={form.is_active}
                    onChange={(e) => setForm(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="mr-2"
                  />
                  Ativa
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Descrição</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Descrição opcional da fonte..."
              />
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
              >
                {editingSource ? "Atualizar" : "Criar"} Fonte
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setEditingSource(null)
                }}
                className="px-4 py-2 text-neutral-700 border rounded-md hover:bg-neutral-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-medium text-neutral-900">Fontes Configuradas</h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center text-neutral-600">Carregando...</div>
        ) : sources.length === 0 ? (
          <div className="p-6 text-center text-neutral-600">Nenhuma fonte configurada.</div>
        ) : (
          <div className="divide-y">
            {sources.map(source => (
              <div key={source.id} className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-neutral-900">{source.name}</h4>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      source.is_active 
                        ? "bg-green-100 text-green-700" 
                        : "bg-red-100 text-red-700"
                    }`}>
                      {source.is_active ? "Ativa" : "Inativa"}
                    </span>
                    <span className="px-2 py-0.5 text-xs bg-neutral-100 text-neutral-600 rounded-full">
                      {source.type.toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Globe size={14} />
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary-600">
                        {source.url}
                      </a>
                    </div>
                    {source.last_crawled && (
                      <div className="flex items-center gap-1">
                        <Activity size={14} />
                        Última coleta: {new Date(source.last_crawled).toLocaleString("pt-BR")}
                      </div>
                    )}
                  </div>
                  
                  {source.description && (
                    <p className="text-sm text-neutral-500 mt-1">{source.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => collectNow(source.id)}
                    className="p-2 text-primary-600 hover:bg-primary-50 rounded-md"
                    title="Coletar agora"
                  >
                    <PlayCircle size={18} />
                  </button>
                  <button
                    onClick={() => handleEdit(source)}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 rounded-md"
                    title="Editar"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(source)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Remover"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
