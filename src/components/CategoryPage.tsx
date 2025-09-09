'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Filter, Clock, User, Eye, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react'

interface CategoryPageProps {
  category: string
  categoryColor: string
  description: string
}

const CategoryPage = ({ category, categoryColor, description }: CategoryPageProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const articlesPerPage = 9

  // Mock data - seria substituído por dados reais da API filtrados por categoria
  const allArticles = [
    {
      id: 1,
      title: "Reforma Tributária Avança no Congresso com Amplo Apoio",
      excerpt: "Proposta de simplificação do sistema tributário brasileiro recebe aprovação em primeira votação...",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop",
      author: "Ana Costa",
      publishedAt: "2024-01-08T14:30:00Z",
      views: 1254,
      href: "/noticia/reforma-tributaria-avanca"
    },
    {
      id: 2,
      title: "Nova Lei de Transparência Pública Entra em Vigor",
      excerpt: "Medidas visam aumentar o acesso da população às informações governamentais...",
      image: "https://images.unsplash.com/photo-1586880244386-8b3e34c8382c?w=400&h=250&fit=crop",
      author: "Roberto Lima",
      publishedAt: "2024-01-08T12:15:00Z",
      views: 987,
      href: "/noticia/lei-transparencia"
    },
    {
      id: 3,
      title: "Ministro Anuncia Investimentos em Infraestrutura",
      excerpt: "R$ 200 bilhões serão destinados para obras de saneamento e mobilidade urbana...",
      image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=400&h=250&fit=crop",
      author: "Carla Santos",
      publishedAt: "2024-01-08T10:45:00Z",
      views: 756,
      href: "/noticia/investimentos-infraestrutura"
    },
    {
      id: 4,
      title: "Congresso Debate Mudanças na Lei Eleitoral",
      excerpt: "Propostas incluem modificações no financiamento de campanhas e propaganda eleitoral...",
      image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=400&h=250&fit=crop",
      author: "Marcos Silva",
      publishedAt: "2024-01-08T09:20:00Z",
      views: 642,
      href: "/noticia/mudancas-lei-eleitoral"
    },
    {
      id: 5,
      title: "Acordo Internacional Fortalece Relações Comerciais",
      excerpt: "Brasil assina tratado que facilita exportações para mercados europeus...",
      image: "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400&h=250&fit=crop",
      author: "Paulo Mendes",
      publishedAt: "2024-01-07T20:30:00Z",
      views: 1876,
      href: "/noticia/acordo-comercial"
    },
    {
      id: 6,
      title: "Presidente Sanciona Lei de Proteção de Dados",
      excerpt: "Nova legislação estabelece regras mais rígidas para uso de informações pessoais...",
      image: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=400&h=250&fit=crop",
      author: "Julia Fernandes",
      publishedAt: "2024-01-07T16:45:00Z",
      views: 1123,
      href: "/noticia/lei-protecao-dados"
    },
    {
      id: 7,
      title: "Comissão Aprova Projeto de Modernização do Estado",
      excerpt: "Iniciativa prevê digitalização de serviços públicos e redução da burocracia...",
      image: "https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=250&fit=crop",
      author: "Marina Rodrigues",
      publishedAt: "2024-01-07T14:20:00Z",
      views: 834,
      href: "/noticia/modernizacao-estado"
    },
    {
      id: 8,
      title: "Senado Analisa Proposta de Reforma Administrativa",
      excerpt: "Projeto visa reorganizar a estrutura do funcionalismo público federal...",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop",
      author: "Diego Almeida",
      publishedAt: "2024-01-07T11:30:00Z",
      views: 698,
      href: "/noticia/reforma-administrativa"
    },
    {
      id: 9,
      title: "Nova Agenda Ambiental é Apresentada no Planalto",
      excerpt: "Governo lança plano estratégico para redução de emissões até 2030...",
      image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=250&fit=crop",
      author: "Fernanda Costa",
      publishedAt: "2024-01-06T18:45:00Z",
      views: 1567,
      href: "/noticia/agenda-ambiental"
    },
    {
      id: 10,
      title: "Câmara Vota Orçamento 2024 na Próxima Semana",
      excerpt: "Projeto prevê investimentos recordes em educação e saúde pública...",
      image: "https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=400&h=250&fit=crop",
      author: "Ricardo Santos",
      publishedAt: "2024-01-06T15:20:00Z",
      views: 945,
      href: "/noticia/orcamento-2024"
    }
  ]

  // Filtrar artigos baseado na busca
  const filteredArticles = allArticles.filter(article =>
    article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    article.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Paginação
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage)
  const startIndex = (currentPage - 1) * articlesPerPage
  const currentArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Agora há pouco'
    if (diffInHours < 24) return `há ${diffInHours}h`
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo(0, 0)
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header da Categoria */}
      <section className={`${categoryColor} text-white py-16`}>
        <div className="container mx-auto px-4">
          <Link 
            href="/" 
            className="inline-flex items-center space-x-2 text-white/80 hover:text-white mb-6 transition-colors duration-200"
          >
            <ArrowLeft size={20} />
            <span>Voltar ao início</span>
          </Link>
          
          <div className="max-w-4xl">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {category}
            </h1>
            <p className="text-xl text-white/90 leading-relaxed">
              {description}
            </p>
          </div>
        </div>
      </section>

      {/* Filtros e Busca */}
      <section className="py-8 bg-white border-b border-neutral-200">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-2 text-neutral-600">
              <Filter size={20} />
              <span className="font-medium">
                {filteredArticles.length} artigo{filteredArticles.length !== 1 ? 's' : ''} encontrado{filteredArticles.length !== 1 ? 's' : ''}
              </span>
            </div>
            
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Buscar nesta categoria..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1) // Reset para primeira página ao buscar
                }}
                className="w-full pl-10 pr-4 py-3 border-2 border-neutral-300 rounded-lg focus:border-primary-500 focus:outline-none transition-colors duration-200"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid de Artigos */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {currentArticles.length > 0 ? (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {currentArticles.map((article, index) => (
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
                    </div>
                    
                    <div className="p-6">
                      <h3 className="text-xl font-bold mb-3 group-hover:text-primary-600 transition-colors duration-200 line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-neutral-600 mb-4 line-clamp-3">
                        {article.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm text-neutral-500">
                        <div className="flex items-center space-x-2">
                          <User size={16} />
                          <span>{article.author}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{formatDate(article.publishedAt)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye size={16} />
                            <span>{article.views}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Paginação */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-12">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <ChevronLeft size={20} />
                    <span>Anterior</span>
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${
                          currentPage === page
                            ? `${categoryColor} text-white`
                            : 'text-neutral-600 hover:bg-neutral-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center space-x-2 px-4 py-2 border border-neutral-300 rounded-lg hover:bg-neutral-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    <span>Próxima</span>
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            // Estado vazio quando não há resultados
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <Search className="mx-auto text-neutral-400 mb-4" size={64} />
                <h3 className="text-2xl font-bold text-neutral-800 mb-4">
                  Nenhum resultado encontrado
                </h3>
                <p className="text-neutral-600 mb-6">
                  Não encontramos artigos que correspondem à sua busca &quot;{searchQuery}&quot;.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="btn-primary"
                >
                  Limpar busca
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

export default CategoryPage
