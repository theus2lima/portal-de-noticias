'use client'

import { useState, useEffect } from 'react'
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

export default function WhatsAppPopup() {
  const [showPopup, setShowPopup] = useState(false)
  const [settings, setSettings] = useState<WhatsAppSettings | null>(null)
  const [isScrollTriggered, setIsScrollTriggered] = useState(false)

  // Buscar configurações
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/whatsapp-settings')
      const result = await response.json()
      
      if (response.ok && result.success) {
        setSettings(result.data)
      }
    } catch (error) {
      console.error('Erro ao buscar configurações do WhatsApp:', error)
    }
  }


  // Função para exibir o popup
  const triggerPopup = () => {
    if (settings?.isActive) {
      setShowPopup(true)
    }
  }

  // Manipular scroll
  const handleScroll = () => {
    if (settings?.triggerType === 'scroll' && !isScrollTriggered) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
      const scrollPercentage = (scrollTop / scrollHeight) * 100

      if (scrollPercentage >= (settings.scrollPercentage || 50)) {
        setIsScrollTriggered(true)
        triggerPopup()
      }
    }
  }

  // Abrir link do WhatsApp
  const openWhatsApp = () => {
    if (settings?.groupLink) {
      window.open(settings.groupLink, '_blank')
    }
  }

  // Configurar triggers
  useEffect(() => {
    if (!settings) return

    if (settings.triggerType === 'time') {
      const timer = setTimeout(() => {
        triggerPopup()
      }, (settings.delaySeconds || 5) * 1000)

      return () => clearTimeout(timer)
    } else if (settings.triggerType === 'scroll') {
      window.addEventListener('scroll', handleScroll, { passive: true })
      return () => window.removeEventListener('scroll', handleScroll)
    }
  }, [settings, isScrollTriggered])

  // Buscar configurações na inicialização
  useEffect(() => {
    fetchSettings()
  }, [])

  // Não renderizar se inativo ou sem configurações
  if (!settings?.isActive || !settings?.groupLink || !showPopup) {
    return null
  }

  return (
    <>
      {/* Popup */}
      <div className="fixed bottom-4 left-4 w-48 sm:w-52 z-50 animate-in slide-in-from-left-5 duration-300">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-md shadow-xl p-2.5 relative overflow-hidden">
          {/* Padrão de fundo sutil */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/10 pointer-events-none" />

          {/* Conteúdo */}
          <div className="flex items-start space-x-1.5 relative">
            {/* Ícone do WhatsApp */}
            <div className="flex-shrink-0 bg-white/20 rounded-full p-1 backdrop-blur-sm">
              <WhatsAppIcon size={20} className="text-white" />
            </div>

            {/* Texto e botão */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-1 mb-1">
                <span className="text-xs font-bold uppercase tracking-wide bg-white/20 px-1 py-0.5 rounded text-[10px]">
                  PARTICIPE
                </span>
              </div>
              
              <p className="text-xs leading-tight mb-1.5 pr-1 line-clamp-2">
                {settings.popupText}
              </p>

              <button
                onClick={openWhatsApp}
                className="bg-white text-green-600 font-medium text-xs px-2 py-1 rounded hover:bg-green-50 transition-all duration-200 shadow-sm hover:shadow-md w-full flex items-center justify-center space-x-1"
              >
                <WhatsAppIcon size={12} className="text-green-600" />
                <span className="text-[11px]">Entrar no Grupo</span>
              </button>
            </div>
          </div>

          {/* Indicador visual */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-green-300 to-green-400" />
        </div>

        {/* Pequena sombra adicional */}
        <div className="absolute inset-0 bg-green-600 rounded-lg -z-10 transform translate-y-1 blur-sm opacity-30" />
      </div>
    </>
  )
}
