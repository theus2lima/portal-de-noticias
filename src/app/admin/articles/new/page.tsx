'use client'

import { useState, useEffect } from 'react'
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
  Image as ImageIcon,
  MessageCircle
} from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useGlobalNotification } from '@/contexts/GlobalNotificationContext'
import WhatsAppSendButton from '@/components/WhatsAppSendButton'

interface Category {
  id: string
  name: string
  slug: string
  description?: string
  color?: string
  icon?: string
  is_active?: boolean
}

export default function NewArticlePage() {
  const router = useRouter()
  const { showArticleSuccess } = useGlobalNotification()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingCategories, setLoadingCategories] = useState(true)
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
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingGallery, setUploadingGallery] = useState(false)
  const [galleryImages, setGalleryImages] = useState<Array<{url: string, filename: string, originalName: string}>>([])

  // Carregar categorias na inicialização
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.data || [])
        }
      } catch (error) {
        console.error('Erro ao carregar categorias:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    fetchCategories()
  }, [])

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

  // Função para fazer upload de imagem
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validações no frontend
    if (!file.type.startsWith('image/')) {
      alert('Apenas arquivos de imagem são permitidos!')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('O arquivo deve ter no máximo 2MB!')
      return
    }

    setUploadingImage(true)

    try {
      const formData = new FormData()
      formData.append('image', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload')
      }

      // Atualizar o campo de imagem com a URL retornada
      setFormData(prev => ({
        ...prev,
        featured_image: result.data.url,
        image_alt: result.data.originalName.replace(/\.[^/.]+$/, '') // Nome sem extensão como alt inicial
      }))

      alert('Upload realizado com sucesso!')
    } catch (error) {
      console.error('Erro no upload:', error)
      alert(error instanceof Error ? error.message : 'Erro no upload da imagem')
    } finally {
      setUploadingImage(false)
      // Limpar o input para permitir o mesmo arquivo novamente
      event.target.value = ''
    }
  }

  // Função para abrir o seletor de arquivo
  const handleUploadClick = () => {
    document.getElementById('image-upload-input')?.click()
  }

  // Função para upload múltiplo de imagens
  const handleGalleryUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files || files.length === 0) return

    // Validar cada arquivo
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      if (!file.type.startsWith('image/')) {
        alert(`Arquivo ${file.name} não é uma imagem válida!`)
        return
      }
      if (file.size > 2 * 1024 * 1024) {
        alert(`Arquivo ${file.name} deve ter no máximo 2MB!`)
        return
      }
    }

    setUploadingGallery(true)

    try {
      const formData = new FormData()
      for (let i = 0; i < files.length; i++) {
        formData.append('images', files[i])
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erro no upload')
      }

      // Adicionar imagens à galeria
      setGalleryImages(prev => [...prev, ...result.data])
      alert(`${result.data.length} imagem(ns) enviada(s) com sucesso!`)
    } catch (error) {
      console.error('Erro no upload:', error)
      alert(error instanceof Error ? error.message : 'Erro no upload das imagens')
    } finally {
      setUploadingGallery(false)
      // Limpar o input
      event.target.value = ''
    }
  }

  // Função para abrir seletor de múltiplas imagens
  const handleGalleryUploadClick = () => {
    document.getElementById('gallery-upload-input')?.click()
  }

  // Função para inserir imagem no conteúdo
  const insertImageInContent = (imageUrl: string, altText: string) => {
    const imageMarkdown = `\n\n![${altText}](${imageUrl})\n\n`
    setFormData(prev => ({
      ...prev,
      content: prev.content + imageMarkdown
    }))
  }

  // Função para remover imagem da galeria
  const removeImageFromGallery = (index: number) => {
    setGalleryImages(prev => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'published') => {
    e.preventDefault()
    setLoading(true)

    try {
      const articleData = {
        ...formData,
        status,
        keywords: tags,
        gallery_images: galleryImages,
        published_at: status === 'published' ? new Date().toISOString() : null
      }

      // Log para debug em produção
      console.log('🔍 DEBUG PRODUÇÃO - Dados do formulário:');
      console.log('- Title:', articleData.title ? 'OK' : 'VAZIO');
      console.log('- Content:', articleData.content ? `${articleData.content.length} chars` : 'VAZIO');
      console.log('- Category ID:', articleData.category_id || 'VAZIO');
      console.log('- Status:', articleData.status);
      console.log('- Environment:', process.env.NODE_ENV || 'undefined');
      
      // Validação no frontend antes de enviar
      if (!articleData.title?.trim()) {
        throw new Error('Título é obrigatório');
      }
      if (!articleData.content?.trim()) {
        throw new Error('Conteúdo é obrigatório');
      }
      if (!articleData.category_id?.trim()) {
        throw new Error('Categoria é obrigatória');
      }

      console.log('✅ Validação frontend passou, enviando requisição...');

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      })

      console.log('📡 Resposta da API:');
      console.log('- Status:', response.status);
      console.log('- Status Text:', response.statusText);
      console.log('- Headers:', Object.fromEntries(response.headers.entries()));

      const result = await response.json()
      console.log('📄 Conteúdo da resposta:', result);

      if (!response.ok) {
        throw new Error(result.error || `Erro ${response.status}: ${response.statusText}`)
      }

      console.log('🎉 Sucesso!');
      
      // Se foi publicado, usar contexto global para mostrar notificação no header
      if (status === 'published' && result.data) {
        const articleForNotification = {
          id: result.data.id,
          title: articleData.title,
          slug: result.data.slug,
          content: articleData.content,
          excerpt: articleData.excerpt || 'Confira esta notícia importante!',
          featured_image: articleData.featured_image || '',
          status: 'published',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
        
        // Mostrar notificação global no header
        showArticleSuccess(articleForNotification)
        
        // Redirecionar para a página de artigos após um delay para mostrar a notificação
        setTimeout(() => {
          router.push('/admin/articles')
        }, 1000)
      } else {
        // Sucesso - redirecionar para lista de artigos se for rascunho
        router.push('/admin/articles?success=created')
      }
    } catch (error) {
      console.error('❌ ERRO DETALHADO:', {
        type: error instanceof Error ? error.constructor.name : typeof error,
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'N/A'
      });
      
      // Melhor UX para exibir erros
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      // Tentar extrair erro mais específico se for um erro de rede/API
      let displayMessage = errorMessage
      
      if (errorMessage.includes('Load failed') || errorMessage.includes('Failed to fetch')) {
        displayMessage = 'Erro de conexão. Verifique sua internet e tente novamente.'
      } else if (errorMessage.includes('500')) {
        displayMessage = 'Erro interno do servidor. Tente novamente em alguns instantes.'
      } else if (errorMessage.includes('400')) {
        displayMessage = 'Dados inválidos. Verifique se todos os campos obrigatórios estão preenchidos.'
      }
      
      // Usar uma modal de erro mais amigável em vez de alert
      const errorModal = document.createElement('div')
      errorModal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4'
      errorModal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full">
          <div class="flex items-center space-x-3 mb-4">
            <div class="flex-shrink-0">
              <svg class="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-medium text-red-800">Erro ao salvar artigo</h3>
            </div>
          </div>
          <p class="text-red-700 mb-4">${displayMessage}</p>
          <div class="flex justify-end space-x-3">
            <button onclick="this.closest('.fixed').remove()" class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">OK</button>
          </div>
        </div>
      `
      document.body.appendChild(errorModal)
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
        
        // Verificar se é uma imagem em Markdown
        const imageMatch = paragraph.match(/!\[([^\]]*)\]\(([^)]+)\)/)
        if (imageMatch) {
          const [, altText, imageUrl] = imageMatch
          return (
            <div key={index} className="my-6">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image 
                  src={imageUrl} 
                  alt={altText || 'Imagem do artigo'} 
                  fill 
                  className="object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>
              {altText && (
                <p className="text-sm text-neutral-600 text-center mt-2 italic">{altText}</p>
              )}
            </div>
          )
        }
        
        // Simular outros formatos markdown básicos
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <button 
            type="button"
            onClick={handlePreview}
            className="btn-outline flex items-center justify-center space-x-2 w-full sm:w-auto"
            disabled={loading}
          >
            <Eye className="h-4 w-4" />
            <span>Pré-visualizar</span>
          </button>
          <button
            type="submit"
            form="article-form"
            onClick={(e) => handleSubmit(e, 'draft')}
            className="btn-secondary flex items-center justify-center space-x-2 w-full sm:w-auto"
            disabled={loading}
          >
            <Save className="h-4 w-4" />
            <span>Salvar Rascunho</span>
          </button>
          <button
            type="submit"
            form="article-form"
            onClick={(e) => handleSubmit(e, 'published')}
            className="btn-primary flex items-center justify-center space-x-2 w-full sm:w-auto"
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
                  disabled={loadingCategories}
                >
                  <option value="">
                    {loadingCategories ? 'Carregando categorias...' : 'Selecione uma categoria'}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
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
                  <button 
                    type="button" 
                    onClick={handleUploadClick}
                    disabled={uploadingImage}
                    className="btn-outline text-sm flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Upload className="h-4 w-4" />
                    <span>{uploadingImage ? 'Enviando...' : 'Upload de Imagem'}</span>
                  </button>
                  
                  {/* Input file invisível */}
                  <input
                    id="image-upload-input"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
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

          {/* Gallery Images */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Galeria de Imagens</h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-neutral-300 rounded-lg p-4 text-center">
                <ImageIcon className="mx-auto h-8 w-8 text-neutral-400 mb-2" />
                <button 
                  type="button" 
                  onClick={handleGalleryUploadClick}
                  disabled={uploadingGallery}
                  className="btn-outline text-sm flex items-center space-x-2 mx-auto disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploadingGallery ? 'Enviando...' : 'Upload Múltiplo'}</span>
                </button>
                
                {/* Input file invisível para múltiplas imagens */}
                <input
                  id="gallery-upload-input"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                />
                
                <p className="mt-2 text-xs text-neutral-500">
                  Selecione várias imagens para inserir no artigo
                </p>
              </div>

              {/* Lista de imagens da galeria */}
              {galleryImages.length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-neutral-700">Imagens Enviadas:</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="flex items-center space-x-2 p-2 border border-neutral-200 rounded-lg">
                        <div className="relative w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <Image 
                            src={image.url} 
                            alt={image.originalName}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-800 truncate">{image.originalName}</p>
                        </div>
                        <div className="flex items-center space-x-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => insertImageInContent(image.url, image.originalName.replace(/\.[^/.]+$/, ''))}
                            className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                            title="Inserir no conteúdo"
                          >
                            Inserir
                          </button>
                          <button
                            type="button"
                            onClick={() => removeImageFromGallery(index)}
                            className="p-1 text-red-600 hover:text-red-800 transition-colors"
                            title="Remover"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))}
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
                      • {categories.find(c => c.id === formData.category_id)?.name || 'Categoria'}
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
