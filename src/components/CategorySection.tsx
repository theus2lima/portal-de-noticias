'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { 
  Building2, 
  TrendingUp, 
  Trophy, 
  Palette, 
  MapPin,
  ArrowRight 
} from 'lucide-react'

// Mapeamento de ícones por slug/nome
const iconMap: Record<string, any> = {
  politica: Building2,
  economia: TrendingUp,
  esportes: Trophy,
  cultura: Palette,
  cidades: MapPin,
}

const CategorySection = () => {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('/api/categories?include_articles=true')
        const data = await res.json()
        const cats = (data.data || []).filter((c: any) => c.is_active !== false)
        setCategories(cats)
      } catch (e) {
        console.error('Erro ao carregar categorias:', e)
      } finally {
        setLoading(false)
      }
    }
    fetchCategories()
  }, [])

  const normalized = useMemo(() => {
    if (!categories || categories.length === 0) return []
    return categories.map((c: any) => {
      const slug = (c.slug || c.name || '').toString().toLowerCase()
      const Icon = iconMap[slug] || Building2
      const count = (c.articles && c.articles[0]?.count) || c.articles_count || c.newsCount || 0
      const href = `/categoria/${slug}`
      const color = 'bg-primary-900 hover:bg-primary-800'
      return {
        name: c.name,
        href,
        icon: Icon,
        description: c.description || 'Notícias desta categoria',
        color,
        newsCount: count
      }
    })
  }, [categories])

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gradient mb-4">
            Explore por Categoria
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Encontre as notícias que mais importam para você, organizadas por tema
          </p>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {(loading ? [] : normalized).map((category, index) => (
            <Link 
              key={category.name}
              href={category.href}
              className={`
                ${category.color} 
                text-white rounded-xl p-6 transition-all duration-300 
                hover:scale-105 hover:shadow-xl group
                animate-fadeInUp
              `}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <category.icon 
                  size={32} 
                  className="group-hover:scale-110 transition-transform duration-200"
                />
                <ArrowRight 
                  size={20} 
                  className="opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                />
              </div>
              
              <h3 className="text-xl font-bold mb-2 group-hover:text-yellow-200 transition-colors duration-200">
                {category.name}
              </h3>
              
              <p className="text-sm text-white/80 mb-4 leading-relaxed">
                {category.description}
              </p>
              
              <div className="flex items-center justify-between text-sm">
                <span className="bg-white/20 px-2 py-1 rounded-full">
                  {category.newsCount} notícias
                </span>
                <span className="font-medium">
                  Ver mais →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-gradient-to-r from-primary-900 to-secondary-600 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Não encontrou o que procura?
            </h3>
            <p className="text-lg mb-6 text-white/90">
              Use nossa busca avançada para encontrar notícias específicas
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="text" 
                placeholder="Digite sua busca..."
                className="flex-1 px-4 py-3 rounded-lg text-neutral-900 focus:outline-none focus:ring-2 focus:ring-secondary-400"
              />
              <button className="bg-secondary-600 hover:bg-secondary-700 px-6 py-3 rounded-lg font-medium transition-colors duration-200">
                Buscar
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CategorySection
