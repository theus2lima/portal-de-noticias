import Hero from '@/components/Hero'
import CategorySection from '@/components/CategorySection'
import NewsSection from '@/components/NewsSection'
import LeadForm from '@/components/LeadForm'
import MostRead from '@/components/MostRead'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section com Carrossel */}
      <Hero />

      {/* Seção de Categorias */}
      <CategorySection />

      {/* Notícias Mais Recentes */}
      <NewsSection />

      {/* Mais Lidas */}
      <MostRead />

      {/* Formulário de Leads */}
      <LeadForm />
    </div>
  )
}
