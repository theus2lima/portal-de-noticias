import Link from 'next/link'
import Image from 'next/image'
import { TrendingUp, Eye, Clock } from 'lucide-react'

const MostRead = () => {
  // Mock data - será substituído por dados da API
  const mostReadArticles = [
    {
      id: 1,
      title: "Brasil Conquista Posição de Destaque no Ranking Mundial de Inovação",
      image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=300&h=200&fit=crop",
      category: "Tecnologia",
      views: 15642,
      publishedAt: "2024-01-07T14:30:00Z",
      href: "/noticia/brasil-inovacao-ranking",
      rank: 1
    },
    {
      id: 2,
      title: "Nova Descoberta Arqueológica Revela Civilização Pré-Colombiana",
      image: "https://images.unsplash.com/photo-1594736797933-d0301ba2fe65?w=300&h=200&fit=crop",
      category: "Cultura",
      views: 12953,
      publishedAt: "2024-01-07T11:15:00Z",
      href: "/noticia/descoberta-arqueologica",
      rank: 2
    },
    {
      id: 3,
      title: "Mercado de Criptomoedas Registra Alta de 250% em Três Meses",
      image: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=300&h=200&fit=crop",
      category: "Economia",
      views: 11287,
      publishedAt: "2024-01-06T16:45:00Z",
      href: "/noticia/criptomoedas-alta",
      rank: 3
    },
    {
      id: 4,
      title: "Campeonato Mundial: Brasil Avança para Final Após 12 Anos",
      image: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=300&h=200&fit=crop",
      category: "Esportes",
      views: 9876,
      publishedAt: "2024-01-06T19:20:00Z",
      href: "/noticia/brasil-final-mundial",
      rank: 4
    },
    {
      id: 5,
      title: "Projeto de Lei Ambiental Promete Mudar Futuro da Amazônia",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=300&h=200&fit=crop",
      category: "Política",
      views: 8654,
      publishedAt: "2024-01-05T13:30:00Z",
      href: "/noticia/lei-ambiental-amazonia",
      rank: 5
    }
  ]

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

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
      'Política': 'text-primary-900',
      'Economia': 'text-secondary-600',
      'Esportes': 'text-accent-500',
      'Cultura': 'text-primary-500',
      'Cidades': 'text-secondary-700',
      'Tecnologia': 'text-primary-600'
    }
    return colors[category] || 'text-primary-900'
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-yellow-900'
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-gray-900'
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600 text-orange-900'
    return 'bg-primary-500 text-white'
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center space-x-2 mb-4">
            <TrendingUp className="text-secondary-600" size={32} />
            <h2 className="text-3xl lg:text-4xl font-bold text-gradient">
              Mais Lidas
            </h2>
          </div>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            As notícias que mais despertaram o interesse dos nossos leitores
          </p>
        </div>

        {/* Featured Article (Rank #1) */}
        <div className="mb-12">
          <Link href={mostReadArticles[0].href} className="block group">
            <div className="relative bg-gradient-to-br from-primary-900 to-secondary-600 rounded-xl overflow-hidden shadow-2xl">
              <div className="grid lg:grid-cols-3 gap-0">
                <div className="lg:col-span-2 relative h-64 lg:h-96">
                  <Image
                    src={mostReadArticles[0].image}
                    alt={mostReadArticles[0].title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                  
                  {/* Rank Badge */}
                  <div className="absolute top-4 left-4">
                    <div className={`${getRankColor(1)} w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg`}>
                      #1
                    </div>
                  </div>
                </div>
                
                <div className="p-6 lg:p-8 text-white flex flex-col justify-center">
                  <span className={`inline-block text-sm font-semibold mb-4 text-secondary-300`}>
                    {mostReadArticles[0].category}
                  </span>
                  
                  <h3 className="text-xl lg:text-2xl font-bold mb-4 group-hover:text-secondary-300 transition-colors duration-200">
                    {mostReadArticles[0].title}
                  </h3>
                  
                  <div className="flex items-center space-x-4 text-sm text-white/80">
                    <div className="flex items-center space-x-1">
                      <Eye size={16} />
                      <span>{formatViews(mostReadArticles[0].views)} visualizações</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock size={16} />
                      <span>{formatDate(mostReadArticles[0].publishedAt)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Other Articles Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {mostReadArticles.slice(1).map((article, index) => (
            <Link 
              key={article.id}
              href={article.href}
              className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:shadow-xl transition-all duration-300 group animate-fadeInUp"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative h-40">
                <Image
                  src={article.image}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                
                {/* Rank Badge */}
                <div className="absolute top-3 left-3">
                  <div className={`${getRankColor(article.rank)} w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-lg`}>
                    #{article.rank}
                  </div>
                </div>
                
                {/* Views Overlay */}
                <div className="absolute bottom-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <Eye size={12} />
                  <span>{formatViews(article.views)}</span>
                </div>
              </div>
              
              <div className="p-4">
                <span className={`text-xs font-semibold ${getCategoryColor(article.category)} mb-2 block`}>
                  {article.category}
                </span>
                
                <h3 className="font-bold text-sm mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-3 leading-tight">
                  {article.title}
                </h3>
                
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>{formatDate(article.publishedAt)}</span>
                  <div className="flex items-center space-x-1">
                    <TrendingUp size={12} />
                    <span>Trending</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Stats Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-900 to-secondary-600 rounded-xl p-8 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl font-bold mb-2">50K+</div>
              <div className="text-sm text-white/80">Leitores mensais</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">1.2M+</div>
              <div className="text-sm text-white/80">Páginas vistas</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">350+</div>
              <div className="text-sm text-white/80">Artigos publicados</div>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">24/7</div>
              <div className="text-sm text-white/80">Cobertura contínua</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default MostRead
