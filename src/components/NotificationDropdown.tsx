'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  Bell, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  AlertTriangle,
  Trash2,
  X,
  ExternalLink,
  Clock
} from 'lucide-react'
import { useNotifications } from '@/contexts/NotificationContext'

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  } = useNotifications()

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Marcar todas como lidas quando abrir o dropdown
  const handleToggleDropdown = () => {
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    
    if (newIsOpen && unreadCount > 0) {
      // Pequeno delay para marcar como lidas depois de abrir
      setTimeout(() => {
        markAllAsRead()
      }, 500)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return 'Agora mesmo'
    if (diffInMinutes < 60) return `${diffInMinutes}min atrás`
    
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h atrás`
    
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d atrás`
    
    return timestamp.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit' 
    })
  }

  const handleNotificationClick = (notification: any) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    
    if (notification.action) {
      setIsOpen(false)
    }
  }

  const sortedNotifications = [...notifications].sort((a, b) => {
    // Primeiro não lidas, depois por timestamp mais recente
    if (a.read !== b.read) {
      return a.read ? 1 : -1
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button 
        onClick={handleToggleDropdown}
        className="relative p-2 text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors"
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-neutral-200 z-50 max-h-96 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <div className="flex items-center space-x-2">
              <Bell className="h-4 w-4 text-neutral-600" />
              <h3 className="font-semibold text-neutral-900">Notificações</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-neutral-400 hover:text-neutral-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Notifications List */}
          <div className="max-h-64 overflow-y-auto">
            {sortedNotifications.length === 0 ? (
              <div className="p-6 text-center">
                <Bell className="h-8 w-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-500">Nenhuma notificação</p>
              </div>
            ) : (
              sortedNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-b border-neutral-100 hover:bg-neutral-50 transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {/* Icon */}
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-neutral-900 leading-tight">
                            {notification.title}
                          </p>
                          <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                            {notification.message}
                          </p>
                          
                          {/* Action Button */}
                          {notification.action && (
                            <Link
                              href={notification.action.href}
                              onClick={() => handleNotificationClick(notification)}
                              className="inline-flex items-center mt-2 text-xs text-primary-600 hover:text-primary-700 font-medium"
                            >
                              {notification.action.label}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </Link>
                          )}
                        </div>
                        
                        {/* Remove Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeNotification(notification.id)
                          }}
                          className="text-neutral-400 hover:text-red-500 transition-colors"
                          title="Remover notificação"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="flex items-center mt-2 text-xs text-neutral-400">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatTimeAgo(new Date(notification.timestamp))}
                        {!notification.read && (
                          <span className="w-2 h-2 bg-blue-500 rounded-full ml-2"></span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Actions */}
          {sortedNotifications.length > 0 && (
            <div className="p-3 border-t border-neutral-200 bg-neutral-50">
              <div className="flex items-center justify-between">
                <button
                  onClick={markAllAsRead}
                  disabled={unreadCount === 0}
                  className="text-xs text-primary-600 hover:text-primary-700 disabled:text-neutral-400 font-medium transition-colors"
                >
                  Marcar todas como lidas
                </button>
                <button
                  onClick={() => {
                    if (confirm('Tem certeza que deseja limpar todas as notificações?')) {
                      clearAll()
                    }
                  }}
                  className="flex items-center text-xs text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Limpar todas
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
