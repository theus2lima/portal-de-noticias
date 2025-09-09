import CategoryPage from '@/components/CategoryPage'
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Cultura Brasileira - Arte, Música e Entretenimento',
  description: 'Notícias culturais, arte brasileira, música, literatura, cinema nacional, teatro, festivais, exposições e eventos culturais.',
  keywords: ['cultura brasileira', 'arte brasil', 'música brasileira', 'cinema nacional', 'teatro', 'literatura', 'festivais', 'exposições', 'eventos culturais', 'entretenimento'],
  url: 'https://portal-de-noticias.vercel.app/categoria/cultura',
  category: 'Cultura'
})

export default function CulturaPage() {
  return (
    <CategoryPage
      category="Cultura"
      categoryColor="bg-gradient-to-br from-primary-500 to-primary-600"
      description="Explore o mundo da arte, música, literatura, cinema e eventos culturais. Mantenha-se atualizado sobre a rica cultura brasileira."
    />
  )
}
