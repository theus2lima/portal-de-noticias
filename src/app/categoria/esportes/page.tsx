import CategoryPage from '@/components/CategoryPage'
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Esportes - Notícias e Resultados Esportivos',
  description: 'Notícias esportivas, resultados de jogos, futebol brasileiro, Brasileirão, Copa do Mundo, Olimpíadas, basquete, vôlei e todos os esportes.',
  keywords: ['esportes brasil', 'futebol brasileiro', 'brasileirão', 'copa mundo', 'olimpíadas', 'basquete', 'vôlei', 'resultados jogos', 'campeonatos', 'seleção brasileira'],
  url: 'https://portal-de-noticias.vercel.app/categoria/esportes',
  category: 'Esportes'
})

export default function EsportesPage() {
  return (
    <CategoryPage
      category="Esportes"
      categoryColor="bg-gradient-to-br from-accent-500 to-accent-600"
      description="Resultados dos principais campeonatos, análises esportivas e todas as novidades do mundo dos esportes nacional e internacional."
    />
  )
}
