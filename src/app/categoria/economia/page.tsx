import CategoryPage from '@/components/CategoryPage'

export const metadata = {
  title: 'Economia - Portal de Notícias',
  description: 'Últimas notícias sobre economia brasileira, mercado financeiro, negócios e indicadores econômicos.',
}

export default function EconomiaPage() {
  return (
    <CategoryPage
      category="Economia"
      categoryColor="bg-gradient-to-br from-secondary-600 to-secondary-700"
      description="Fique por dentro do mercado financeiro, indicadores econômicos, negócios e análises sobre a economia nacional e internacional."
    />
  )
}
