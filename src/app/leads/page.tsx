import LeadForm from '@/components/LeadForm'

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-600">
      {/* Cabeçalho simples */}
      <div className="bg-white/10 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            📱 Cadastre-se para receber notícias
          </h1>
          <p className="text-white/90">
            Radar Noroeste PR - Seu portal de notícias confiável
          </p>
        </div>
      </div>

      {/* Formulário de Leads */}
      <LeadForm />
    </div>
  )
}
