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
    // Buscar todas as categorias e filtrar pelo slug
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`, {
      next: { revalidate: 300 } // Revalidar a cada 5 minutos
    })
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    const categories = data.data || []
    
    // Encontrar categoria pelo slug
    const category = categories.find((cat: CategoryData) => cat.slug === slug && cat.is_active)
    
    return category || null
  } catch (error) {
    console.error('Erro ao buscar categoria:', error)
    return null
  }
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
    // Se a cor for um hex, criar um gradiente
    if (color.startsWith('#')) {
      return `bg-gradient-to-br from-primary-900 to-primary-800`
    }
    
    // Fallback para cores pré-definidas
    const colorMap: Record<string, string> = {
      '#DC2626': 'bg-gradient-to-br from-red-900 to-red-800',
      '#059669': 'bg-gradient-to-br from-emerald-900 to-emerald-800', 
      '#7C3AED': 'bg-gradient-to-br from-violet-900 to-violet-800',
      '#0EA5E9': 'bg-gradient-to-br from-sky-900 to-sky-800',
      '#3B82F6': 'bg-gradient-to-br from-blue-900 to-blue-800',
      '#D97706': 'bg-gradient-to-br from-amber-900 to-amber-800'
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
