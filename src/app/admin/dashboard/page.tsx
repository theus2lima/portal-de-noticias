import { 
  FileText, 
  Users, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Clock,
  BarChart3,
  Database,
  AlertCircle
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'

export default async function AdminDashboardMain() {
  const supabase = await createClient()

  // Tentar buscar estatísticas com fallback
  let stats = null
  let recentArticles = null
  let recentLeads = null
  let dbConnected = true
  
  try {
    // Verifica se as variáveis de ambiente estão configuradas
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.log('Variáveis de ambiente do Supabase não configuradas')
      dbConnected = false
    } else {
      // Teste de conexão simples
      const { data: testConnection, error: testError } = await supabase
        .from('categories')
        .select('count', { count: 'exact', head: true })
      
      if (!testError && testConnection !== undefined) {
        // Se a conexão funciona, tente buscar dados
        const results = await Promise.allSettled([
          supabase.from('dashboard_stats').select('*').single(),
          supabase
            .from('articles_with_details')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5),
          supabase
            .from('leads')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(5)
        ])
        
        stats = results[0].status === 'fulfilled' ? results[0].value.data : null
        recentArticles = results[1].status === 'fulfilled' ? results[1].value.data : null
        recentLeads = results[2].status === 'fulfilled' ? results[2].value.data : null
      } else {
        console.log('Teste de conexão falhou:', testError?.message || 'Tabelas não existem')
        dbConnected = false
      }
    }
  } catch (error) {
    console.log('Erro ao conectar com banco:', error)
    dbConnected = false
  }

  const statCards = [
    {
      title: 'Artigos Publicados',
      value: stats?.published_articles || 0,
      icon: FileText,
      color: 'bg-primary-500',
      change: '+12%'
    },
    {
      title: 'Rascunhos',
      value: stats?.draft_articles || 0,
      icon: Clock,
      color: 'bg-secondary-500',
      change: '+5%'
    },
    {
      title: 'Total de Visualizações',
      value: stats?.total_views || 0,
      icon: Eye,
      color: 'bg-accent-500',
      change: '+23%'
    },
    {
      title: 'Leads (30 dias)',
      value: stats?.leads_last_30_days || 0,
      icon: MessageSquare,
      color: 'bg-primary-600',
      change: '+8%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
          <p className="text-neutral-600">Bem-vindo ao painel administrativo</p>
        </div>
        {!dbConnected && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Banco não configurado</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Execute o script SQL no Supabase para configurar as tabelas.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">{stat.title}</p>
                <p className="text-2xl font-bold text-neutral-900 mt-2">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm font-medium text-green-500">{stat.change}</span>
              <span className="text-sm text-neutral-500 ml-1">vs mês anterior</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Artigos Recentes</h3>
          </div>
          <div className="p-6">
            {recentArticles && recentArticles.length > 0 ? (
              <div className="space-y-4">
                {recentArticles.map((article: any) => (
                  <div key={article.id} className="flex items-center space-x-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {article.title}
                      </p>
                      <div className="flex items-center mt-1 space-x-2 text-xs text-neutral-500">
                        <span>{article.category_name}</span>
                        <span>•</span>
                        <span>{article.author_name}</span>
                        <span>•</span>
                        <span>{new Date(article.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      article.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {article.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">Nenhum artigo encontrado</p>
            )}
          </div>
        </div>

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Leads Recentes</h3>
          </div>
          <div className="p-6">
            {recentLeads && recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead: any) => (
                  <div key={lead.id} className="flex items-center space-x-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900">
                        {lead.name}
                      </p>
                      <div className="flex items-center mt-1 space-x-2 text-xs text-neutral-500">
                        <span>{lead.phone}</span>
                        <span>•</span>
                        <span>{lead.city}</span>
                        <span>•</span>
                        <span>{new Date(lead.created_at).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      lead.is_contacted 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {lead.is_contacted ? 'Contatado' : 'Pendente'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-neutral-500 text-center py-4">Nenhum lead encontrado</p>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/admin/articles/new"
            className="btn-primary flex items-center justify-center space-x-2 py-3 text-center"
          >
            <FileText className="h-5 w-5" />
            <span>Novo Artigo</span>
          </Link>
          <Link
            href="/admin/analytics"
            className="btn-secondary flex items-center justify-center space-x-2 py-3 text-center"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Ver Analytics</span>
          </Link>
          <Link
            href="/admin/leads"
            className="btn-outline flex items-center justify-center space-x-2 py-3 text-center"
          >
            <MessageSquare className="h-5 w-5" />
            <span>Ver Leads</span>
          </Link>
        </div>
      </div>
      
      {/* Database Setup Instructions */}
      {!dbConnected && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start">
            <Database className="h-6 w-6 text-blue-600 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">Configure seu banco de dados</h3>
              <p className="text-blue-800 mb-4">
                Para que a dashboard funcione completamente, você precisa executar o script SQL no Supabase.
              </p>
              <div className="space-y-2 text-sm text-blue-700">
                <p><strong>1.</strong> Acesse seu projeto no Supabase</p>
                <p><strong>2.</strong> Vá para SQL Editor</p>
                <p><strong>3.</strong> Execute o conteúdo do arquivo <code className="bg-blue-200 px-1 rounded">database-schema.sql</code></p>
                <p><strong>4.</strong> Atualize esta página</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
