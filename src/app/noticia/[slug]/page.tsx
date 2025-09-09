import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Clock, 
  User, 
  Eye, 
  Share2, 
  Facebook, 
  Twitter, 
  MessageCircle,
  Calendar 
} from 'lucide-react'

interface ArticlePageProps {
  params: {
    slug: string
  }
}

// Dados mock - em produção viriam de uma API ou banco de dados
const getArticleData = (slug: string) => {
  return {
    id: 1,
    slug: slug,
    title: "Reforma Tributária é Aprovada em Primeira Votação no Congresso Nacional",
    subtitle: "Proposta prevê simplificação do sistema de impostos e redução da carga tributária para empresas de pequeno porte em todo o território nacional",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&h=600&fit=crop",
    category: "Política",
    author: {
      name: "Ana Costa",
      bio: "Jornalista especializada em política brasileira há mais de 15 anos",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop"
    },
    publishedAt: "2024-01-08T14:30:00Z",
    updatedAt: "2024-01-08T16:45:00Z",
    views: 1254,
    readTime: "5 min",
    content: `
      <p class="lead">A Reforma Tributária brasileira deu um importante passo nesta segunda-feira, sendo aprovada em primeira votação no Congresso Nacional com ampla maioria dos parlamentares.</p>
      
      <p>A proposta, que tramita há mais de dois anos no Legislativo, prevê uma significativa simplificação do complexo sistema tributário brasileiro, consolidando diversos impostos em um único tributo sobre valor agregado (IVA).</p>
      
      <h3>Principais mudanças propostas</h3>
      
      <p>Entre as principais alterações estão:</p>
      
      <ul>
        <li>Unificação do PIS, Cofins, IPI, ICMS e ISS em um único imposto</li>
        <li>Redução da carga tributária para micro e pequenas empresas</li>
        <li>Simplificação das obrigações acessórias</li>
        <li>Criação de um sistema único de arrecadação</li>
      </ul>
      
      <p>O relator da proposta, deputado federal João Silva (PL-SP), destacou que "esta reforma representa uma revolução na forma como o Brasil tributa suas empresas e cidadãos".</p>
      
      <blockquote>
        "Estamos promovendo a maior simplificação tributária da história do país. Isso vai reduzir custos, aumentar a competitividade e gerar mais empregos."
        <cite>— João Silva, relator da reforma</cite>
      </blockquote>
      
      <h3>Impacto para as empresas</h3>
      
      <p>Segundo estudos do Ministério da Fazenda, a reforma pode representar uma economia de até R$ 50 bilhões anuais para o setor privado, principalmente através da:</p>
      
      <ul>
        <li>Redução de custos com consultoria tributária</li>
        <li>Diminuição do tempo gasto com obrigações fiscais</li>
        <li>Maior previsibilidade jurídica</li>
        <li>Facilidade para operações interestaduais</li>
      </ul>
      
      <p>A presidente da Confederação Nacional da Indústria (CNI), Maria Santos, manifestou apoio à proposta: "Esta é uma demanda antiga do setor produtivo brasileiro. A simplificação tributária era essencial para melhorar nosso ambiente de negócios".</p>
      
      <h3>Próximos passos</h3>
      
      <p>Após a aprovação em primeiro turno, a proposta ainda precisa passar por:</p>
      
      <ol>
        <li>Segunda votação na Câmara dos Deputados</li>
        <li>Análise do Senado Federal</li>
        <li>Regulamentação pelo Executivo</li>
        <li>Período de transição de 3 anos</li>
      </ol>
      
      <p>O presidente da Câmara, Roberto Almeida (MDB-RJ), prevê que todo o processo de aprovação deve ser concluído até o final do primeiro semestre de 2024.</p>
      
      <p>A implementação da reforma será gradual, com período de adaptação para empresas e órgãos fiscalizadores. Estados e municípios terão prazo de até 36 meses para se adequar ao novo sistema.</p>
    `,
    tags: ["reforma tributária", "política", "economia", "impostos", "empresas"],
    relatedArticles: [
      {
        id: 2,
        title: "Entenda como a reforma afetará sua empresa",
        href: "/noticia/reforma-tributaria-empresas",
        image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=300&h=200&fit=crop"
      },
      {
        id: 3,
        title: "Especialistas analisam impactos da mudança",
        href: "/noticia/analise-reforma-tributaria",
        image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=300&h=200&fit=crop"
      }
    ]
  }
}

export default function ArticlePage({ params }: ArticlePageProps) {
  const article = getArticleData(params.slug)

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

  const shareUrl = typeof window !== 'undefined' ? window.location.href : ''
  const shareText = `${article.title} - Portal de Notícias`

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-primary-600 hover:text-primary-700">
              Início
            </Link>
            <span className="text-neutral-400">/</span>
            <Link 
              href={`/categoria/${article.category.toLowerCase()}`} 
              className="text-primary-600 hover:text-primary-700"
            >
              {article.category}
            </Link>
            <span className="text-neutral-400">/</span>
            <span className="text-neutral-600 truncate">{article.title}</span>
          </nav>
        </div>
      </div>

      <article className="py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
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
                <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full ${getCategoryColor(article.category)}`}>
                  {article.category}
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
                  <Image
                    src={article.author.avatar}
                    alt={article.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <div>
                    <p className="font-medium text-neutral-900">{article.author.name}</p>
                    <p className="text-sm">{article.author.bio}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-1">
                    <Calendar size={16} />
                    <span>{formatDate(article.publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{article.readTime} de leitura</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={16} />
                    <span>{article.views.toLocaleString()} visualizações</span>
                  </div>
                </div>
              </div>

              {/* Social sharing */}
              <div className="flex items-center space-x-4 py-4 border-y border-neutral-200">
                <span className="text-sm font-medium text-neutral-700">Compartilhar:</span>
                <div className="flex items-center space-x-3">
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                    title="Compartilhar no Facebook"
                  >
                    <Facebook size={16} />
                  </a>
                  <a
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors duration-200"
                    title="Compartilhar no Twitter"
                  >
                    <Twitter size={16} />
                  </a>
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
                    title="Compartilhar no WhatsApp"
                  >
                    <MessageCircle size={16} />
                  </a>
                </div>
              </div>
            </header>

            {/* Featured image */}
            <div className="relative h-96 lg:h-[500px] mb-8 rounded-xl overflow-hidden">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Article content */}
            <div 
              className="prose prose-lg max-w-none prose-headings:text-neutral-900 prose-p:text-neutral-700 prose-a:text-primary-600 prose-strong:text-neutral-900 prose-blockquote:border-primary-600 prose-blockquote:bg-neutral-50 prose-blockquote:rounded-lg prose-blockquote:p-6"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Tags */}
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <h3 className="text-lg font-semibold mb-4">Tags relacionadas:</h3>
              <div className="flex flex-wrap gap-2">
                {article.tags.map(tag => (
                  <span 
                    key={tag}
                    className="px-3 py-1 bg-neutral-200 text-neutral-700 rounded-full text-sm hover:bg-neutral-300 transition-colors duration-200 cursor-pointer"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Related articles */}
            {article.relatedArticles.length > 0 && (
              <div className="mt-12 pt-8 border-t border-neutral-200">
                <h3 className="text-2xl font-bold mb-6">Leia também</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  {article.relatedArticles.map(related => (
                    <Link 
                      key={related.id}
                      href={related.href}
                      className="flex space-x-4 p-4 bg-white rounded-lg border border-neutral-200 hover:shadow-md transition-shadow duration-200"
                    >
                      <div className="relative w-24 h-24 flex-shrink-0">
                        <Image
                          src={related.image}
                          alt={related.title}
                          fill
                          className="object-cover rounded-lg"
                        />
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
      </article>
    </div>
  )
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = getArticleData(params.slug)
  
  return {
    title: `${article.title} - Portal de Notícias`,
    description: article.subtitle,
    openGraph: {
      title: article.title,
      description: article.subtitle,
      images: [article.image],
      type: 'article',
    },
  }
}
