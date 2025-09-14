'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Eye, ArrowLeft, X, CheckCircle } from 'lucide-react'
import { WhatsAppSendButton } from '@/components/WhatsAppSendButton'

interface Article {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string
  featured_image: string
  status: string
  created_at: string
  updated_at: string
}

interface GlobalSuccessNotificationProps {
  article?: Article | null
  onDismiss?: () => void
  className?: string
}

const GlobalSuccessNotification = ({ 
  article, 
  onDismiss,
  className = "" 
}: GlobalSuccessNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (article) {
      setIsVisible(true)
      // Auto dismiss after 10 seconds
      const timer = setTimeout(() => {
        handleDismiss()
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [article])

  const handleDismiss = () => {
    setIsVisible(false)
    setTimeout(() => {
      if (onDismiss) onDismiss()
    }, 300) // Wait for animation to complete
  }

  if (!article || !isVisible) {
    return null
  }

  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg mx-6 mt-4 p-4 animate-in slide-in-from-top duration-500 ${className}`}>
      <div className="flex items-start space-x-3">
        {/* Success Icon */}
        <div className="flex-shrink-0 mt-0.5">
          <CheckCircle className="w-5 h-5 text-green-600" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-green-800 mb-1">
                Artigo Publicado com Sucesso!
              </h3>
              <p className="text-sm text-green-700 mb-3 line-clamp-1">
                Seu artigo "{article.title}" foi publicado e está disponível no portal.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <WhatsAppSendButton 
                  article={article}
                  variant="compact"
                  className="text-xs h-7 px-3"
                />
                <Link 
                  href={`/noticia/${article.slug}`}
                  className="inline-flex items-center px-3 h-7 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                  target="_blank"
                >
                  <Eye className="h-3 w-3 mr-1.5" />
                  Ver Artigo
                </Link>
                <Link 
                  href="/admin/articles"
                  className="inline-flex items-center px-3 h-7 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ArrowLeft className="h-3 w-3 mr-1.5" />
                  Voltar à Lista
                </Link>
              </div>
            </div>
            
            {/* Dismiss Button */}
            <button
              onClick={handleDismiss}
              className="flex-shrink-0 ml-3 p-1 rounded-md text-green-500 hover:text-green-700 hover:bg-green-100 transition-colors"
              aria-label="Fechar notificação"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export { GlobalSuccessNotification }
export type { GlobalSuccessNotificationProps }
