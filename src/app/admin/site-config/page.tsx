'use client'

import { useState, useEffect } from 'react'
import { 
  Globe, 
  Facebook, 
  Twitter, 
  Instagram, 
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Save,
  Check,
  AlertCircle,
  Eye,
  ExternalLink,
  Plus,
  Trash2,
  Edit3,
  Link as LinkIcon
} from 'lucide-react'

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  color: string
  enabled: boolean
}

interface SiteConfig {
  // Informações do Site
  siteName: string
  siteDescription: string
  siteUrl: string
  
  // Cabeçalho
  headerText: string
  
  // Contato
  contactEmail: string
  contactPhone: string
  contactAddress: string
  
  // Newsletter
  newsletterEnabled: boolean
  newsletterTitle: string
  newsletterDescription: string
  
  // Redes Sociais
  socialLinks: SocialLink[]
  
  // Rodapé
  footerDescription: string
  footerCopyright: string
  
  // Links Úteis
  usefulLinks: Array<{
    id: string
    title: string
    url: string
    enabled: boolean
  }>
}

const defaultConfig: SiteConfig = {
  siteName: 'Radar Noroeste PR',
  siteDescription: 'Informação de qualidade, sempre atualizada. Acompanhe as principais notícias do Brasil e do mundo.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://radarnoroeste.com.br',
  
  headerText: '📍 Últimas notícias em tempo real',
  
  contactEmail: 'contato@radarnoroeste.com.br',
  contactPhone: '(44) 9999-9999',
  contactAddress: 'Noroeste do Paraná - Brasil',
  
  newsletterEnabled: true,
  newsletterTitle: 'Newsletter',
  newsletterDescription: 'Receba as principais notícias em seu e-mail',
  
  socialLinks: [
    {
      id: '1',
      platform: 'Facebook',
      url: 'https://facebook.com/radarnoroeste',
      icon: 'Facebook',
      color: 'hover:text-blue-600',
      enabled: true
    },
    {
      id: '2',
      platform: 'Twitter',
      url: 'https://twitter.com/radarnoroeste',
      icon: 'Twitter',
      color: 'hover:text-blue-400',
      enabled: true
    },
    {
      id: '3',
      platform: 'Instagram',
      url: 'https://instagram.com/radarnoroeste',
      icon: 'Instagram',
      color: 'hover:text-pink-600',
      enabled: true
    },
    {
      id: '4',
      platform: 'WhatsApp',
      url: 'https://wa.me/5544999999999',
      icon: 'MessageCircle',
      color: 'hover:text-green-500',
      enabled: true
    }
  ],
  
  footerDescription: 'Informação de qualidade, sempre atualizada. Acompanhe as principais notícias do Brasil e do mundo.',
  footerCopyright: '© 2024 Radar Noroeste PR. Todos os direitos reservados.',
  
  usefulLinks: [
    { id: '1', title: 'Sobre Nós', url: '/sobre', enabled: true },
    { id: '2', title: 'Contato', url: '/contato', enabled: true },
    { id: '3', title: 'Política Editorial', url: '/politica-editorial', enabled: true },
    { id: '4', title: 'Política de Privacidade', url: '/privacidade', enabled: true },
    { id: '5', title: 'Termos de Uso', url: '/termos', enabled: true }
  ]
}

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      // Carregar configurações do localStorage ou API
      const savedConfig = localStorage.getItem('site-config')
      if (savedConfig) {
        setConfig(JSON.parse(savedConfig))
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    }
  }

  const saveConfig = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Salvar no localStorage (pode ser substituído por API)
      localStorage.setItem('site-config', JSON.stringify(config))
      
      // Simular delay de salvamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao salvar configurações')
      setTimeout(() => setError(''), 5000)
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (field: string, value: any) => {
    setConfig(prev => ({ ...prev, [field]: value }))
  }

  const updateSocialLink = (id: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      socialLinks: prev.socialLinks.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }))
  }

  const addSocialLink = () => {
    const newLink: SocialLink = {
      id: Date.now().toString(),
      platform: 'Nova Rede',
      url: '',
      icon: 'LinkIcon',
      color: 'hover:text-gray-600',
      enabled: true
    }
    
    setConfig(prev => ({
      ...prev,
      socialLinks: [...prev.socialLinks, newLink]
    }))
  }

  const removeSocialLink = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta rede social?')) {
      setConfig(prev => ({
        ...prev,
        socialLinks: prev.socialLinks.filter(link => link.id !== id)
      }))
    }
  }

  const updateUsefulLink = (id: string, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      usefulLinks: prev.usefulLinks.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    }))
  }

  const addUsefulLink = () => {
    const newLink = {
      id: Date.now().toString(),
      title: 'Novo Link',
      url: '/',
      enabled: true
    }
    
    setConfig(prev => ({
      ...prev,
      usefulLinks: [...prev.usefulLinks, newLink]
    }))
  }

  const removeUsefulLink = (id: string) => {
    if (confirm('Tem certeza que deseja remover este link?')) {
      setConfig(prev => ({
        ...prev,
        usefulLinks: prev.usefulLinks.filter(link => link.id !== id)
      }))
    }
  }

  const getIconComponent = (iconName: string) => {
    const icons = {
      Facebook,
      Twitter,
      Instagram,
      MessageCircle,
      LinkIcon,
      Mail,
      Phone
    }
    const Icon = icons[iconName as keyof typeof icons] || LinkIcon
    return <Icon size={20} />
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações do Site</h1>
          <p className="text-gray-600">Gerencie informações do rodapé, redes sociais e newsletter</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => window.open('/', '_blank')}
            className="btn-outline flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Visualizar Site</span>
          </button>
          <button 
            onClick={saveConfig}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                <span>Salvar Alterações</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2">
          <Check className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2">
          <AlertCircle className="h-5 w-5" />
          <span>{error}</span>
        </div>
      )}

      {/* Site Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 p-2 rounded-lg mr-3">
            <Globe className="h-5 w-5 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Informações do Site</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Site
            </label>
            <input
              type="text"
              value={config.siteName}
              onChange={(e) => updateConfig('siteName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Site
            </label>
            <input
              type="url"
              value={config.siteUrl}
              onChange={(e) => updateConfig('siteUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="lg:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição do Site
            </label>
            <textarea
              rows={3}
              value={config.siteDescription}
              onChange={(e) => updateConfig('siteDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      
      {/* Header Configuration */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <Globe className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Configurações do Cabeçalho</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Texto do Cabeçalho Superior
            </label>
            <input
              type="text"
              value={config.headerText}
              onChange={(e) => updateConfig('headerText', e.target.value)}
              placeholder="Ex: 📍 Últimas notícias em tempo real"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Este texto aparece na barra superior do site, à esquerda das redes sociais
            </p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Preview do Cabeçalho</h4>
            <div className="bg-primary-900 text-white p-3 rounded-lg">
              <div className="flex justify-between items-center">
                <div className="text-sm">
                  {config.headerText || 'Texto do cabeçalho aqui...'}
                </div>
                <div className="flex items-center space-x-3">
                  {config.socialLinks
                    .filter(link => link.enabled)
                    .slice(0, 4)
                    .map((social, index) => (
                      <div key={social.id || index} className="text-white" title={social.platform}>
                        {getIconComponent(social.icon)}
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              As redes sociais do cabeçalho são gerenciadas na seção &quot;Redes Sociais&quot; abaixo (máximo 4)
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <Phone className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Informações de Contato</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-mail de Contato
            </label>
            <input
              type="email"
              value={config.contactEmail}
              onChange={(e) => updateConfig('contactEmail', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telefone de Contato
            </label>
            <input
              type="tel"
              value={config.contactPhone}
              onChange={(e) => updateConfig('contactPhone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Endereço
            </label>
            <input
              type="text"
              value={config.contactAddress}
              onChange={(e) => updateConfig('contactAddress', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Social Media */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-purple-100 p-2 rounded-lg mr-3">
              <MessageCircle className="h-5 w-5 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Redes Sociais</h3>
          </div>
          <button
            onClick={addSocialLink}
            className="btn-outline text-sm flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Rede</span>
          </button>
        </div>

        <div className="space-y-4">
          {config.socialLinks.map((link) => (
            <div key={link.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-shrink-0">
                {getIconComponent(link.icon)}
              </div>
              
              <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) => updateSocialLink(link.id, 'platform', e.target.value)}
                  placeholder="Nome da plataforma"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSocialLink(link.id, 'url', e.target.value)}
                  placeholder="URL da rede social"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  value={link.icon}
                  onChange={(e) => updateSocialLink(link.id, 'icon', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Facebook">Facebook</option>
                  <option value="Twitter">Twitter</option>
                  <option value="Instagram">Instagram</option>
                  <option value="MessageCircle">WhatsApp</option>
                  <option value="LinkIcon">Genérico</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={(e) => updateSocialLink(link.id, 'enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Ativo</span>
                </label>
                <button
                  onClick={() => removeSocialLink(link.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
            <Mail className="h-5 w-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Newsletter</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-center">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={config.newsletterEnabled}
                onChange={(e) => updateConfig('newsletterEnabled', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Habilitar Newsletter</span>
            </label>
          </div>

          {config.newsletterEnabled && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título da Newsletter
                </label>
                <input
                  type="text"
                  value={config.newsletterTitle}
                  onChange={(e) => updateConfig('newsletterTitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descrição da Newsletter
                </label>
                <input
                  type="text"
                  value={config.newsletterDescription}
                  onChange={(e) => updateConfig('newsletterDescription', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-indigo-100 p-2 rounded-lg mr-3">
            <Globe className="h-5 w-5 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Configurações do Rodapé</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição no Rodapé
            </label>
            <textarea
              rows={3}
              value={config.footerDescription}
              onChange={(e) => updateConfig('footerDescription', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Copyright
            </label>
            <input
              type="text"
              value={config.footerCopyright}
              onChange={(e) => updateConfig('footerCopyright', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Useful Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-cyan-100 p-2 rounded-lg mr-3">
              <LinkIcon className="h-5 w-5 text-cyan-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Links Úteis</h3>
          </div>
          <button
            onClick={addUsefulLink}
            className="btn-outline text-sm flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Adicionar Link</span>
          </button>
        </div>

        <div className="space-y-4">
          {config.usefulLinks.map((link) => (
            <div key={link.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={link.title}
                  onChange={(e) => updateUsefulLink(link.id, 'title', e.target.value)}
                  placeholder="Título do link"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <input
                  type="text"
                  value={link.url}
                  onChange={(e) => updateUsefulLink(link.id, 'url', e.target.value)}
                  placeholder="URL do link (ex: /sobre)"
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={link.enabled}
                    onChange={(e) => updateUsefulLink(link.id, 'enabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-600">Ativo</span>
                </label>
                <button
                  onClick={() => removeUsefulLink(link.id)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                  title="Remover"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
