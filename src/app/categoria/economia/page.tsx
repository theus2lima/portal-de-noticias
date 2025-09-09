import CategoryPage from '@/components/CategoryPage'
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Economia Brasileira - Notícias e Análises',
  description: 'Notícias sobre economia brasileira, mercado financeiro, bolsa de valores, PIB, inflação, juros, negócios e indicadores econômicos atualizados.',
  keywords: ['economia brasil', 'mercado financeiro', 'bolsa valores', 'PIB', 'inflação', 'juros', 'banco central', 'dolar', 'investimentos', 'negócios'],
  url: 'https://portal-de-noticias.vercel.app/categoria/economia',
  category: 'Economia'
})

export default function EconomiaPage() {
  return (
    <CategoryPage
      category="Economia"
      categoryColor="bg-gradient-to-br from-secondary-600 to-secondary-700"
      description="Fique por dentro do mercado financeiro, indicadores econômicos, negócios e análises sobre a economia nacional e internacional."
    />
  )
}
