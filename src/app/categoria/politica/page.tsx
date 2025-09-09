import CategoryPage from '@/components/CategoryPage'
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Notícias de Política Brasileira',
  description: 'Acompanhe as últimas notícias de política brasileira, decisões governamentais, eleições, Congresso Nacional e análises políticas atualizadas.',
  keywords: ['política brasileira', 'notícias políticas', 'governo brasil', 'congresso nacional', 'eleições', 'senado', 'câmara deputados', 'STF'],
  url: 'https://portal-de-noticias.vercel.app/categoria/politica',
  category: 'Política'
})

export default function PoliticaPage() {
  return (
    <CategoryPage
      category="Política"
      categoryColor="bg-gradient-to-br from-primary-900 to-primary-800"
      description="Acompanhe as últimas decisões do governo, análises políticas e os principais acontecimentos do cenário político nacional."
    />
  )
}
