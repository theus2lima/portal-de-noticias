import { NextResponse } from 'next/server'

export async function GET() {
  const baseUrl = 'https://portal-de-noticias.vercel.app'
  
  // Mock data - em produção viria do banco de dados
  const articles = [
    {
      title: 'Reforma Tributária é Aprovada em Primeira Votação no Congresso',
      description: 'Proposta prevê simplificação do sistema de impostos e redução da carga tributária para empresas de pequeno porte',
      link: `${baseUrl}/noticia/reforma-tributaria-avanca`,
      pubDate: new Date('2024-01-08T14:30:00Z').toUTCString(),
      category: 'Política',
      author: 'Ana Costa'
    },
    {
      title: 'PIB Brasileiro Cresce 2.3% no Último Trimestre',
      description: 'Resultado supera expectativas do mercado e consolida recuperação da economia nacional',
      link: `${baseUrl}/noticia/pib-crescimento`,
      pubDate: new Date('2024-01-08T12:15:00Z').toUTCString(),
      category: 'Economia',
      author: 'Roberto Lima'
    },
    {
      title: 'Brasil Avança para Semifinais em Copa Mundial',
      description: 'Seleção brasileira vence por 3-1 em partida disputada no Maracanã',
      link: `${baseUrl}/noticia/brasil-semifinais`,
      pubDate: new Date('2024-01-07T22:45:00Z').toUTCString(),
      category: 'Esportes',
      author: 'Carlos Oliveira'
    },
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
