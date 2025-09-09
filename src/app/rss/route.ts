import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://portal-de-noticias.vercel.app'
  
  // Usar artigos reais do arquivo articles.json
  const articles = [
    {
      title: 'Brasil Conquista Posição de Destaque no Ranking Mundial de Inovação',
      description: 'Brasil sobe 15 posições no ranking mundial de inovação e entra no top 30, destacando-se em tecnologia e energia renovável.',
      link: `${baseUrl}/noticia/brasil-ranking-inovacao-mundial-2024`,
      pubDate: new Date('2024-01-08T14:30:00Z').toUTCString(),
      category: 'Tecnologia',
      author: 'Maria Silva'
    },
    {
      title: 'Campeonato Mundial: Brasil Avança para Final Após 12 Anos',
      description: 'Brasil vence semifinal por 2-0 e avança para a final do mundial após 12 anos, emocionando torcedores em todo o país.',
      link: `${baseUrl}/noticia/brasil-final-mundial-futebol-2024`,
      pubDate: new Date('2024-01-08T20:00:00Z').toUTCString(),
      category: 'Esportes',
      author: 'Carlos Esporte'
    },
    {
      title: 'Mercado de Criptomoedas Registra Alta de 180% em Dois Meses',
      description: 'Criptomoedas sobem 180% em dois meses, com Bitcoin batendo recordes e atraindo cada vez mais investidores institucionais.',
      link: `${baseUrl}/noticia/criptomoedas-alta-recorde-2024`,
      pubDate: new Date('2024-01-07T16:45:00Z').toUTCString(),
      category: 'Economia',
      author: 'Ana Economia'
    },
    {
      title: 'Nova Descoberta Arqueológica Revela Civilização Pré-Colombiana',
      description: 'Arqueólogos descobrem artefatos de 2.000 anos que podem reescrever a história das civilizações pré-colombianas.',
      link: `${baseUrl}/noticia/descoberta-arqueologica-pre-colombiana-2024`,
      pubDate: new Date('2024-01-07T11:15:00Z').toUTCString(),
      category: 'Cultura',
      author: 'Dr. Pedro História'
    },
    {
      title: 'Artigo de Teste - Portal de Notícias',
      description: 'Este é um artigo de teste para verificar se o sistema de publicação do portal de notícias está funcionando corretamente.',
      link: `${baseUrl}/noticia/artigo-de-teste-portal-noticias-1736442600000`,
      pubDate: new Date('2024-01-09T17:30:00Z').toUTCString(),
      category: 'Política',
      author: 'Editor Teste'
    }
  ]

  const rssContent = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>Portal de Notícias - RSS Feed</title>
    <description>Sua fonte confiável de informação sobre política, economia, esportes, cultura e cidades</description>
    <link>${baseUrl}</link>
    <language>pt-BR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <pubDate>${new Date().toUTCString()}</pubDate>
    <ttl>60</ttl>
    <image>
      <url>${baseUrl}/icon.svg</url>
      <title>Portal de Notícias</title>
      <link>${baseUrl}</link>
      <width>32</width>
      <height>32</height>
    </image>
    <atom:link href="${baseUrl}/rss" rel="self" type="application/rss+xml" />
    
    ${articles.map(article => `
    <item>
      <title><![CDATA[${article.title}]]></title>
      <description><![CDATA[${article.description}]]></description>
      <link>${article.link}</link>
      <guid isPermaLink="true">${article.link}</guid>
      <pubDate>${article.pubDate}</pubDate>
      <category>${article.category}</category>
      <author>noreply@portalnoticias.com.br (${article.author})</author>
    </item>
    `).join('')}
    
  </channel>
</rss>`

  return new NextResponse(rssContent, {
    status: 200,
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
