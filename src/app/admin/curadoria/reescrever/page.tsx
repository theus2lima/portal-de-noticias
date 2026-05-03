'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Bot, Send, ExternalLink, RefreshCw,
  Check, AlertCircle, Loader2, Tag, X, Sparkles, Eye, EyeOff
} from 'lucide-react'
import RichTextEditor from '@/components/RichTextEditor'
import DOMPurify from 'isomorphic-dompurify'

interface NewsItem {
  id: string
  title: string
  url: string
  summary: string
  source_name: string
  source_url: string
  published_at: string
  image_url: string | null
  origin: string
}

interface Category {
  id: string
  name: string
}

export default function ReescreverPage() {
  const router = useRouter()
  const [original, setOriginal] = useState<NewsItem | null>(null)
  const [categories, setCategories] = useState<Category[]>([])

  // Form state (AI result, editable)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [keywords, setKeywords] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState('')
  const [newTag, setNewTag] = useState('')

  // UI state
  const [rewriting, setRewriting] = useState(false)
  const [rewriteError, setRewriteError] = useState<string | null>(null)
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [rewriteDone, setRewriteDone] = useState(false)
  const [originalContent, setOriginalContent] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showIframe, setShowIframe] = useState(false)
  const [iframeBlocked, setIframeBlocked] = useState(false)

  // Load original from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('curadoria_item')
    if (!stored) {
      router.push('/admin/curadoria')
      return
    }
    const item: NewsItem = JSON.parse(stored)
    setOriginal(item)
    setTitle(item.title) // Pre-fill with original title

    // Fetch categories
    fetch('/api/categories')
      .then((r) => r.json())
      .then((d) => setCategories(d.data || []))
      .catch(() => {})

    // Auto-start rewriting
    rewriteArticle(item)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const rewriteArticle = async (item?: NewsItem) => {
    const source = item || original
    if (!source) return

    setRewriting(true)
    setRewriteError(null)
    setRewriteDone(false)

    try {
      const res = await fetch('/api/curadoria/reescrever', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: source.title,
          summary: source.summary,
          url: source.url,
          sourceUrl: source.source_url,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setTitle(data.data.title)
        setContent(data.data.content)
        setExcerpt(data.data.excerpt)
        setKeywords(data.data.keywords || [])
        setOriginalContent(data.data.originalContent || '')
        setRewriteDone(true)
      } else {
        setRewriteError(data.error || 'Erro ao reescrever')
        // Keep original title so user can edit manually
        setContent(`<p>${source.summary}</p>`)
      }
    } catch (err: any) {
      setRewriteError(err.message || 'Erro de conexão')
      setContent(`<p>${source.summary}</p>`)
    } finally {
      setRewriting(false)
    }
  }

  const handleAddTag = () => {
    const tag = newTag.trim()
    if (tag && !keywords.includes(tag)) {
      setKeywords([...keywords, tag])
      setNewTag('')
    }
  }

  const handlePublish = async (status: 'draft' | 'published') => {
    if (!title || !content) {
      setPublishError('Preencha pelo menos o título e o conteúdo')
      return
    }

    setPublishing(true)
    setPublishError(null)

    try {
      const res = await fetch('/api/articles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          content,
          excerpt,
          keywords,
          category_id: categoryId || undefined,
          status,
          source_url: original?.url,
        }),
      })

      const data = await res.json()

      if (!res.ok) throw new Error(data.error || 'Erro ao publicar')

      // Clear sessionStorage
      sessionStorage.removeItem('curadoria_item')

      // Navigate to articles list
      router.push('/admin/articles?success=' + (status === 'published' ? 'published' : 'draft'))
    } catch (err: any) {
      setPublishError(err.message || 'Erro ao publicar. Tente novamente.')
    } finally {
      setPublishing(false)
    }
  }

  if (!original && !rewriting) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <Loader2 size={24} className="animate-spin text-neutral-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/curadoria"
            className="p-2 text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-neutral-900">Reescrever com IA</h1>
            <p className="text-sm text-neutral-500">
              Fonte: <span className="font-medium">{original?.source_name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => rewriteArticle()}
            disabled={rewriting}
            className="flex items-center gap-1.5 px-3 py-2 text-sm border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={rewriting ? 'animate-spin' : ''} />
            Reescrever de novo
          </button>
          {rewriteDone && (
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm border border-primary-200 text-primary-700 bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors"
            >
              <Eye size={14} />
              Ver rascunho
            </button>
          )}
          <button
            onClick={() => handlePublish('draft')}
            disabled={publishing || rewriting}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-neutral-200 hover:bg-neutral-300 text-neutral-800 rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Salvar Rascunho
          </button>
          <button
            onClick={() => handlePublish('published')}
            disabled={publishing || rewriting || !rewriteDone}
            className="flex items-center gap-1.5 px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
          >
            {publishing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            Publicar Artigo
          </button>
        </div>
      </div>

      {/* Error states */}
      {publishError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          <AlertCircle size={16} />
          {publishError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">

        {/* ══════════════════════════════════════════════════════
            ESQUERDA — Artigo original (leitura)
        ══════════════════════════════════════════════════════ */}
        <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden sticky top-4">
          {/* Header do painel */}
          <div className="px-4 py-3 border-b border-neutral-100 flex items-center justify-between bg-neutral-50">
            <h2 className="text-sm font-semibold text-neutral-700">Artigo Original</h2>
            {original?.url && (
              <a
                href={original.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700"
              >
                <ExternalLink size={12} />
                Ver no site
              </a>
            )}
          </div>

          {/* Scrollable — imagem + título + fonte + conteúdo completo */}
          <div className="overflow-y-auto max-h-[calc(100vh-160px)]">
            {original?.image_url && (
              <img
                src={original.image_url}
                alt={original?.title}
                className="w-full h-48 object-cover"
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
            )}

            <div className="p-5 space-y-3">
              <h3 className="font-bold text-neutral-900 text-base leading-snug">
                {original?.title}
              </h3>

              <div className="text-xs text-neutral-400">
                {original?.source_name} • {original?.published_at ? new Date(original.published_at).toLocaleString('pt-BR') : ''}
              </div>

              <hr className="border-neutral-100" />

              {/* Resumo sempre visível */}
              {original?.summary && (
                <p className="text-sm text-neutral-600 leading-relaxed">
                  {original.summary}
                </p>
              )}

              {/* Conteúdo completo capturado — só aparece se trouxer mais do que o resumo */}
              {rewriting ? (
                <div className="space-y-2.5 animate-pulse pt-1">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className={`h-3 bg-neutral-100 rounded ${i % 5 === 4 ? 'w-3/5' : 'w-full'}`} />
                  ))}
                </div>
              ) : originalContent && originalContent.trim() !== original?.summary?.trim() ? (
                <>
                  <div className="flex items-center gap-2 pt-1">
                    <div className="h-px flex-1 bg-neutral-100" />
                    <span className="text-xs text-neutral-400">conteúdo completo</span>
                    <div className="h-px flex-1 bg-neutral-100" />
                  </div>
                  <div className="space-y-3">
                    {originalContent.split('\n\n').filter(p => p.trim()).map((para, i) => (
                      <p key={i} className="text-sm text-neutral-700 leading-relaxed">
                        {para.trim()}
                      </p>
                    ))}
                  </div>
                </>
              ) : !rewriting && (
                <div className="pt-1 space-y-3">
                  <p className="text-xs text-neutral-400 italic">
                    Conteúdo completo não disponível — o site pode bloquear leitura automática.
                  </p>

                  {/* Botão para tentar carregar o artigo em iframe */}
                  {!showIframe && (
                    <button
                      onClick={() => { setShowIframe(true); setIframeBlocked(false) }}
                      className="flex items-center gap-1.5 text-xs text-primary-600 hover:text-primary-700 underline"
                    >
                      <ExternalLink size={11} />
                      Carregar artigo inline
                    </button>
                  )}

                  {showIframe && (
                    <div className="space-y-2">
                      <div className="relative rounded-lg border border-neutral-200 overflow-hidden bg-neutral-50" style={{ height: '500px' }}>
                        <iframe
                          src={original?.url}
                          className="w-full h-full"
                          title="Artigo original"
                          referrerPolicy="no-referrer"
                        />
                        {/* Overlay caso o site bloqueie o iframe (aparece transparente por baixo) */}
                        <div className="absolute bottom-0 left-0 right-0 bg-white/90 border-t border-neutral-200 px-3 py-2 flex items-center justify-between">
                          <span className="text-xs text-neutral-500">Se aparecer em branco, o site bloqueia exibição inline.</span>
                          <a
                            href={original?.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary-600 hover:text-primary-700 underline"
                          >
                            <ExternalLink size={11} />
                            Nova aba
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => setShowIframe(false)}
                        className="text-xs text-neutral-400 hover:text-neutral-600 underline"
                      >
                        Fechar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════
            DIREITA — Texto reescrito + configurações
        ══════════════════════════════════════════════════════ */}
        <div className="space-y-4">
          {/* AI Status Banner */}
          {rewriting && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 text-blue-700">
              <Loader2 size={16} className="animate-spin flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">A IA está reescrevendo a notícia...</p>
                <p className="text-xs text-blue-600 mt-0.5">Buscando conteúdo completo e gerando texto jornalístico</p>
              </div>
            </div>
          )}

          {rewriteError && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-xl p-4 text-amber-700">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium">Não foi possível reescrever automaticamente</p>
                <p className="text-xs mt-0.5">{rewriteError}</p>
                <p className="text-xs mt-1">Edite o conteúdo manualmente ou clique em &quot;Reescrever de novo&quot;</p>
              </div>
            </div>
          )}

          {rewriteDone && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-3 text-green-700">
              <Sparkles size={14} />
              <p className="text-xs font-medium">Texto reescrito com sucesso! Revise antes de publicar.</p>
            </div>
          )}

          {/* Editor do texto reescrito */}
          <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-neutral-100 flex items-center gap-2 bg-neutral-50">
              <Bot size={14} className="text-primary-600" />
              <h2 className="text-sm font-semibold text-neutral-700">Texto Reescrito (editável)</h2>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Título *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título do artigo..."
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-600 mb-1.5">Conteúdo *</label>
                {rewriting ? (
                  <div className="border border-neutral-200 rounded-xl min-h-64 flex items-center justify-center text-neutral-400 gap-2">
                    <Loader2 size={18} className="animate-spin" />
                    <span className="text-sm">Gerando texto...</span>
                  </div>
                ) : (
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="O conteúdo reescrito aparecerá aqui..."
                    minHeight={380}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Configurações de Publicação */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4 space-y-4">
            <h2 className="text-sm font-semibold text-neutral-700">Configurações de Publicação</h2>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Categoria</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Selecione uma categoria...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Resumo (excerpt)</label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                placeholder="Resumo curto para exibição na home..."
                className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-600 mb-1.5">Tags/Palavras-chave</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {keywords.map((kw, i) => (
                  <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 text-primary-700 text-xs rounded-full">
                    {kw}
                    <button type="button" onClick={() => setKeywords(keywords.filter((_, j) => j !== i))}>
                      <X size={10} />
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag() } }}
                  placeholder="Adicionar tag..."
                  className="flex-1 border border-neutral-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs rounded-lg transition-colors"
                >
                  <Tag size={12} />
                </button>
              </div>
            </div>
          </div>

          {/* Publish actions (bottom) */}
          <div className="flex gap-3">
            <button
              onClick={() => handlePublish('draft')}
              disabled={publishing || rewriting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-neutral-300 rounded-xl text-sm font-medium text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Salvar como Rascunho
            </button>
            <button
              onClick={() => handlePublish('published')}
              disabled={publishing || rewriting || !rewriteDone && !content}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
            >
              {publishing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Publicar Agora
            </button>
          </div>
        </div>
      </div>
      {/* Modal de prévia */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto py-8 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 sticky top-0 bg-white rounded-t-2xl z-10">
              <div className="flex items-center gap-2">
                <Eye size={16} className="text-primary-600" />
                <h3 className="font-semibold text-neutral-900">Rascunho do Artigo</h3>
              </div>
              <button
                onClick={() => setShowPreview(false)}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Conteúdo da prévia */}
            <div className="p-8">
              {/* Categoria / tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {categoryId && categories.find(c => c.id === categoryId) && (
                  <span className="px-2.5 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                    {categories.find(c => c.id === categoryId)?.name}
                  </span>
                )}
                {keywords.map((kw, i) => (
                  <span key={i} className="px-2.5 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                    {kw}
                  </span>
                ))}
              </div>

              {/* Título */}
              <h1 className="text-2xl font-bold text-neutral-900 leading-tight mb-4">
                {title || 'Sem título'}
              </h1>

              {/* Excerpt */}
              {excerpt && (
                <p className="text-base text-neutral-500 italic border-l-4 border-primary-200 pl-4 mb-6 leading-relaxed">
                  {excerpt}
                </p>
              )}

              {/* Fonte */}
              {original && (
                <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
                  <span>Fonte: {original.source_name}</span>
                  <span>•</span>
                  <span>{original.published_at ? new Date(original.published_at).toLocaleString('pt-BR') : ''}</span>
                </div>
              )}

              <hr className="border-neutral-200 mb-6" />

              {/* Corpo do artigo — sanitizado com DOMPurify antes de renderizar */}
              <div
                className="prose prose-neutral max-w-none text-neutral-800 leading-relaxed"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }}
              />
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-200 bg-neutral-50 rounded-b-2xl">
              <p className="text-xs text-neutral-500">Esta é uma prévia — o artigo ainda não foi publicado.</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowPreview(false)}
                  className="px-4 py-2 text-sm text-neutral-700 border border-neutral-300 rounded-lg hover:bg-white transition-colors"
                >
                  Fechar
                </button>
                <button
                  onClick={() => { setShowPreview(false); handlePublish('published') }}
                  disabled={publishing}
                  className="px-4 py-2 text-sm bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {publishing ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                  Publicar agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
