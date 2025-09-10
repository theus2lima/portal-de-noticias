'use client'

import { 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Database,
  Globe,
  Server,
  Settings,
  Loader2
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface DatabaseStatus {
  database_connected: boolean
  published_articles: number
  total_categories: number
  total_tags: number
  error?: string
}

export default function StatusPage() {
  const [databaseStatus, setDatabaseStatus] = useState<DatabaseStatus | null>(null)
  const [loading, setLoading] = useState(true)

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  useEffect(() => {
    const checkDatabaseConnection = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setDatabaseStatus(data)
        } else {
          setDatabaseStatus({ 
            database_connected: false, 
            published_articles: 0,
            total_categories: 0,
            total_tags: 0,
            error: 'Falha na conectividade' 
          })
        }
      } catch (error) {
        console.error('Erro ao verificar status:', error)
        setDatabaseStatus({ 
          database_connected: false, 
          published_articles: 0,
          total_categories: 0,
          total_tags: 0,
          error: 'Erro de rede' 
        })
      } finally {
        setLoading(false)
      }
    }

    checkDatabaseConnection()
  }, [])

  const checks = {
    supabaseUrl: !!supabaseUrl,
    supabaseKey: !!supabaseKey,
    databaseConnection: databaseStatus?.database_connected || false,
    tablesExist: databaseStatus?.database_connected || false,
    categoriesData: (databaseStatus?.total_categories || 0) > 0,
    usersData: databaseStatus?.database_connected || false
  }

  let errorDetails: string[] = []
  
  // Verificar variáveis de ambiente
  if (!checks.supabaseUrl) {
    errorDetails.push('NEXT_PUBLIC_SUPABASE_URL não configurada')
  }
  if (!checks.supabaseKey) {
    errorDetails.push('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
  }

  const getStatusIcon = (status: boolean) => {
    return status ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-700 bg-green-50' : 'text-red-700 bg-red-50'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Status do Sistema</h1>
          <p className="text-neutral-600">Diagnóstico de configuração e conectividade em tempo real</p>
        </div>
        {loading && (
          <div className="flex items-center text-neutral-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm">Verificando...</span>
          </div>
        )}
      </div>

      {/* Status Geral */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center mb-4">
          <Server className="h-6 w-6 text-neutral-600 mr-2" />
          <h2 className="text-xl font-semibold text-neutral-900">Status Geral</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`p-4 rounded-lg ${getStatusColor(checks.supabaseUrl && checks.supabaseKey)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.supabaseUrl && checks.supabaseKey)}
              <span className="ml-2 font-medium">Variáveis de Ambiente</span>
            </div>
            <p className="text-sm mt-1">
              {checks.supabaseUrl && checks.supabaseKey 
                ? 'Configuradas corretamente' 
                : 'Não configuradas'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${getStatusColor(checks.databaseConnection)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.databaseConnection)}
              <span className="ml-2 font-medium">Conexão com Banco</span>
            </div>
            <p className="text-sm mt-1">
              {checks.databaseConnection 
                ? 'Conectado ao Supabase' 
                : 'Falha na conexão'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${getStatusColor(checks.tablesExist)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.tablesExist)}
              <span className="ml-2 font-medium">Tabelas do Banco</span>
            </div>
            <p className="text-sm mt-1">
              {checks.tablesExist 
                ? 'Tabelas existem' 
                : 'Tabelas não encontradas'}
            </p>
          </div>

          <div className={`p-4 rounded-lg ${getStatusColor(checks.categoriesData && checks.usersData)}`}>
            <div className="flex items-center">
              {getStatusIcon(checks.categoriesData && checks.usersData)}
              <span className="ml-2 font-medium">Dados Iniciais</span>
            </div>
            <p className="text-sm mt-1">
              {checks.categoriesData && checks.usersData
                ? 'Dados seed criados' 
                : 'Sem dados iniciais'}
            </p>
          </div>
        </div>
      </div>

      {/* Detalhes de Configuração */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <div className="flex items-center mb-4">
          <Settings className="h-6 w-6 text-neutral-600 mr-2" />
          <h2 className="text-xl font-semibold text-neutral-900">Configuração</h2>
        </div>
        
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-600">Supabase URL:</span>
            <span className="font-mono text-sm">
              {process.env.NEXT_PUBLIC_SUPABASE_URL 
                ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.substring(0, 30)}...` 
                : 'Não configurada'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-600">Supabase Key:</span>
            <span className="font-mono text-sm">
              {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY 
                ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` 
                : 'Não configurada'}
            </span>
          </div>
          
          <div className="flex justify-between items-center py-2 border-b border-neutral-200">
            <span className="text-neutral-600">Ambiente:</span>
            <span className="font-mono text-sm">
              {process.env.NODE_ENV || 'development'}
            </span>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-neutral-600">Vercel Deploy:</span>
            <span className="font-mono text-sm">
              {process.env.VERCEL ? 'Sim' : 'Local'}
            </span>
          </div>
        </div>
      </div>

      {/* Erros Encontrados */}
      {errorDetails.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-6 w-6 text-red-600 mr-2" />
            <h2 className="text-xl font-semibold text-red-900">Erros Encontrados</h2>
          </div>
          
          <ul className="space-y-2">
            {errorDetails.map((error, index) => (
              <li key={index} className="text-red-800 text-sm">
                • {error}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Instruções de Correção */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <Database className="h-6 w-6 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-blue-900">Como Corrigir</h2>
        </div>
        
        <div className="space-y-4 text-blue-800">
          {!checks.supabaseUrl || !checks.supabaseKey ? (
            <div>
              <h3 className="font-semibold mb-2">1. Configurar Variáveis de Ambiente</h3>
              <p className="text-sm">
                Configure as variáveis no Vercel ou no seu arquivo .env.local:
              </p>
              <code className="block bg-blue-200 p-2 rounded mt-2 text-xs">
                NEXT_PUBLIC_SUPABASE_URL=sua-url-aqui<br/>
                NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-aqui
              </code>
            </div>
          ) : null}
          
          {!checks.tablesExist ? (
            <div>
              <h3 className="font-semibold mb-2">2. Executar Script SQL</h3>
              <p className="text-sm">
                Execute o conteúdo do arquivo database-schema.sql no SQL Editor do Supabase.
              </p>
            </div>
          ) : null}
          
          {!checks.categoriesData || !checks.usersData ? (
            <div>
              <h3 className="font-semibold mb-2">3. Verificar Dados Iniciais</h3>
              <p className="text-sm">
                Certifique-se de que o script SQL foi executado completamente e criou os dados iniciais.
              </p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Status OK */}
      {Object.values(checks).every(check => check) && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-green-900 mb-2">Sistema Funcionando!</h2>
          <p className="text-green-800">
            Todos os componentes estão configurados corretamente. 
            Sua dashboard está pronta para uso.
          </p>
        </div>
      )}
    </div>
  )
}
