import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://portal-de-noticias.vercel.app'
  
  // Data atual para lastModified
  const currentDate = new Date()
  
  // URLs estáticas principais
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: 'hourly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/categoria/politica`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categoria/economia`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categoria/esportes`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categoria/cultura`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/categoria/cidades`,
      lastModified: currentDate,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
  ]

  // URLs de notícias (usando slugs reais do arquivo articles.json)
  const newsArticles = [
    'artigo-de-teste-portal-noticias-1736442600000',
    'segunda-noticia-teste-economia-local-1736442700000',
    'brasil-ranking-inovacao-mundial-2024',
    'brasil-final-mundial-futebol-2024',
    'criptomoedas-alta-recorde-2024',
    'descoberta-arqueologica-pre-colombiana-2024'
  ]

  const newsRoutes = newsArticles.map((slug) => ({
    url: `${baseUrl}/noticia/${slug}`,
    lastModified: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random last week
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // Combinar todas as rotas
  return [...staticRoutes, ...newsRoutes]
}
