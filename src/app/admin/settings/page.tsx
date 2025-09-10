'use client'

import { useState } from 'react'
import Image from 'next/image'
import { 
  Settings, 
  Globe, 
  Mail, 
  Shield, 
  Database,
  Palette,
  Bell,
  Save,
  RefreshCw,
  Eye,
  Lock,
  Upload,
  Check,
  Trash2
} from 'lucide-react'
import TickerNewsManager from '@/components/admin/TickerNewsManager'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteName: 'Portal de Notícias',
    siteDescription: 'Seu portal de notícias mais confiável',
    siteUrl: 'https://portal-noticias.com',
    logo: null as string | null,
    adminEmail: 'admin@portal-noticias.com',
    contactEmail: 'contato@portal-noticias.com',
    smtpServer: 'smtp.gmail.com',
    smtpPort: 587,
    encryption: 'tls',
    twoFactorAuth: false,
    googleLogin: true,
    captcha: true,
    sessionTimeout: 120,
    articlesPerPage: '15',
    allowComments: true,
    moderateComments: true,
    newsletter: true,
    colorScheme: 'default',
    font: 'Inter (Atual)',
    darkMode: false,
    animations: true,
    emailNewArticles: true,
    emailNewComments: true,
    emailNewLeads: true,
    pushSystemUpdates: false,
    pushWeeklyReports: true,
    pushSecurityAlerts: true
  })
  
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [logoUploading, setLogoUploading] = useState(false)
  
  const handleInputChange = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }
  
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione apenas arquivos de imagem')
      return
    }
    
    // Validar tamanho (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 5MB')
      return
    }
    
    setLogoUploading(true)
    setError('')
    
    try {
      // Simular upload
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Converter para base64 para preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        handleInputChange('logo', result)
        setSuccess('Logo alterado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      }
      reader.readAsDataURL(file)
      
    } catch (err) {
      setError('Erro ao fazer upload da imagem')
    } finally {
      setLogoUploading(false)
    }
  }
  
  const triggerLogoUpload = () => {
    const fileInput = document.getElementById('logo-upload') as HTMLInputElement
    fileInput?.click()
  }
  
  const removeLogo = () => {
    if (confirm('Tem certeza que deseja remover o logo?')) {
      handleInputChange('logo', null)
      setSuccess('Logo removido com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }
  
  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')
    
    try {
      // Simular salvamento
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSuccess('Configurações salvas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Erro ao salvar configurações')
    } finally {
      setLoading(false)
    }
  }
  
  const handleReset = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão?')) {
      setSettings({
        siteName: 'Portal de Notícias',
        siteDescription: 'Seu portal de notícias mais confiável',
        siteUrl: 'https://portal-noticias.com',
        logo: null,
        adminEmail: 'admin@portal-noticias.com',
        contactEmail: 'contato@portal-noticias.com',
        smtpServer: 'smtp.gmail.com',
        smtpPort: 587,
        encryption: 'tls',
        twoFactorAuth: false,
        googleLogin: true,
        captcha: true,
        sessionTimeout: 120,
        articlesPerPage: '15',
        allowComments: true,
        moderateComments: true,
        newsletter: true,
        colorScheme: 'default',
        font: 'Inter (Atual)',
        darkMode: false,
        animations: true,
        emailNewArticles: true,
        emailNewComments: true,
        emailNewLeads: true,
        pushSystemUpdates: false,
        pushWeeklyReports: true,
        pushSecurityAlerts: true
      })
      setSuccess('Configurações restauradas!')
      setTimeout(() => setSuccess(''), 3000)
    }
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Configurações</h1>
          <p className="text-neutral-600">Gerencie as configurações do portal</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={loading}
          className="btn-primary flex items-center space-x-2 disabled:bg-neutral-400"
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

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2">
          <Check className="h-5 w-5" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Settings Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-primary-100 p-2 rounded-lg mr-3">
              <Globe className="h-5 w-5 text-primary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Configurações do Site</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Nome do Portal
              </label>
              <input
                type="text"
                defaultValue="Portal de Notícias"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                defaultValue="Seu portal de notícias mais confiável"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                URL do Site
              </label>
              <input
                type="url"
                defaultValue="https://portal-noticias.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Logotipo
              </label>
              <div className="space-y-3">
                {/* Preview do Logo */}
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-16 bg-neutral-200 rounded-lg flex items-center justify-center overflow-hidden">
                    {settings.logo ? (
                      <Image 
                        src={settings.logo} 
                        alt="Logo" 
                        width={64}
                        height={64}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Globe className="h-8 w-8 text-neutral-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-600">
                      {settings.logo ? 'Logo atual' : 'Nenhum logo definido'}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Recomendado: PNG ou JPG, máx. 5MB
                    </p>
                  </div>
                </div>
                
                {/* Botões de Ação */}
                <div className="flex items-center space-x-2">
                  <button 
                    type="button"
                    onClick={triggerLogoUpload}
                    disabled={logoUploading}
                    className="btn-outline text-sm flex items-center space-x-2 disabled:opacity-50"
                  >
                    {logoUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                        <span>Carregando...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4" />
                        <span>{settings.logo ? 'Alterar Logo' : 'Adicionar Logo'}</span>
                      </>
                    )}
                  </button>
                  
                  {settings.logo && (
                    <button 
                      type="button"
                      onClick={removeLogo}
                      disabled={logoUploading}
                      className="btn-outline text-sm text-red-600 hover:text-red-700 hover:border-red-300 flex items-center space-x-2 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Remover</span>
                    </button>
                  )}
                </div>
                
                {/* Input de arquivo (oculto) */}
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Email Configuration */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-accent-100 p-2 rounded-lg mr-3">
              <Mail className="h-5 w-5 text-accent-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Configurações de Email</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email do Administrador
              </label>
              <input
                type="email"
                defaultValue="admin@portal-noticias.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email de Contato
              </label>
              <input
                type="email"
                defaultValue="contato@portal-noticias.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Servidor SMTP
              </label>
              <input
                type="text"
                defaultValue="smtp.gmail.com"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Porta
                </label>
                <input
                  type="number"
                  defaultValue="587"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Criptografia
                </label>
                <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-red-100 p-2 rounded-lg mr-3">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Configurações de Segurança</h3>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Autenticação em Duas Etapas</h4>
                <p className="text-sm text-neutral-500">Adiciona uma camada extra de segurança</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Login com Google</h4>
                <p className="text-sm text-neutral-500">Permitir login com contas Google</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Captcha em Formulários</h4>
                <p className="text-sm text-neutral-500">Proteção contra spam e bots</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sessão expira em (minutos)
              </label>
              <input
                type="number"
                defaultValue="120"
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>
          </div>
        </div>

        {/* Content Settings */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center mb-6">
            <div className="bg-secondary-100 p-2 rounded-lg mr-3">
              <Database className="h-5 w-5 text-secondary-600" />
            </div>
            <h3 className="text-lg font-semibold text-neutral-900">Configurações de Conteúdo</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Artigos por página
              </label>
              <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option value="10">10 artigos</option>
                <option value="15" selected>15 artigos</option>
                <option value="20">20 artigos</option>
                <option value="25">25 artigos</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Comentários</h4>
                <p className="text-sm text-neutral-500">Permitir comentários nos artigos</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Moderação</h4>
                <p className="text-sm text-neutral-500">Aprovar comentários antes de publicar</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Newsletter</h4>
                <p className="text-sm text-neutral-500">Sistema de newsletter ativo</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-2 rounded-lg mr-3">
            <Palette className="h-5 w-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Aparência e Tema</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Esquema de Cores
              </label>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center space-x-2 p-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <div className="w-4 h-4 bg-primary-500 rounded-full"></div>
                  <span className="text-sm">Padrão</span>
                </div>
                <div className="flex items-center space-x-2 p-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-sm">Azul</span>
                </div>
                <div className="flex items-center space-x-2 p-2 border border-neutral-300 rounded-lg cursor-pointer hover:bg-neutral-50">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-sm">Verde</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Fonte Principal
              </label>
              <select className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
                <option>Inter (Atual)</option>
                <option>Roboto</option>
                <option>Open Sans</option>
                <option>Poppins</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Modo Escuro</h4>
                <p className="text-sm text-neutral-500">Tema escuro para o admin</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Animações</h4>
                <p className="text-sm text-neutral-500">Ativar animações na interface</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Ticker News Manager */}
      <TickerNewsManager />

      {/* Notification Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-yellow-100 p-2 rounded-lg mr-3">
            <Bell className="h-5 w-5 text-yellow-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Notificações</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h4 className="font-medium text-neutral-900">Notificações por Email</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Novos artigos publicados</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Novos comentários</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Novos leads</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-neutral-900">Notificações Push</h4>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Atualizações do sistema</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Relatórios semanais</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-neutral-700">Alertas de segurança</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between p-6 bg-neutral-50 rounded-xl">
        <div className="flex items-center space-x-4">
          <button 
            onClick={handleReset}
            disabled={loading}
            className="btn-outline flex items-center space-x-2 disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Restaurar Padrões</span>
          </button>
          <button 
            onClick={() => alert('Pré-visualização em desenvolvimento')}
            className="btn-outline flex items-center space-x-2"
          >
            <Eye className="h-4 w-4" />
            <span>Pré-visualizar</span>
          </button>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => window.history.back()}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave}
            disabled={loading}
            className="btn-primary flex items-center space-x-2 disabled:bg-neutral-400"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Salvando...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Salvar Configurações</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
