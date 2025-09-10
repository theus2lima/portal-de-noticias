"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { fetchJSON } from "@/utils/http"
import { Bot, Save } from "lucide-react"

type Setting = { key: string; value: string; description?: string }

export default function CurationSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({
    ai_classification_enabled: "true",
    auto_approve_threshold: "0.85",
    fetch_interval_hours: "1",
    max_articles_per_fetch: "50",
    openai_model: "gpt-3.5-turbo"
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchJSON<{ success: boolean; data: Setting[] }>("/api/admin/settings?scope=curation")
        if (res.success) {
          const map: Record<string, string> = {}
          res.data.forEach(s => { map[s.key] = s.value })
          setSettings(prev => ({ ...prev, ...map }))
        }
      } catch {}
    }
    load()
  }, [])

  const save = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await fetchJSON("/api/admin/settings", {
        method: "PUT",
        body: JSON.stringify({ settings })
      })
      setMessage("Configurações salvas com sucesso")
    } catch (e: any) {
      setMessage(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-neutral-900">Configurações de Curadoria</h1>
        <Link href="/admin/curadoria" className="px-3 py-1.5 text-sm text-neutral-700 border rounded-md hover:bg-neutral-50">← Voltar</Link>
      </div>

      {message && (
        <div className="px-4 py-3 border rounded-md">{message}</div>
      )}

      <div className="bg-white border rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Habilitar Classificação por IA</label>
            <select
              value={settings.ai_classification_enabled}
              onChange={(e) => setSettings(prev => ({ ...prev, ai_classification_enabled: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            >
              <option value="true">Ativado</option>
              <option value="false">Desativado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Limiar de Aprovação Automática</label>
            <input
              type="number" step="0.01" min="0" max="1"
              value={settings.auto_approve_threshold}
              onChange={(e) => setSettings(prev => ({ ...prev, auto_approve_threshold: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Intervalo de Coleta (horas)</label>
            <input
              type="number" min="1" max="24"
              value={settings.fetch_interval_hours}
              onChange={(e) => setSettings(prev => ({ ...prev, fetch_interval_hours: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Máximo por Coleta</label>
            <input
              type="number" min="1" max="100"
              value={settings.max_articles_per_fetch}
              onChange={(e) => setSettings(prev => ({ ...prev, max_articles_per_fetch: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">Modelo OpenAI</label>
            <input
              type="text"
              value={settings.openai_model}
              onChange={(e) => setSettings(prev => ({ ...prev, openai_model: e.target.value }))}
              className="w-full px-3 py-2 border rounded-md"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={save} disabled={saving} className="inline-flex items-center px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50">
            <Save size={16} className="mr-1" /> Salvar Configurações
          </button>
          <button
            onClick={async () => {
              await fetchJSON("/api/ai-classifier", { method: "POST", body: JSON.stringify({ batchSize: 10 }) })
              setMessage("Classificação automática iniciada")
            }}
            className="inline-flex items-center px-3 py-2 text-sm bg-neutral-800 text-white rounded-md hover:bg-neutral-900"
          >
            <Bot size={16} className="mr-1" /> Rodar Classificação (IA)
          </button>
        </div>
      </div>
    </div>
  )
}

