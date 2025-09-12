'use client'

import { useState, useEffect } from 'react'
import { WhatsAppGroupService } from '@/services/whatsappGroupService'
import { MessageCircle, Send, Settings, CheckCircle, AlertCircle, History } from 'lucide-react'

interface WhatsAppGroupConfig {
  groupUrl: string
  enabled: boolean
  autoSend: boolean
}

export default function WhatsAppGroupConfig() {
  const [config, setConfig] = useState<WhatsAppGroupConfig>({
    groupUrl: 'https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L',
    enabled: true,
    autoSend: true
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [logs, setLogs] = useState<any[]>([])

  const whatsappService = WhatsAppGroupService.getInstance()

  useEffect(() => {
    // Carregar configurações atuais
    const currentConfig = whatsappService.getConfig()
    setConfig(currentConfig)
    
    // Carregar logs
    setLogs(whatsappService.getSendLogs())
  }, [])

  const handleSave = async () => {
    setLoading(true)
    try {
      whatsappService.saveConfig(config)
      setMessage({ type: 'success', text: 'Configurações salvas com sucesso!' })
      
      // Limpar mensagem após 3 segundos
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro ao salvar configurações' })
    } finally {
      setLoading(false)
    }
  }

  const handleTest = () => {
    const isValid = whatsappService.testGroupConnection()
    if (isValid) {
      setMessage({ type: 'success', text: 'Configuração válida! Grupo conectado.' })
    } else {
      setMessage({ type: 'error', text: 'Configuração inválida. Verifique o link do grupo.' })
    }
    setTimeout(() => setMessage(null), 3000)
  }

  const handleClearLogs = () => {
    whatsappService.clearLogs()
    setLogs([])
    setMessage({ type: 'success', text: 'Histórico limpo com sucesso!' })
    setTimeout(() => setMessage(null), 3000)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6">
      <div className="flex items-center mb-6">
        <MessageCircle className="h-6 w-6 text-green-600 mr-3" />
        <h2 className="text-xl font-semibold text-neutral-900">
          Configurações do WhatsApp Grupo
        </h2>
      </div>

      {message && (
        <div className={`mb-4 p-4 rounded-lg flex items-center ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-700'
            : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="h-5 w-5 mr-2" />
          ) : (
            <AlertCircle className="h-5 w-5 mr-2" />
          )}
          {message.text}
        </div>
      )}

      <div className="space-y-6">
        {/* URL do Grupo */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Link do Grupo WhatsApp
          </label>
          <input
            type="url"
            value={config.groupUrl}
            onChange={(e) => setConfig({ ...config, groupUrl: e.target.value })}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="https://chat.whatsapp.com/..."
          />
            <p className="mt-1 text-sm text-neutral-500">
            Link do grupo onde as notícias serão enviadas via botão manual ou automaticamente (se habilitado)
          </p>
        </div>

        {/* Configurações */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-700">
                Habilitar envio para WhatsApp
              </h3>
              <p className="text-sm text-neutral-500">
                Ativar/desativar o sistema de envio para WhatsApp
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={(e) => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-neutral-700">
                Envio automático ao publicar
              </h3>
              <p className="text-sm text-neutral-500">
                Se desabilitado, envios só ocorrem via botão manual no painel de artigos
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.autoSend}
                onChange={(e) => setConfig({ ...config, autoSend: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
            </label>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex space-x-3 pt-4 border-t border-neutral-200">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Settings className="h-4 w-4 mr-2" />
            {loading ? 'Salvando...' : 'Salvar Configurações'}
          </button>
          
          <button
            onClick={handleTest}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Send className="h-4 w-4 mr-2" />
            Testar Conexão
          </button>
        </div>

        {/* Histórico de Envios */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-neutral-900 flex items-center">
              <History className="h-5 w-5 mr-2" />
              Histórico de Envios
            </h3>
            {logs.length > 0 && (
              <button
                onClick={handleClearLogs}
                className="text-sm text-red-600 hover:text-red-700 transition-colors"
              >
                Limpar Histórico
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-neutral-300" />
              <p>Nenhum envio registrado ainda</p>
              <p className="text-sm">Os envios aparecerão aqui quando você usar os botões manuais ou publicar artigos (se automático estiver ativo)</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    log.status === 'success'
                      ? 'border-green-200 bg-green-50'
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {log.status === 'success' ? (
                        <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-600 mr-2" />
                      )}
                      <span className="text-sm font-medium">
                        Artigo ID: {log.articleId}
                      </span>
                    </div>
                    <span className="text-xs text-neutral-500">
                      {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  {log.error && (
                    <p className="text-sm text-red-600 mt-1 ml-6">
                      Erro: {log.error}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
