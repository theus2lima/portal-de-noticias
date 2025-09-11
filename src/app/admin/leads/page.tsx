'use client'

import { useState, useEffect } from 'react'
import { 
  Search,
  Filter,
  Calendar,
  MessageCircle,
  ExternalLink,
  Copy,
  Save,
  Check,
  AlertCircle
} from 'lucide-react'
import LeadsClient from '@/components/LeadsClient'
import LeadsActions from '@/components/LeadsActions'
import LeadConversionChart from '@/components/LeadConversionChart'
import { Lead } from '@/utils/localStorage'
import { useNotificationHelpers } from '@/hooks/useNotificationHelpers'

// Dados simulados - no client-side, usaremos apenas dados mock por enquanto
function getLeadsData() {
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
    },
    {
      id: 4,
      name: "Maria José da Silva",
      phone: "11999887766",
      city: "Campinas",
      email: "maria@exemplo.com",
      source: "website",
      message: "Interessada em notícias de economia",
      is_contacted: true,
      notes: "Contatado por email",
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 5,
      name: "João Pedro Costa",
      phone: "47988776655",
      city: "Blumenau",
      email: null,
      source: "website",
      message: null,
      is_contacted: false,
      notes: null,
      created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 6,
      name: "Fernanda Lima",
      phone: "85987654321",
      city: "Fortaleza",
      email: "fernanda@teste.com",
      source: "website",
      message: "Gostaria de receber notícias de esportes",
      is_contacted: true,
      notes: "Lead qualificado",
      created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 7,
      name: "Roberto Santos",
      phone: "62999888777",
      city: "Goiânia",
      email: null,
      source: "website",
      message: null,
      is_contacted: false,
      notes: null,
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 8,
      name: "Carla Mendes",
      phone: "31987654321",
      city: "Belo Horizonte",
      email: "carla@exemplo.com",
      source: "website",
      message: "Interessada em política local",
      is_contacted: true,
      notes: "Follow-up agendado",
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 9,
      name: "Pedro Alves",
      phone: "41988776644",
      city: "Curitiba",
      email: null,
      source: "website",
      message: null,
      is_contacted: false,
      notes: null,
      created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 10,
      name: "Luciana Costa",
      phone: "51999887755",
      city: "Porto Alegre",
      email: "luciana@email.com",
      source: "website",
      message: "Quero receber resumos diários",
      is_contacted: false,
      notes: null,
      created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    }
  ]

  return { leads: mockLeads, useLocalStorage: true }
}

function LeadsPageContent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [useLocalStorage, setUseLocalStorage] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  
  // Estados para filtros
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  
  // Notification helpers
  const {
    notifyNewLead,
    notifyNewArticle,
    notifySystemUpdate,
    notifyBackupComplete,
    notifyHighTraffic,
    notifySuccess,
    notifyError,
    notifyWarning,
    notifyInfo
  } = useNotificationHelpers()
  
  // Estados para configuração do WhatsApp
  const [whatsappLink, setWhatsappLink] = useState('https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L')
  const [whatsappLinkLoading, setWhatsappLinkLoading] = useState(false)
  const [whatsappSuccess, setWhatsappSuccess] = useState('')
  const [whatsappError, setWhatsappError] = useState('')

  useEffect(() => {
    const { leads: initialLeads, useLocalStorage } = getLeadsData()
    setLeads(initialLeads)
    setUseLocalStorage(useLocalStorage)
    setMounted(true)
    
    // Carregar configurações do WhatsApp
    fetchWhatsAppLink()
  }, [refreshKey]) // Recarregar quando refreshKey mudar
  
  // Filtrar leads quando qualquer filtro mudar
  useEffect(() => {
    let filtered = [...leads]
    
    // Filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(lead => 
        lead.name.toLowerCase().includes(query) ||
        lead.phone.includes(query) ||
        lead.city.toLowerCase().includes(query) ||
        (lead.email && lead.email.toLowerCase().includes(query)) ||
        (lead.message && lead.message.toLowerCase().includes(query))
      )
    }
    
    // Filtro de status
    if (statusFilter) {
      if (statusFilter === 'contacted') {
        filtered = filtered.filter(lead => lead.is_contacted)
      } else if (statusFilter === 'pending') {
        filtered = filtered.filter(lead => !lead.is_contacted)
      }
    }
    
    // Filtro de data
    if (dateFilter) {
      const now = new Date()
      let startDate: Date
      
      switch (dateFilter) {
        case 'today':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1)
          break
        default:
          startDate = new Date(0)
      }
      
      filtered = filtered.filter(lead => 
        new Date(lead.created_at) >= startDate
      )
    }
    
    setFilteredLeads(filtered)
  }, [leads, searchQuery, statusFilter, dateFilter])
  
  // Carregar link do WhatsApp
  const fetchWhatsAppLink = async () => {
    try {
      const response = await fetch('/api/settings/whatsapp-lead-link')
      const result = await response.json()
      if (result.success && result.data?.whatsapp_lead_link) {
        setWhatsappLink(result.data.whatsapp_lead_link)
      }
    } catch (error) {
      console.error('Erro ao carregar link do WhatsApp:', error)
    }
  }

  // Salvar link do WhatsApp
  const handleSaveWhatsAppLink = async () => {
    if (!whatsappLink.trim()) {
      setWhatsappError('Link do WhatsApp é obrigatório')
      return
    }

    setWhatsappLinkLoading(true)
    setWhatsappError('')
    setWhatsappSuccess('')

    try {
      const response = await fetch('/api/settings/whatsapp-lead-link', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ whatsapp_lead_link: whatsappLink }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setWhatsappSuccess('Link do WhatsApp atualizado com sucesso!')
        setTimeout(() => setWhatsappSuccess(''), 3000)
      } else {
        setWhatsappError(result.error || 'Erro ao salvar link do WhatsApp')
        setTimeout(() => setWhatsappError(''), 5000)
      }
    } catch (error) {
      console.error('Erro ao salvar:', error)
      setWhatsappError('Erro ao salvar link do WhatsApp')
      setTimeout(() => setWhatsappError(''), 5000)
    } finally {
      setWhatsappLinkLoading(false)
    }
  }

  // Testar link do WhatsApp
  const handleTestWhatsAppLink = () => {
    if (whatsappLink.trim()) {
      window.open(whatsappLink, '_blank')
    }
  }

  // Copiar link do WhatsApp
  const handleCopyWhatsAppLink = async () => {
    try {
      await navigator.clipboard.writeText(whatsappLink)
      setWhatsappSuccess('Link copiado para área de transferência!')
      setTimeout(() => setWhatsappSuccess(''), 2000)
    } catch (error) {
      setWhatsappError('Erro ao copiar link')
      setTimeout(() => setWhatsappError(''), 3000)
    }
  }

  const handleSelectLead = (leadId: number) => {
    setSelectedLeads(prev => 
      prev.includes(leadId) 
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    )
  }

  const handleSelectAll = () => {
    setSelectedLeads(leads.map(lead => lead.id))
  }

  const handleDeselectAll = () => {
    setSelectedLeads([])
  }

  const handleLeadsUpdate = () => {
    // Forçar uma atualização dos leads
    setRefreshKey(prev => prev + 1)
    // Limpar seleção
    setSelectedLeads([])
  }
  
  // Função para limpar todos os filtros
  const handleClearFilters = () => {
    setSearchQuery('')
    setStatusFilter('')
    setDateFilter('')
  }

  if (!mounted) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded w-40"></div>
        <div className="h-32 bg-gray-200 rounded"></div>
        <div className="h-64 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com LeadsActions */}
      <LeadsActions 
        leads={leads}
        selectedLeads={selectedLeads}
        onSelectLead={handleSelectLead}
        onSelectAll={handleSelectAll}
        onDeselectAll={handleDeselectAll}
        onLeadsUpdate={handleLeadsUpdate}
        useLocalStorage={useLocalStorage}
      />

      {/* Configuração do WhatsApp para Leads */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-green-100 p-2 rounded-lg mr-3">
            <MessageCircle className="h-5 w-5 text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Configuração do WhatsApp</h3>
            <p className="text-sm text-gray-600">Configure para onde os leads serão redirecionados após o cadastro</p>
          </div>
        </div>

        {/* Mensagens de Sucesso/Erro */}
        {whatsappSuccess && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center space-x-2 mb-4">
            <Check className="h-5 w-5" />
            <span>{whatsappSuccess}</span>
          </div>
        )}

        {whatsappError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center space-x-2 mb-4">
            <AlertCircle className="h-5 w-5" />
            <span>{whatsappError}</span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Link do Grupo/Chat do WhatsApp
            </label>
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <input
                  type="url"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={handleCopyWhatsAppLink}
                className="btn-outline text-sm flex items-center space-x-1 px-3 py-2"
                title="Copiar link"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleTestWhatsAppLink}
                className="btn-outline text-sm flex items-center space-x-1 px-3 py-2"
                title="Testar link"
              >
                <ExternalLink className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={handleSaveWhatsAppLink}
                disabled={whatsappLinkLoading}
                className="btn-primary text-sm flex items-center space-x-2 px-4 py-2 disabled:opacity-50"
              >
                {whatsappLinkLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Salvando...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Salvar</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              <p><strong>Como funciona:</strong> Após preencher o formulário de leads, o usuário será redirecionado automaticamente para este WhatsApp.</p>
              <p className="mt-1"><strong>Tipos aceitos:</strong> Grupos (<code>https://chat.whatsapp.com/...</code>) ou contatos (<code>https://wa.me/...</code>)</p>
            </div>
          </div>
        </div>
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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* Status Filter */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os status</option>
            <option value="contacted">Contatado</option>
            <option value="pending">Pendente</option>
          </select>

          {/* Date Filter */}
          <select 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Todos os períodos</option>
            <option value="today">Hoje</option>
            <option value="week">Última semana</option>
            <option value="month">Último mês</option>
          </select>

          <button 
            onClick={handleClearFilters}
            disabled={!searchQuery && !statusFilter && !dateFilter}
            className={`px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 transition-colors ${
              (!searchQuery && !statusFilter && !dateFilter) 
                ? 'text-gray-400 cursor-not-allowed bg-gray-50' 
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span>Limpar Filtros</span>
          </button>
        </div>
        
        {/* Indicador de filtros ativos */}
        {(searchQuery || statusFilter || dateFilter) && (
          <div className="mt-3 flex flex-wrap gap-2">
            {searchQuery && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Busca: &quot;{searchQuery}&quot;
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Status: {statusFilter === 'contacted' ? 'Contatado' : 'Pendente'}
              </span>
            )}
            {dateFilter && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Período: {dateFilter === 'today' ? 'Hoje' : dateFilter === 'week' ? 'Última semana' : 'Último mês'}
              </span>
            )}
            <span className="text-sm text-gray-500">
              {filteredLeads.length} de {leads.length} leads encontrados
            </span>
          </div>
        )}
      </div>

      {/* Client-side Leads Display with selection support */}
      <LeadsClient 
        initialLeads={filteredLeads.length > 0 || searchQuery || statusFilter || dateFilter ? filteredLeads : leads} 
        shouldUseLocalStorage={useLocalStorage}
        selectedLeads={selectedLeads}
        onSelectLead={handleSelectLead}
      />

      {/* Conversion Chart */}
      <LeadConversionChart leads={leads} />
      
      {/* Demo Notification Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-6">
          <div className="bg-purple-100 p-2 rounded-lg mr-3">
            <AlertCircle className="h-5 w-5 text-purple-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Teste de Notificações</h3>
            <p className="text-sm text-gray-600">Clique nos botões abaixo para testar diferentes tipos de notificações no sininho</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          <button
            onClick={() => notifyNewLead('João Silva')}
            className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors text-sm font-medium"
          >
            Novo Lead
          </button>
          <button
            onClick={() => notifyNewArticle('Economia Brasileira em Alta')}
            className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors text-sm font-medium"
          >
            Novo Artigo
          </button>
          <button
            onClick={() => notifySystemUpdate('2.1.5')}
            className="px-4 py-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-800 rounded-lg transition-colors text-sm font-medium"
          >
            Sistema Atualizado
          </button>
          <button
            onClick={() => notifyBackupComplete()}
            className="px-4 py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg transition-colors text-sm font-medium"
          >
            Backup Completo
          </button>
          <button
            onClick={() => notifyHighTraffic(250)}
            className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors text-sm font-medium"
          >
            Tráfego Alto
          </button>
          <button
            onClick={() => notifyError('Erro no Sistema', 'Falha ao conectar com o banco de dados')}
            className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors text-sm font-medium"
          >
            Erro
          </button>
          <button
            onClick={() => notifyWarning('Memória Alta', 'Uso de memória acima de 80%', 'Ver Status', '/admin/status')}
            className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg transition-colors text-sm font-medium"
          >
            Aviso
          </button>
          <button
            onClick={() => notifyInfo('Manutenção Programada', 'Sistema entrará em manutenção às 02:00')}
            className="px-4 py-2 bg-cyan-100 hover:bg-cyan-200 text-cyan-800 rounded-lg transition-colors text-sm font-medium"
          >
            Informação
          </button>
        </div>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Dica:</strong> As notificações aparecerão no sininho do cabeçalho. Clique no sininho para ver todas as notificações e testeis as funcionalidades como marcar como lida, limpar todas, etc.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  return <LeadsPageContent />
}
