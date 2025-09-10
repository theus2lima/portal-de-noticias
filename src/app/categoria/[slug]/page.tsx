import { notFound } from 'next/navigation'
import CategoryPage from '@/components/CategoryPage'
import { generateSEO } from '@/lib/seo'

interface CategoryData {
  id: string
  name: string
  slug: string
  description: string
  color: string
  is_active: boolean
}

async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  try {
    // Para build local, usar fallback categories
    const fallbackCategories = [
      { id: '1', name: 'Política', slug: 'politica', description: 'Notícias sobre política nacional e local', color: '#DC2626', is_active: true },
      { id: '2', name: 'Economia', slug: 'economia', description: 'Economia, finanças e mercado', color: '#059669', is_active: true },
      { id: '3', name: 'Esportes', slug: 'esportes', description: 'Esportes nacionais e internacionais', color: '#7C3AED', is_active: true },
      { id: '4', name: 'Cultura', slug: 'cultura', description: 'Arte, cultura e entretenimento', color: '#0EA5E9', is_active: true },
      { id: '5', name: 'Cidades', slug: 'cidades', description: 'Notícias das cidades e regiões', color: '#D97706', is_active: true },
      { id: '6', name: 'Tecnologia', slug: 'tecnologia', description: 'Inovação e tecnologia', color: '#3B82F6', is_active: true }
    ]

    try {
      // Tentar buscar da API primeiro
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 
                     process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 
                     'http://localhost:3000'
      
      const response = await fetch(`${baseUrl}/api/categories`, {
        next: { revalidate: 300 },
        headers: {
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const categories = data.data || []
        const category = categories.find((cat: CategoryData) => cat.slug === slug && cat.is_active)
        if (category) return category
      }
    } catch (apiError) {
      console.log('API não disponível durante build, usando fallback')
    }
    
    // Fallback para categorias padrão
    const category = fallbackCategories.find(cat => cat.slug === slug)
    return category || null
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return null
  }
}

// Gerar páginas estáticas para as categorias principais
export async function generateStaticParams() {
  // Categorias padrão que sempre devem existir
  const defaultSlugs = ['politica', 'economia', 'esportes', 'cultura', 'cidades', 'tecnologia']
  
  try {
    // Tentar buscar categorias da API
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const response = await fetch(`${baseUrl}/api/categories`, {
      next: { revalidate: 300 }
    })
    
    if (response.ok) {
      const data = await response.json()
      const categories = data.data || []
      const apiSlugs = categories
        .filter((cat: CategoryData) => cat.is_active)
        .map((cat: CategoryData) => cat.slug)
      
      // Combinar slugs da API com padrões
      const uniqueSlugs = new Set([...defaultSlugs, ...apiSlugs])
      const allSlugs = Array.from(uniqueSlugs)
      return allSlugs.map(slug => ({ slug }))
    }
  } catch (error) {
    console.log('Usando categorias padrão para generateStaticParams')
  }
  
  // Fallback para categorias padrão
  return defaultSlugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug)
  
  if (!category) {
    return {
      title: 'Categoria não encontrada',
      description: 'A categoria solicitada não foi encontrada.'
    }
  }

  return generateSEO({
    title: `Notícias de ${category.name}`,
    description: category.description || `Acompanhe as últimas notícias de ${category.name.toLowerCase()}, análises e os principais acontecimentos desta categoria.`,
    keywords: [category.name.toLowerCase(), 'notícias', 'brasil', 'atualidades'],
    url: `https://portal-de-noticias.vercel.app/categoria/${category.slug}`,
    category: category.name
  })
}

export default async function DynamicCategoryPage({ params }: { params: { slug: string } }) {
  const category = await getCategoryBySlug(params.slug)
  
  if (!category) {
    notFound()
  }

  // Mapear cor para classe CSS
  const getCategoryColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      '#DC2626': 'bg-gradient-to-br from-red-900 to-red-800',
      '#059669': 'bg-gradient-to-br from-emerald-900 to-emerald-800', 
      '#7C3AED': 'bg-gradient-to-br from-violet-900 to-violet-800',
      '#0EA5E9': 'bg-gradient-to-br from-sky-900 to-sky-800',
      '#3B82F6': 'bg-gradient-to-br from-blue-900 to-blue-800',
      '#D97706': 'bg-gradient-to-br from-amber-900 to-amber-800',
      '#16A34A': 'bg-gradient-to-br from-green-900 to-green-800',
      '#BE185D': 'bg-gradient-to-br from-pink-900 to-pink-800',
      '#7C2D12': 'bg-gradient-to-br from-amber-800 to-amber-900',
      '#374151': 'bg-gradient-to-br from-gray-600 to-gray-700',
      '#1F2937': 'bg-gradient-to-br from-gray-800 to-gray-900'
    }
    
    return colorMap[color] || 'bg-gradient-to-br from-primary-900 to-primary-800'
  }

  return (
    <CategoryPage
      category={category.name}
      categoryColor={getCategoryColorClass(category.color)}
      description={category.description || `Acompanhe as últimas notícias de ${category.name.toLowerCase()}, análises e os principais acontecimentos desta categoria.`}
      categoryId={category.id}
      categorySlug={category.slug}
    />
  )
}
