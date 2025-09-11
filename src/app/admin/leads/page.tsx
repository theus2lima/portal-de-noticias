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

// Função para carregar leads reais da API ou localStorage
async function fetchLeadsData() {
  try {
    console.log('🔄 Carregando leads da API...')
    const response = await fetch('/api/leads?limit=100', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Leads carregados da API:', result.data?.length || 0)
      return { 
        leads: result.data || [], 
        useLocalStorage: false 
      }
    } else {
      console.warn('⚠️ API não disponível, usando localStorage')
      throw new Error('API não disponível')
    }
  } catch (error) {
    console.warn('⚠️ Erro na API, usando localStorage:', error)
    // Fallback para localStorage
    try {
      const { LeadsStorage } = await import('@/utils/localStorage')
      const localLeads = LeadsStorage.getLeads()
      console.log('✅ Leads carregados do localStorage:', localLeads.length)
      return { 
        leads: localLeads, 
        useLocalStorage: true 
      }
    } catch (localError) {
      console.error('❌ Erro no localStorage:', localError)
      return { 
        leads: [], 
        useLocalStorage: true 
      }
    }
  }
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
  
  
  // Estados para configuração do WhatsApp
  const [whatsappLink, setWhatsappLink] = useState('https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L')
  const [whatsappLinkLoading, setWhatsappLinkLoading] = useState(false)
  const [whatsappSuccess, setWhatsappSuccess] = useState('')
  const [whatsappError, setWhatsappError] = useState('')

  useEffect(() => {
    const loadLeads = async () => {
      try {
        const { leads: initialLeads, useLocalStorage } = await fetchLeadsData()
        setLeads(initialLeads)
        setUseLocalStorage(useLocalStorage)
      } catch (error) {
        console.error('Erro ao carregar leads:', error)
        setLeads([])
        setUseLocalStorage(true)
      } finally {
        setMounted(true)
      }
    }
    
    loadLeads()
    
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
      
    </div>
  )
}

export default function LeadsPage() {
  return <LeadsPageContent />
}
