import CategoryPage from '@/components/CategoryPage'

export const metadata = {
  title: 'Esportes - Portal de Notícias',
  description: 'Resultados, análises e novidades do mundo esportivo. Futebol, olimpíadas, campeonatos nacionais e internacionais.',
}

export default function EsportesPage() {
  return (
    <CategoryPage
      category="Esportes"
      categoryColor="bg-gradient-to-br from-accent-500 to-accent-600"
      description="Resultados dos principais campeonatos, análises esportivas e todas as novidades do mundo dos esportes nacional e internacional."
    />
  )
}
