'use client'

import { 
  FileText, 
  Users, 
  Eye, 
  MessageSquare, 
  TrendingUp,
  TrendingDown,
  Calendar,
  Clock,
  BarChart3,
  Database,
  AlertCircle,
  Loader2
} from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DashboardStats {
  published_articles: number
  draft_articles: number
  total_views: number
  leads_last_30_days: number
  total_categories: number
  total_tags: number
  database_connected: boolean
  error?: string
  changes?: {
    published_articles: string
    draft_articles: string
    total_views: string
    leads_last_30_days: string
  }
}

interface Article {
  id: string
  title: string
  category_name: string
  author_name: string
  created_at: string
  status: string
}

interface Lead {
  id: string
  name: string
  phone: string
  city: string
  created_at: string
  is_contacted: boolean
}

export default function AdminDashboardMain() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [articles, setArticles] = useState<Article[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Buscar estatísticas
        const [statsResponse, articlesResponse, leadsResponse] = await Promise.all([
          fetch('/api/dashboard/stats'),
          fetch('/api/articles?limit=5'),
          fetch('/api/leads?limit=5')
        ])

        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        if (articlesResponse.ok) {
          const articlesData = await articlesResponse.json()
          setArticles(Array.isArray(articlesData) ? articlesData : articlesData.data || [])
        }

        if (leadsResponse.ok) {
          const leadsData = await leadsResponse.json()
          setLeads(Array.isArray(leadsData) ? leadsData : leadsData.data || [])
        }

      } catch (err) {
        console.error('Erro ao carregar dashboard:', err)
        setError('Erro ao carregar dados do dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statCards = [
    {
      title: 'Artigos Publicados',
      value: stats?.published_articles || 0,
      icon: FileText,
      color: 'bg-primary-500',
      change: stats?.changes?.published_articles || '0%'
    },
    {
      title: 'Rascunhos',
      value: stats?.draft_articles || 0,
      icon: Clock,
      color: 'bg-secondary-500',
      change: stats?.changes?.draft_articles || '0%'
    },
    {
      title: 'Total de Visualizações',
      value: stats?.total_views || 0,
      icon: Eye,
      color: 'bg-accent-500',
      change: stats?.changes?.total_views || '0%'
    },
    {
      title: 'Leads (30 dias)',
      value: stats?.leads_last_30_days || 0,
      icon: MessageSquare,
      color: 'bg-primary-600',
      change: stats?.changes?.leads_last_30_days || '0%'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header - mais limpo */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">Dashboard</h1>
          <p className="text-sm text-neutral-600 mt-1">Visão geral do sistema</p>
        </div>
        <div className="flex items-center space-x-3">
          {!isSupabaseConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-yellow-600 mr-2" />
                <div>
                  <p className="text-xs text-yellow-700">
                    Banco de dados não configurado
                  </p>
                </div>
              </div>
            </div>
          )}
          <div className="text-right">
            <p className="text-xs text-neutral-500">Atualizado há</p>
            <p className="text-xs font-medium text-neutral-700">poucos minutos</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const isPositive = stat.change.startsWith('+')
          const isNegative = stat.change.startsWith('-')
          const TrendIcon = isNegative ? TrendingDown : TrendingUp
          const changeColor = isNegative 
            ? 'text-red-500' 
            : isPositive 
            ? 'text-green-500' 
            : 'text-neutral-500'

          return (
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
                <TrendIcon className={`h-4 w-4 ${changeColor} mr-1`} />
                <span className={`text-sm font-medium ${changeColor}`}>{stat.change}</span>
                <span className="text-sm text-neutral-500 ml-1">vs período anterior</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
          <div className="px-6 py-4 border-b border-neutral-200">
            <h3 className="text-lg font-semibold text-neutral-900">Artigos Recentes</h3>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                <span className="ml-2 text-neutral-500">Carregando...</span>
              </div>
            ) : articles && articles.length > 0 ? (
              <div className="space-y-4">
                {articles.map((article: Article) => (
                  <div key={article.id} className="flex items-center space-x-4 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-neutral-900 truncate">
                        {article.title}
                      </p>
                      <div className="flex items-center mt-1 space-x-2 text-xs text-neutral-500">
                        <span>{article.category_name || 'Sem categoria'}</span>
                        <span>•</span>
                        <span>{article.author_name || 'Autor'}</span>
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
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-neutral-400" />
                <span className="ml-2 text-neutral-500">Carregando...</span>
              </div>
            ) : leads && leads.length > 0 ? (
              <div className="space-y-4">
                {leads.map((lead: Lead) => (
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
      {!isSupabaseConfigured && (
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
