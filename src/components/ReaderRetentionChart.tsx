'use client'

import { useState, useEffect } from 'react'
import { BookOpen, RefreshCw, TrendingUp, Users, Clock, Loader2, AlertCircle } from 'lucide-react'

interface RetentionData {
  period: string
  percentage: number
  readers: number
  description: string
}

interface ReaderRetentionData {
  reader_retention: RetentionData[]
  total_unique_readers: number
  returning_readers: number
  avg_reading_time: number
  completion_rate: number
  period_days: number
  last_updated: string
  database_connected: boolean
  has_data: boolean
  error?: string
}

const ReaderRetentionChart = () => {
  const [data, setData] = useState<ReaderRetentionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchRetentionData = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics/retention', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Erro ao carregar dados de retenção')
      }
      
      const retentionData = await response.json()
      setData(retentionData)
    } catch (err) {
      console.error('Erro ao carregar dados de retenção:', err)
      setError('Erro ao carregar dados de retenção')
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchRetentionData(false)
  }

  useEffect(() => {
    fetchRetentionData()
  }, [])

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500 mr-3" />
          <span className="text-lg text-gray-600">Carregando dados de retenção...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12 text-center">
          <div>
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Erro ao Carregar Dados</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button 
              onClick={() => fetchRetentionData()}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </button>
          </div>
        </div>
      </div>
    )
  }

  const retentionData = data?.reader_retention || []
  const maxPercentage = Math.max(...retentionData.map(r => r.percentage), 1)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <BookOpen className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Retenção de Leitores</h3>
            <p className="text-sm text-gray-600">
              {data?.has_data ? 
                `Baseado em ${data.total_unique_readers} leitores únicos` : 
                'Dados simulados - aguardando tráfego real'
              }
            </p>
          </div>
        </div>
        
        <button 
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          {isRefreshing ? 'Atualizando...' : 'Atualizar'}
        </button>
      </div>

      {/* Retention Chart */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {retentionData.map((retention, index) => {
          // Calculate bar height with minimum visibility
          const barHeight = Math.max((retention.percentage / maxPercentage) * 100, 8)
          
          // Color scheme matching the original design
          const getBarColor = (index: number) => {
            const colors = [
              'from-blue-500 to-blue-400',     // 1 dia
              'from-blue-500 to-blue-400',     // 7 dias  
              'from-blue-500 to-blue-400',     // 30 dias
              'from-blue-600 to-blue-500',     // Tempo médio
              'from-blue-500 to-blue-400'      // Taxa de conclusão
            ]
            return colors[index] || 'from-blue-500 to-blue-400'
          }

          return (
            <div key={index} className="text-center">
              {/* Bar Chart */}
              <div className="mb-4">
                <div className="h-32 flex items-end justify-center mb-2">
                  <div 
                    className={`w-12 bg-gradient-to-t ${getBarColor(index)} rounded-t-md transition-all duration-500 hover:scale-105 cursor-pointer relative group`}
                    style={{ height: `${barHeight}%`, minHeight: '8px' }}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                      <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                        <div className="font-medium">{retention.period}</div>
                        <div>{retention.percentage}%</div>
                        <div>{retention.readers.toLocaleString()} leitores</div>
                      </div>
                      <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
                    </div>
                  </div>
                </div>
                
                {/* Percentage */}
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {retention.percentage}%
                </div>
              </div>
              
              {/* Labels */}
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">{retention.period}</p>
                <p className="text-xs text-gray-500">{retention.description}</p>
                <p className="text-xs text-blue-600 font-medium">
                  {retention.readers.toLocaleString()} leitores
                </p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Leitores Únicos</p>
              <p className="text-xl font-bold text-blue-600">
                {data?.total_unique_readers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Leitores Recorrentes</p>
              <p className="text-xl font-bold text-green-600">
                {data?.returning_readers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-purple-900">Tempo Médio</p>
              <p className="text-xl font-bold text-purple-600">
                {data?.avg_reading_time}min
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs text-gray-500 space-y-2 sm:space-y-0">
          <div className="flex items-center space-x-4">
            <span>Taxa de retenção baseada nos últimos {data?.period_days || 30} dias</span>
            <div className="flex items-center">
              <div className={`w-2 h-2 rounded-full mr-1 ${data?.database_connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span>{data?.database_connected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          <span>
            Atualizado em: {data?.last_updated ? 
              new Date(data.last_updated).toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit', 
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              }) : 'N/A'
            }
          </span>
        </div>
      </div>
    </div>
  )
}

export default ReaderRetentionChart
