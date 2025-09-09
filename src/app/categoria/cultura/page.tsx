import CategoryPage from '@/components/CategoryPage'

export const metadata = {
  title: 'Cultura - Portal de Notícias',
  description: 'Arte, música, literatura, cinema e eventos culturais. Descubra o que há de melhor na cultura brasileira.',
}

export default function CulturaPage() {
  return (
    <CategoryPage
      category="Cultura"
      categoryColor="bg-gradient-to-br from-primary-500 to-primary-600"
      description="Explore o mundo da arte, música, literatura, cinema e eventos culturais. Mantenha-se atualizado sobre a rica cultura brasileira."
    />
  )
}
