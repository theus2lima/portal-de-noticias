'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Clock, User } from 'lucide-react'

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  // Mock data - será substituído por dados reais da API
  const headlines = [
    {
      id: 1,
      title: "Nova Política Econômica Promete Revolucionar o Mercado Brasileiro",
      subtitle: "Medidas incluem redução de juros e incentivos para pequenas empresas",
      image: "https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=1200&h=600&fit=crop",
      category: "Economia",
      author: "João Silva",
      publishedAt: "2024-01-08T10:30:00Z",
      href: "/noticia/nova-politica-economica"
    },
    {
      id: 2,
      title: "Breakthrough em Tecnologia Verde Pode Transformar Energia no País",
      subtitle: "Pesquisadores desenvolvem nova fonte de energia limpa e renovável",
      image: "https://images.unsplash.com/photo-1466611653911-95081537e5b7?w=1200&h=600&fit=crop",
      category: "Ciência",
      author: "Maria Santos",
      publishedAt: "2024-01-08T08:15:00Z",
      href: "/noticia/tecnologia-verde"
    },
    {
      id: 3,
      title: "Copa Mundial: Brasil Avança para as Semifinais em Jogo Emocionante",
      subtitle: "Seleção brasileira vence por 3-1 em partida disputada no Maracanã",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=1200&h=600&fit=crop",
      category: "Esportes",
      author: "Carlos Oliveira",
      publishedAt: "2024-01-07T22:45:00Z",
      href: "/noticia/brasil-semifinais"
    }
  ]

  // Auto-play do carrossel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % headlines.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [headlines.length])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % headlines.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + headlines.length) % headlines.length)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
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
      'Cidades': 'bg-secondary-700',
      'Ciência': 'bg-primary-600'
    }
    return colors[category] || 'bg-primary-900'
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-900 to-primary-800 text-white overflow-hidden">
      <div className="container mx-auto px-4 py-8 lg:py-12">
        <div className="relative">
          {/* Carrossel */}
          <div className="relative h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl">
            {headlines.map((headline, index) => (
              <div
                key={headline.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <div className="relative h-full w-full">
                  <Image
                    src={headline.image}
                    alt={headline.title}
                    fill
                    className="object-cover"
                    priority={index === 0}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                    <div className="max-w-4xl">
                      <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full mb-4 ${getCategoryColor(headline.category)}`}>
                        {headline.category}
                      </span>
                      
                      <Link href={headline.href} className="block group">
                        <h1 className="text-2xl lg:text-4xl font-bold mb-3 group-hover:text-secondary-400 transition-colors duration-200 leading-tight">
                          {headline.title}
                        </h1>
                        <p className="text-lg lg:text-xl text-gray-200 mb-4 leading-relaxed">
                          {headline.subtitle}
                        </p>
                      </Link>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-300">
                        <div className="flex items-center space-x-1">
                          <User size={16} />
                          <span>{headline.author}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{formatDate(headline.publishedAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Controles do Carrossel */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 hover:scale-110"
            aria-label="Próximo slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicadores */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {headlines.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-secondary-500 scale-110'
                    : 'bg-white/50 hover:bg-white/70'
                }`}
                aria-label={`Slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Breaking News Ticker */}
        <div className="mt-6 bg-secondary-600 rounded-lg p-4">
          <div className="flex items-center">
            <span className="bg-white text-secondary-600 px-3 py-1 rounded-full text-sm font-bold mr-4 animate-pulse">
              ÚLTIMAS
            </span>
            <div className="flex-1 overflow-hidden">
              <div className="animate-marquee whitespace-nowrap">
                <span className="text-white font-medium">
                  🔴 Nova lei aprovada no Senado • 🏆 Brasil conquista medalha de ouro • 💰 Bolsa de valores atinge recorde histórico • 🌿 Projeto ambiental recebe investimento de R$ 50 milhões
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default Hero
