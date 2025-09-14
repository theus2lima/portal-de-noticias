'use client'

import { useState, useEffect } from 'react'

interface SocialLink {
  id: string
  platform: string
  url: string
  icon: string
  color: string
  enabled: boolean
}

interface SiteConfig {
  // Informações do Site
  siteName: string
  siteDescription: string
  siteUrl: string
  
  // Cabeçalho
  headerText: string
  
  // Contato
  contactEmail: string
  contactPhone: string
  contactAddress: string
  
  // Newsletter
  newsletterEnabled: boolean
  newsletterTitle: string
  newsletterDescription: string
  
  // Redes Sociais
  socialLinks: SocialLink[]
  
  // Rodapé
  footerDescription: string
  footerCopyright: string
  
  // Links Úteis
  usefulLinks: Array<{
    id: string
    title: string
    url: string
    enabled: boolean
  }>
}

const defaultConfig: SiteConfig = {
  siteName: 'Radar Noroeste PR',
  siteDescription: 'Informação de qualidade, sempre atualizada. Acompanhe as principais notícias do Brasil e do mundo.',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://radarnoroeste.com.br',
  
  headerText: '📍 Últimas notícias em tempo real',
  
  contactEmail: 'contato@radarnoroeste.com.br',
  contactPhone: '(44) 9999-9999',
  contactAddress: 'Noroeste do Paraná - Brasil',
  
  newsletterEnabled: true,
  newsletterTitle: 'Newsletter',
  newsletterDescription: 'Receba as principais notícias em seu e-mail',
  
  socialLinks: [
    {
      id: '1',
      platform: 'Facebook',
      url: 'https://facebook.com/radarnoroeste',
      icon: 'Facebook',
      color: 'hover:text-blue-600',
      enabled: true
    },
    {
      id: '2',
      platform: 'Twitter',
      url: 'https://twitter.com/radarnoroeste',
      icon: 'Twitter',
      color: 'hover:text-blue-400',
      enabled: true
    },
    {
      id: '3',
      platform: 'Instagram',
      url: 'https://instagram.com/radarnoroeste',
      icon: 'Instagram',
      color: 'hover:text-pink-600',
      enabled: true
    },
    {
      id: '4',
      platform: 'WhatsApp',
      url: 'https://wa.me/5544999999999',
      icon: 'MessageCircle',
      color: 'hover:text-green-500',
      enabled: true
    }
  ],
  
  footerDescription: 'Informação de qualidade, sempre atualizada. Acompanhe as principais notícias do Brasil e do mundo.',
  footerCopyright: '© 2024 Radar Noroeste PR. Todos os direitos reservados.',
  
  usefulLinks: [
    { id: '1', title: 'Sobre Nós', url: '/sobre', enabled: true },
    { id: '2', title: 'Contato', url: '/contato', enabled: true },
    { id: '3', title: 'Política Editorial', url: '/politica-editorial', enabled: true },
    { id: '4', title: 'Política de Privacidade', url: '/privacidade', enabled: true },
    { id: '5', title: 'Termos de Uso', url: '/termos', enabled: true }
  ]
}

export function useSiteConfig() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadConfig = () => {
      try {
        const savedConfig = localStorage.getItem('site-config')
        if (savedConfig) {
          const parsedConfig = JSON.parse(savedConfig)
          setConfig(parsedConfig)
        }
      } catch (error) {
        console.error('Erro ao carregar configurações do site:', error)
      } finally {
        setLoading(false)
      }
    }

    // Carregar configurações imediatamente
    loadConfig()

    // Escutar mudanças nas configurações (quando salvas via dashboard)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'site-config' && e.newValue) {
        try {
          const parsedConfig = JSON.parse(e.newValue)
          setConfig(parsedConfig)
        } catch (error) {
          console.error('Erro ao atualizar configurações:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  return { config, loading }
}
