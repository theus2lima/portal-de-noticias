"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { fetchJSON } from '@/utils/http'
import { Calendar, Play, CheckCircle2, AlertCircle, ArrowLeft, Eye } from 'lucide-react'

type Source = { id: string; name: string; url: string; type: string; is_active: boolean }

type SummaryItem = { source: string; inserted: number; checked: number; archive_pages: number }

type CollectorResponse = {
  success: boolean
  data: { total_inserted: number; sources: SummaryItem[] }
}

export default function SourcesHistoricalPage() {
  const [sources, setSources] = useState<Source[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [limit, setLimit] = useState(100)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState<CollectorResponse['data'] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetchJSON<{ success: boolean; data: { active_sources: Source[] } }>(
          '/api/news-collector/historical'
        )
        if (res.success) {
          setSources(res.data.active_sources)
          setSelected(res.data.active_sources.map(s => s.id))
        }
        // Datas padrão: último mês
        const end = new Date()
        const start = new Date()
        start.setMonth(start.getMonth() - 1)
        setStartDate(start.toISOString().substring(0, 10))
        setEndDate(end.toISOString().substring(0, 10))
      } catch (e: any) {
        setError(e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const toggleSource = (id: string) => {
    setSelected(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const runHistorical = async () => {
    if (!startDate || !endDate) {
      setError('Selecione o período de coleta')
      return
    }
    setProcessing(true)
    setError(null)
    setResult(null)
    try {
      const payload = {
        startDate: startDate + 'T00:00:00Z',
        endDate: endDate + 'T23:59:59Z',
        sourceIds: selected,
        limitPerSource: limit
      }
      const res = await fetchJSON<CollectorResponse>('/api/news-collector/historical', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      if (res.success) setResult(res.data)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin/curadoria" className="p-2 hover:bg-neutral-100 rounded-md">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Coleta Histórica de Fontes</h1>
          <p className="text-neutral-600 text-sm">Faça scraping das notícias publicadas no período selecionado</p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
      )}

      {loading ? (
        <div className="text-neutral-600">Carregando fontes...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Config */}
          <div className="lg:col-span-2 bg-white border rounded-lg p-6 space-y-4">
            <h2 className="text-lg font-medium mb-2 flex items-center gap-2">
              <Calendar size={18} /> Selecionar Período
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Data Inicial</label>
                <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Data Final</label>
                <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Limite por Fonte</label>
                <select value={limit} onChange={e => setLimit(parseInt(e.target.value))} className="w-full px-3 py-2 border rounded-md">
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={200}>200</option>
                </select>
              </div>
            </div>

            <h2 className="text-lg font-medium mt-6 mb-2">Fontes Ativas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-64 overflow-auto border rounded-md p-2">
              {sources.map(src => (
                <label key={src.id} className="flex items-center gap-2 text-sm p-2 rounded hover:bg-neutral-50">
                  <input type="checkbox" checked={selected.includes(src.id)} onChange={() => toggleSource(src.id)} />
                  <span className="font-medium text-neutral-800">{src.name}</span>
                  <span className="text-neutral-500">({src.type})</span>
                </label>
              ))}
            </div>

            <div className="flex items-center gap-3 mt-4">
              <button onClick={runHistorical} disabled={processing} className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
                <Play size={18} className="mr-2" /> Iniciar Coleta Histórica
              </button>
              
              <Link
                href="/admin/curadoria/fontes-historico/resultados"
                className="inline-flex items-center px-4 py-2 bg-neutral-600 text-white rounded-md hover:bg-neutral-700"
              >
                <Eye size={18} className="mr-2" /> Ver Resultados
              </Link>
            </div>
          </div>

          {/* Resultados */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-medium mb-4">Resultado</h2>
            {!result ? (
              <div className="text-neutral-600 text-sm">Nada processado ainda.</div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-700"><CheckCircle2 size={18} /> Inseridos: {result.total_inserted}</div>
                <div className="space-y-2">
                  {result.sources.map((s, i) => (
                    <div key={i} className="text-sm border rounded p-2">
                      <div className="font-medium">{s.source}</div>
                      <div className="text-neutral-600">Verificadas: {s.checked} • Inseridas: {s.inserted} • Páginas: {s.archive_pages}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

