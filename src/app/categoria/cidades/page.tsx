import CategoryPage from '@/components/CategoryPage'

export const metadata = {
  title: 'Cidades - Portal de Notícias',
  description: 'Notícias locais, infraestrutura, mobilidade urbana e qualidade de vida nas cidades brasileiras.',
}

export default function CidadesPage() {
  return (
    <CategoryPage
      category="Cidades"
      categoryColor="bg-gradient-to-br from-secondary-700 to-secondary-800"
      description="Notícias sobre infraestrutura urbana, mobilidade, serviços públicos e tudo que afeta o dia a dia das cidades brasileiras."
    />
  )
}
