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

  // URLs de notícias (mock data - em produção viria do banco)
  const newsArticles = [
    'reforma-tributaria-avanca',
    'nova-politica-economica',
    'lei-transparencia',
    'investimentos-infraestrutura',
    'mudancas-lei-eleitoral',
    'acordo-comercial',
    'lei-protecao-dados',
    'modernizacao-estado',
    'reforma-administrativa',
    'agenda-ambiental',
    'orcamento-2024',
    'tecnologia-verde',
    'brasil-semifinais',
    'brasil-inovacao-ranking',
    'descoberta-arqueologica',
    'criptomoedas-alta',
    'brasil-final-mundial',
    'lei-ambiental-amazonia',
    'selecao-feminina-ouro',
    'energia-solar'
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
