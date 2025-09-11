'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Share, 
  TrendingUp, 
  TrendingDown,
  Eye,
  BarChart3,
  Calendar,
  Download,
  RefreshCw,
  Loader2,
  AlertCircle,
  MessageCircle,
  Instagram,
  Hash,
  ExternalLink
} from 'lucide-react'

interface ShareData {
  totalShares: number
  sharesByPlatform: {
    whatsapp: number
    x: number
    threads: number
    instagram: number
    facebook?: number
    twitter?: number
  }
  last7Days: Array<{
    date: string
    shares: number
    label: string
  }>
  topArticles: Array<{
    id: string
    title: string
    shares: number
  }>
  period: number
}

// Ícones customizados para as redes sociais
const WhatsAppIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.894 3.690" />
  </svg>
)

const XIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const ThreadsIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.542-1.94-1.548-3.456-2.987-4.51C16.123 2.856 14.226 2.32 12.199 2.306h-.01c-2.777.014-4.673.55-5.64 1.595-.906 1.004-1.567 2.394-1.589 4.108v.017c.022 1.717.683 3.104 1.589 4.108.967 1.044 2.863 1.58 5.64 1.595h.01c1.692-.01 3.096-.4 4.026-1.086.675-.498 1.183-1.183 1.462-2.025-.578-.468-1.27-.785-2.064-.929-.526.168-1.111.252-1.735.252-2.135 0-3.654-1.379-3.654-3.317 0-1.938 1.519-3.317 3.654-3.317.648 0 1.235.176 1.735.504.26.17.484.375.672.608.24.299.425.638.544.997.13.395.198.815.198 1.208 0 2.979-1.993 5.113-4.666 5.113-.914 0-1.681-.363-2.225-1.051-.47-.594-.728-1.381-.728-2.22 0-1.19.537-2.08 1.295-2.635.758-.555 1.759-.834 2.917-.834.648 0 1.297.123 1.888.35.592.228 1.117.543 1.529.915.516.467.912 1.048 1.161 1.698.249.65.374 1.36.374 2.085 0 1.45-.318 2.72-.937 3.748-.62 1.028-1.524 1.816-2.668 2.324-1.144.508-2.53.762-4.098.762zM10.065 11.711c0 .619.275 1.186.768 1.556.493.37 1.166.555 1.847.555 1.319 0 2.403-.485 3.147-1.406.743-.92 1.128-2.186 1.128-3.718 0-.619-.123-1.205-.356-1.718-.233-.513-.575-.951-1.009-1.288-.434-.337-.963-.506-1.557-.506-1.319 0-2.403.485-3.147 1.406C10.443 8.512 10.065 9.9 10.065 11.711z"/>
  </svg>
)

const InstagramIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export default function ShareInsightsPage() {
  const [shareData, setShareData] = useState<ShareData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [period, setPeriod] = useState('30')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  const fetchShareData = useCallback(async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      setError(null)
      
      const response = await fetch(`/api/analytics/shares?period=${period}`)
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de compartilhamentos')
      }
      
      const data = await response.json()
      setShareData(data.data)
    } catch (err) {
      console.error('Erro ao carregar insights de compartilhamento:', err)
      setError('Erro ao carregar dados de compartilhamentos')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }, [period])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchShareData(false)
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      const response = await fetch(`/api/analytics/shares/export?period=${period}`)
      
      if (!response.ok) {
        throw new Error('Erro ao exportar relatório')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `relatorio-compartilhamentos-${new Date().toISOString().split('T')[0]}.csv`
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
    fetchShareData()
  }, [period, fetchShareData])

  const platformIcons = {
    whatsapp: WhatsAppIcon,
    x: XIcon,
    threads: ThreadsIcon,
    instagram: InstagramIcon,
  }

  const platformColors = {
    whatsapp: { bg: 'bg-green-100', text: 'text-green-800', accent: 'bg-green-500' },
    x: { bg: 'bg-gray-100', text: 'text-gray-800', accent: 'bg-gray-900' },
    threads: { bg: 'bg-gray-100', text: 'text-gray-800', accent: 'bg-gray-800' },
    instagram: { bg: 'bg-pink-100', text: 'text-pink-800', accent: 'bg-pink-500' },
  }

  const platformNames = {
    whatsapp: 'WhatsApp',
    x: 'X (Twitter)',
    threads: 'Threads',
    instagram: 'Instagram',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Share className="mr-3" />
            Insights de Compartilhamentos
          </h1>
          <p className="text-gray-600">Análise detalhada de compartilhamentos por plataforma</p>
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
            onClick={handleExport}
            disabled={isExporting || loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {isExporting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Download className="h-5 w-5" />
            )}
            <span>{isExporting ? 'Exportando...' : 'Exportar'}</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mr-3" />
          <span className="text-lg text-neutral-600">Carregando dados de compartilhamentos...</span>
        </div>
      ) : (
        <>
          {/* Total Shares Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Total de Compartilhamentos</h3>
                <p className="text-3xl font-bold text-primary-600 mt-2">
                  {shareData?.totalShares?.toLocaleString() || 0}
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Últimos {shareData?.period || 30} dias
                </p>
              </div>
              <div className="bg-primary-100 p-3 rounded-lg">
                <Share className="h-8 w-8 text-primary-600" />
              </div>
            </div>
          </div>

          {/* Platform Breakdown */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Compartilhamentos por Plataforma</h3>
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(shareData?.sharesByPlatform || {}).map(([platform, count]) => {
                const IconComponent = platformIcons[platform as keyof typeof platformIcons]
                const colors = platformColors[platform as keyof typeof platformColors]
                const name = platformNames[platform as keyof typeof platformNames]
                
                if (!IconComponent || !colors || !name) return null

                const percentage = shareData?.totalShares ? (count / shareData.totalShares * 100).toFixed(1) : '0.0'

                return (
                  <div key={platform} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${colors.bg}`}>
                        <IconComponent size={20} />
                      </div>
                      <span className="text-2xl font-bold text-gray-900">{count}</span>
                    </div>
                    <h4 className="font-medium text-gray-900">{name}</h4>
                    <div className="flex items-center justify-between mt-2">
                      <span className={`text-sm font-medium ${colors.text}`}>{percentage}%</span>
                      <div className="flex-1 mx-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${colors.accent}`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Shares Over Time */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Evolução dos Compartilhamentos</h3>
              <div className="space-y-4">
                {shareData?.last7Days?.length ? shareData.last7Days.map((day, index) => (
                  <div key={day.date} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-primary-500 rounded-full"></div>
                      <span className="text-sm font-medium text-gray-900">{day.label}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ 
                            width: `${shareData?.last7Days && shareData.last7Days.length > 0 ? (day.shares / Math.max(...shareData.last7Days.map(d => d.shares), 1)) * 100 : 0}%` 
                          }}
                        />
                      </div>
                      <span className="text-sm text-gray-600 w-8 text-right">{day.shares}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <BarChart3 className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Não há dados suficientes para exibir o gráfico</p>
                  </div>
                )}
              </div>
            </div>

            {/* Top Shared Articles */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Artigos Mais Compartilhados</h3>
              <div className="space-y-4">
                {shareData?.topArticles?.length ? shareData.topArticles.slice(0, 5).map((article, index) => (
                  <div key={article.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                          {article.title}
                        </h4>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Share className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-bold text-gray-900">{article.shares}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-8">
                    <Share className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Nenhum artigo foi compartilhado ainda</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Performance Insights */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Insights de Performance</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <h4 className="font-semibold text-green-800">Plataforma Líder</h4>
                <p className="text-sm text-green-600">
                  {shareData?.sharesByPlatform && Object.keys(shareData.sharesByPlatform).length > 0 ? 
                    platformNames[Object.keys(shareData.sharesByPlatform).reduce((a, b) => 
                      (shareData.sharesByPlatform as any)[a] > (shareData.sharesByPlatform as any)[b] ? a : b
                    ) as keyof typeof platformNames] || 'N/A'
                    : 'N/A'
                  }
                </p>
              </div>

              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <h4 className="font-semibold text-blue-800">Média Diária</h4>
                <p className="text-sm text-blue-600">
                  {shareData?.totalShares && shareData?.period ? 
                    Math.round(shareData.totalShares / shareData.period) : 0
                  } compartilhamentos/dia
                </p>
              </div>

              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Eye className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <h4 className="font-semibold text-purple-800">Engajamento</h4>
                <p className="text-sm text-purple-600">
                  {shareData?.totalShares ? 
                    shareData.totalShares > 100 ? 'Alto' :
                    shareData.totalShares > 50 ? 'Médio' : 'Baixo'
                    : 'Baixo'
                  }
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
