'use client'

import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  Eye, 
  Users,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Clock,
  Loader2,
  AlertCircle
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface AnalyticsData {
  stats: {
    total_views: number
    published_articles: number
    leads_last_30_days: number
    avg_views_per_article: number
  }
  changes: {
    total_views: string
    published_articles: string
    leads_last_30_days: string
    avg_views_per_article: string
  }
  top_articles: Array<{
    id: string
    title: string
    author_name: string
    category_name: string
    views_count: number
    published_at: string
    created_at: string
  }>
  top_categories: Array<{
    name: string
    views: number
    articles: number
  }>
  hourly_traffic: Array<{
    time: string
    percentage: number
    views: string
  }>
  conversion_funnel: Array<{
    stage: string
    count: number
    percentage: number
  }>
  period_days: number
  last_updated: string
  database_connected: boolean
  error?: string
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchAnalyticsData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics?period=${period}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de analytics')
      }
      
      const data = await response.json()
      setAnalyticsData(data)
    } catch (err) {
      console.error('Erro ao carregar analytics:', err)
      setError('Erro ao carregar dados de analytics')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchAnalyticsData(false)
  }

  const handleExport = async (format: 'csv' | 'json' = 'csv') => {
    try {
      setIsExporting(true)
      const response = await fetch(`/api/analytics/export?format=${format}&period=${period}`)
      
      if (!response.ok) {
        throw new Error('Erro ao exportar relatório')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-analytics-${new Date().toISOString().split('T')[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Erro ao exportar:', err)
      alert('Erro ao exportar relatório. Tente novamente.')
    } finally {
      setIsExporting(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsData()
  }, [period])

  // Extract data with fallbacks
  const stats = analyticsData?.stats || {
    total_views: 0,
    published_articles: 0,
    leads_last_30_days: 0,
    avg_views_per_article: 0
  }
  
  const changes = analyticsData?.changes || {
    total_views: '0%',
    published_articles: '0%',
    leads_last_30_days: '0%',
    avg_views_per_article: '0%'
  }
  
  const topArticles = analyticsData?.top_articles || []
  const topCategories = analyticsData?.top_categories || []
  const hourlyTraffic = analyticsData?.hourly_traffic || []
  const conversionFunnel = analyticsData?.conversion_funnel || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Análise detalhada de desempenho do portal</p>
        </div>
        <div className="flex items-center space-x-3">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                <p className="text-xs text-red-700">{error}</p>
              </div>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing || loading}
            className="btn-outline flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{isRefreshing ? 'Atualizando...' : 'Atualizar'}</span>
          </button>
          <button 
            onClick={() => handleExport('csv')}
            disabled={isExporting || loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>{isExporting ? 'Exportando...' : 'Exportar Relatório'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mr-3" />
          <span className="text-lg text-neutral-600">Carregando dados de analytics...</span>
        </div>
      ) : (
        <>
          {/* Main Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[{
              title: 'Total de Visualizações',
              value: stats.total_views,
              icon: Eye,
              color: 'bg-blue-500',
              change: changes.total_views
            }, {
              title: 'Artigos Publicados',
              value: stats.published_articles,
              icon: BarChart3,
              color: 'bg-green-500',
              change: changes.published_articles
            }, {
              title: 'Leads Captados',
              value: stats.leads_last_30_days,
              icon: Users,
              color: 'bg-secondary-500',
              change: changes.leads_last_30_days
            }, {
              title: 'Média de Views',
              value: stats.avg_views_per_article,
              icon: TrendingUp,
              color: 'bg-primary-600',
              change: changes.avg_views_per_article
            }].map((stat, index) => {
              const isPositive = stat.change.startsWith('+')
              const isNegative = stat.change.startsWith('-')
              const TrendIcon = isNegative ? TrendingDown : TrendingUp
              const changeColor = isNegative 
                ? 'text-red-500' 
                : isPositive 
                ? 'text-green-500' 
                : 'text-neutral-500'

              return (
                <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
                      </p>
                    </div>
                    <div className={`${stat.color} p-3 rounded-lg`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <div className="mt-4 flex items-center">
                    <TrendIcon className={`h-4 w-4 ${changeColor} mr-1`} />
                    <span className={`text-sm font-medium ${changeColor}`}>{stat.change}</span>
                    <span className="text-sm text-gray-500 ml-1">vs período anterior</span>
                  </div>
                </div>
              )
            })}
          </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Tráfego do Portal</h3>
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-3 py-1 border border-neutral-300 rounded-md text-sm"
            >
              <option value="7">Últimos 7 dias</option>
              <option value="30">Últimos 30 dias</option>
              <option value="90">Últimos 90 dias</option>
            </select>
          </div>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500">Gráfico de tráfego será exibido aqui</p>
            </div>
          </div>
        </div>

        {/* Categories Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Performance por Categoria</h3>
          <div className="space-y-4">
            {topCategories.length > 0 ? topCategories.map((category: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-900">{category.name}</span>
                    <span className="text-sm text-neutral-500">{category.views.toLocaleString()} views</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((category.views / Math.max(...topCategories.map((c: any) => c.views))) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{category.articles} artigos</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-4">
                <BarChart3 className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Performance por categoria será exibida com mais artigos</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Articles */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Artigos Mais Lidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Artigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Visualizações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Publicado em
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {topArticles && topArticles.length > 0 ? (
                topArticles.map((article: any, index: number) => (
                  <tr key={article.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900 truncate max-w-xs">
                        {article.title}
                      </div>
                      <div className="text-sm text-neutral-500">
                        Por {article.author_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {article.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-neutral-900">
                        <Eye className="h-4 w-4 text-neutral-400 mr-1" />
                        {(article.views_count || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-neutral-400 mr-1" />
                        {new Date(article.published_at || article.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">
                      Nenhum dado de analytics disponível
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Dados de visualização aparecerão aqui conforme o tráfego cresce.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time-based Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time of Day Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Horários de Maior Tráfego</h3>
          <div className="space-y-3">
            {hourlyTraffic.length > 0 ? hourlyTraffic.map((timeSlot, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-900">{timeSlot.time}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-accent-500 h-2 rounded-full"
                      style={{ width: `${timeSlot.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-600 w-12 text-right">{timeSlot.views}</span>
                </div>
              </div>
            )) : (
              <div className="text-center py-4">
                <Clock className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Dados de horários serão exibidos quando houver tráfego suficiente</p>
              </div>
            )}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Funil de Conversão</h3>
          <div className="space-y-4">
            {conversionFunnel.length > 0 ? conversionFunnel.map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">{stage.stage}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900">{stage.count.toLocaleString()}</span>
                    <span className="text-xs text-neutral-500 ml-2">{stage.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            )) : (
              <div className="text-center py-4">
                <TrendingUp className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Funil de conversão será exibido com mais dados</p>
              </div>
            )}
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  )
}
