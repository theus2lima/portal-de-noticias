'use client'

import React, { useState, useEffect } from 'react'
import { Loader2, Search, RefreshCw, TrendingUp, Calendar, Globe, AlertCircle } from 'lucide-react'

interface CollectionResult {
  id?: string
  title: string
  url: string
  source?: string
  status: 'success' | 'duplicate' | 'error'
  message?: string
  error?: string
}

interface GoogleNewsStats {
  configured: boolean
  source?: any
  stats?: {
    total_collected: number
    by_day: { date: string; count: number }[]
    last_fetch: string
    last_results: number
  }
  available_categories: { value: string | null; label: string }[]
}

const GoogleNewsCollector: React.FC = () => {
  const [query, setQuery] = useState('Brasil')
  const [category, setCategory] = useState<string | null>(null)
  const [limit, setLimit] = useState(20)
  const [isCollecting, setIsCollecting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [results, setResults] = useState<CollectionResult[]>([])
  const [stats, setStats] = useState<GoogleNewsStats | null>(null)
  const [lastCollection, setLastCollection] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Carregar estatísticas iniciais
  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/news-collector/google-news')
      const data = await response.json()
      
      if (data.success) {
        setStats(data.data)
      } else {
        setError(data.error || 'Erro ao carregar estatísticas')
      }
    } catch (err) {
      setError('Erro ao conectar com a API')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCollect = async () => {
    try {
      setIsCollecting(true)
      setError(null)
      setResults([])

      const response = await fetch('/api/news-collector/google-news', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          category: category || null,
          limit,
          language: 'pt-BR',
          country: 'BR',
          timeRange: 'today'
        }),
      })

      const data = await response.json()

      if (data.success) {
        setResults(data.data.results || [])
        setLastCollection(data.data)
        // Recarregar estatísticas
        loadStats()
      } else {
        setError(data.error || 'Erro na coleta')
      }
    } catch (err) {
      setError('Erro ao conectar com a API')
    } finally {
      setIsCollecting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Carregando configurações...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-2">
            <Globe className="h-5 w-5" />
            Coletor Google News
          </h2>
          <p className="text-gray-600">
            Colete notícias automaticamente do Google Notícias usando termos de busca ou categorias específicas
          </p>
        </div>
      </div>

      {/* Estatísticas */}
      {stats && stats.configured && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <TrendingUp className="h-4 w-4" />
              Estatísticas
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.stats?.total_collected || 0}
                </div>
                <div className="text-sm text-gray-500">Notícias coletadas (7 dias)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.stats?.last_results || 0}
                </div>
                <div className="text-sm text-gray-500">Última coleta</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {stats.stats?.by_day?.length || 0}
                </div>
                <div className="text-sm text-gray-500">Dias ativos</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-gray-700">
                  {stats.stats?.last_fetch ? 
                    new Date(stats.stats.last_fetch).toLocaleString('pt-BR') : 
                    'Nunca'
                  }
                </div>
                <div className="text-sm text-gray-500">Última atualização</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Formulário de Coleta */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
            <Search className="h-4 w-4" />
            Nova Coleta
          </h3>
          <div className="space-y-4">
            {/* Termo de busca */}
            <div className="space-y-2">
              <label htmlFor="query" className="block text-sm font-medium text-gray-700">
                Termo de busca
              </label>
              <input
                id="query"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ex: Brasil, eleições, economia..."
                disabled={isCollecting}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>

            {/* Categoria */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Categoria (opcional)
              </label>
              <select
                value={category || ''}
                onChange={(e) => setCategory(e.target.value || null)}
                disabled={isCollecting}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                {(stats?.available_categories || []).map((cat) => (
                  <option key={cat.value || 'all'} value={cat.value || ''}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Limite */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Limite de notícias
              </label>
              <select
                value={limit.toString()}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                disabled={isCollecting}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
              >
                <option value="10">10 notícias</option>
                <option value="20">20 notícias</option>
                <option value="50">50 notícias</option>
                <option value="100">100 notícias</option>
              </select>
            </div>

            {/* Botão de coleta */}
            <button
              onClick={handleCollect}
              disabled={isCollecting || !query.trim()}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors"
            >
              {isCollecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Coletando notícias...
                </>
              ) : (
                <>
                  <RefreshCw className="h-4 w-4" />
                  Coletar Notícias
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Erro */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
            <span className="text-red-700">{error}</span>
          </div>
        </div>
      )}

      {/* Resultado da última coleta */}
      {lastCollection && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium flex items-center gap-2 mb-4">
              <Calendar className="h-4 w-4" />
              Resultado da Coleta
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-600">{lastCollection.total_found}</div>
                <div className="text-sm text-gray-500">Encontradas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{lastCollection.collected}</div>
                <div className="text-sm text-gray-500">Coletadas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{lastCollection.duplicates}</div>
                <div className="text-sm text-gray-500">Duplicadas</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-red-600">{lastCollection.errors}</div>
                <div className="text-sm text-gray-500">Erros</div>
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Consulta:</strong> &quot;{lastCollection.query}&quot;
              {lastCollection.category && (
                <>
                  <span className="mx-2">•</span>
                  <strong>Categoria:</strong> {lastCollection.category}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Lista de resultados */}
      {results.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6">
            <h3 className="text-lg font-medium mb-2">Notícias Processadas</h3>
            <p className="text-sm text-gray-600 mb-4">
              Resultado detalhado do processamento (mostrando até 10 itens)
            </p>
            <div className="space-y-3">
              {results.map((result, index) => (
                <div key={index} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">
                      {result.title}
                    </h4>
                    {result.source && (
                      <p className="text-xs text-gray-500 mt-1">
                        Fonte: {result.source}
                      </p>
                    )}
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Ver original
                    </a>
                  </div>
                  <div className="ml-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        result.status === 'success'
                          ? 'bg-green-100 text-green-800'
                          : result.status === 'duplicate'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {result.status === 'success' && 'Coletada'}
                      {result.status === 'duplicate' && 'Duplicada'}
                      {result.status === 'error' && 'Erro'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default GoogleNewsCollector
