'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  timestamp: Date
  read: boolean
  action?: {
    label: string
    href: string
  }
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotifications = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider')
  }
  return context
}

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Carregar notificações do localStorage ao inicializar
  useEffect(() => {
    const savedNotifications = localStorage.getItem('admin-notifications')
    if (savedNotifications) {
      try {
        const parsed = JSON.parse(savedNotifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }))
        setNotifications(parsed)
      } catch (error) {
        console.error('Erro ao carregar notificações:', error)
      }
    }

    // Adicionar notificações de exemplo na primeira carga
    const hasInitialized = localStorage.getItem('notifications-initialized')
    if (!hasInitialized) {
      const sampleNotifications: Notification[] = [
        {
          id: '1',
          title: 'Novo Lead Capturado',
          message: 'Ana Silva Santos se cadastrou para receber notícias',
          type: 'success',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 horas atrás
          read: false,
          action: {
            label: 'Ver Leads',
            href: '/admin/leads'
          }
        },
        {
          id: '2',
          title: 'Sistema Atualizado',
          message: 'Portal atualizado para versão 2.1.4 com melhorias de performance',
          type: 'info',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 horas atrás
          read: false
        },
        {
          id: '3',
          title: 'Backup Concluído',
          message: 'Backup automático das 08:00 executado com sucesso',
          type: 'success',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 horas atrás
          read: true
        },
        {
          id: '4',
          title: 'Novo Artigo Publicado',
          message: 'Artigo "Economia Brasileira em 2024" foi publicado com sucesso',
          type: 'info',
          timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 horas atrás
          read: true,
          action: {
            label: 'Ver Artigo',
            href: '/admin/articles'
          }
        },
        {
          id: '5',
          title: 'Tráfego Alto Detectado',
          message: 'Site recebendo 300% mais visitas que o normal nas últimas 2 horas',
          type: 'warning',
          timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 horas atrás
          read: true,
          action: {
            label: 'Ver Analytics',
            href: '/admin/analytics'
          }
        }
      ]
      
      setNotifications(sampleNotifications)
      localStorage.setItem('notifications-initialized', 'true')
      localStorage.setItem('admin-notifications', JSON.stringify(sampleNotifications))
    }
  }, [])

  // Salvar notificações no localStorage sempre que mudar
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem('admin-notifications', JSON.stringify(notifications))
    }
  }, [notifications])

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      read: false
    }
    
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    )
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    localStorage.removeItem('admin-notifications')
  }

  const value = {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll
  }

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  )
}
