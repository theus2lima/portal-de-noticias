'use client'

import { 
  MessageCircle, 
  Clock, 
  MousePointer, 
  Eye, 
  EyeOff, 
  Save, 
  TestTube,
  Link as LinkIcon,
  Settings,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import WhatsAppIcon from '@/components/icons/WhatsAppIcon'

interface WhatsAppSettings {
  id: string
  isActive: boolean
  groupLink: string
  popupText: string
  triggerType: 'time' | 'scroll'
  delaySeconds: number
  scrollPercentage: number
  updatedAt: string
}

export default function WhatsAppSettingsPage() {
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  
  const [formData, setFormData] = useState({
    isActive: false,
    groupLink: '',
    popupText: 'Entre no nosso grupo do WhatsApp para receber notícias em primeira mão!',
    triggerType: 'time' as 'time' | 'scroll',
    delaySeconds: 5,
    scrollPercentage: 50
  })

  // Buscar configurações
  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/whatsapp-settings')
      const result = await response.json()
      
      if (response.ok && result.success) {
        const settingsData = result.data
        setSettings(settingsData)
        setFormData({
          isActive: settingsData.isActive,
          groupLink: settingsData.groupLink,
          popupText: settingsData.popupText,
          triggerType: settingsData.triggerType,
          delaySeconds: settingsData.delaySeconds,
          scrollPercentage: settingsData.scrollPercentage
        })
      } else {
        toast.error('Erro ao carregar configurações')
      }
    } catch (error) {
      console.error('Erro ao buscar configurações:', error)
      toast.error('Erro ao carregar configurações')
    } finally {
      setLoading(false)
    }
  }

  // Salvar configurações
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.isActive && !formData.groupLink.trim()) {
      toast.error('Link do grupo é obrigatório quando ativo')
      return
    }

    if (!formData.popupText.trim()) {
      toast.error('Texto do popup é obrigatório')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/whatsapp-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        toast.success('Configurações salvas com sucesso!')
        setSettings(result.data)
      } else {
        toast.error(result.error || 'Erro ao salvar configurações')
      }
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      toast.error('Erro ao salvar configurações')
    } finally {
      setSaving(false)
    }
  }

  // Validar link do WhatsApp
  const isValidWhatsAppLink = (link: string) => {
    return link.includes('chat.whatsapp.com') || link.includes('wa.me')
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-neutral-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 animate-pulse">
          <div className="space-y-4">
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-10 bg-neutral-200 rounded"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
            <div className="h-20 bg-neutral-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900 flex items-center">
            <WhatsAppIcon size={32} className="text-green-600 mr-3" />
            WhatsApp
          </h1>
          <p className="text-neutral-600">Configure o popup de convite para o grupo do WhatsApp</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="btn-secondary flex items-center space-x-2"
          >
            <TestTube className="h-4 w-4" />
            <span>Prévia</span>
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-3 ${formData.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <div>
              <h3 className="font-semibold text-neutral-900">
                Status: {formData.isActive ? 'Ativo' : 'Inativo'}
              </h3>
              <p className="text-sm text-neutral-600">
                {formData.isActive 
                  ? 'O popup está sendo exibido no site público'
                  : 'O popup está desativado'
                }
              </p>
            </div>
          </div>
          {formData.isActive && (
            <CheckCircle className="h-8 w-8 text-green-600" />
          )}
        </div>
      </div>

      {/* Configurações */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* Ativação */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-4 flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Configurações Gerais
          </h2>
          
          <div className="space-y-4">
            <label className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="w-5 h-5 text-green-600 border-neutral-300 rounded focus:ring-green-500"
              />
              <div>
                <span className="text-sm font-medium text-neutral-700">Ativar popup do WhatsApp</span>
                <p className="text-xs text-neutral-500">O popup será exibido para os visitantes do site</p>
              </div>
            </label>
          </div>
        </div>

        {/* Link do Grupo */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4 flex items-center">
            <LinkIcon className="h-5 w-5 mr-2" />
            Link do Grupo
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Link do WhatsApp *
              </label>
              <input
                type="url"
                value={formData.groupLink}
                onChange={(e) => setFormData({ ...formData, groupLink: e.target.value })}
                placeholder="https://chat.whatsapp.com/..."
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  formData.groupLink && !isValidWhatsAppLink(formData.groupLink)
                    ? 'border-red-300 bg-red-50'
                    : 'border-neutral-300'
                }`}
              />
              {formData.groupLink && !isValidWhatsAppLink(formData.groupLink) && (
                <p className="text-sm text-red-600 mt-1 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Link deve ser do WhatsApp (chat.whatsapp.com ou wa.me)
                </p>
              )}
              <p className="text-xs text-neutral-500 mt-1">
                Cole o link de convite do seu grupo do WhatsApp
              </p>
            </div>
          </div>
        </div>

        {/* Texto do Popup */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Mensagem do Popup
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-2">
                Texto da chamada *
              </label>
              <textarea
                value={formData.popupText}
                onChange={(e) => setFormData({ ...formData, popupText: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                placeholder="Digite a mensagem que aparecerá no popup"
              />
              <p className="text-xs text-neutral-500 mt-1">
                {formData.popupText.length}/200 caracteres
              </p>
            </div>
          </div>
        </div>

        {/* Configurações de Exibição */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            Quando Exibir o Popup
          </h3>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="triggerType"
                  value="time"
                  checked={formData.triggerType === 'time'}
                  onChange={(e) => setFormData({ ...formData, triggerType: e.target.value as 'time' })}
                  className="w-4 h-4 text-green-600 border-neutral-300 focus:ring-green-500"
                />
                <Clock className="h-5 w-5 text-neutral-600" />
                <span className="text-sm font-medium text-neutral-700">Após um tempo na página</span>
              </label>
              
              {formData.triggerType === 'time' && (
                <div className="ml-10">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Delay em segundos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.delaySeconds}
                    onChange={(e) => setFormData({ ...formData, delaySeconds: parseInt(e.target.value) || 5 })}
                    className="w-32 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <p className="text-xs text-neutral-500 mt-1">Entre 1 e 60 segundos</p>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="triggerType"
                  value="scroll"
                  checked={formData.triggerType === 'scroll'}
                  onChange={(e) => setFormData({ ...formData, triggerType: e.target.value as 'scroll' })}
                  className="w-4 h-4 text-green-600 border-neutral-300 focus:ring-green-500"
                />
                <MousePointer className="h-5 w-5 text-neutral-600" />
                <span className="text-sm font-medium text-neutral-700">Ao rolar a página</span>
              </label>
              
              {formData.triggerType === 'scroll' && (
                <div className="ml-10">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Porcentagem de scroll
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="100"
                    value={formData.scrollPercentage}
                    onChange={(e) => setFormData({ ...formData, scrollPercentage: parseInt(e.target.value) || 50 })}
                    className="w-32 px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <span className="ml-2 text-sm text-neutral-600">%</span>
                  <p className="text-xs text-neutral-500 mt-1">Entre 10% e 100%</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botão Salvar */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="btn-primary flex items-center space-x-2"
          >
            {saving ? (
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
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-sm w-full shadow-lg">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">Prévia do Popup</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="text-neutral-400 hover:text-neutral-600"
                >
                  ×
                </button>
              </div>
              
              {/* Popup Preview */}
              <div className="bg-green-600 text-white p-4 rounded-lg shadow-lg">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 bg-white/20 rounded-full p-2 backdrop-blur-sm mt-1">
                    <WhatsAppIcon size={32} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium mb-2">PARTICIPE</p>
                    <p className="text-sm mb-3">{formData.popupText}</p>
                    <button className="bg-white text-green-600 px-4 py-2 rounded-lg text-sm font-medium w-full flex items-center justify-center space-x-2">
                      <WhatsAppIcon size={16} className="text-green-600" />
                      <span>Entrar no Grupo</span>
                    </button>
                  </div>
                  <button className="text-white hover:text-green-200">
                    ×
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
