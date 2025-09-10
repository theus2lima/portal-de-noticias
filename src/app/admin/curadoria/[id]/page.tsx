"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { fetchJSON } from "@/utils/http"
import { CurationItem } from "@/types/curation"
import { ArrowLeft, ExternalLink, Save, Send, ThumbsDown, Check, Edit3, Eye, Copy, Maximize2, FileText, Clock, User } from "lucide-react"

type Category = {
  id: string
  name: string
  color?: string
}

export default function CurationReviewPage() {
  const params = useParams()
  const router = useRouter()
  const [item, setItem] = useState<CurationItem | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [expandedContent, setExpandedContent] = useState(false)
  const [copySuccess, setCopySuccess] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    summary: "",
    content: "",
    categoryId: "",
    notes: ""
  })

  const fetchData = async () => {
    setLoading(true)
    try {
      const [curationRes, categoriesRes] = await Promise.all([
        fetchJSON<{ success: boolean; data: CurationItem }>(`/api/curation/${params.id}`),
        fetchJSON<{ success: boolean; data: Category[] }>(`/api/categories`)
      ])

      if (curationRes.success && curationRes.data) {
        const foundItem = curationRes.data
        setItem(foundItem)
        setFormData({
          title: foundItem.scraped_news.title,
          summary: foundItem.scraped_news.summary || "",
          content: foundItem.scraped_news.content || "",
          categoryId: foundItem.suggested_category?.id || foundItem.manual_category?.id || "",
          notes: foundItem.curator_notes || ""
        })
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

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id])

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopySuccess(`${type} copiado!`)
      setTimeout(() => setCopySuccess(null), 2000)
    } catch (error) {
      console.error('Erro ao copiar:', error)
    }
  }

  const copyOriginalToForm = () => {
    if (!item) return
    setFormData({
      title: item.scraped_news.title,
      summary: item.scraped_news.summary || "",
      content: item.scraped_news.content || "",
      categoryId: item.suggested_category?.id || item.manual_category?.id || "",
      notes: formData.notes // Manter as notas atuais
    })
    setCopySuccess("Conteúdo original copiado para edição!")
    setTimeout(() => setCopySuccess(null), 3000)
  }

  const handleAction = async (action: "approve" | "reject" | "edit" | "publish") => {
    if (!item) return

    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      let data = {}
      
      switch (action) {
        case "approve":
          data = {
            categoryId: formData.categoryId,
            notes: formData.notes
          }
          break
        case "reject":
          data = {
            reason: formData.notes || "Rejeitado pelo curador"
          }
          break
        case "edit":
          data = {
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
            categoryId: formData.categoryId,
            notes: formData.notes
          }
          break
        case "publish":
          data = {
            title: formData.title,
            summary: formData.summary,
            content: formData.content,
            categoryId: formData.categoryId
          }
          break
      }

      const res = await fetchJSON<{ success: boolean; message: string }>(`/api/curation/${item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          action,
          data
        })
      })

      if (res.success) {
        setSuccess(res.message)
        if (action === "approve" || action === "reject" || action === "publish") {
          setTimeout(() => {
            router.push("/admin/curadoria")
          }, 2000)
        }
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-neutral-600">Carregando...</div>
      </div>
    )
  }

  if (!item) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Notícia não encontrada</div>
        <Link href="/admin/curadoria" className="text-primary-600 hover:underline">
          ← Voltar para curadoria
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/curadoria" className="p-2 hover:bg-neutral-100 rounded-md">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-semibold text-neutral-900">Revisar Notícia</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 text-sm rounded-full ${
            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
            item.status === 'approved' ? 'bg-green-100 text-green-800' :
            item.status === 'rejected' ? 'bg-red-100 text-red-800' :
            item.status === 'published' ? 'bg-blue-100 text-blue-800' :
            'bg-neutral-100 text-neutral-800'
          }`}>
            {item.status === 'pending' ? 'Pendente' :
             item.status === 'approved' ? 'Aprovada' :
             item.status === 'rejected' ? 'Rejeitada' :
             item.status === 'published' ? 'Publicada' :
             'Em Edição'}
          </span>
          
          {item.ai_confidence && (
            <span className="px-3 py-1 text-sm bg-primary-100 text-primary-800 rounded-full">
              IA {Math.round(item.ai_confidence * 100)}%
            </span>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {success}
        </div>
      )}

      {copySuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {copySuccess}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Original Content */}
        <div className="bg-white border rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium flex items-center gap-2">
              <Eye size={20} />
              Conteúdo Original
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={copyOriginalToForm}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-md transition-colors"
              >
                <Copy size={14} />
                Copiar Tudo
              </button>
              <button
                onClick={() => setExpandedContent(!expandedContent)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors"
              >
                <Maximize2 size={14} />
                {expandedContent ? 'Reduzir' : 'Expandir'}
              </button>
            </div>
          </div>
          
          <div className="space-y-4">
            {/* Metadados da Fonte */}
            <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-neutral-900">{item.scraped_news.news_sources.name}</div>
                  <div className="text-sm text-neutral-600 flex items-center gap-2">
                    <Clock size={14} />
                    Coletado em: {new Date(item.scraped_news.published_at || item.created_at).toLocaleString('pt-BR')}
                  </div>
                </div>
                <a 
                  href={item.scraped_news.original_url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-700 bg-primary-100 hover:bg-primary-200 rounded-md transition-colors"
                >
                  <ExternalLink size={14} />
                  Ver Original
                </a>
              </div>

              {item.scraped_news.image_url && (
                <div className="border-t pt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={item.scraped_news.image_url} 
                    alt="Imagem da notícia" 
                    className="w-full max-w-sm h-32 object-cover rounded-md mx-auto"
                  />
                </div>
              )}
            </div>

            {/* Título Original */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">Título Original</label>
                <button
                  onClick={() => copyToClipboard(item.scraped_news.title, 'Título')}
                  className="text-xs text-neutral-500 hover:text-primary-600 flex items-center gap-1"
                >
                  <Copy size={12} /> Copiar
                </button>
              </div>
              <div className="p-3 bg-neutral-50 rounded-md text-sm font-medium">
                {item.scraped_news.title}
              </div>
            </div>

            {/* Resumo Original */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">Resumo Original</label>
                {item.scraped_news.summary && item.scraped_news.summary.trim() && (
                  <button
                    onClick={() => copyToClipboard(item.scraped_news.summary!, 'Resumo')}
                    className="text-xs text-neutral-500 hover:text-primary-600 flex items-center gap-1"
                  >
                    <Copy size={12} /> Copiar
                  </button>
                )}
              </div>
              <div className="p-3 bg-neutral-50 rounded-md text-sm">
                {item.scraped_news.summary && item.scraped_news.summary.trim() ? (
                  item.scraped_news.summary
                ) : (
                  <div className="text-neutral-500 italic space-y-2">
                    <div>Resumo não extraído automaticamente</div>
                    <div className="text-xs">
                      <span className="font-medium">Sugestão:</span> Visite o link original e crie um resumo manual no campo de edição
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Conteúdo Original */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">Conteúdo Original</label>
                {item.scraped_news.content && item.scraped_news.content.trim() && (
                  <button
                    onClick={() => copyToClipboard(item.scraped_news.content!, 'Conteúdo')}
                    className="text-xs text-neutral-500 hover:text-primary-600 flex items-center gap-1"
                  >
                    <Copy size={12} /> Copiar
                  </button>
                )}
              </div>
              <div className={`p-3 bg-neutral-50 rounded-md text-sm ${
                expandedContent ? 'max-h-none' : 'max-h-40'
              } overflow-y-auto`}>
                {item.scraped_news.content && item.scraped_news.content.trim() ? (
                  <div className="whitespace-pre-wrap">
                    {item.scraped_news.content}
                  </div>
                ) : (
                  <div className="text-neutral-500 italic space-y-2">
                    <div>Conteúdo não extraído automaticamente</div>
                    <div className="text-xs">
                      <span className="font-medium">Ações recomendadas:</span>
                      <ol className="list-decimal list-inside mt-1 space-y-1">
                        <li>Visite o link original para ver o conteúdo completo</li>
                        <li>Copie e cole o conteúdo manualmente no campo de edição</li>
                        <li>Ou rejeite esta notícia se não for possível obter o conteúdo</li>
                      </ol>
                    </div>
                  </div>
                )}
              </div>
              {!expandedContent && item.scraped_news.content && item.scraped_news.content.trim() && item.scraped_news.content.length > 500 && (
                <div className="text-center mt-2">
                  <button
                    onClick={() => setExpandedContent(true)}
                    className="text-xs text-primary-600 hover:text-primary-700"
                  >
                    Ver conteúdo completo...
                  </button>
                </div>
              )}
            </div>

            {/* Análise da IA */}
            {item.ai_category_reasoning && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">Análise da IA</label>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md text-sm">
                  <div className="flex items-center gap-2 font-medium mb-2 text-blue-800">
                    <FileText size={14} />
                    Categoria sugerida: {item.suggested_category?.name}
                  </div>
                  <div className="text-blue-700">{item.ai_category_reasoning}</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="bg-white border rounded-lg p-6">
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
            <Edit3 size={20} />
            Editar Conteúdo
          </h2>

          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Título</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Resumo</label>
              <textarea
                value={formData.summary}
                onChange={(e) => setFormData(prev => ({ ...prev, summary: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Categoria</label>
              <select
                value={formData.categoryId}
                onChange={(e) => setFormData(prev => ({ ...prev, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione uma categoria</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Conteúdo</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">Notas do Curador</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
                placeholder="Observações sobre a curadoria..."
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </form>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between p-4 bg-white border rounded-lg">
        <div className="text-sm text-neutral-600">
          Coletado em: {new Date(item.created_at).toLocaleString("pt-BR")}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleAction("edit")}
            disabled={saving}
            className="inline-flex items-center px-3 py-2 text-sm bg-neutral-200 text-neutral-800 rounded-md hover:bg-neutral-300 disabled:opacity-50"
          >
            <Save size={16} className="mr-1" />
            {saving ? "Salvando..." : "Salvar Edições"}
          </button>

          <button
            onClick={() => handleAction("reject")}
            disabled={saving}
            className="inline-flex items-center px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
          >
            <ThumbsDown size={16} className="mr-1" />
            Rejeitar
          </button>

          <button
            onClick={() => handleAction("approve")}
            disabled={saving}
            className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
          >
            <Check size={16} className="mr-1" />
            Aprovar
          </button>

          <button
            onClick={() => handleAction("publish")}
            disabled={saving}
            className="inline-flex items-center px-3 py-2 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            <Send size={16} className="mr-1" />
            Publicar
          </button>
        </div>
      </div>
    </div>
  )
}
