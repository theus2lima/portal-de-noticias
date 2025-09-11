'use client'

import { useNotifications } from '@/contexts/NotificationContext'

export const useNotificationHelpers = () => {
  const { addNotification } = useNotifications()

  const notifyNewLead = (leadName: string) => {
    addNotification({
      title: 'Novo Lead Capturado',
      message: `${leadName} se cadastrou para receber notícias`,
      type: 'success',
      action: {
        label: 'Ver Leads',
        href: '/admin/leads'
      }
    })
  }

  const notifyNewArticle = (articleTitle: string) => {
    addNotification({
      title: 'Novo Artigo Publicado',
      message: `Artigo "${articleTitle}" foi publicado com sucesso`,
      type: 'info',
      action: {
        label: 'Ver Artigo',
        href: '/admin/articles'
      }
    })
  }

  const notifySystemUpdate = (version?: string) => {
    addNotification({
      title: 'Sistema Atualizado',
      message: version 
        ? `Portal atualizado para versão ${version} com melhorias de performance`
        : 'Sistema atualizado com melhorias de performance e segurança',
      type: 'info'
    })
  }

  const notifyBackupComplete = () => {
    addNotification({
      title: 'Backup Concluído',
      message: `Backup automático das ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} executado com sucesso`,
      type: 'success'
    })
  }

  const notifyHighTraffic = (percentage: number) => {
    addNotification({
      title: 'Tráfego Alto Detectado',
      message: `Site recebendo ${percentage}% mais visitas que o normal nas últimas 2 horas`,
      type: 'warning',
      action: {
        label: 'Ver Analytics',
        href: '/admin/analytics'
      }
    })
  }

  const notifyNewComment = (articleTitle: string, commenterName: string) => {
    addNotification({
      title: 'Novo Comentário',
      message: `${commenterName} comentou em "${articleTitle}"`,
      type: 'info',
      action: {
        label: 'Moderar Comentários',
        href: '/admin/comments'
      }
    })
  }

  const notifyError = (title: string, message: string) => {
    addNotification({
      title,
      message,
      type: 'error'
    })
  }

  const notifySuccess = (title: string, message: string, actionLabel?: string, actionHref?: string) => {
    addNotification({
      title,
      message,
      type: 'success',
      ...(actionLabel && actionHref && {
        action: {
          label: actionLabel,
          href: actionHref
        }
      })
    })
  }

  const notifyWarning = (title: string, message: string, actionLabel?: string, actionHref?: string) => {
    addNotification({
      title,
      message,
      type: 'warning',
      ...(actionLabel && actionHref && {
        action: {
          label: actionLabel,
          href: actionHref
        }
      })
    })
  }

  const notifyInfo = (title: string, message: string, actionLabel?: string, actionHref?: string) => {
    addNotification({
      title,
      message,
      type: 'info',
      ...(actionLabel && actionHref && {
        action: {
          label: actionLabel,
          href: actionHref
        }
      })
    })
  }

  return {
    notifyNewLead,
    notifyNewArticle,
    notifySystemUpdate,
    notifyBackupComplete,
    notifyHighTraffic,
    notifyNewComment,
    notifyError,
    notifySuccess,
    notifyWarning,
    notifyInfo
  }
}
