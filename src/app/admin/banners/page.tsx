'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, ExternalLink, Image as ImageIcon, MousePointer, Eye } from 'lucide-react'

interface Banner {
  id: string
  title: string
  image_url: string
  link_url: string
  position: string
  active: boolean
  start_date: string | null
  end_date: string | null
  clicks: number
  impressions: number
  created_at: string
}

const POSITIONS = [
  { value: 'topo_artigo', label: 'Topo do Artigo' },
  { value: 'sidebar', label: 'Sidebar (Lateral)' },
  { value: 'meio_artigo', label: 'Meio do Artigo' },
  { value: 'rodape_artigo', label: 'Rodapé do Artigo' },
]

const emptyForm = {
  title: '',
  image_url: '',
  link_url: '',
  position: 'sidebar',
  active: true,
  start_date: '',
  end_date: '',
}

export default function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [filterPosition, setFilterPosition] = useState('')
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null)

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchBanners = async () => {
    setLoading(true)
    try {
      const url = filterPosition ? `/api/banners?position=${filterPosition}` : '/api/banners'
      const res = await fetch(url)
      const { data } = await res.json()
      setBanners(data || [])
    } catch {
      showToast('Erro ao carregar banners', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchBanners() }, [filterPosition])

  const openNew = () => {
    setForm(emptyForm)
    setEditingId(null)
    setShowForm(true)
  }

  const openEdit = (b: Banner) => {
    setForm({
      title: b.title,
      image_url: b.image_url,
      link_url: b.link_url,
      position: b.position,
      active: b.active,
      start_date: b.start_date || '',
      end_date: b.end_date || '',
    })
    setEditingId(b.id)
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.title || !form.image_url || !form.link_url) {
      showToast('Preencha título, imagem e link', 'error')
      return
    }
    setSaving(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/banners/${editingId}` : '/api/banners'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      showToast(editingId ? 'Banner atualizado!' : 'Banner criado!')
      setShowForm(false)
      fetchBanners()
    } catch {
      showToast('Erro ao salvar banner', 'error')
    } finally {
      setSaving(false)
    }
  }

  const toggleActive = async (b: Banner) => {
    try {
      await fetch(`/api/banners/${b.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !b.active }),
      })
      fetchBanners()
    } catch {
      showToast('Erro ao atualizar status', 'error')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return
    try {
      await fetch(`/api/banners/${id}`, { method: 'DELETE' })
      showToast('Banner excluído!')
      fetchBanners()
    } catch {
      showToast('Erro ao excluir banner', 'error')
    }
  }

  const getPositionLabel = (value: string) =>
    POSITIONS.find(p => p.value === value)?.label || value

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium ${
          toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Gerenciar Banners</h1>
          <p className="text-neutral-500 text-sm mt-1">Cadastre e gerencie os banners de publicidade do portal</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          <Plus size={18} />
          Novo Banner
        </button>
      </div>

      {/* Filtro por posição */}
      <div className="mb-4 flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterPosition('')}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
            filterPosition === '' ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
          }`}
        >
          Todos
        </button>
        {POSITIONS.map(p => (
          <button
            key={p.value}
            onClick={() => setFilterPosition(p.value)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              filterPosition === p.value ? 'bg-blue-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Modal Formulário */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
            <div className="p-6 border-b">
              <h2 className="text-lg font-bold">{editingId ? 'Editar Banner' : 'Novo Banner'}</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Título *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Ex: Banner Supermercado ABC"
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">URL da Imagem *</label>
                <input
                  type="url"
                  value={form.image_url}
                  onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {form.image_url && (
                  <img src={form.image_url} alt="preview" className="mt-2 rounded-lg max-h-32 object-cover" onError={e => (e.currentTarget.style.display = 'none')} />
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Link de Destino *</label>
                <input
                  type="url"
                  value={form.link_url}
                  onChange={e => setForm(f => ({ ...f, link_url: e.target.value }))}
                  placeholder="https://..."
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Posição *</label>
                <select
                  value={form.position}
                  onChange={e => setForm(f => ({ ...f, position: e.target.value }))}
                  className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {POSITIONS.map(p => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Data Início</label>
                  <input
                    type="date"
                    value={form.start_date}
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Data Fim</label>
                  <input
                    type="date"
                    value={form.end_date}
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                    className="w-full border border-neutral-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  checked={form.active}
                  onChange={e => setForm(f => ({ ...f, active: e.target.checked }))}
                  className="w-4 h-4 rounded"
                />
                <label htmlFor="active" className="text-sm font-medium text-neutral-700">Banner ativo</label>
              </div>
            </div>
            <div className="p-6 border-t flex gap-3 justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="px-4 py-2 rounded-lg border border-neutral-300 text-neutral-700 hover:bg-neutral-50 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50"
              >
                {saving ? 'Salvando...' : editingId ? 'Salvar Alterações' : 'Criar Banner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Banners */}
      {loading ? (
        <div className="text-center py-12 text-neutral-400">Carregando banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-12">
          <ImageIcon size={48} className="mx-auto text-neutral-300 mb-3" />
          <p className="text-neutral-500">Nenhum banner cadastrado ainda.</p>
          <button onClick={openNew} className="mt-4 text-blue-600 hover:underline text-sm">
            Cadastrar primeiro banner
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {banners.map(banner => (
            <div key={banner.id} className={`bg-white rounded-xl shadow-sm border flex gap-4 p-4 ${!banner.active ? 'opacity-60' : ''}`}>
              {/* Imagem */}
              <div className="w-32 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-neutral-100">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                  onError={e => { e.currentTarget.src = '' ; e.currentTarget.className = 'hidden' }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-neutral-900 truncate">{banner.title}</h3>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                      {getPositionLabel(banner.position)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => toggleActive(banner)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 transition"
                      title={banner.active ? 'Desativar' : 'Ativar'}
                    >
                      {banner.active
                        ? <ToggleRight size={20} className="text-green-600" />
                        : <ToggleLeft size={20} className="text-neutral-400" />
                      }
                    </button>
                    <button
                      onClick={() => openEdit(banner)}
                      className="p-1.5 rounded-lg hover:bg-neutral-100 transition"
                      title="Editar"
                    >
                      <Pencil size={16} className="text-neutral-600" />
                    </button>
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg hover:bg-neutral-100 transition"
                      title="Abrir link"
                    >
                      <ExternalLink size={16} className="text-neutral-600" />
                    </a>
                    <button
                      onClick={() => handleDelete(banner.id)}
                      className="p-1.5 rounded-lg hover:bg-red-50 transition"
                      title="Excluir"
                    >
                      <Trash2 size={16} className="text-red-500" />
                    </button>
                  </div>
                </div>

                {/* Métricas */}
                <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                  <span className="flex items-center gap-1">
                    <MousePointer size={12} />
                    {banner.clicks} cliques
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {banner.impressions} impressões
                  </span>
                  {banner.start_date && (
                    <span>De {new Date(banner.start_date).toLocaleDateString('pt-BR')}</span>
                  )}
                  {banner.end_date && (
                    <span>até {new Date(banner.end_date).toLocaleDateString('pt-BR')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
