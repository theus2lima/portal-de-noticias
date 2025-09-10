import * as cheerio from 'cheerio'

export interface ScrapingConfig {
  // Seletores básicos
  article_selector?: string
  title_selector?: string
  link_selector?: string
  date_selector?: string
  summary_selector?: string
  image_selector?: string
  
  // Configuração de arquivo/histórico
  archive_pattern?: string // Ex: "https://site.com/arquivo/{yyyy}/{mm}/{dd}"
  archive_selector?: string // Seletor para links de arquivo na página principal
  pagination_selector?: string // Seletor para próxima página
  
  // Headers personalizados
  headers?: Record<string, string>
  
  // Limites
  max_pages?: number
  delay_ms?: number
}

export interface ScrapedArticle {
  title: string
  original_url: string
  summary?: string
  content?: string
  image_url?: string
  published_at?: string
  author?: string
  tags?: string[]
}

export class SmartScraper {
  private config: ScrapingConfig
  private baseUrl: string

  constructor(baseUrl: string, config: ScrapingConfig = {}) {
    this.baseUrl = baseUrl
    this.config = {
      // Defaults
      article_selector: 'article, .post, .news-item, .entry, .story',
      title_selector: 'h1, h2, h3, .title, .headline, .entry-title',
      link_selector: 'a',
      summary_selector: 'p, .summary, .excerpt, .description, .lead',
      image_selector: 'img',
      max_pages: 5,
      delay_ms: 1000,
      ...config
    }
  }

  // Normalizar URLs
  private normalizeUrl(url: string): string {
    if (url.startsWith('http')) return url
    if (url.startsWith('//')) return 'https:' + url
    return new URL(url, this.baseUrl).href
  }

  // Extrair data de texto
  private parseDate(text: string): string | null {
    if (!text) return null
    
    // Patterns brasileiros
    const patterns = [
      /(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/, // dd/mm/yyyy
      /(\d{4})[\/-](\d{1,2})[\/-](\d{1,2})/, // yyyy-mm-dd
      /(\d{1,2})\s+de\s+(\w+)\s+de\s+(\d{4})/i, // 10 de janeiro de 2024
    ]

    const months: Record<string, number> = {
      janeiro: 0, fevereiro: 1, março: 2, abril: 3, maio: 4, junho: 5,
      julho: 6, agosto: 7, setembro: 8, outubro: 9, novembro: 10, dezembro: 11,
      jan: 0, fev: 1, mar: 2, abr: 3, mai: 4, jun: 5,
      jul: 6, ago: 7, set: 8, out: 9, nov: 10, dez: 11
    }

    // dd/mm/yyyy
    const ddmmMatch = text.match(patterns[0])
    if (ddmmMatch) {
      const [, d, m, y] = ddmmMatch
      const year = y.length === 2 ? `20${y}` : y
      return new Date(parseInt(year), parseInt(m) - 1, parseInt(d)).toISOString()
    }

    // yyyy-mm-dd
    const yyyymmMatch = text.match(patterns[1])
    if (yyyymmMatch) {
      const [, y, m, d] = yyyymmMatch
      return new Date(parseInt(y), parseInt(m) - 1, parseInt(d)).toISOString()
    }

    // dd de mês de yyyy
    const textualMatch = text.match(patterns[2])
    if (textualMatch) {
      const [, d, monthName, y] = textualMatch
      const monthIndex = months[monthName.toLowerCase()]
      if (monthIndex !== undefined) {
        return new Date(parseInt(y), monthIndex, parseInt(d)).toISOString()
      }
    }

    return null
  }

  // Buscar artigos em uma página
  private async scrapePage(url: string): Promise<ScrapedArticle[]> {
    try {
      const headers = this.config.headers || {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
      
      const response = await fetch(url, { headers })
      if (!response.ok) return []
      
      const html = await response.text()
      const $ = cheerio.load(html)
      
      const articles: ScrapedArticle[] = []
      
      $(this.config.article_selector!).each((i, element) => {
        if (articles.length >= 50) return false // Limite por página
        
        const $el = $(element)
        
        // Extrair dados básicos
        const title = $el.find(this.config.title_selector!).first().text().trim()
        const linkHref = $el.find(this.config.link_selector!).first().attr('href')
        
        if (!title || !linkHref) return
        
        const link = this.normalizeUrl(linkHref)
        const summary = $el.find(this.config.summary_selector!).first().text().trim().slice(0, 500)
        const imageUrl = $el.find(this.config.image_selector!).first().attr('src')
        const dateText = this.config.date_selector ? 
          $el.find(this.config.date_selector).first().text().trim() : ''
        
        const article: ScrapedArticle = {
          title,
          original_url: link,
          summary,
          content: summary, // Por enquanto usa o resumo como conteúdo
          published_at: this.parseDate(dateText) || new Date().toISOString()
        }
        
        if (imageUrl) {
          article.image_url = this.normalizeUrl(imageUrl)
        }
        
        articles.push(article)
      })
      
      return articles
    } catch (error) {
      console.error('Erro ao fazer scraping da página:', url, error)
      return []
    }
  }

  // Detectar automaticamente páginas de arquivo
  private async detectArchiveUrls(startDate: Date, endDate: Date): Promise<string[]> {
    const urls: string[] = []
    
    // 1. Se tem pattern configurado, usar ele
    if (this.config.archive_pattern) {
      for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        const url = this.config.archive_pattern
          .replace('{yyyy}', String(d.getFullYear()))
          .replace('{mm}', String(d.getMonth() + 1).padStart(2, '0'))
          .replace('{dd}', String(d.getDate()).padStart(2, '0'))
        urls.push(url)
      }
      return urls
    }
    
    // 2. Tentar detectar links de arquivo na página principal
    try {
      const response = await fetch(this.baseUrl)
      if (response.ok) {
        const html = await response.text()
        const $ = cheerio.load(html)
        
        // Procurar por links que parecem ser de arquivo
        const archiveSelectors = [
          'a[href*="arquivo"]',
          'a[href*="archive"]', 
          'a[href*="/202"]', // Anos recentes
          'a[href*="historico"]',
          this.config.archive_selector
        ].filter(Boolean)
        
        archiveSelectors.forEach(selector => {
          $(selector).each((i, el) => {
            const href = $(el).attr('href')
            if (href) {
              urls.push(this.normalizeUrl(href))
            }
          })
        })
      }
    } catch (e) {
      // Ignorar erros
    }
    
    // 3. Fallback: usar página principal
    if (urls.length === 0) {
      urls.push(this.baseUrl)
      
      // Adicionar páginas numeradas comuns
      for (let i = 2; i <= 5; i++) {
        urls.push(`${this.baseUrl}/page/${i}`)
        urls.push(`${this.baseUrl}?page=${i}`)
      }
    }
    
    return Array.from(new Set(urls)) // Remove duplicatas
  }

  // Scraping completo com período
  async scrapeByPeriod(startDate: Date, endDate: Date, limit: number = 100): Promise<ScrapedArticle[]> {
    const archiveUrls = await this.detectArchiveUrls(startDate, endDate)
    const allArticles: ScrapedArticle[] = []
    
    for (const url of archiveUrls.slice(0, this.config.max_pages!)) {
      if (allArticles.length >= limit) break
      
      const articles = await this.scrapePage(url)
      
      // Filtrar por período se conseguimos extrair a data
      const filteredArticles = articles.filter(article => {
        if (!article.published_at) return true // Incluir se não conseguimos determinar a data
        
        const publishDate = new Date(article.published_at)
        return publishDate >= startDate && publishDate <= endDate
      })
      
      allArticles.push(...filteredArticles)
      
      // Delay entre requests
      if (this.config.delay_ms! > 0) {
        await new Promise(resolve => setTimeout(resolve, this.config.delay_ms!))
      }
    }
    
    // Remover duplicatas por URL
    const unique = allArticles.filter((article, index, arr) => 
      arr.findIndex(a => a.original_url === article.original_url) === index
    )
    
    return unique.slice(0, limit)
  }
}

// Factory para criar scrapers configurados para sites conhecidos
export function createScraperForSite(url: string): SmartScraper {
  const domain = new URL(url).hostname
  
  // Configurações específicas por site conhecido
  const configs: Record<string, ScrapingConfig> = {
    'g1.globo.com': {
      article_selector: '.feed-post, .post',
      title_selector: '.feed-post-link, .post__title',
      date_selector: '.feed-post-datetime, .post__date',
      summary_selector: '.feed-post-body-resumo, .post__excerpt'
    },
    'folha.uol.com.br': {
      article_selector: '.c-headline, .news-item',
      title_selector: '.c-headline__title, .news-item__title',
      date_selector: '.c-headline__dateline, .news-item__date'
    },
    'estadao.com.br': {
      article_selector: '.card, .noticia',
      title_selector: '.card__title, .titulo',
      date_selector: '.card__date, .data'
    }
  }
  
  const config = configs[domain] || {}
  return new SmartScraper(url, config)
}
