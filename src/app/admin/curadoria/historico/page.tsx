"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchJSON } from "@/utils/http"
import { Calendar, Clock, Zap, TrendingUp, Filter, ArrowLeft, Play } from "lucide-react"

type Category = {
  id: string
  name: string
  color?: string
}

type HistoricalStats = {
  period: {
    months: number
    start_date: string
    end_date: string
  }
  total_articles: number
  articles_by_month: Array<{ month: string; count: number }>
  available_categories: Category[]
}

export default function HistoricalCurationPage() {
  const [stats, setStats] = useState<HistoricalStats | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    categoryId: '',
    reprocessType: 'reclassify',
    limit: 50
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, categoriesRes] = await Promise.all([
        fetchJSON<{ success: boolean; data: HistoricalStats }>('/api/curation/historical?months=12'),
        fetchJSON<{ success: boolean; data: Category[] }>('/api/categories')
      ])

      if (statsRes.success) {
        setStats(statsRes.data)
        // Configurar datas padrão (último mês)
        const endDate = new Date()
        const startDate = new Date()
        startDate.setMonth(startDate.getMonth() - 1)
        
        setFormData(prev => ({
          ...prev,
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }))
      }

      if (categoriesRes.success) {
        setCategories(categoriesRes.data)
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProcess = async () => {
    if (!formData.startDate || !formData.endDate) {
      setError('Selecione o período para coleta')
      return
    }

    setProcessing(true)
    setError(null)
    setResult(null)

    try {
      const payload = {
        startDate: formData.startDate + 'T00:00:00Z',
        endDate: formData.endDate + 'T23:59:59Z',
        categoryId: formData.categoryId || null,
        reprocessType: formData.reprocessType,
        limit: formData.limit
      }

      const res = await fetchJSON<{ success: boolean; data: any }>('/api/curation/historical', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      setResult(res.data)
      
      if (res.success && res.data.processed > 0) {
        // Aguardar um pouco e executar classificação IA automaticamente
        setTimeout(async () => {
          try {
            await fetchJSON('/api/ai-classifier', {
              method: 'POST',
              body: JSON.stringify({ batchSize: res.data.processed })
            })
          } catch (e) {
            console.error('Erro na classificação automática:', e)
          }
        }, 2000)
      }

    } catch (e: any) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  const getPeriodPresets = () => {
    const today = new Date()
    const presets = [
      {
        label: 'Última Semana',
        start: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
        end: today
      },
      {
        label: 'Último Mês',
        start: new Date(today.getFullYear(), today.getMonth() - 1, today.getDate()),
        end: today
      },
      {
        label: 'Últimos 3 Meses',
        start: new Date(today.getFullYear(), today.getMonth() - 3, today.getDate()),
        end: today
      },
      {
        label: 'Últimos 6 Meses',
        start: new Date(today.getFullYear(), today.getMonth() - 6, today.getDate()),
        end: today
      },
      {
        label: 'Último Ano',
        start: new Date(today.getFullYear() - 1, today.getMonth(), today.getDate()),
        end: today
      }
    ]

    return presets.map(preset => ({
      ...preset,
      start: preset.start.toISOString().split('T')[0],
      end: preset.end.toISOString().split('T')[0]
    }))
  }

  const applyPreset = (startDate: string, endDate: string) => {
    setFormData(prev => ({ ...prev, startDate, endDate }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/curadoria" className="p-2 hover:bg-neutral-100 rounded-md">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-semibold text-neutral-900">Coleta Histórica</h1>
            <p className="text-neutral-600 text-sm">Reprocessar artigos já publicados no portal</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-neutral-600">Carregando estatísticas...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estatísticas */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <TrendingUp size={20} />
              Estatísticas
            </h2>
            
            <div className="space-y-4">
              <div className="bg-primary-50 p-4 rounded-md">
                <div className="text-2xl font-bold text-primary-700">
                  {stats?.total_articles || 0}
                </div>
                <div className="text-sm text-primary-600">
                  Artigos Publicados (12 meses)
                </div>
              </div>

              <div className="bg-secondary-50 p-4 rounded-md">
                <div className="text-2xl font-bold text-secondary-700">
                  {categories.length}
                </div>
                <div className="text-sm text-secondary-600">
                  Categorias Disponíveis
                </div>
              </div>
            </div>
          </div>

          {/* Formulário de Coleta */}
          <div className="lg:col-span-2 bg-white border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Calendar size={20} />
              Configurar Coleta Histórica
            </h2>

            <div className="space-y-6">
              {/* Presets de Período */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Períodos Rápidos
                </label>
                <div className="flex flex-wrap gap-2">
                  {getPeriodPresets().map(preset => (
                    <button
                      key={preset.label}
                      onClick={() => applyPreset(preset.start, preset.end)}
                      className="px-3 py-1.5 text-xs bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-md transition-colors"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Seleção de Data */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Data Inicial
                  </label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Data Final
                  </label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

              {/* Filtros */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Categoria (Opcional)
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Todas as categorias</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                    Tipo de Reprocessamento
                  </label>
                  <select
                    value={formData.reprocessType}
                    onChange={(e) => setFormData(prev => ({ ...prev, reprocessType: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="reclassify">Reclassificar Categoria</option>
                    <option value="improve">Melhorar Conteúdo</option>
                    <option value="redistribute">Redistribuir</option>
                  </select>
                </div>
              </div>

              {/* Limite */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Limite de Artigos
                </label>
                <select
                  value={formData.limit}
                  onChange={(e) => setFormData(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value={10}>10 artigos</option>
                  <option value={25}>25 artigos</option>
                  <option value={50}>50 artigos</option>
                  <option value={100}>100 artigos</option>
                </select>
              </div>

              {/* Botão de Execução */}
              <button
                onClick={handleProcess}
                disabled={processing || !formData.startDate || !formData.endDate}
                className="w-full inline-flex items-center justify-center px-4 py-3 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {processing ? (
                  <>
                    <Clock className="animate-spin mr-2" size={18} />
                    Processando...
                  </>
                ) : (
                  <>
                    <Play size={18} className="mr-2" />
                    Iniciar Coleta Histórica
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resultado */}
      {result && (
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Zap size={20} />
            Resultado da Coleta
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="bg-blue-50 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-blue-700">{result.total_found}</div>
              <div className="text-sm text-blue-600">Encontrados</div>
            </div>
            <div className="bg-green-50 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-green-700">{result.processed}</div>
              <div className="text-sm text-green-600">Processados</div>
            </div>
            <div className="bg-red-50 p-4 rounded-md text-center">
              <div className="text-2xl font-bold text-red-700">{result.errors}</div>
              <div className="text-sm text-red-600">Erros</div>
            </div>
            <div className="bg-primary-50 p-4 rounded-md text-center">
              <div className="text-sm font-medium text-primary-700">{result.reprocess_type}</div>
              <div className="text-sm text-primary-600">Tipo</div>
            </div>
          </div>

          {result.processed > 0 && (
            <div className="bg-green-50 border border-green-200 p-4 rounded-md">
              <div className="font-medium text-green-800 mb-2">✅ Coleta Concluída!</div>
              <div className="text-sm text-green-700">
                {result.processed} artigos foram adicionados à curadoria e estão sendo classificados pela IA.
                <br />
                Vá para <Link href="/admin/curadoria" className="font-medium underline">Dashboard de Curadoria</Link> para revisar.
              </div>
            </div>
          )}

          {result.results && result.results.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium text-neutral-900 mb-2">Primeiros Resultados:</h3>
              <div className="space-y-2">
                {result.results.slice(0, 5).map((item: any, index: number) => (
                  <div key={index} className={`flex items-center justify-between p-2 rounded text-sm ${
                    item.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    <span className="truncate">{item.title}</span>
                    <span className="text-xs">
                      {item.success ? '✅ OK' : '❌ Erro'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
