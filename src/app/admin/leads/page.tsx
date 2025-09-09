'use client'

import { useState, useEffect } from 'react'
import { 
  Search,
  Filter,
  Calendar
} from 'lucide-react'
import LeadsClient from '@/components/LeadsClient'
import LeadsActions from '@/components/LeadsActions'
import { Lead } from '@/utils/localStorage'

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
    }
  ]

  return { leads: mockLeads, useLocalStorage: true }
}

function LeadsPageContent() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [useLocalStorage, setUseLocalStorage] = useState(false)
  const [selectedLeads, setSelectedLeads] = useState<number[]>([])
  const [mounted, setMounted] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const { leads: initialLeads, useLocalStorage } = getLeadsData()
    setLeads(initialLeads)
    setUseLocalStorage(useLocalStorage)
    setMounted(true)
  }, [refreshKey]) // Recarregar quando refreshKey mudar

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

      {/* Client-side Leads Display with selection support */}
      <LeadsClient 
        initialLeads={leads} 
        shouldUseLocalStorage={useLocalStorage}
        selectedLeads={selectedLeads}
        onSelectLead={handleSelectLead}
      />

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

export default function LeadsPage() {
  return <LeadsPageContent />
}
