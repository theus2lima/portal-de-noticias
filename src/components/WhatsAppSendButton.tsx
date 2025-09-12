'use client'

import { useState } from 'react'
import { MessageCircle, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { WhatsAppGroupService } from '@/services/whatsappGroupService'
import { useSiteConfig } from '@/hooks/useSiteConfig'

interface WhatsAppSendButtonProps {
  article: {
    id: string
    title: string
    excerpt?: string
    slug: string
    category_name: string
    featured_image?: string
    author_name?: string
    published_at?: string
  }
  variant?: 'default' | 'small' | 'icon-only'
  className?: string
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function WhatsAppSendButton({ 
  article, 
  variant = 'default', 
  className = '',
  onSuccess,
  onError 
}: WhatsAppSendButtonProps) {
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const { config: siteConfig } = useSiteConfig()
  const [whatsappService] = useState(() => WhatsAppGroupService.getInstance())

  const handleSendToWhatsApp = async () => {
    setLoading(true)
    setStatus('idle')

    try {
      const config = whatsappService.getConfig()
      
      if (!config.enabled) {
        throw new Error('Sistema de WhatsApp está desabilitado. Ative nas configurações.')
      }

      // Preparar dados do artigo para envio
      const articleForWhatsApp = {
        id: article.id,
        title: article.title,
        excerpt: article.excerpt || 'Confira esta notícia importante!',
        slug: article.slug,
        category_name: article.category_name,
        featured_image: article.featured_image,
        author_name: article.author_name || 'Radar Noroeste',
        published_at: article.published_at || new Date().toISOString()
      }

      const success = await whatsappService.sendToGroup(articleForWhatsApp, siteConfig.siteUrl)
      
      if (success) {
        setStatus('success')
        onSuccess?.()
        
        // Reset status após 3 segundos
        setTimeout(() => setStatus('idle'), 3000)
      } else {
        throw new Error('Falha ao enviar para WhatsApp')
      }
    } catch (error) {
      console.error('Erro ao enviar para WhatsApp:', error)
      setStatus('error')
      onError?.(error instanceof Error ? error.message : 'Erro desconhecido')
      
      // Reset status após 5 segundos
      setTimeout(() => setStatus('idle'), 5000)
    } finally {
      setLoading(false)
    }
  }

  // Variantes do botão
  const getButtonContent = () => {
    if (loading) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
          {variant !== 'icon-only' && <span>Enviando...</span>}
        </>
      )
    }

    if (status === 'success') {
      return (
        <>
          <CheckCircle className="h-4 w-4" />
          {variant !== 'icon-only' && <span>Enviado!</span>}
        </>
      )
    }

    if (status === 'error') {
      return (
        <>
          <AlertCircle className="h-4 w-4" />
          {variant !== 'icon-only' && <span>Erro</span>}
        </>
      )
    }

    // Estado normal
    if (variant === 'icon-only') {
      return <MessageCircle className="h-4 w-4" />
    }

    return (
      <>
        <MessageCircle className="h-4 w-4" />
        <span>{variant === 'small' ? 'WhatsApp' : 'Enviar para WhatsApp'}</span>
      </>
    )
  }

  const getButtonClasses = () => {
    const baseClasses = "flex items-center space-x-2 transition-all duration-200 disabled:cursor-not-allowed"
    
    let sizeClasses = ""
    let colorClasses = ""

    // Classes de tamanho baseadas na variante
    switch (variant) {
      case 'small':
        sizeClasses = "px-3 py-1.5 text-sm rounded-md"
        break
      case 'icon-only':
        sizeClasses = "p-2 rounded-lg"
        break
      default:
        sizeClasses = "px-4 py-2 rounded-lg"
    }

    // Classes de cor baseadas no status
    if (status === 'success') {
      colorClasses = "bg-green-600 hover:bg-green-700 text-white"
    } else if (status === 'error') {
      colorClasses = "bg-red-600 hover:bg-red-700 text-white"
    } else {
      colorClasses = "bg-green-600 hover:bg-green-700 text-white disabled:opacity-50"
    }

    return `${baseClasses} ${sizeClasses} ${colorClasses} ${className}`
  }

  return (
    <button
      onClick={handleSendToWhatsApp}
      disabled={loading}
      className={getButtonClasses()}
      title={variant === 'icon-only' ? 'Enviar para WhatsApp' : undefined}
    >
      {getButtonContent()}
    </button>
  )
}
