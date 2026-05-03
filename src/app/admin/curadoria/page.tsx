'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search, RefreshCw, ExternalLink, Bot, Newspaper,
  Clock, Globe, Rss, AlertCircle, ChevronRight, Loader2
} from 'lucide-react'

interface NewsItem {
  id: string
  title: string
  url: string
  summary: string
  source_name: string
  source_url: string
  published_at: string
  image_url: string | null
  origin: 'google' | 'parana' | 'rss'
}

const KEYWORD_SUGGESTIONS = [
  'Noroeste do Paraná',
  'Campo Mourão',
  'Maringá',
  'Umuarama',
  'Cianorte',
  'Paraná Política',
  'Paraná Economia',
  'Paraná Saúde',
]

const SOURCE_TABS = [
  { key: 'google', label: 'Google News', icon: Globe },
  { key: 'parana', label: 'Sites do Paraná', icon: Newspaper },
  { key: 'rss', label: 'Fontes RSS', icon: Rss },
]

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  return `${days}d atrás`
}

function NewsCard({ item, onRewrite }: { item: NewsItem; onRewrite: (item: NewsItem) => void }) {
  const originColors: Record<string, string> = {
    google: 'bg-blue-100 text-blue-700',
    parana: 'bg-green-100 text-green-700',
    rss: 'bg-orange-100 text-orange-700',
  }

  return (
    <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
      {/* Image */}
      <div className="h-40 bg-neutral-100 flex-shrink-0 overflow-hidden relative">
        {item.image_url ? (
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = 'none' }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Newspaper size={32} className="text-neutral-300" />
          </div>
        )}
        <span className={`absolute top-2 left-2 text-xs font-medium px-2 py-0.5 rounded-full ${originColors[item.origin] || 'bg-neutral-100 text-neutral-600'}`}>
          {item.source_name}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-center gap-1 text-xs text-neutral-400 mb-2">
          <Clock size={11} />
          <span>{timeAgo(item.published_at)}</span>
        </div>

        <h3 className="font-semibold text-neutral-900 text-sm leading-snug mb-2 line-clamp-3 flex-1">
          {item.title}
        </h3>

        {item.summary && (
          <p className="text-xs text-neutral-500 line-clamp-2 mb-4">
            {item.summary}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <button
            onClick={() => onRewrite(item)}
            className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium px-3 py-2 rounded-lg transition-colors"
          >
            <Bot size={13} />
            Reescrever com IA
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
            title="Ver original"
          >
            <ExternalLink size={14} className="text-neutral-500" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function CuradoriaPage() {
  const router = useRouter()
  const [query, setQuery] = useState('Noroeste do Paraná')
  const [activeSource, setActiveSource] = useState('google')
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasSearched, setHasSearched] = useState(false)

  const fetchNews = async (q = query, src = activeSource) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(
        `/api/curadoria/buscar?q=${encodeURIComponent(q)}&source=${src}`,
        { credentials: 'include' }
      )
      const data = await res.json()
      if (data.success) {
        setNews(data.data || [])
        setHasSearched(true)
        if (data.errors?.length) {
          console.warn('Algumas fontes falharam:', data.errors)
        }
      } else {
        setError(data.error || 'Erro ao buscar notícias')
      }
    } catch (err) {
      setError('Não foi possível conectar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  // Load on first render
  useEffect(() => {
    fetchNews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleSourceChange = (src: string) => {
    setActiveSource(src)
    fetchNews(query, src)
  }

  const handleRewrite = (item: NewsItem) => {
    // Store in sessionStorage and navigate to rewrite page
    sessionStorage.setItem('curadoria_item', JSON.stringify(item))
    router.push('/admin/curadoria/reescrever')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') fetchNews()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Curadoria de Notícias</h1>
          <p className="text-sm text-neutral-500 mt-0.5">Busque notícias, reescreva com IA e publique em segundos</p>
        </div>
        <a
          href="/admin/curadoria/fontes"
          className="flex items-center gap-1.5 text-sm text-neutral-600 hover:text-neutral-900 border border-neutral-200 px-3 py-2 rounded-lg hover:bg-neutral-50 transition-colors"
        >
          <Rss size={14} />
          Gerenciar Fontes
          <ChevronRight size={14} />
        </a>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ex: Campo Mourão, Paraná política, Noroeste Paraná..."
              className="w-full pl-9 pr-4 py-2.5 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <button
            onClick={() => fetchNews()}
            disabled={loading}
            className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-60"
          >
            {loading ? <Loader2 size={15} className="animate-spin" /> : <Search size={15} />}
            Buscar
          </button>
          <button
            onClick={() => fetchNews()}
            disabled={loading}
            title="Atualizar"
            className="p-2.5 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin text-neutral-400' : 'text-neutral-500'} />
          </button>
        </div>

        {/* Keyword suggestions */}
        <div className="flex flex-wrap gap-2">
          <span className="text-xs text-neutral-400 self-center">Sugestões:</span>
          {KEYWORD_SUGGESTIONS.map((kw) => (
            <button
              key={kw}
              onClick={() => { setQuery(kw); fetchNews(kw, activeSource) }}
              className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                query === kw
                  ? 'bg-primary-50 border-primary-300 text-primary-700'
                  : 'border-neutral-200 text-neutral-600 hover:border-primary-300 hover:text-primary-700'
              }`}
            >
              {kw}
            </button>
          ))}
        </div>
      </div>

      {/* Source Tabs */}
      <div className="flex gap-2">
        {SOURCE_TABS.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.key}
              onClick={() => handleSourceChange(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeSource === tab.key
                  ? 'bg-primary-600 text-white'
                  : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Results */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
          <Loader2 size={32} className="animate-spin" />
          <p className="text-sm">Buscando notícias...</p>
        </div>
      ) : error ? (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
          <button onClick={() => fetchNews()} className="ml-auto text-xs underline">Tentar novamente</button>
        </div>
      ) : news.length === 0 && hasSearched ? (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
          <Newspaper size={40} className="text-neutral-200" />
          <p className="text-sm font-medium">Nenhuma notícia encontrada</p>
          <p className="text-xs">Tente outra palavra-chave ou fonte</p>
        </div>
      ) : news.length > 0 ? (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              <span className="font-semibold text-neutral-900">{news.length}</span> notícias encontradas
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {news.map((item) => (
              <NewsCard key={item.id} item={item} onRewrite={handleRewrite} />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-neutral-400 gap-3">
          <Search size={40} className="text-neutral-200" />
          <p className="text-sm font-medium">Busque notícias para começar</p>
          <p className="text-xs">Digite uma palavra-chave ou clique em uma sugestão acima</p>
        </div>
      )}
    </div>
  )
}
