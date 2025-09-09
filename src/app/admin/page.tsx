import { 
  FileText, 
  Users, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  Calendar,
  Clock,
  BarChart3
} from 'lucide-react'
import { createClient } from '@/utils/supabase/server'

export default async function AdminDashboard() {
  const supabase = await createClient()

  // Buscar estatísticas
  const [
    { data: stats },
    { data: recentArticles },
    { data: recentLeads }
  ] = await Promise.all([
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
      <div>
        <h1 className="text-3xl font-bold text-neutral-900">Dashboard</h1>
        <p className="text-neutral-600">Bem-vindo ao painel administrativo</p>
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
          <button className="btn-primary flex items-center justify-center space-x-2 py-3">
            <FileText className="h-5 w-5" />
            <span>Novo Artigo</span>
          </button>
          <button className="btn-secondary flex items-center justify-center space-x-2 py-3">
            <BarChart3 className="h-5 w-5" />
            <span>Ver Analytics</span>
          </button>
          <button className="btn-outline flex items-center justify-center space-x-2 py-3">
            <MessageSquare className="h-5 w-5" />
            <span>Exportar Leads</span>
          </button>
        </div>
      </div>
    </div>
  )
}
