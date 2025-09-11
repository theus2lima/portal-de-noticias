'use client'

import { useState, useEffect } from 'react'

export interface SystemSettings {
  // Configurações do Site
  siteName: string
  siteDescription: string
  siteUrl: string
  logo: string | null
  
  // Configurações de Email
  adminEmail: string
  contactEmail: string
  smtpServer: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  encryption: 'tls' | 'ssl' | 'none'
  
  // Configurações de Segurança
  twoFactorAuth: boolean
  googleLogin: boolean
  captcha: boolean
  sessionTimeout: number
  passwordMinLength: number
  allowPasswordReset: boolean
  
  // Configurações de Conteúdo
  articlesPerPage: number
  allowComments: boolean
  moderateComments: boolean
  autoApproveComments: boolean
  newsletter: boolean
  enableCategories: boolean
  enableTags: boolean
  
  // Configurações de Notificações
  emailNewArticles: boolean
  emailNewComments: boolean
  emailNewLeads: boolean
  pushSystemUpdates: boolean
  pushWeeklyReports: boolean
  pushSecurityAlerts: boolean
  
  // Configurações de Performance
  enableCache: boolean
  cacheTimeout: number
  enableCompression: boolean
  enableMinification: boolean
  
  // SEO
  metaKeywords: string
  metaDescription: string
  enableSitemap: boolean
  enableRobots: boolean
}

const defaultSettings: SystemSettings = {
  // Site
  siteName: 'Radar Noroeste PR',
  siteDescription: 'Portal de notícias confiável com informações atualizadas em tempo real',
  siteUrl: 'https://radarnoroeste.com.br',
  logo: null,
  
  // Email
  adminEmail: 'admin@radarnoroeste.com.br',
  contactEmail: 'contato@radarnoroeste.com.br',
  smtpServer: 'smtp.gmail.com',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  encryption: 'tls',
  
  // Segurança
  twoFactorAuth: false,
  googleLogin: true,
  captcha: true,
  sessionTimeout: 120,
  passwordMinLength: 8,
  allowPasswordReset: true,
  
  // Conteúdo
  articlesPerPage: 15,
  allowComments: true,
  moderateComments: true,
  autoApproveComments: false,
  newsletter: true,
  enableCategories: true,
  enableTags: true,
  
  // Notificações
  emailNewArticles: true,
  emailNewComments: true,
  emailNewLeads: true,
  pushSystemUpdates: false,
  pushWeeklyReports: true,
  pushSecurityAlerts: true,
  
  // Performance
  enableCache: true,
  cacheTimeout: 3600,
  enableCompression: true,
  enableMinification: false,
  
  // SEO
  metaKeywords: 'notícias, paraná, jornalismo, informação',
  metaDescription: 'Fique por dentro das principais notícias do Paraná',
  enableSitemap: true,
  enableRobots: true
}

export function useSystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)

  // Carregar configurações salvas
  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)
      
      // Tentar carregar do localStorage primeiro
      const savedSettings = localStorage.getItem('system-settings')
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings)
        setSettings({ ...defaultSettings, ...parsed })
      }
      
      // TODO: Aqui poderia carregar de uma API real
      // const response = await fetch('/api/system-settings')
      // const data = await response.json()
      // if (data.success) {
      //   setSettings({ ...defaultSettings, ...data.settings })
      // }
      
    } catch (error) {
      console.error('Erro ao carregar configurações:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSettings = async (updates: Partial<SystemSettings>) => {
    try {
      setSaving(true)
      
      const newSettings = { ...settings, ...updates }
      setSettings(newSettings)
      
      // Salvar no localStorage
      localStorage.setItem('system-settings', JSON.stringify(newSettings))
      
      // TODO: Salvar na API real
      // await fetch('/api/system-settings', {
      //   method: 'PUT',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(newSettings)
      // })
      
      setLastSaved(new Date())
      
      // Simular delay de rede
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Erro ao salvar configurações:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const resetSettings = async () => {
    try {
      setSaving(true)
      setSettings(defaultSettings)
      
      // Remover do localStorage
      localStorage.removeItem('system-settings')
      
      // TODO: Resetar na API
      // await fetch('/api/system-settings', {
      //   method: 'DELETE'
      // })
      
      setLastSaved(new Date())
      
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
    } catch (error) {
      console.error('Erro ao resetar configurações:', error)
      throw error
    } finally {
      setSaving(false)
    }
  }

  const testEmailSettings = async () => {
    try {
      setSaving(true)
      
      // TODO: Implementar teste de email real
      // await fetch('/api/test-email', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     smtpServer: settings.smtpServer,
      //     smtpPort: settings.smtpPort,
      //     smtpUsername: settings.smtpUsername,
      //     smtpPassword: settings.smtpPassword,
      //     encryption: settings.encryption
      //   })
      // })
      
      // Simular teste
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      return { success: true, message: 'Configurações de email testadas com sucesso!' }
      
    } catch (error) {
      console.error('Erro ao testar email:', error)
      return { success: false, message: 'Erro ao testar configurações de email' }
    } finally {
      setSaving(false)
    }
  }

  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `configuracoes-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  const importSettings = (file: File) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      
      reader.onload = (e) => {
        try {
          const importedSettings = JSON.parse(e.target?.result as string)
          const mergedSettings = { ...defaultSettings, ...importedSettings }
          setSettings(mergedSettings)
          localStorage.setItem('system-settings', JSON.stringify(mergedSettings))
          setLastSaved(new Date())
          resolve(true)
        } catch (error) {
          reject(error)
        }
      }
      
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  return {
    settings,
    loading,
    saving,
    lastSaved,
    updateSettings,
    resetSettings,
    testEmailSettings,
    exportSettings,
    importSettings,
    loadSettings
  }
}
