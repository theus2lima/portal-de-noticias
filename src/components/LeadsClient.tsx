'use client'

import { useState, useEffect } from 'react'
import { 
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  CheckCircle,
  User,
  MessageSquare,
  Trash2
} from 'lucide-react'
import { LeadsStorage, Lead } from '@/utils/localStorage'

interface LeadsClientProps {
  initialLeads: Lead[]
  shouldUseLocalStorage?: boolean
  selectedLeads?: number[]
  onSelectLead?: (leadId: number) => void
}

const LeadsClient = ({ 
  initialLeads, 
  shouldUseLocalStorage = true, 
  selectedLeads = [], 
  onSelectLead 
}: LeadsClientProps) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    if (shouldUseLocalStorage) {
      // Buscar leads do localStorage e mesclar com leads iniciais
      const localStorageLeads = LeadsStorage.getLeads()
      
      if (localStorageLeads.length > 0) {
        // Combinar leads do localStorage com leads iniciais, removendo duplicatas
        const combined = [...localStorageLeads]
        
        // Adicionar leads iniciais que não estão no localStorage
        initialLeads.forEach(initialLead => {
          const exists = localStorageLeads.some(localLead => 
            localLead.phone === initialLead.phone || 
            (localLead.email && localLead.email === initialLead.email)
          )
          if (!exists) {
            combined.push(initialLead)
          }
        })
        
        // Ordenar por data de criação (mais recentes primeiro)
        const sortedLeads = combined.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        
        setLeads(sortedLeads)
      }
    }
  }, [initialLeads, shouldUseLocalStorage])

  // Função para excluir um lead individual
  const handleDeleteLead = async (leadId: number) => {
    if (!confirm('Tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.')) {
      return
    }

    try {
      if (shouldUseLocalStorage) {
        // Excluir do localStorage
        const success = LeadsStorage.deleteLead(leadId)
        if (success) {
          setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId))
        }
      } else {
        // Excluir via API
        const response = await fetch('/api/leads', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ ids: [leadId] }),
        })

        if (response.ok) {
          setLeads(prevLeads => prevLeads.filter(lead => lead.id !== leadId))
        } else {
          const result = await response.json()
          alert(`Erro ao excluir lead: ${result.error || 'Erro desconhecido'}`)
        }
      }
    } catch (error) {
      console.error('Erro ao excluir lead:', error)
      alert('Erro ao excluir lead. Tente novamente.')
    }
  }

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

  // Não renderizar nada até que o componente seja montado (hidratação)
  if (!mounted) {
    return (
      <div className="space-y-6">
        {/* Skeleton loading para stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-8"></div>
                </div>
                <div className="bg-gray-200 p-3 rounded-lg h-12 w-12"></div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Skeleton loading para tabela */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Total de Leads</p>
              <p className="text-2xl font-bold text-gray-900">{totalLeads}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Contatados</p>
              <p className="text-2xl font-bold text-green-600">{contactedLeads}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-orange-600">{pendingLeads}</p>
            </div>
            <div className="bg-orange-500 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600">Últimos 7 dias</p>
              <p className="text-2xl font-bold text-purple-600">{recentLeads}</p>
            </div>
            <div className="bg-purple-500 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {onSelectLead && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <span className="sr-only">Selecionar</span>
                  </th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Lead
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localização
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Data
                </th>
                <th className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads && leads.length > 0 ? (
                leads.map((lead: Lead) => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    {onSelectLead && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedLeads.includes(lead.id)}
                          onChange={() => onSelectLead(lead.id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-full mr-4">
                          <User className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lead.name}
                          </div>
                          {lead.message && (
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {lead.message}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {lead.phone}
                        </div>
                        {lead.email && (
                          <div className="flex items-center text-sm text-gray-900">
                            <Mail className="h-4 w-4 text-gray-400 mr-2" />
                            {lead.email}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                        {new Date(lead.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {!lead.is_contacted && (
                          <button
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Marcar como contatado"
                            onClick={() => {
                              // Atualizar localStorage
                              LeadsStorage.updateLead(lead.id, { is_contacted: true })
                              // Atualizar estado local
                              setLeads(prevLeads => 
                                prevLeads.map(l => 
                                  l.id === lead.id ? { ...l, is_contacted: true } : l
                                )
                              )
                            }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </button>
                        )}
                        <a
                          href={`tel:${lead.phone}`}
                          className="text-blue-600 hover:text-blue-900 transition-colors"
                          title="Ligar para o lead"
                        >
                          <Phone className="h-4 w-4" />
                        </a>
                        {lead.email && (
                          <a
                            href={`mailto:${lead.email}`}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Enviar email"
                          >
                            <Mail className="h-4 w-4" />
                          </a>
                        )}
                        <button
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                          title="Ver detalhes"
                        >
                          <MessageSquare className="h-4 w-4" />
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 transition-colors"
                          title="Excluir lead"
                          onClick={() => handleDeleteLead(lead.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={onSelectLead ? 7 : 6} className="px-6 py-12 text-center">
                    <User className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Nenhum lead encontrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Os leads capturados aparecerão aqui. Cadastre-se usando o formulário na página inicial para ver os leads aparecerem aqui.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default LeadsClient
