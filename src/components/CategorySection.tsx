import Link from 'next/link'
import { 
  Building2, 
  TrendingUp, 
  Trophy, 
  Palette, 
  MapPin,
  ArrowRight 
} from 'lucide-react'

const CategorySection = () => {
  const categories = [
    {
      name: 'Política',
      href: '/categoria/politica',
      icon: Building2,
      description: 'Últimas decisões do governo e análises políticas',
      color: 'bg-primary-900 hover:bg-primary-800',
      newsCount: 45
    },
    {
      name: 'Economia',
      href: '/categoria/economia',
      icon: TrendingUp,
      description: 'Mercado financeiro, negócios e economia nacional',
      color: 'bg-secondary-600 hover:bg-secondary-700',
      newsCount: 38
    },
    {
      name: 'Esportes',
      href: '/categoria/esportes',
      icon: Trophy,
      description: 'Resultados, análises e novidades do mundo esportivo',
      color: 'bg-accent-500 hover:bg-accent-600',
      newsCount: 52
    },
    {
      name: 'Cultura',
      href: '/categoria/cultura',
      icon: Palette,
      description: 'Arte, música, literatura e eventos culturais',
      color: 'bg-primary-500 hover:bg-primary-600',
      newsCount: 29
    },
    {
      name: 'Cidades',
      href: '/categoria/cidades',
      icon: MapPin,
      description: 'Notícias locais, infraestrutura e vida urbana',
      color: 'bg-secondary-700 hover:bg-secondary-800',
      newsCount: 67
    }
  ]

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
          {categories.map((category, index) => (
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
