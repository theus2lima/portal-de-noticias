'use client'

import { useState, useEffect } from 'react'
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
  Trash2,
  MessageCircle,
  ExternalLink,
  Copy,
  Sparkles,
  Download,
  FileUp,
  TestTube,
  AlertCircle
} from 'lucide-react'
import TickerNewsManager from '@/components/admin/TickerNewsManager'
import { useTheme, type ColorScheme, type FontFamily } from '@/hooks/useTheme'
import { useSystemSettings } from '@/hooks/useSystemSettings'

export default function SettingsPage() {
  const { theme, updateTheme, resetTheme, colorSchemes, loading: themeLoading } = useTheme()
  const {
    settings,
    loading: systemLoading,
    saving,
    lastSaved,
    updateSettings,
    resetSettings,
    testEmailSettings,
    exportSettings,
    importSettings
  } = useSystemSettings()
  
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [emailTestResult, setEmailTestResult] = useState<{ success: boolean, message: string } | null>(null)
  const [logoUploading, setLogoUploading] = useState(false)
  const [whatsappLink, setWhatsappLink] = useState('https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L')
  const [whatsappLinkLoading, setWhatsappLinkLoading] = useState(false)
  
  const handleInputChange = async (field: string, value: any) => {
    try {
      await updateSettings({ [field]: value })
      setSuccess(`${field} atualizado com sucesso!`)
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(`Erro ao atualizar ${field}`)
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleBulkUpdate = async (updates: Record<string, any>) => {
    try {
      await updateSettings(updates)
      setSuccess('Configurações atualizadas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Erro ao atualizar configurações')
      setTimeout(() => setError(''), 3000)
    }
  }

  // Carregar link do WhatsApp
  useEffect(() => {
    const fetchWhatsAppLink = async () => {
      try {
        const response = await fetch('/api/settings/whatsapp-lead-link')
        const result = await response.json()
        if (result.success && result.data?.whatsapp_lead_link) {
          setWhatsappLink(result.data.whatsapp_lead_link)
        }
      } catch (error) {
        console.error('Erro ao carregar link do WhatsApp:', error)
      }
    }
    fetchWhatsAppLink()
  }, [])

  // Salvar link do WhatsApp
  const handleSaveWhatsAppLink = async () => {
    if (!whatsappLink.trim()) {
      setError('Link do WhatsApp é obrigatório')
      return
    }

    setWhatsappLinkLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/settings/whatsapp-lead-link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsapp_lead_link: whatsappLink }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setSuccess('Link do WhatsApp atualizado com sucesso!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(result.error || 'Erro ao salvar link do WhatsApp')
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setError('Erro ao salvar link do WhatsApp')
    } finally {
      setWhatsappLinkLoading(false)
    }
  }

  // Testar link do WhatsApp
  const handleTestWhatsAppLink = () => {
    if (whatsappLink.trim()) {
      window.open(whatsappLink, '_blank')
    }
  }

  // Copiar link do WhatsApp
  const handleCopyWhatsAppLink = async () => {
    try {
      await navigator.clipboard.writeText(whatsappLink)
      setSuccess('Link copiado para área de transferência!')
      setTimeout(() => setSuccess(''), 2000)
    } catch (error) {
      setError('Erro ao copiar link')
    }
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
  
  const handleTestEmail = async () => {
    try {
      setEmailTestResult(null)
      const result = await testEmailSettings()
      setEmailTestResult(result)
      setTimeout(() => setEmailTestResult(null), 5000)
    } catch (error) {
      setEmailTestResult({
        success: false,
        message: 'Erro ao testar configurações de email'
      })
    }
  }

  const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      await importSettings(file)
      setSuccess('Configurações importadas com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError('Erro ao importar configurações')
      setTimeout(() => setError(''), 3000)
    }

    // Reset file input
    event.target.value = ''
  }
  
  const handleReset = async () => {
    if (confirm('Tem certeza que deseja restaurar as configurações padrão? Esta ação não pode ser desfeita.')) {
      try {
        await resetSettings()
        setSuccess('Configurações restauradas para o padrão!')
        setTimeout(() => setSuccess(''), 3000)
      } catch (error) {
        setError('Erro ao restaurar configurações')
        setTimeout(() => setError(''), 3000)
      }
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
        <div className="flex items-center space-x-4">
          {/* Indicador de última salvamento */}
          {lastSaved && (
            <div className="text-sm text-neutral-500">
              Última salvamento: {lastSaved.toLocaleTimeString()}
            </div>
          )}
          
          {/* Botões de ação */}
          <div className="flex space-x-2">
            <button
              onClick={exportSettings}
              className="btn-outline text-sm flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </button>
            
            <input
              type="file"
              accept=".json"
              onChange={handleFileImport}
              className="hidden"
              id="import-settings"
            />
            <button
              onClick={() => document.getElementById('import-settings')?.click()}
              className="btn-outline text-sm flex items-center space-x-2"
            >
              <FileUp className="h-4 w-4" />
              <span>Importar</span>
            </button>
          </div>
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
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* WhatsApp Lead Settings - Full Width */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900">Configurações do WhatsApp para Leads</h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Link do Grupo/Chat do WhatsApp
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="url"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyWhatsAppLink}
                className="btn-outline text-sm flex items-center space-x-1 px-3 py-2"
                title="Copiar link"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleTestWhatsAppLink}
                className="btn-outline text-sm flex items-center space-x-1 px-3 py-2"
                title="Testar link"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSaveWhatsAppLink}
                disabled={whatsappLinkLoading}
                className="btn-primary text-sm flex items-center space-x-2 px-4 py-2 disabled:opacity-50"
              >
                {whatsappLinkLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-neutral-500 mt-1">
              Este link será usado para redirecionar usuários após se cadastrarem no formulário de leads. 
              Aceita links do WhatsApp como: <code className="bg-neutral-100 px-1 rounded">https://chat.whatsapp.com/...</code> ou <code className="bg-neutral-100 px-1 rounded">https://wa.me/...</code>
            </p>
          </div>

          <div className="bg-neutral-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-neutral-900 mb-2">Como funciona:</h4>
            <ul className="text-sm text-neutral-600 space-y-1">
              <li>• Quando um usuário preenche o formulário de captação de leads</li>
              <li>• Após o cadastro bem-sucedido, ele é redirecionado automaticamente para este WhatsApp</li>
              <li>• Você pode alterar este link a qualquer momento para direcionar para diferentes grupos ou conversas</li>
            </ul>
          </div>
        </div>
      </div>

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
                value={settings.siteName}
                onChange={(e) => handleInputChange('siteName', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Descrição
              </label>
              <textarea
                rows={3}
                value={settings.siteDescription}
                onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                URL do Site
              </label>
              <input
                type="url"
                value={settings.siteUrl}
                onChange={(e) => handleInputChange('siteUrl', e.target.value)}
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
                value={settings.adminEmail}
                onChange={(e) => handleInputChange('adminEmail', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Email de Contato
              </label>
              <input
                type="email"
                value={settings.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Servidor SMTP
              </label>
              <input
                type="text"
                value={settings.smtpServer}
                onChange={(e) => handleInputChange('smtpServer', e.target.value)}
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
                  value={settings.smtpPort}
                  onChange={(e) => handleInputChange('smtpPort', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Criptografia
                </label>
                <select 
                  value={settings.encryption}
                  onChange={(e) => handleInputChange('encryption', e.target.value)}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="tls">TLS</option>
                  <option value="ssl">SSL</option>
                  <option value="none">Nenhuma</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Usuário SMTP
                </label>
                <input
                  type="text"
                  value={settings.smtpUsername}
                  onChange={(e) => handleInputChange('smtpUsername', e.target.value)}
                  placeholder="Seu usuário SMTP"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Senha SMTP
                </label>
                <input
                  type="password"
                  value={settings.smtpPassword}
                  onChange={(e) => handleInputChange('smtpPassword', e.target.value)}
                  placeholder="Sua senha SMTP"
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            
            {/* Botão de teste de email */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={handleTestEmail}
                disabled={saving}
                className="w-full btn-outline text-sm flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                    <span>Testando...</span>
                  </>
                ) : (
                  <>
                    <TestTube className="h-4 w-4" />
                    <span>Testar Configurações de Email</span>
                  </>
                )}
              </button>
              
              {/* Resultado do teste */}
              {emailTestResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  emailTestResult.success 
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'bg-red-50 border border-red-200 text-red-700'
                }`}>
                  <div className="flex items-center space-x-2">
                    {emailTestResult.success ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    <span>{emailTestResult.message}</span>
                  </div>
                </div>
              )}
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
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.twoFactorAuth}
                  onChange={(e) => handleInputChange('twoFactorAuth', e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Login com Google</h4>
                <p className="text-sm text-neutral-500">Permitir login com contas Google</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.googleLogin}
                  onChange={(e) => handleInputChange('googleLogin', e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Captcha em Formulários</h4>
                <p className="text-sm text-neutral-500">Proteção contra spam e bots</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={settings.captcha}
                  onChange={(e) => handleInputChange('captcha', e.target.checked)}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Sessão expira em (minutos)
              </label>
              <input
                type="number"
                value={settings.sessionTimeout}
                onChange={(e) => handleInputChange('sessionTimeout', parseInt(e.target.value))}
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
              <select 
                value={settings.articlesPerPage}
                onChange={(e) => handleInputChange('articlesPerPage', parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value={10}>10 artigos</option>
                <option value={15}>15 artigos</option>
                <option value={20}>20 artigos</option>
                <option value={25}>25 artigos</option>
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
              <label className="block text-sm font-medium text-neutral-700 mb-3">
                Esquema de Cores
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                {Object.entries(colorSchemes).map(([key, colors]) => {
                  const colorKey = key as ColorScheme
                  const isActive = theme.colorScheme === colorKey
                  
                  const colorNames = {
                    default: 'Padrão',
                    blue: 'Azul',
                    green: 'Verde',
                    purple: 'Roxo',
                    orange: 'Laranja'
                  }
                  
                  return (
                    <div
                      key={colorKey}
                      onClick={() => updateTheme({ colorScheme: colorKey })}
                      className={`relative flex items-center space-x-2 p-3 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                        isActive 
                          ? 'border-primary-500 bg-primary-50 shadow-md' 
                          : 'border-neutral-300 hover:border-neutral-400 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center space-x-1">
                        <div 
                          className="w-4 h-4 rounded-full border border-white shadow-sm" 
                          style={{ backgroundColor: `rgb(${colors.primary[500]})` }}
                        ></div>
                        <div 
                          className="w-3 h-3 rounded-full border border-white shadow-sm" 
                          style={{ backgroundColor: `rgb(${colors.secondary[500]})` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{colorNames[colorKey]}</span>
                      {isActive && (
                        <div className="absolute top-1 right-1">
                          <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Fonte Principal
              </label>
              <select 
                value={theme.fontFamily}
                onChange={(e) => updateTheme({ fontFamily: e.target.value as FontFamily })}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="inter">Inter</option>
                <option value="roboto">Roboto</option>
                <option value="opensans">Open Sans</option>
                <option value="poppins">Poppins</option>
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
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={theme.darkMode}
                  onChange={(e) => updateTheme({ darkMode: e.target.checked })}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-neutral-900">Animações</h4>
                <p className="text-sm text-neutral-500">Ativar animações na interface</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={theme.animations}
                  onChange={(e) => updateTheme({ animations: e.target.checked })}
                />
                <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
              </label>
            </div>
            
            {/* Preview do Tema */}
            <div className="mt-6 p-4 bg-neutral-50 rounded-lg">
              <h4 className="text-sm font-medium text-neutral-900 mb-3 flex items-center">
                <Sparkles className="h-4 w-4 mr-2" />
                Preview do Tema
              </h4>
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                    <div className="w-4 h-4 bg-white rounded opacity-80"></div>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-primary-200 rounded mb-1"></div>
                    <div className="h-2 bg-neutral-200 rounded w-2/3"></div>
                  </div>
                  <button className="px-3 py-1 bg-secondary-500 text-white text-xs rounded-md">
                    Botão
                  </button>
                </div>
                <div className="text-xs text-neutral-500">
                  Fonte: {theme.fontFamily.charAt(0).toUpperCase() + theme.fontFamily.slice(1)} | 
                  Esquema: {theme.colorScheme.charAt(0).toUpperCase() + theme.colorScheme.slice(1)}
                </div>
              </div>
            </div>
            
            {/* Botão para resetar tema */}
            <div className="pt-4 border-t border-neutral-200">
              <button
                onClick={resetTheme}
                className="w-full btn-outline text-sm flex items-center justify-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Restaurar Tema Padrão</span>
              </button>
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
            disabled={saving || systemLoading}
            className="btn-outline flex items-center space-x-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>Resetando...</span>
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4" />
                <span>Restaurar Padrões</span>
              </>
            )}
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
          <div className="text-sm text-neutral-600">
            {saving ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                <span>Salvando automaticamente...</span>
              </div>
            ) : lastSaved ? (
              <span className="text-green-600">✓ Configurações salvas automaticamente</span>
            ) : (
              <span>Configurações serão salvas automaticamente</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
