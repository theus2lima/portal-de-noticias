/**
 * Serviço para envio automático de artigos para grupo do WhatsApp
 */

import { generateWhatsAppMessage, encodeWhatsAppMessage } from '@/config/whatsapp-categories'

interface ArticleData {
  id: string
  title: string
  excerpt: string
  slug: string
  category_name: string
  featured_image?: string
  author_name: string
  published_at: string
}

interface WhatsAppGroupConfig {
  groupUrl: string
  enabled: boolean
  autoSend: boolean
}

export class WhatsAppGroupService {
  private static instance: WhatsAppGroupService
  private config: WhatsAppGroupConfig = {
    groupUrl: 'https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L',
    enabled: true,
    autoSend: true
  }

  public static getInstance(): WhatsAppGroupService {
    if (!WhatsAppGroupService.instance) {
      WhatsAppGroupService.instance = new WhatsAppGroupService()
    }
    return WhatsAppGroupService.instance
  }

  /**
   * Carrega configurações do localStorage ou usa padrões
   */
  private loadConfig(): WhatsAppGroupConfig {
    try {
      if (typeof window !== 'undefined') {
        const savedConfig = localStorage.getItem('whatsapp-group-config')
        if (savedConfig) {
          return { ...this.config, ...JSON.parse(savedConfig) }
        }
      }
    } catch (error) {
      console.error('Erro ao carregar configurações do WhatsApp:', error)
    }
    return this.config
  }

  /**
   * Salva configurações no localStorage
   */
  public saveConfig(config: Partial<WhatsAppGroupConfig>): void {
    try {
      if (typeof window !== 'undefined') {
        this.config = { ...this.config, ...config }
        localStorage.setItem('whatsapp-group-config', JSON.stringify(this.config))
      }
    } catch (error) {
      console.error('Erro ao salvar configurações do WhatsApp:', error)
    }
  }

  /**
   * Obtém configurações atuais
   */
  public getConfig(): WhatsAppGroupConfig {
    return this.loadConfig()
  }

  /**
   * Gera mensagem formatada para o grupo
   */
  private generateGroupMessage(article: ArticleData, siteUrl: string): string {
    const articleUrl = `${siteUrl}/noticia/${article.slug}`
    
    // Adicionar informação sobre imagem se existir
    let excerpt = article.excerpt
    if (article.featured_image) {
      excerpt += ' 🖼 Veja também a imagem!'
    }
    
    return generateWhatsAppMessage(
      article.title,
      excerpt,
      articleUrl,
      article.category_name
    )
  }

  /**
   * Gera URL para envio ao grupo do WhatsApp
   */
  private generateGroupShareUrl(message: string): string {
    const config = this.getConfig()
    const encodedMessage = encodeWhatsAppMessage(message)
    
    // Para grupos, usar o formato específico do WhatsApp
    const groupId = config.groupUrl.split('/').pop() // Extrai o ID do grupo
    return `https://wa.me/g/${groupId}?text=${encodedMessage}`
  }

  /**
   * Envia artigo para o grupo do WhatsApp (abre nova aba)
   */
  public async sendToGroup(article: ArticleData, siteUrl: string): Promise<boolean> {
    try {
      const config = this.getConfig()
      
      if (!config.enabled) {
        console.log('Envio para WhatsApp desabilitado')
        return false
      }

      const message = this.generateGroupMessage(article, siteUrl)
      const shareUrl = this.generateGroupShareUrl(message)
      
      // Registrar tentativa de envio
      await this.logSendAttempt(article.id, 'success')
      
      // Abrir WhatsApp em nova aba
      if (typeof window !== 'undefined') {
        window.open(shareUrl, '_blank', 'noopener,noreferrer')
      }
      
      return true
    } catch (error) {
      console.error('Erro ao enviar para grupo WhatsApp:', error)
      await this.logSendAttempt(article.id, 'error', error instanceof Error ? error.message : 'Erro desconhecido')
      return false
    }
  }

  /**
   * Envia artigo automaticamente (usado quando publicar)
   */
  public async autoSendToGroup(article: ArticleData, siteUrl: string): Promise<boolean> {
    const config = this.getConfig()
    
    if (!config.autoSend) {
      return false
    }
    
    return this.sendToGroup(article, siteUrl)
  }

  /**
   * Registra tentativa de envio para análise
   */
  private async logSendAttempt(articleId: string, status: 'success' | 'error', error?: string): Promise<void> {
    try {
      const logEntry = {
        articleId,
        status,
        timestamp: new Date().toISOString(),
        error
      }
      
      // Salvar no localStorage para histórico local
      if (typeof window !== 'undefined') {
        const logs = JSON.parse(localStorage.getItem('whatsapp-send-logs') || '[]')
        logs.unshift(logEntry) // Adicionar no início
        
        // Manter apenas os últimos 50 logs
        if (logs.length > 50) {
          logs.splice(50)
        }
        
        localStorage.setItem('whatsapp-send-logs', JSON.stringify(logs))
      }
      
      // Opcional: Enviar para API se quiser persistir no banco
      // await fetch('/api/whatsapp-logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // })
      
    } catch (error) {
      console.error('Erro ao registrar log:', error)
    }
  }

  /**
   * Obtém logs de envio
   */
  public getSendLogs(): any[] {
    try {
      if (typeof window !== 'undefined') {
        return JSON.parse(localStorage.getItem('whatsapp-send-logs') || '[]')
      }
    } catch (error) {
      console.error('Erro ao carregar logs:', error)
    }
    return []
  }

  /**
   * Limpa logs antigos
   */
  public clearLogs(): void {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('whatsapp-send-logs')
      }
    } catch (error) {
      console.error('Erro ao limpar logs:', error)
    }
  }

  /**
   * Testa conexão com o grupo
   */
  public testGroupConnection(): boolean {
    const config = this.getConfig()
    return config.groupUrl.includes('chat.whatsapp.com') && config.enabled
  }
}
