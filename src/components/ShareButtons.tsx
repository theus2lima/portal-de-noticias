'use client'

import { MessageCircle, Share, Instagram, Hash } from 'lucide-react'
import { useState } from 'react'
import { generateWhatsAppShareURL, getCategoryEmoji } from '@/config/whatsapp-categories'

interface ShareButtonsProps {
  url: string
  title: string
  articleId: string
  excerpt?: string
  categoryName?: string
  className?: string
  featuredImage?: string
  imageAlt?: string
}

// Ícones customizados para as redes sociais
const WhatsAppIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.894 3.690" />
  </svg>
)

const XIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
  </svg>
)

const ThreadsIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-.542-1.94-1.548-3.456-2.987-4.51C16.123 2.856 14.226 2.32 12.199 2.306h-.01c-2.777.014-4.673.55-5.64 1.595-.906 1.004-1.567 2.394-1.589 4.108v.017c.022 1.717.683 3.104 1.589 4.108.967 1.044 2.863 1.58 5.64 1.595h.01c1.692-.01 3.096-.4 4.026-1.086.675-.498 1.183-1.183 1.462-2.025-.578-.468-1.27-.785-2.064-.929-.526.168-1.111.252-1.735.252-2.135 0-3.654-1.379-3.654-3.317 0-1.938 1.519-3.317 3.654-3.317.648 0 1.235.176 1.735.504.26.17.484.375.672.608.24.299.425.638.544.997.13.395.198.815.198 1.208 0 2.979-1.993 5.113-4.666 5.113-.914 0-1.681-.363-2.225-1.051-.47-.594-.728-1.381-.728-2.22 0-1.19.537-2.08 1.295-2.635.758-.555 1.759-.834 2.917-.834.648 0 1.297.123 1.888.35.592.228 1.117.543 1.529.915.516.467.912 1.048 1.161 1.698.249.65.374 1.36.374 2.085 0 1.45-.318 2.72-.937 3.748-.62 1.028-1.524 1.816-2.668 2.324-1.144.508-2.53.762-4.098.762zM10.065 11.711c0 .619.275 1.186.768 1.556.493.37 1.166.555 1.847.555 1.319 0 2.403-.485 3.147-1.406.743-.92 1.128-2.186 1.128-3.718 0-.619-.123-1.205-.356-1.718-.233-.513-.575-.951-1.009-1.288-.434-.337-.963-.506-1.557-.506-1.319 0-2.403.485-3.147 1.406C10.443 8.512 10.065 9.9 10.065 11.711z"/>
  </svg>
)

const InstagramIcon = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
  </svg>
)

export default function ShareButtons({ url, title, articleId, excerpt = '', categoryName = '', className = "", featuredImage, imageAlt }: ShareButtonsProps) {
  const [isSharing, setIsSharing] = useState<string | null>(null)

  // Função para registrar compartilhamento com dados da categoria
  const trackShare = async (platform: string) => {
    try {
      await fetch(`/api/articles/${articleId}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          platform,
          category: categoryName,
          timestamp: new Date().toISOString(),
          // Dados adicionais para análise
          metadata: {
            hasExcerpt: !!excerpt,
            titleLength: title.length,
            categoryEmoji: getCategoryEmoji(categoryName)
          }
        }),
      })
    } catch (error) {
      console.log('Erro ao registrar compartilhamento:', error)
      // Continuar sem falhar - apenas log
    }
  }

  // Função para detectar se está em mobile
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.navigator && window.navigator.maxTouchPoints > 0) ||
           (window.screen && window.screen.width <= 768)
  }

  // Função para compartilhar via Web Share API (nativo)
  const handleNativeShare = async (platform: string) => {
    if (navigator.share && platform === 'whatsapp') {
      try {
        await navigator.share({
          title: shareText,
          text: shareText,
          url: url,
        })
        return true
      } catch (error) {
        console.log('Erro no Web Share API:', error)
        return false
      }
    }
    return false
  }

  // Função para verificar se a URL é acessível
  const getValidShareUrl = (originalUrl: string) => {
    try {
      const urlObj = new URL(originalUrl)
      // Se a URL configurada não for localhost nem uma URL válida em produção,
      // use a origem atual do browser
      if (typeof window !== 'undefined') {
        const currentOrigin = window.location.origin
        const currentHost = window.location.hostname
        
        // Se estivermos em desenvolvimento (localhost), usar origem atual
        if (currentHost === 'localhost' || currentHost === '127.0.0.1') {
          return originalUrl.replace(urlObj.origin, currentOrigin)
        }
      }
      return originalUrl
    } catch (error) {
      // Se a URL for inválida, use a origem atual
      if (typeof window !== 'undefined') {
        const currentOrigin = window.location.origin
        const path = originalUrl.startsWith('/') ? originalUrl : `/${originalUrl}`
        return `${currentOrigin}${path}`
      }
      return originalUrl
    }
  }

  // Função para compartilhar e rastrear
  const handleShare = async (platform: string, shareUrl: string) => {
    setIsSharing(platform)
    
    // Registrar o compartilhamento
    await trackShare(platform)
    
    // Garantir que a URL seja válida e acessível
    const validShareUrl = platform === 'whatsapp' ? shareUrl : getValidShareUrl(shareUrl)
    
    // Para WhatsApp, tentar Web Share API primeiro em mobile
    if (platform === 'whatsapp' && isMobile()) {
      const nativeShareWorked = await handleNativeShare(platform)
      
      if (!nativeShareWorked) {
        // Fallback para protocolo whatsapp://
        const mobileWhatsAppUrl = validShareUrl.replace('https://wa.me/?text=', 'whatsapp://send?text=')
        
        try {
          // Tentar abrir o app nativo
          window.location.href = mobileWhatsAppUrl
        } catch (error) {
          // Se falhar, usar window.open como último recurso
          window.open(validShareUrl, '_blank', 'noopener,noreferrer')
        }
      }
    } else {
      // Para outras plataformas ou desktop, usar window.open normal
      window.open(validShareUrl, '_blank', 'noopener,noreferrer')
    }
    
    setTimeout(() => setIsSharing(null), 1000)
  }

  const shareText = `${title} - Portal de Notícias`
  
  // Gerar URL personalizada do WhatsApp com emoji e formatação especial
  let whatsappExcerpt = excerpt || `Confira esta notícia importante no Portal Radar Noroeste!`
  
  // Se houver imagem, mencionar na mensagem
  if (featuredImage) {
    whatsappExcerpt += ` 🖼 Veja também a imagem!`
  }
  
  const whatsappUrl = generateWhatsAppShareURL(
    title,
    whatsappExcerpt,
    url,
    categoryName
  )
  
  const shareLinks = {
    whatsapp: whatsappUrl,
    x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`,
    threads: `https://threads.net/intent/post?text=${encodeURIComponent(`${shareText} ${url}`)}`,
    instagram: `https://www.instagram.com/`, // Instagram não permite compartilhamento direto via URL
  }

  const buttons = [
    {
      platform: 'whatsapp',
      icon: WhatsAppIcon,
      label: `WhatsApp ${getCategoryEmoji(categoryName)}`,
      color: 'bg-green-600 hover:bg-green-700',
      url: shareLinks.whatsapp,
    },
    {
      platform: 'x',
      icon: XIcon,
      label: 'X (Twitter)',
      color: 'bg-black hover:bg-gray-800',
      url: shareLinks.x,
    },
    {
      platform: 'threads',
      icon: ThreadsIcon,
      label: 'Threads',
      color: 'bg-gray-900 hover:bg-black',
      url: shareLinks.threads,
    },
    {
      platform: 'instagram',
      icon: InstagramIcon,
      label: 'Instagram',
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      url: shareLinks.instagram,
    },
  ]

  const handleInstagramShare = async () => {
    setIsSharing('instagram')
    await trackShare('instagram')
    
    // Para Instagram, copiar texto para área de transferência
    try {
      await navigator.clipboard.writeText(`${shareText} ${url}`)
      alert('Link copiado! Cole no Instagram para compartilhar.')
    } catch (error) {
      // Fallback para browsers mais antigos
      const textArea = document.createElement('textarea')
      textArea.value = `${shareText} ${url}`
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
      alert('Link copiado! Cole no Instagram para compartilhar.')
    }
    
    setTimeout(() => setIsSharing(null), 1000)
  }

  return (
    <div className={`flex items-center space-x-4 py-4 border-y border-neutral-200 ${className}`}>
      <span className="text-sm font-medium text-neutral-700 flex items-center">
        <Share size={16} className="mr-2" />
        Compartilhar:
      </span>
      <div className="flex items-center space-x-3">
        {buttons.map((button) => (
          <button
            key={button.platform}
            onClick={() => {
              if (button.platform === 'instagram') {
                handleInstagramShare()
              } else {
                handleShare(button.platform, button.url)
              }
            }}
            disabled={isSharing === button.platform}
            className={`
              p-2.5 text-white rounded-lg transition-all duration-200 transform
              ${button.color}
              ${isSharing === button.platform ? 'scale-95 opacity-75' : 'hover:scale-105'}
              disabled:cursor-not-allowed
              shadow-sm hover:shadow-md
            `}
            title={`Compartilhar no ${button.label}`}
          >
            {isSharing === button.platform ? (
              <div className="animate-spin">
                <Share size={16} />
              </div>
            ) : (
              <button.icon size={16} />
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
