'use client'

import { useState } from 'react'
import { 
  Download, 
  MessageSquare, 
  CheckCircle, 
  X,
  Send,
  Mail,
  Phone,
  Calendar,
  Users,
  Check,
  AlertCircle,
  FileText,
  Table
} from 'lucide-react'
import { Lead, LeadsStorage } from '@/utils/localStorage'
import * as XLSX from 'xlsx'

interface LeadsActionsProps {
  leads: Lead[]
  selectedLeads: number[]
  onSelectLead: (leadId: number) => void
  onSelectAll: () => void
  onDeselectAll: () => void
  onLeadsUpdate?: () => void // Callback para atualizar a lista de leads
  useLocalStorage?: boolean
}

const LeadsActions = ({ 
  leads, 
  selectedLeads, 
  onSelectLead, 
  onSelectAll, 
  onDeselectAll,
  onLeadsUpdate,
  useLocalStorage = true
}: LeadsActionsProps) => {
  const [showFollowUpModal, setShowFollowUpModal] = useState(false)
  const [followUpMessage, setFollowUpMessage] = useState('')
  const [followUpType, setFollowUpType] = useState<'whatsapp' | 'email'>('whatsapp')
  const [loading, setLoading] = useState(false)
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info'
    message: string
  } | null>(null)
  const [showExportModal, setShowExportModal] = useState(false)
  const [exportType, setExportType] = useState<'all' | 'selected'>('all')

  // Função para preparar dados para exportação
  const prepareExportData = (leadsToExport: Lead[]) => {
    return leadsToExport.map(lead => ({
      'Nome': lead.name,
      'Telefone': lead.phone,
      'Email': lead.email || '',
      'Cidade': lead.city,
      'Status': lead.is_contacted ? 'Contatado' : 'Pendente',
      'Data': new Date(lead.created_at).toLocaleDateString('pt-BR'),
      'Mensagem': lead.message || '',
      'Observações': lead.notes || ''
    }))
  }

  // Função para exportar para CSV
  const exportToCSV = (leadsToExport: Lead[]) => {
    if (leadsToExport.length === 0) {
      showNotification('error', 'Nenhum lead para exportar!')
      return
    }

    const data = prepareExportData(leadsToExport)
    const csvHeaders = Object.keys(data[0])
    
    const csvContent = [
      csvHeaders.join(','),
      ...data.map(row => 
        csvHeaders.map(header => `"${row[header as keyof typeof row]}"`).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `leads_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    showNotification('success', `${leadsToExport.length} lead(s) exportado(s) em CSV!`)
  }

  // Função para exportar para XLSX
  const exportToXLSX = (leadsToExport: Lead[]) => {
    if (leadsToExport.length === 0) {
      showNotification('error', 'Nenhum lead para exportar!')
      return
    }

    const data = prepareExportData(leadsToExport)
    
    // Criar workbook e worksheet
    const wb = XLSX.utils.book_new()
    const ws = XLSX.utils.json_to_sheet(data)
    
    // Definir largura das colunas
    const colWidths = [
      { wch: 25 }, // Nome
      { wch: 15 }, // Telefone
      { wch: 25 }, // Email
      { wch: 20 }, // Cidade
      { wch: 12 }, // Status
      { wch: 12 }, // Data
      { wch: 30 }, // Mensagem
      { wch: 30 }  // Observações
    ]
    ws['!cols'] = colWidths
    
    // Adicionar worksheet ao workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Leads')
    
    // Gerar e baixar arquivo
    const fileName = `leads_${new Date().toISOString().split('T')[0]}.xlsx`
    XLSX.writeFile(wb, fileName)
    
    showNotification('success', `${leadsToExport.length} lead(s) exportado(s) em Excel!`)
  }

  // Função para abrir modal de exportação
  const openExportModal = (type: 'all' | 'selected') => {
    setExportType(type)
    setShowExportModal(true)
  }

  // Função para executar exportação
  const executeExport = (format: 'csv' | 'xlsx') => {
    const leadsToExport = exportType === 'all' ? leads : leads.filter(lead => selectedLeads.includes(lead.id))
    
    if (format === 'csv') {
      exportToCSV(leadsToExport)
    } else {
      exportToXLSX(leadsToExport)
    }
    
    setShowExportModal(false)
  }

  // Função para mostrar notificação
  const showNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000) // Remove após 5 segundos
  }

  // Função para marcar leads selecionados como contatados
  const markSelectedAsContacted = async () => {
    if (selectedLeads.length === 0) {
      showNotification('error', 'Nenhum lead selecionado!')
      return
    }
    
    setLoading(true)
    
    try {
      if (useLocalStorage) {
        // Atualizar no localStorage
        const updatedLeads = LeadsStorage.updateLeads(selectedLeads, { is_contacted: true })
        
        if (updatedLeads.length > 0) {
          showNotification('success', `${selectedLeads.length} lead(s) marcado(s) como contatado(s)!`)
          onLeadsUpdate?.() // Atualizar a lista de leads
          onDeselectAll()
        } else {
          showNotification('error', 'Erro ao atualizar leads no armazenamento local')
        }
      } else {
        // Fazer requisição para a API
        const response = await fetch('/api/leads', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ids: selectedLeads,
            is_contacted: true
          })
        })
        
        if (response.ok) {
          const result = await response.json()
          showNotification('success', result.message || `${selectedLeads.length} lead(s) marcado(s) como contatado(s)!`)
          onLeadsUpdate?.() // Atualizar a lista de leads
          onDeselectAll()
        } else {
          const error = await response.json()
          showNotification('error', error.error || 'Erro ao atualizar leads')
        }
      }
    } catch (error) {
      console.error('Erro ao marcar leads como contatados:', error)
      showNotification('error', 'Erro interno do servidor')
    } finally {
      setLoading(false)
    }
  }

  // Função para iniciar campanha de follow-up
  const startFollowUpCampaign = () => {
    if (selectedLeads.length === 0) {
      alert('Selecione pelo menos um lead para iniciar a campanha!')
      return
    }
    setShowFollowUpModal(true)
  }

  // Função para executar a campanha de follow-up
  const executeFollowUpCampaign = () => {
    const selectedLeadData = leads.filter(lead => selectedLeads.includes(lead.id))
    
    if (followUpType === 'whatsapp') {
      // Abrir WhatsApp Web para cada lead selecionado
      selectedLeadData.forEach(lead => {
        const phoneNumber = lead.phone.replace(/\D/g, '') // Remove caracteres não numéricos
        const formattedPhone = phoneNumber.startsWith('55') ? phoneNumber : `55${phoneNumber}`
        const encodedMessage = encodeURIComponent(followUpMessage)
        const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodedMessage}`
        window.open(whatsappUrl, '_blank')
      })
    } else if (followUpType === 'email') {
      // Abrir cliente de email com todos os emails
      const emails = selectedLeadData
        .filter(lead => lead.email)
        .map(lead => lead.email)
        .join(',')
      
      if (emails) {
        const emailUrl = `mailto:${emails}?subject=Follow-up&body=${encodeURIComponent(followUpMessage)}`
        window.open(emailUrl, '_blank')
      } else {
        alert('Nenhum lead selecionado possui email!')
        return
      }
    }

    setShowFollowUpModal(false)
    setFollowUpMessage('')
    onDeselectAll()
    alert('Campanha de follow-up iniciada!')
  }

  const allSelected = selectedLeads.length === leads.length && leads.length > 0
  const someSelected = selectedLeads.length > 0

  return (
    <>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leads</h1>
          <p className="text-gray-600">
            Gerencie todos os leads captados
            {someSelected && (
              <span className="ml-2 text-blue-600 font-medium">
                ({selectedLeads.length} selecionado{selectedLeads.length !== 1 ? 's' : ''})
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {someSelected && (
            <>
              <button 
                onClick={() => openExportModal('selected')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
              >
                <Download className="h-4 w-4" />
                <span>Exportar Selecionados</span>
              </button>
              <button 
                onClick={startFollowUpCampaign}
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Follow-up</span>
              </button>
              <button 
                onClick={markSelectedAsContacted}
                disabled={loading}
                className={`${loading ? 'bg-orange-400 cursor-not-allowed' : 'bg-orange-600 hover:bg-orange-700'} text-white font-medium px-4 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2 text-sm`}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                ) : (
                  <CheckCircle className="h-4 w-4" />
                )}
                <span>{loading ? 'Processando...' : 'Marcar como Contatados'}</span>
              </button>
            </>
          )}
          
          <button 
            onClick={() => openExportModal('all')}
            className="bg-blue-900 hover:bg-blue-800 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200 flex items-center space-x-2"
          >
            <Download className="h-5 w-5" />
            <span>Exportar Leads</span>
          </button>
        </div>
      </div>

      {/* Selection Controls */}
      {leads.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={allSelected ? onDeselectAll : onSelectAll}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  {allSelected ? 'Desselecionar todos' : 'Selecionar todos'}
                </span>
              </label>
              
              {someSelected && (
                <span className="text-sm text-gray-500">
                  {selectedLeads.length} de {leads.length} leads selecionados
                </span>
              )}
            </div>

            {someSelected && (
              <button 
                onClick={onDeselectAll}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                title="Limpar seleção"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => openExportModal('all')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200"
          >
            <Download className="h-5 w-5" />
            <span>Exportar</span>
          </button>
          <button 
            onClick={someSelected ? startFollowUpCampaign : () => alert('Selecione pelo menos um lead primeiro')}
            className={`${
              someSelected 
                ? 'bg-green-600 hover:bg-green-700 text-white' 
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            } px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Campanhas de Follow-up</span>
          </button>
          <button 
            onClick={someSelected ? markSelectedAsContacted : () => showNotification('error', 'Selecione pelo menos um lead primeiro')}
            disabled={loading || !someSelected}
            className={`${
              someSelected && !loading
                ? 'border border-gray-300 hover:bg-gray-50 text-gray-700' 
                : 'border border-gray-200 text-gray-400 cursor-not-allowed'
            } px-4 py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors duration-200`}
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-400 border-t-transparent"></div>
            ) : (
              <CheckCircle className="h-5 w-5" />
            )}
            <span>{loading ? 'Processando...' : 'Marcar Selecionados'}</span>
          </button>
        </div>
      </div>

      {/* Follow-up Campaign Modal */}
      {showFollowUpModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Campanha de Follow-up
              </h3>
              <button 
                onClick={() => setShowFollowUpModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Campanha
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFollowUpType('whatsapp')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-colors ${
                      followUpType === 'whatsapp'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Phone className="h-4 w-4" />
                    <span>WhatsApp</span>
                  </button>
                  <button
                    onClick={() => setFollowUpType('email')}
                    className={`p-3 rounded-lg border-2 flex items-center justify-center space-x-2 transition-colors ${
                      followUpType === 'email'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Email</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mensagem
                </label>
                <textarea
                  value={followUpMessage}
                  onChange={(e) => setFollowUpMessage(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Digite sua mensagem de follow-up..."
                />
              </div>

              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800">
                  <Users className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selecionado{selectedLeads.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowFollowUpModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={executeFollowUpCampaign}
                  disabled={!followUpMessage.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
                >
                  <Send className="h-4 w-4" />
                  <span>Iniciar Campanha</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Exportar {exportType === 'all' ? 'todos os leads' : 'leads selecionados'}
              </h3>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => executeExport('csv')}
                className="p-4 border-2 rounded-lg hover:border-blue-400 transition-colors flex items-center justify-center space-x-2"
              >
                <FileText className="h-5 w-5 text-blue-600" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => executeExport('xlsx')}
                className="p-4 border-2 rounded-lg hover:border-green-400 transition-colors flex items-center justify-center space-x-2"
              >
                <Table className="h-5 w-5 text-green-600" />
                <span>Excel (.xlsx)</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg border max-w-sm ${
          notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' :
          notification.type === 'error' ? 'bg-red-50 border-red-200 text-red-800' :
          'bg-blue-50 border-blue-200 text-blue-800'
        }`}>
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              {notification.type === 'success' ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : notification.type === 'error' ? (
                <AlertCircle className="h-5 w-5 text-red-500" />
              ) : (
                <AlertCircle className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="flex-shrink-0 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default LeadsActions
