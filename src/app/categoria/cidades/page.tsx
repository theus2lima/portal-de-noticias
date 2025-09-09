import CategoryPage from '@/components/CategoryPage'
import { generateSEO } from '@/lib/seo'

export const metadata = generateSEO({
  title: 'Cidades - Notícias Locais e Vida Urbana',
  description: 'Notícias das cidades brasileiras, infraestrutura urbana, transporte público, segurança, saúde, educação e qualidade de vida municipal.',
  keywords: ['cidades brasil', 'notícias locais', 'infraestrutura urbana', 'transporte público', 'segurança', 'prefeitura', 'município', 'vida urbana', 'saúde pública', 'educação'],
  url: 'https://portal-de-noticias.vercel.app/categoria/cidades',
  category: 'Cidades'
})

export default function CidadesPage() {
  return (
    <CategoryPage
      category="Cidades"
      categoryColor="bg-gradient-to-br from-secondary-700 to-secondary-800"
      description="Notícias sobre infraestrutura urbana, mobilidade, serviços públicos e tudo que afeta o dia a dia das cidades brasileiras."
    />
  )
}
