'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  Eye, 
  ArrowLeft,
  Upload,
  X,
  FileText,
  Calendar,
  Tag,
  Image as ImageIcon
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function NewArticlePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    content: '',
    excerpt: '',
    category_id: '',
    featured_image: '',
    image_alt: '',
    meta_title: '',
    meta_description: '',
    keywords: '',
    status: 'draft',
    is_featured: false,
    published_at: ''
  })

  const [tags, setTags] = useState<string[]>([])
  const [currentTag, setCurrentTag] = useState('')
  const [showPreview, setShowPreview] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleAddTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()])
      setCurrentTag('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    setLoading(true)

    try {
      const articleData = {
        ...formData,
        status,
        keywords: tags,
        published_at: status === 'published' ? new Date().toISOString() : null
      }

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro ao salvar artigo')
      }

      // Sucesso - redirecionar para lista de artigos
      router.push('/admin/articles?success=created')
    } catch (error) {
      console.error('Erro ao salvar artigo:', error)
      alert('Erro ao salvar artigo: ' + (error as Error).message)
    } finally {
      setLoading(false)
    }
  }

  // Função para abrir pré-visualização
  const handlePreview = () => {
    if (!formData.title || !formData.content) {
      alert('Preencha pelo menos o título e conteúdo para visualizar')
      return
    }
    setShowPreview(true)
  }

  // Função para formatar conteúdo (simular markdown básico)
  const formatContent = (content: string) => {
    return content
      .split('\n')
      .map((paragraph, index) => {
        if (paragraph.trim() === '') return null
        
        // Simular alguns formatos markdown básicos
        let formatted = paragraph
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // **bold**
          .replace(/\*(.*?)\*/g, '<em>$1</em>') // *italic*
          .replace(/^## (.*)/g, '<h2 class="text-xl font-semibold mt-6 mb-3">$1</h2>') // ## heading
          .replace(/^# (.*)/g, '<h1 class="text-2xl font-bold mt-6 mb-4">$1</h1>') // # heading
        
        return (
          <div key={index} className="mb-4 text-justify" dangerouslySetInnerHTML={{ __html: formatted }} />
        )
      })
      .filter(Boolean)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <Link
            href="/admin/articles"
            className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Novo Artigo</h1>
            <p className="text-neutral-600">Crie um novo artigo para o portal</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            type="button"
            onClick={handlePreview}
            className="btn-outline flex items-center space-x-2"
            disabled={loading}
          >
            <Eye className="h-4 w-4" />
            <span>Pré-visualizar</span>
          </button>
          <button
            type="submit"
            form="article-form"
            onClick={(e) => handleSubmit(e, 'draft')}
            className="btn-secondary flex items-center space-x-2"
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            <span>Salvar Rascunho</span>
          </button>
          <button
            type="submit"
            form="article-form"
            onClick={(e) => handleSubmit(e, 'published')}
            className="btn-primary flex items-center space-x-2"
            disabled={loading}
          >
            <FileText className="h-4 w-4" />
            <span>Publicar</span>
          </button>
        </div>
      </div>

      <form id="article-form" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Informações Básicas</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Digite o título do artigo..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Subtítulo
                </label>
                <input
                  type="text"
                  name="subtitle"
                  value={formData.subtitle}
                  onChange={handleInputChange}
                  placeholder="Subtítulo opcional..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Resumo
                </label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Breve resumo do artigo..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Conteúdo</h3>
            
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Conteúdo do Artigo *
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={15}
                placeholder="Escreva o conteúdo completo do artigo aqui..."
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                required
              />
              <p className="text-xs text-neutral-500 mt-1">
                Você pode usar Markdown para formatação
              </p>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">SEO & Meta Tags</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Meta Título
                </label>
                <input
                  type="text"
                  name="meta_title"
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  placeholder="Título para SEO (deixe vazio para usar o título principal)"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Meta Descrição
                </label>
                <textarea
                  name="meta_description"
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  rows={3}
                  placeholder="Descrição para mecanismos de busca..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Tags/Keywords
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1 text-primary-600 hover:text-primary-800"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                    placeholder="Digite uma tag e pressione Enter"
                    className="flex-1 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="btn-outline text-sm"
                  >
                    <Tag className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish Settings */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Configurações</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Categoria *
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  required
                >
                  <option value="">Selecione uma categoria</option>
                  <option value="11111111-1111-1111-1111-111111111111">Política</option>
                  <option value="22222222-2222-2222-2222-222222222222">Economia</option>
                  <option value="33333333-3333-3333-3333-333333333333">Esportes</option>
                  <option value="44444444-4444-4444-4444-444444444444">Cultura</option>
                  <option value="55555555-5555-5555-5555-555555555555">Cidades</option>
                  <option value="66666666-6666-6666-6666-666666666666">Tecnologia</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Data de Publicação
                </label>
                <input
                  type="datetime-local"
                  name="published_at"
                  value={formData.published_at}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_featured"
                  name="is_featured"
                  checked={formData.is_featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-neutral-300 rounded"
                />
                <label htmlFor="is_featured" className="ml-2 block text-sm text-neutral-700">
                  Artigo em destaque
                </label>
              </div>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Imagem Destacada</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  URL da Imagem
                </label>
                <input
                  type="url"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleInputChange}
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Texto Alternativo
                </label>
                <input
                  type="text"
                  name="image_alt"
                  value={formData.image_alt}
                  onChange={handleInputChange}
                  placeholder="Descrição da imagem para acessibilidade"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-neutral-400" />
                <div className="mt-4">
                  <button type="button" className="btn-outline text-sm flex items-center space-x-2 mx-auto">
                    <Upload className="h-4 w-4" />
                    <span>Upload de Imagem</span>
                  </button>
                </div>
                <p className="mt-2 text-xs text-neutral-500">
                  PNG, JPG até 2MB
                </p>
              </div>

              {formData.featured_image && (
                <div className="mt-4">
                  <div className="relative w-full h-48 rounded-lg overflow-hidden">
                    <Image 
                      src={formData.featured_image} 
                      alt="Preview" 
                      fill
                      className="object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-neutral-50 rounded-xl p-4">
            <h4 className="font-medium text-neutral-900 mb-3">Ações Rápidas</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Status:</span>
                <span className="font-medium text-neutral-900">Rascunho</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Palavras:</span>
                <span className="font-medium text-neutral-900">
                  {formData.content.split(' ').filter(word => word.length > 0).length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">Tempo de leitura:</span>
                <span className="font-medium text-neutral-900">
                  {Math.max(1, Math.ceil(formData.content.split(' ').length / 200))} min
                </span>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="bg-white w-full max-w-5xl max-h-[85vh] rounded-xl overflow-hidden shadow-xl flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0">
              <h3 className="text-lg font-semibold">Pré-visualização do Artigo</h3>
              <button onClick={() => setShowPreview(false)} className="text-neutral-500 hover:text-neutral-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 overflow-y-auto flex-1">
              {/* Content */}
              <div className="md:col-span-2">
                <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">{formData.title || 'Título do artigo'}</h1>
                {formData.subtitle && (
                  <p className="mt-2 text-neutral-600">{formData.subtitle}</p>
                )}
                <div className="mt-4 text-sm text-neutral-500 flex gap-3">
                  <span>{new Date().toLocaleDateString('pt-BR')}</span>
                  {formData.category_id && (
                    <span>
                      • {formData.category_id === '11111111-1111-1111-1111-111111111111' ? 'Política' :
                          formData.category_id === '22222222-2222-2222-2222-222222222222' ? 'Economia' :
                          formData.category_id === '33333333-3333-3333-3333-333333333333' ? 'Esportes' :
                          formData.category_id === '44444444-4444-4444-4444-444444444444' ? 'Cultura' :
                          formData.category_id === '55555555-5555-5555-5555-555555555555' ? 'Cidades' :
                          formData.category_id === '66666666-6666-6666-6666-666666666666' ? 'Tecnologia' : 'Geral'}
                    </span>
                  )}
                </div>

                {formData.featured_image && (
                  <div className="relative w-full h-48 md:h-64 mt-4 rounded-lg overflow-hidden">
                    <Image src={formData.featured_image} alt={formData.image_alt || 'Imagem destacada'} fill className="object-cover" />
                  </div>
                )}

                <div className="prose prose-sm md:prose-base prose-neutral max-w-none mt-6 prose-p:text-justify">
                  {formatContent(formData.content)}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {formData.excerpt && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Resumo</h4>
                    <p className="text-sm text-neutral-700">{formData.excerpt}</p>
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="bg-neutral-50 rounded-lg p-4">
                    <h4 className="font-medium mb-2">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {tags.map((t, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-full bg-primary-100 text-primary-800 text-xs">{t}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="bg-neutral-50 rounded-lg p-4 text-sm text-neutral-600">
                  <div className="flex items-center justify-between">
                    <span>Tempo de leitura</span>
                    <span className="font-medium text-neutral-900">{Math.max(1, Math.ceil(formData.content.split(' ').length / 200))} min</span>
                  </div>
                </div>

                <button onClick={() => setShowPreview(false)} className="w-full btn-secondary">Fechar Pré-visualização</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
