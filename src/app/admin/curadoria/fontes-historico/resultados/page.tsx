"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchJSON } from '@/utils/http'
import { ArrowLeft, Calendar, ExternalLink, Eye, Send, Filter, CheckCircle2 } from 'lucide-react'

type ScrapedNews = {
  id: string
  title: string
  summary?: string
  original_url: string
  image_url?: string
  published_at: string
  created_at: string
  source_id: string
  news_sources: {
    id: string
    name: string
    url: string
  }
}

type NewsSource = {
  id: string
  name: string
  url: string
}

export default function HistoricalResultsPage() {
  const [news, setNews] = useState<ScrapedNews[]>([])
  const [sources, setSources] = useState<NewsSource[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<string[]>([])
  const [filter, setFilter] = useState({
    days: 7,
    source: '',
    search: ''
  })
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    loadSources()
  }, [])

  useEffect(() => {
    loadNews()
  }, [filter])

  const loadSources = async () => {
    try {
      const response = await fetchJSON<{ success: boolean; data: NewsSource[] }>(
        '/api/news-sources'
      )
      
      if (response.success) {
        setSources(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar fontes:', error)
    }
  }

  const loadNews = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      // Calcular data de corte baseada nos dias
      const cutoffDate = new Date()
      cutoffDate.setDate(cutoffDate.getDate() - filter.days)
      params.set('after', cutoffDate.toISOString())
      
      if (filter.source) params.set('source_id', filter.source)
      if (filter.search) params.set('search', filter.search)
      
      const response = await fetchJSON<{ success: boolean; data: ScrapedNews[] }>(
        `/api/news-collector/scraped?${params}`
      )
      
      if (response.success) {
        setNews(response.data)
      }
    } catch (error) {
      console.error('Erro ao carregar notícias:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSelection = (id: string) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const selectAll = () => {
    setSelected(news.map(n => n.id))
  }

  const clearSelection = () => {
    setSelected([])
  }

  const sendToCuration = async () => {
    if (selected.length === 0) {
      setMessage('Selecione pelo menos uma notícia')
      return
    }
    
    setSending(true)
    setMessage(null)
    
    try {
      const response = await fetchJSON<{ success: boolean; message?: string }>('/api/news-collector/scraped', {
        method: 'POST',
        body: JSON.stringify({
          action: 'send_to_curation',
          news_ids: selected
        })
      })
      
      if (response.success) {
        setMessage(`${selected.length} notícias enviadas para curadoria!`)
        setSelected([])
        // Recarregar para remover as que foram enviadas
        loadNews()
      }
    } catch (error) {
      setMessage('Erro ao enviar para curadoria')
    } finally {
      setSending(false)
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/curadoria/fontes-historico" className="p-2 hover:bg-neutral-100 rounded-md">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Notícias Coletadas</h1>
          <p className="text-neutral-600 text-sm">Resultados do scraping histórico • {news.length} notícias encontradas</p>
        </div>
      </div>

      {message && (
        <div className={`px-4 py-3 rounded-md ${message.includes('Erro') ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {message}
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center gap-4 mb-4">
          <Filter size={18} />
          <h2 className="font-medium">Filtros</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Período</label>
            <select value={filter.days} onChange={e => setFilter(prev => ({ ...prev, days: parseInt(e.target.value) }))} className="w-full px-3 py-2 border rounded-md text-sm">
              <option value={1}>Último dia</option>
              <option value={7}>Últimos 7 dias</option>
              <option value={30}>Últimos 30 dias</option>
              <option value={90}>Últimos 90 dias</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Fonte</label>
            <select 
              value={filter.source} 
              onChange={e => setFilter(prev => ({ ...prev, source: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md text-sm"
            >
              <option value="">Todas as fontes</option>
              {sources.map(source => (
                <option key={source.id} value={source.id}>
                  {source.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Buscar</label>
            <input
              type="text"
              placeholder="Título, palavra-chave..."
              value={filter.search}
              onChange={e => setFilter(prev => ({ ...prev, search: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => setFilter({ days: 7, source: '', search: '' })}
              className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-800 border border-neutral-300 hover:border-neutral-400 rounded-md transition-colors"
            >
              Limpar Filtros
            </button>
          </div>
        </div>
      </div>

      {/* Ações em lote */}
      {selected.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm text-primary-700">
                {selected.length} notícia(s) selecionada(s)
              </span>
              <button onClick={clearSelection} className="text-xs text-primary-600 hover:text-primary-800">
                Limpar seleção
              </button>
            </div>
            <button
              onClick={sendToCuration}
              disabled={sending}
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              <Send size={16} className="mr-2" />
              {sending ? 'Enviando...' : 'Enviar para Curadoria'}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-neutral-600">Carregando notícias...</div>
      ) : (
        <div className="space-y-4">
          {news.length === 0 ? (
            <div className="text-center py-12 text-neutral-600">
              <Calendar size={48} className="mx-auto mb-4 text-neutral-400" />
              <p>Nenhuma notícia encontrada no período selecionado</p>
              <Link href="/admin/curadoria/fontes-historico" className="text-primary-600 hover:text-primary-800 text-sm">
                Voltar e fazer nova coleta
              </Link>
            </div>
          ) : (
            <div className="flex items-center justify-between mb-4">
              <button onClick={selectAll} className="text-sm text-primary-600 hover:text-primary-800">
                Selecionar todas ({news.length})
              </button>
            </div>
          )}

          {news.map(item => (
            <div key={item.id} className="bg-white border rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selected.includes(item.id)}
                  onChange={() => toggleSelection(item.id)}
                  className="mt-1"
                />
                
                {item.image_url && (
                  <div className="w-20 h-20 bg-neutral-100 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-medium text-neutral-900 mb-2 line-clamp-2">
                        {item.title}
                      </h3>
                      
                      {item.summary && (
                        <p className="text-sm text-neutral-600 mb-3 line-clamp-3">
                          {item.summary}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span className="font-medium text-primary-600">
                          {item.news_sources?.name}
                        </span>
                        <span>{formatDate(item.published_at)}</span>
                        <span>Coletado: {formatDate(item.created_at)}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-md"
                        title="Ver original"
                      >
                        <ExternalLink size={16} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
