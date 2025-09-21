import LeadForm from '@/components/LeadForm'
import Image from 'next/image'

export default function LeadsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-green-600">
      {/* Cabeçalho simples */}
      <div className="bg-white/10 backdrop-blur-sm py-6">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center mb-4">
            <Image 
              src="/logo.png" 
              alt="Radar Noroeste PR" 
              width={200} 
              height={80}
              className="h-16 w-auto"
              priority
            />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Cadastre-se para receber notícias
          </h1>
          <p className="text-white/90">
            Seu portal de notícias confiável do Noroeste do Paraná
          </p>
        </div>
      </div>

      {/* Formulário de Leads */}
      <LeadForm />
    </div>
  )
}
