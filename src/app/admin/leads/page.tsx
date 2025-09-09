import { 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  Search,
  Filter,
  Download,
  MessageSquare,
  Clock,
  CheckCircle,
  User
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import LeadsClient from '@/components/LeadsClient'

export default async function LeadsPage() {
  // Dados simulados para demonstração quando Supabase não estiver configurado
  const mockLeads = [
    {
      id: 1,
      name: "Matheus Victor de Lima Machado",
      phone: "44999823193",
      city: "Paranavaí",
      email: null,
      source: "website",
      message: null,
      is_contacted: false,
      notes: null,
      created_at: new Date().toISOString()
    },
    {
      id: 2,
      name: "Ana Silva Santos",
      phone: "11987654321",
      city: "São Paulo",
      email: "ana@email.com",
      source: "website",
      message: "Gostaria de receber notícias de política",
      is_contacted: true,
      notes: "Contatado via WhatsApp",
      created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 3,
      name: "Carlos Eduardo Oliveira",
      phone: "21987654321",
      city: "Rio de Janeiro",
      email: null,
      source: "website",
      message: null,
      is_contacted: false,
      notes: null,
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  let leads = mockLeads
  
  // Tentar buscar leads do Supabase se configurado
  try {
    const supabase = await createClient()
    const { data: supabaseLeads, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (supabaseLeads && !error) {
      leads = supabaseLeads
    }
  } catch (error) {
    console.log('Usando dados simulados para leads:', error)
  }

  // Determinar se devemos usar localStorage como fallback
  const useLocalStorage = leads === mockLeads // Se ainda estamos usando dados mock, significa que Supabase não está configurado

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">Gerencie todos os leads captados</p>
        </div>
        <button className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Exportar Leads</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar leads por nome, telefone ou cidade..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Status Filter */}
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Todos os status</option>
            <option value="contacted">Contatado</option>
            <option value="pending">Pendente</option>
          </select>

          {/* Date Filter */}
          <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
            <option value="">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>

          <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Client-side Leads Display with localStorage support */}
      <LeadsClient 
        initialLeads={leads} 
        shouldUseLocalStorage={useLocalStorage} 
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Exportar para CSV</span>
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
            <MessageSquare className="h-5 w-5" />
            <span>Campanhas de Follow-up</span>
          </button>
          <button className="border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-3 rounded-lg flex items-center justify-center space-x-2">
            <CheckCircle className="h-5 w-5" />
            <span>Marcar Selecionados</span>
          </button>
        </div>
      </div>

      {/* Conversion Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversão de Leads</h3>
        <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Gráfico de conversão será exibido aqui</p>
          </div>
        </div>
      </div>
    </div>
  )
}
