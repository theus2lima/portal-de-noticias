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

export default async function LeadsPage() {
  const supabase = await createClient()

  // Buscar leads
  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  // Estatísticas dos leads
  const totalLeads = leads?.length || 0
  const contactedLeads = leads?.filter((lead: any) => lead.is_contacted).length || 0
  const pendingLeads = totalLeads - contactedLeads
  const recentLeads = leads?.filter((lead: any) => {
    const leadDate = new Date(lead.created_at)
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    return leadDate >= sevenDaysAgo
  }).length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Leads</h1>
          <p className="text-neutral-600">Gerencie todos os leads captados</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <Download className="h-5 w-5" />
          <span>Exportar Leads</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Total de Leads</p>
              <p className="text-2xl font-bold text-neutral-900">{totalLeads}</p>
            </div>
            <div className="bg-primary-500 p-3 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Contatados</p>
              <p className="text-2xl font-bold text-green-600">{contactedLeads}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{pendingLeads}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-neutral-600">Últimos 7 dias</p>
              <p className="text-2xl font-bold text-accent-600">{recentLeads}</p>
            </div>
            <div className="bg-accent-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Buscar leads por nome, telefone ou cidade..."
              className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>
          
          {/* Status Filter */}
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">Todos os status</option>
            <option value="contacted">Contatado</option>
            <option value="pending">Pendente</option>
          </select>

          {/* Date Filter */}
          <select className="px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500">
            <option value="">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>

          <button className="btn-outline flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>Filtros</span>
          </button>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {leads && leads.length > 0 ? (
                leads.map((lead: any) => (
                  <tr key={lead.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-full mr-4">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-neutral-900">
                            {lead.name}
                          </div>
                          {lead.message && (
                            <div className="text-sm text-neutral-500 truncate max-w-xs">
                              {lead.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-neutral-900">
                          <Phone className="h-4 w-4 text-neutral-400 mr-2" />
                          {lead.phone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center text-sm text-neutral-900">
                            <Mail className="h-4 w-4 text-neutral-400 mr-2" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-neutral-900">
                        <MapPin className="h-4 w-4 text-neutral-400 mr-2" />
                        {lead.city}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        lead.is_contacted
                          ? 'bg-green-100 text-green-800'
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {lead.is_contacted ? 'Contatado' : 'Pendente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-neutral-400 mr-1" />
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!lead.is_contacted && (
                          <button
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Marcar como contatado"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-primary-600 hover:text-primary-900 transition-colors"
                          title="Ligar para o lead"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-accent-600 hover:text-accent-900 transition-colors"
                            title="Enviar email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          className="text-neutral-600 hover:text-neutral-900 transition-colors"
                          title="Ver detalhes"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">
                      Nenhum lead encontrado
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Os leads capturados aparecerão aqui.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn-primary flex items-center justify-center space-x-2 py-3">
            <Download className="h-5 w-5" />
            <span>Exportar para CSV</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
            <MessageSquare className="h-5 w-5" />
            <span>Campanhas de Follow-up</span>
          </button>
          <button className="btn-outline flex items-center justify-center space-x-2 py-3">
            <CheckCircle className="h-5 w-5" />
            <span>Marcar Selecionados</span>
          </button>
        </div>
      </div>

      {/* Conversion Chart Placeholder */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Conversão de Leads</h3>
        <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Calendar className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
            <p className="text-neutral-500">Gráfico de conversão será exibido aqui</p>
          </div>
        </div>
      </div>
    </div>
  )
}
