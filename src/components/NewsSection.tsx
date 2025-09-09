import Link from 'next/link'
import Image from 'next/image'
import { Clock, User, Eye, ArrowRight } from 'lucide-react'

const NewsSection = () => {
  // Mock data - será substituído por dados da API
  const recentNews = [
    {
      id: 1,
      title: "Reforma Tributária é Aprovada em Primeira Votação no Congresso",
      excerpt: "Proposta prevê simplificação do sistema de impostos e redução da carga tributária para empresas de pequeno porte...",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop",
      category: "Política",
      author: "Ana Costa",
      publishedAt: "2024-01-08T14:30:00Z",
      views: 1254,
      href: "/noticia/reforma-tributaria"
    },
    {
      id: 2,
      title: "PIB Brasileiro Cresce 2.3% no Último Trimestre",
      excerpt: "Resultado supera expectativas do mercado e consolida recuperação da economia nacional após período de instabilidade...",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=400&h=250&fit=crop",
      category: "Economia",
      author: "Roberto Lima",
      publishedAt: "2024-01-08T12:15:00Z",
      views: 987,
      href: "/noticia/pib-crescimento"
    },
    {
      id: 3,
      title: "Festival de Inverno Movimenta Economia Local em Gramado",
      excerpt: "Evento cultural atrai mais de 100 mil visitantes e gera R$ 50 milhões em receita para a região...",
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=250&fit=crop",
      category: "Cultura",
      author: "Carla Santos",
      publishedAt: "2024-01-08T10:45:00Z",
      views: 756,
      href: "/noticia/festival-gramado"
    },
    {
      id: 4,
      title: "Novo Sistema de Transporte Público Reduz Tempo de Viagem em 40%",
      excerpt: "BRT implementado na capital melhora mobilidade urbana e satisfação dos usuários segundo pesquisa...",
      image: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=250&fit=crop",
      category: "Cidades",
      author: "Marcos Silva",
      publishedAt: "2024-01-08T09:20:00Z",
      views: 642,
      href: "/noticia/transporte-publico"
    },
    {
      id: 5,
      title: "Seleção Brasileira Feminina Conquista Medalha de Ouro",
      excerpt: "Equipe vence por 2-1 na final olímpica e traz mais uma conquista histórica para o país...",
      image: "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=250&fit=crop",
      category: "Esportes",
      author: "Paulo Mendes",
      publishedAt: "2024-01-07T20:30:00Z",
      views: 1876,
      href: "/noticia/selecao-feminina-ouro"
    },
    {
      id: 6,
      title: "Startup Brasileira Desenvolve Tecnologia Inovadora para Energia Solar",
      excerpt: "Nova técnica aumenta eficiência dos painéis solares em 35% e pode revolucionar o setor...",
      image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=250&fit=crop",
      category: "Tecnologia",
      author: "Julia Fernandes",
      publishedAt: "2024-01-07T16:45:00Z",
      views: 1123,
      href: "/noticia/energia-solar"
    }
  ]

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `há ${diffInHours}h`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
    })
  }

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Política': 'category-politica',
      'Economia': 'category-economia',
      'Esportes': 'category-esportes',
      'Cultura': 'category-cultura',
      'Cidades': 'category-cidades',
      'Tecnologia': 'bg-primary-600'
    }
    return colors[category] || 'category-politica'
  }

  return (
    <section className="py-16 bg-neutral-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gradient mb-4">
              Notícias Recentes
            </h2>
            <p className="text-lg text-neutral-600">
              Fique por dentro das últimas novidades
            </p>
          </div>
          <Link 
            href="/noticias" 
            className="btn-primary hidden md:inline-flex items-center space-x-2"
          >
            <span>Ver todas</span>
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Featured Article */}
        <div className="mb-12">
          <Link href={recentNews[0].href} className="block group">
            <div className="grid lg:grid-cols-2 gap-8 bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-64 lg:h-full">
                <Image
                  src={recentNews[0].image}
                  alt={recentNews[0].title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`category-badge ${getCategoryColor(recentNews[0].category)}`}>
                    {recentNews[0].category}
                  </span>
                </div>
              </div>
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <h3 className="text-2xl lg:text-3xl font-bold mb-4 group-hover:text-primary-600 transition-colors duration-200">
                  {recentNews[0].title}
                </h3>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  {recentNews[0].excerpt}
                </p>
                <div className="flex items-center space-x-4 text-sm text-neutral-500">
                  <div className="flex items-center space-x-1">
                    <User size={16} />
                    <span>{recentNews[0].author}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{formatDate(recentNews[0].publishedAt)}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Eye size={16} />
                    <span>{recentNews[0].views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentNews.slice(1).map((article, index) => (
            <Link 
              key={article.id} 
              href={article.href}
              className="news-card group animate-fadeInUp"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative h-48 mb-4">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3">
                  <span className={`category-badge ${getCategoryColor(article.category)}`}>
                    {article.category}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-bold mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                  {article.excerpt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <div className="flex items-center space-x-2">
                    <User size={14} />
                    <span>{article.author}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Clock size={14} />
                      <span>{formatDate(article.publishedAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Eye size={14} />
                      <span>{article.views}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile View All Button */}
        <div className="text-center mt-8 md:hidden">
          <Link href="/noticias" className="btn-primary inline-flex items-center space-x-2">
            <span>Ver todas as notícias</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  )
}

export default NewsSection
