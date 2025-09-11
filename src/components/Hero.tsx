'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Clock, User, FileText } from 'lucide-react'

interface Article {
  id: string
  title: string
  subtitle?: string
  slug: string
  featured_image?: string
  category_name: string
  author_name: string
  created_at: string
}

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [headlines, setHeadlines] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [tickerData, setTickerData] = useState({
    enabled: true,
    items: [] as string[]
  })

  // Carregar artigos reais da API
  useEffect(() => {
    const fetchHeadlines = async () => {
      try {
        const response = await fetch('/api/articles?status=published&limit=3')
        if (response.ok) {
          const data = await response.json()
          setHeadlines(data.data || [])
        }
      } catch (error) {
        console.error('Erro ao buscar artigos para o hero:', error)
        // Não há dados para exibir
        setHeadlines([])
      } finally {
        setLoading(false)
      }
    }

    fetchHeadlines()
  }, [])

  // Carregar dados do ticker
  useEffect(() => {
    const fetchTickerData = async () => {
      try {
        const response = await fetch('/api/settings?category=ticker')
        if (response.ok) {
          const data = await response.json()
          if (data.success) {
            setTickerData({
              enabled: data.data.tickerEnabled,
              items: data.data.tickerItems
                .filter((item: any) => item.active)
                .map((item: any) => item.text)
            })
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados do ticker:', error)
        // Não há dados de ticker para exibir
        setTickerData({
          enabled: false,
          items: []
        })
      }
    }

    fetchTickerData()
  }, [])

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
          {loading ? (
            <div className="relative h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl bg-neutral-200 animate-pulse">
              <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                <div className="max-w-4xl">
                  <div className="h-6 bg-neutral-300 rounded mb-4 w-24"></div>
                  <div className="h-8 bg-neutral-300 rounded mb-3 w-3/4"></div>
                  <div className="h-6 bg-neutral-300 rounded mb-4 w-1/2"></div>
                  <div className="flex space-x-4">
                    <div className="h-4 bg-neutral-300 rounded w-20"></div>
                    <div className="h-4 bg-neutral-300 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </div>
          ) : headlines.length > 0 ? (
            <div className="relative h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl">
              {headlines.map((headline, index) => (
                <div
                  key={headline.id}
                  className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0'
                  }`}
                >
                  <div className="relative h-full w-full">
                    {headline.featured_image ? (
                      <Image
                        src={headline.featured_image}
                        alt={headline.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                    ) : (
                      <div className="w-full h-full bg-neutral-300 flex items-center justify-center">
                        <FileText className="h-24 w-24 text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                      <div className="max-w-4xl">
                        <span className={`inline-block px-3 py-1 text-sm font-semibold text-white rounded-full mb-4 ${getCategoryColor(headline.category_name)}`}>
                          {headline.category_name}
                        </span>
                        
                        <Link href={`/noticia/${headline.slug}`} className="block group">
                          <h1 className="text-2xl lg:text-4xl font-bold mb-3 group-hover:text-secondary-400 transition-colors duration-200 leading-tight">
                            {headline.title}
                          </h1>
                          {headline.subtitle && (
                            <p className="text-lg lg:text-xl text-gray-200 mb-4 leading-relaxed">
                              {headline.subtitle}
                            </p>
                          )}
                        </Link>
                        
                        <div className="flex items-center space-x-4 text-sm text-gray-300">
                          <div className="flex items-center space-x-1">
                            <User size={16} />
                            <span>{headline.author_name}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock size={16} />
                            <span>{formatDate(headline.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-[500px] lg:h-[600px] rounded-xl overflow-hidden shadow-2xl bg-neutral-100 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 text-neutral-400 mx-auto mb-4" />
                <p className="text-neutral-600 text-lg">Nenhum artigo encontrado</p>
              </div>
            </div>
          )}

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
        {tickerData.enabled && tickerData.items.length > 0 && (
          <div className="mt-6 bg-secondary-600 rounded-lg p-4">
            <div className="flex items-center">
              <span className="bg-white text-secondary-600 px-3 py-1 rounded-full text-sm font-bold mr-4 animate-pulse">
                ÚLTIMAS
              </span>
              <div className="flex-1 overflow-hidden">
                <div className="animate-marquee whitespace-nowrap">
                  <span className="text-white font-medium">
                    {tickerData.items.join(' • ')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}

export default Hero
