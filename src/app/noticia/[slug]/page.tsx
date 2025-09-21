import Link from 'next/link'
import Image from 'next/image'
import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import ShareButtons from '@/components/ShareButtons'
import LeadForm from '@/components/LeadForm'
import GoogleAd from '@/components/GoogleAd'
import ArticleClient from './ArticleClient'
import { generateSEO, generateArticleSchema } from '@/lib/seo'
import { 
  ArrowLeft, 
  Clock, 
  Eye, 
  Calendar,
  FileText
} from 'lucide-react'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  content: string
  excerpt: string
  featured_image?: string
  image_alt?: string
  category_id?: string
  category_name: string
  author_name: string
  created_at: string
  updated_at?: string
  views_count: number
  reading_time: number
  keywords?: string[]
  published_at: string
}

// Função para buscar dados do artigo
async function getArticle(slug: string): Promise<Article | null> {
  try {
    // Durante o build, usar dados locais diretamente
    if (process.env.NODE_ENV === 'production' && !process.env.VERCEL_URL) {
      // Fallback para dados locais durante build
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(process.cwd(), 'data', 'articles.json')
      
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        const articles = JSON.parse(data)
        return articles.find((a: any) => a.slug === slug && a.status === 'published') || null
      }
      return null
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/articles/by-slug/${slug}`, {
      next: { revalidate: 300 } // Revalidar a cada 5 minutos
    })
    
    if (!response.ok) {
      // Fallback para dados locais se API falhar
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(process.cwd(), 'data', 'articles.json')
      
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        const articles = JSON.parse(data)
        return articles.find((a: any) => a.slug === slug && a.status === 'published') || null
      }
      return null
    }
    
    const data = await response.json()
    return data.data
  } catch (error) {
    console.error('Erro ao buscar artigo:', error)
    
    // Fallback final para dados locais
    try {
      const fs = require('fs')
      const path = require('path')
      const filePath = path.join(process.cwd(), 'data', 'articles.json')
      
      if (fs.existsSync(filePath)) {
        const data = fs.readFileSync(filePath, 'utf8')
        const articles = JSON.parse(data)
        return articles.find((a: any) => a.slug === slug && a.status === 'published') || null
      }
    } catch (fallbackError) {
      console.error('Erro no fallback:', fallbackError)
    }
    
    return null
  }
}
// Gerar metadata dinamicamente
export async function generateMetadata({ params }: ArticlePageProps): Promise<Metadata> {
  const article = await getArticle(params.slug)
  
  if (!article) {
    return {
      title: 'Artigo não encontrado - Radar Noroeste PR',
      description: 'O artigo solicitado não foi encontrado.',
    }
  }
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radarnoroestepr.com.br'
  const articleUrl = `${baseUrl}/noticia/${article.slug}`
  
  // Debug: verificar se featured_image existe
  console.log('Article data for meta tags:', {
    slug: article.slug,
    title: article.title,
    featured_image: article.featured_image,
    hasImage: !!article.featured_image
  })
  
  // Validar se featured_image é uma URL válida
  let ogImage = `${baseUrl}/og-image.svg` // fallback padrão
  
  if (article.featured_image && 
      (article.featured_image.startsWith('http://') || 
       article.featured_image.startsWith('https://') ||
       article.featured_image.startsWith('/'))
     ) {
    // Se a imagem começa com '/', adicionar baseUrl
    ogImage = article.featured_image.startsWith('/') 
      ? `${baseUrl}${article.featured_image}`
      : article.featured_image
    
    console.log('Using article featured_image:', ogImage)
  } else {
    console.log('Using fallback og-image.svg:', ogImage)
  }
  
  return generateSEO({
    title: article.title,
    description: article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no Radar Noroeste PR`,
    keywords: article.keywords || [article.category_name.toLowerCase(), 'notícias', 'paraná'],
    image: ogImage,
    url: articleUrl,
    type: 'article',
    publishedTime: article.published_at,
    modifiedTime: article.updated_at,
    author: article.author_name,
    category: article.category_name,
    tags: article.keywords || []
  })
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.slug)
  
  if (!article) {
    notFound()
  }

  // Buscar artigos relacionados no servidor
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:3000'
  
  let relatedArticles: Article[] = []
  if (article.category_id) {
    try {
      const relatedResponse = await fetch(`${baseUrl}/api/articles?status=published&category=${article.category_id}&limit=3`, {
        next: { revalidate: 300 }
      })
      if (relatedResponse.ok) {
        const relatedData = await relatedResponse.json()
        relatedArticles = relatedData.data?.filter((a: Article) => a.id !== article.id) || []
      }
    } catch (error) {
      console.error('Erro ao buscar artigos relacionados:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Política': 'bg-primary-900',
      'Economia': 'bg-secondary-600',
      'Esportes': 'bg-accent-500',
      'Cultura': 'bg-primary-500',
      'Cidades': 'bg-secondary-700'
    }
    return colors[category] || 'bg-primary-900'
  }

  // URLs para compartilhamento
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radarnoroestepr.com.br'
  const shareUrl = `${siteUrl}/noticia/${article.slug}`
  const shareText = `${article.title} - Radar Noroeste PR`

  // Dados estruturados JSON-LD para SEO
  const articleSchema = generateArticleSchema({
    headline: article.title,
    description: article.excerpt || article.subtitle || `Leia mais sobre ${article.title} no Radar Noroeste PR`,
    image: article.featured_image || `${siteUrl}/og-image.svg`,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: article.author_name,
    category: article.category_name,
    url: shareUrl
  })

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleSchema),
        }}
      />
      
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              Início
            </Link>
            <span className="text-neutral-400">/</span>
            <Link 
              href={`/categoria/${article.category_name.toLowerCase()}`} 
              className="text-primary-600 hover:text-primary-700"
            >
              {article.category_name}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-600 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <article className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto flex gap-8">
            {/* Anúncio Sidebar - Fixo durante a leitura */}
            <div className="hidden lg:block fixed right-4 top-1/2 transform -translate-y-1/2 w-160px z-10">
              <GoogleAd 
                slot="3456789012"
                format="vertical"
                style={{ width: '160px', height: '600px' }}
                className="shadow-lg rounded-lg overflow-hidden"
              />
            </div>
            
            {/* Conteúdo principal */}
            <div className="flex-1 max-w-4xl">
            {/* Header */}
            <header className="mb-8">
              <Link 
                href="/" 
                className="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 mb-6 transition-colors duration-200"
              >
                <ArrowLeft size={20} />
                <span>Voltar ao início</span>
              </Link>

              <div className="mb-4">
                <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${getCategoryColor(article.category_name)}`}>
                  {article.category_name}
                </span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-bold text-neutral-900 mb-4 leading-tight">
                {article.title}
              </h1>

              <p className="text-xl text-neutral-600 mb-6 leading-relaxed">
                {article.subtitle}
              </p>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-6 text-neutral-500 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                    {article.author_name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-neutral-900">{article.author_name}</p>
                    <p className="text-sm">Autor</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{formatDate(article.published_at)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{article.reading_time} min de leitura</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={16} />
                    <span>{article.views_count.toLocaleString()} visualizações</span>
                  </div>
                </div>
              </div>

            {/* Social sharing */}
              <ShareButtons 
                url={shareUrl}
                title={article.title}
                articleId={article.id}
                excerpt={article.excerpt}
                categoryName={article.category_name}
                featuredImage={article.featured_image}
                imageAlt={article.image_alt}
              />
            </header>
            
            {/* Anúncio 1 - Após header, antes da imagem */}
            <div className="mb-8">
              <GoogleAd 
                slot="1234567890"
                format="auto"
                className="text-center"
              />
            </div>

            {/* Featured image */}
            {article.featured_image ? (
              <div className="relative h-96 lg:h-[500px] mb-8 rounded-xl overflow-hidden">
                <Image
                  src={article.featured_image}
                  alt={article.image_alt || article.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            ) : (
              <div className="relative h-96 lg:h-[500px] mb-8 rounded-xl overflow-hidden bg-neutral-200 flex items-center justify-center">
                <FileText className="h-24 w-24 text-neutral-400" />
              </div>
            )}

            {/* Article content */}
            <div className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-p:text-justify prose-a:text-primary-600 prose-strong:text-neutral-900 prose-blockquote:border-primary-600 prose-blockquote:bg-neutral-50 prose-blockquote:rounded-lg prose-blockquote:p-6">
              {(article.content && article.content.includes('<')) ? (
                <div dangerouslySetInnerHTML={{ __html: article.content }} />
              ) : (
                <div className="whitespace-pre-wrap">
                  {(article.content || '').split('\n').map((paragraph, index) => (
                    paragraph.trim() ? (
                      <p key={index} className="mb-4">{paragraph}</p>
                    ) : null
                  ))}
                </div>
              )}
            </div>

            {/* Anúncio 2 - Após conteudo do artigo */}
            <div className="my-8">
              <GoogleAd 
                slot="2345678901"
                format="rectangle"
                className="text-center"
              />
            </div>

            {/* Tags */}
            {article.keywords && article.keywords.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-lg font-semibold mb-4">Tags relacionadas:</h3>
                <div className="flex flex-wrap gap-2">
                  {article.keywords.map(tag => (
                    <span 
                      key={tag}
                      className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-sm hover:bg-neutral-300 transition-colors duration-200 cursor-pointer"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related articles */}
            {relatedArticles.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-2xl font-bold mb-6">Leia também</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {relatedArticles.map(related => (
                    <Link 
                      key={related.id}
                      href={`/noticia/${related.slug}`}
                      className="flex space-x-4 p-4 bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0">
                        {related.featured_image ? (
                          <Image
                            src={related.featured_image}
                            alt={related.title}
                            fill
                            className="object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-full bg-neutral-200 rounded-lg flex items-center justify-center">
                            <FileText className="h-8 w-8 text-neutral-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-neutral-900 line-clamp-3">
                          {related.title}
                        </h4>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
            </div>
          </div>
        </div>
      </article>
      
      {/* Anúncio 3 - Entre seções */}
      <div className="py-8 bg-neutral-100">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <GoogleAd 
              slot="4567890123"
              format="horizontal"
              className="text-center"
            />
          </div>
        </div>
      </div>
      
      {/* Componente cliente para funcionalidades interativas */}
      <ArticleClient initialArticle={article} />
      
      {/* Formulário de cadastro WhatsApp */}
      <LeadForm />
    </div>
  )
}
