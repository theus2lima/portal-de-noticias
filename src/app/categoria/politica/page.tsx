import CategoryPage from '@/components/CategoryPage'

export const metadata = {
  title: 'Política - Portal de Notícias',
  description: 'Acompanhe as últimas notícias de política brasileira, decisões governamentais e análises políticas.',
}

export default function PoliticaPage() {
  return (
    <CategoryPage
      category="Política"
      categoryColor="bg-gradient-to-br from-primary-900 to-primary-800"
      description="Acompanhe as últimas decisões do governo, análises políticas e os principais acontecimentos do cenário político nacional."
    />
  )
}
