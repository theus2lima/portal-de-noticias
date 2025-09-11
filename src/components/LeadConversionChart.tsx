'use client'

import { useState, useEffect, useMemo } from 'react'
import { 
  BarChart3, 
  Calendar, 
  TrendingUp, 
  Users,
  ChevronDown 
} from 'lucide-react'
import { Lead, LeadsStorage } from '@/utils/localStorage'

interface LeadConversionChartProps {
  leads: Lead[]
}

interface ChartData {
  date: string
  dateFormatted: string
  count: number
  contacted: number
  pending: number
}

const LeadConversionChart = ({ leads }: LeadConversionChartProps) => {
  const [period, setPeriod] = useState('7') // 7, 15, 30 dias
  const [mounted, setMounted] = useState(false)
  const [allLeads, setAllLeads] = useState<Lead[]>([])

  useEffect(() => {
    setMounted(true)
    
    // Combinar leads passados como props com leads do localStorage
    const localStorageLeads = LeadsStorage.getLeads()
    
    // Remover duplicatas baseado no telefone
    const combined = [...leads]
    
    localStorageLeads.forEach(localLead => {
      const exists = leads.some(lead => 
        lead.phone === localLead.phone || 
        (lead.email && localLead.email && lead.email === localLead.email)
      )
      if (!exists) {
        combined.push(localLead)
      }
    })
    
    setAllLeads(combined)
  }, [leads])

  // Processar dados para o gráfico
  const chartData = useMemo(() => {
    if (!mounted || allLeads.length === 0) return []

    const days = parseInt(period)
    const data: ChartData[] = []
    
    // Gerar array de datas dos últimos X dias
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)
      
      const dateStr = date.toISOString().split('T')[0]
      const dateFormatted = date.toLocaleDateString('pt-BR', { 
        day: '2-digit', 
        month: '2-digit' 
      })
      
      // Contar leads criados neste dia
      const dayLeads = allLeads.filter(lead => {
        const leadDate = new Date(lead.created_at)
        leadDate.setHours(0, 0, 0, 0)
        return leadDate.toISOString().split('T')[0] === dateStr
      })
      
      const contacted = dayLeads.filter(lead => lead.is_contacted).length
      const pending = dayLeads.length - contacted
      
      data.push({
        date: dateStr,
        dateFormatted,
        count: dayLeads.length,
        contacted,
        pending
      })
    }
    
    return data
  }, [allLeads, period, mounted])

  // Calcular estatísticas
  const totalLeads = allLeads.length
  const totalInPeriod = chartData.reduce((sum, day) => sum + day.count, 0)
  const totalContactedInPeriod = chartData.reduce((sum, day) => sum + day.contacted, 0)
  const avgLeadsPerDay = totalInPeriod / parseInt(period)
  const conversionRate = totalInPeriod > 0 ? (totalContactedInPeriod / totalInPeriod) * 100 : 0

  // Calcular altura máxima das barras
  const maxCount = Math.max(...chartData.map(d => d.count), 1)

  if (!mounted) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center mb-4 sm:mb-0">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <BarChart3 className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Conversão de Leads</h3>
            <p className="text-sm text-gray-600">Leads capturados nos últimos {period} dias</p>
          </div>
        </div>
        
        <div className="relative">
          <select 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="7">Últimos 7 dias</option>
            <option value="15">Últimos 15 dias</option>
            <option value="30">Últimos 30 dias</option>
          </select>
          <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-900">Total no Período</p>
              <p className="text-xl font-bold text-blue-600">{totalInPeriod}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-900">Taxa de Conversão</p>
              <p className="text-xl font-bold text-green-600">{conversionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-purple-900">Média por Dia</p>
              <p className="text-xl font-bold text-purple-600">{avgLeadsPerDay.toFixed(1)}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-orange-50 rounded-lg p-4">
          <div className="flex items-center">
            <BarChart3 className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-900">Total Geral</p>
              <p className="text-xl font-bold text-orange-600">{totalLeads}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="bg-gray-50 rounded-lg p-6">
        {chartData.length > 0 && totalInPeriod > 0 ? (
          <div className="space-y-4">
            {/* Chart Legend */}
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                <span className="text-gray-600">Total de Leads</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                <span className="text-gray-600">Contatados</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-orange-500 rounded mr-2"></div>
                <span className="text-gray-600">Pendentes</span>
              </div>
            </div>
            
            {/* Chart Bars */}
            <div className="flex items-end justify-between space-x-1 h-48">
              {chartData.map((day, index) => (
                <div key={day.date} className="flex-1 flex flex-col items-center">
                  <div className="flex flex-col items-center space-y-1 w-full">
                    {/* Bars */}
                    <div className="relative w-full flex flex-col items-center">
                      {/* Total bar (background) */}
                      <div 
                        className="w-full bg-blue-500 rounded-t-md relative group cursor-pointer transition-all duration-200 hover:bg-blue-600"
                        style={{ 
                          height: `${day.count > 0 ? Math.max((day.count / maxCount) * 160, 8) : 4}px`,
                          minHeight: '4px'
                        }}
                      >
                        {/* Contacted portion (green overlay) */}
                        {day.contacted > 0 && (
                          <div 
                            className="absolute bottom-0 left-0 w-full bg-green-500 rounded-t-md transition-all duration-200 group-hover:bg-green-600"
                            style={{ 
                              height: `${(day.contacted / day.count) * 100}%`
                            }}
                          />
                        )}
                        
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                          <div className="bg-gray-800 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                            <div>{day.dateFormatted}</div>
                            <div>Total: {day.count}</div>
                            <div>Contatados: {day.contacted}</div>
                            <div>Pendentes: {day.pending}</div>
                          </div>
                          <div className="w-2 h-2 bg-gray-800 transform rotate-45 absolute top-full left-1/2 -translate-x-1/2 -mt-1"></div>
                        </div>
                      </div>
                      
                      {/* Count label */}
                      {day.count > 0 && (
                        <div className="text-xs font-semibold text-gray-700 mt-1">
                          {day.count}
                        </div>
                      )}
                    </div>
                    
                    {/* Date label */}
                    <div className="text-xs text-gray-500 transform -rotate-45 origin-center mt-2">
                      {day.dateFormatted}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum lead encontrado
            </h3>
            <p className="text-gray-500 max-w-sm">
              {totalLeads === 0 
                ? 'Ainda não há leads capturados. Os dados aparecerão aqui conforme novos leads forem cadastrados.'
                : `Nenhum lead foi capturado nos últimos ${period} dias. Tente selecionar um período maior ou cadastre novos leads.`
              }
            </p>
            {totalLeads === 0 && (
              <div className="mt-4">
                <button 
                  onClick={() => window.open('/', '_blank')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Ir para formulário de leads
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 text-xs text-gray-500 text-center">
        <p>
          Dados atualizados em tempo real • 
          Leads incluem dados do localStorage e base de dados • 
          Estatísticas baseadas na data de criação dos leads
        </p>
      </div>
    </div>
  )
}

export default LeadConversionChart
