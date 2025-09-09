import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Users,
  Calendar,
  Download,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  Clock
} from 'lucide-react'

export default function AnalyticsPage() {
  // Dados mocados para demonstração (substituir quando Supabase estiver configurado)
  const stats = {
    total_views: 15420,
    published_articles: 23,
    leads_last_30_days: 47,
  }

  const topArticles = [
    {
      id: 1,
      title: "Nova política de saúde aprovada na câmara municipal",
      author_name: "Redação",
      category_name: "Política",
      views_count: 2450,
      published_at: "2024-01-15T10:00:00Z"
    },
    {
      id: 2,
      title: "Crescimento econômico da cidade surpreende especialistas",
      author_name: "Redação",
      category_name: "Economia",
      views_count: 1890,
      published_at: "2024-01-14T14:30:00Z"
    },
    {
      id: 3,
      title: "Time local conquista campeonato regional",
      author_name: "Redação",
      category_name: "Esportes",
      views_count: 1650,
      published_at: "2024-01-13T16:45:00Z"
    }
  ]

  const categoryViews = [
    { category_name: "Política", views_count: 5420 },
    { category_name: "Economia", views_count: 3890 },
    { category_name: "Esportes", views_count: 2650 },
    { category_name: "Cultura", views_count: 2100 },
    { category_name: "Cidades", views_count: 1360 }
  ]

  // Agrupar visualizações por categoria
  const categoryStats = categoryViews?.reduce((acc: any, article: any) => {
    const category = article.category_name
    if (!acc[category]) {
      acc[category] = { name: category, views: 0, articles: 0 }
    }
    acc[category].views += article.views_count || 0
    acc[category].articles += 1
    return acc
  }, {})

  const topCategories = Object.values(categoryStats || {})
    .sort((a: any, b: any) => b.views - a.views)
    .slice(0, 5)

  // Estatísticas calculadas
  const totalViews = stats?.total_views || 0
  const publishedArticles = stats?.published_articles || 0
  const totalLeads = stats?.leads_last_30_days || 0
  const avgViewsPerArticle = publishedArticles > 0 ? Math.round(totalViews / publishedArticles) : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
          <p className="text-gray-600">Análise detalhada de desempenho do portal</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="btn-outline flex items-center space-x-2">
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
          <button className="btn-primary flex items-center space-x-2">
            <Download className="h-5 w-5" />
            <span>Exportar Relatório</span>
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Visualizações</p>
              <p className="text-2xl font-bold text-gray-900">{totalViews.toLocaleString()}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-500">+23%</span>
            <span className="text-sm text-gray-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Artigos Publicados</p>
              <p className="text-2xl font-bold text-gray-900">{publishedArticles}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-500">+12%</span>
            <span className="text-sm text-neutral-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Leads Captados</p>
              <p className="text-2xl font-bold text-neutral-900">{totalLeads}</p>
            </div>
            <div className="bg-secondary-500 p-3 rounded-lg">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-sm font-medium text-green-500">+8%</span>
            <span className="text-sm text-neutral-500 ml-1">vs mês anterior</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-600">Média de Views</p>
              <p className="text-2xl font-bold text-neutral-900">{avgViewsPerArticle}</p>
            </div>
            <div className="bg-primary-600 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center">
            <ArrowDown className="h-4 w-4 text-red-500 mr-1" />
            <span className="text-sm font-medium text-red-500">-2%</span>
            <span className="text-sm text-neutral-500 ml-1">vs mês anterior</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Traffic Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-900">Tráfego do Portal</h3>
            <select className="px-3 py-1 border border-neutral-300 rounded-md text-sm">
              <option>Últimos 30 dias</option>
              <option>Últimos 7 dias</option>
              <option>Último mês</option>
            </select>
          </div>
          <div className="h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-neutral-400 mx-auto mb-2" />
              <p className="text-neutral-500">Gráfico de tráfego será exibido aqui</p>
            </div>
          </div>
        </div>

        {/* Categories Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Performance por Categoria</h3>
          <div className="space-y-4">
            {topCategories.map((category: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-neutral-900">{category.name}</span>
                    <span className="text-sm text-neutral-500">{category.views.toLocaleString()} views</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((category.views / Math.max(...topCategories.map((c: any) => c.views))) * 100, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-neutral-500 mt-1">{category.articles} artigos</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Articles */}
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200">
        <div className="px-6 py-4 border-b border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-900">Artigos Mais Lidos</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-neutral-200">
            <thead className="bg-neutral-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Posição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Artigo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Categoria
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Visualizações
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Publicado em
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {topArticles && topArticles.length > 0 ? (
                topArticles.map((article: any, index: number) => (
                  <tr key={article.id} className="hover:bg-neutral-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-800' :
                          index === 1 ? 'bg-gray-100 text-gray-800' :
                          index === 2 ? 'bg-orange-100 text-orange-800' :
                          'bg-neutral-100 text-neutral-800'
                        }`}>
                          {index + 1}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-neutral-900 truncate max-w-xs">
                        {article.title}
                      </div>
                      <div className="text-sm text-neutral-500">
                        Por {article.author_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                        {article.category_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-neutral-900">
                        <Eye className="h-4 w-4 text-neutral-400 mr-1" />
                        {(article.views_count || 0).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-neutral-400 mr-1" />
                        {new Date(article.published_at || article.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <BarChart3 className="mx-auto h-12 w-12 text-neutral-400" />
                    <h3 className="mt-2 text-sm font-medium text-neutral-900">
                      Nenhum dado de analytics disponível
                    </h3>
                    <p className="mt-1 text-sm text-neutral-500">
                      Dados de visualização aparecerão aqui conforme o tráfego cresce.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Time-based Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time of Day Analytics */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Horários de Maior Tráfego</h3>
          <div className="space-y-3">
            {[
              { time: '08:00 - 10:00', percentage: 85, views: '2.3k' },
              { time: '12:00 - 14:00', percentage: 92, views: '2.8k' },
              { time: '18:00 - 20:00', percentage: 78, views: '2.1k' },
              { time: '20:00 - 22:00', percentage: 65, views: '1.8k' },
            ].map((timeSlot, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-900">{timeSlot.time}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-neutral-200 rounded-full h-2">
                    <div 
                      className="bg-accent-500 h-2 rounded-full"
                      style={{ width: `${timeSlot.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-neutral-600 w-12 text-right">{timeSlot.views}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-6">Funil de Conversão</h3>
          <div className="space-y-4">
            {[
              { stage: 'Visitantes', count: totalViews, percentage: 100 },
              { stage: 'Leitores de Artigos', count: Math.round(totalViews * 0.65), percentage: 65 },
              { stage: 'Engajamento', count: Math.round(totalViews * 0.25), percentage: 25 },
              { stage: 'Leads Gerados', count: totalLeads, percentage: Math.round((totalLeads / totalViews) * 100) || 0 },
            ].map((stage, index) => (
              <div key={index} className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-neutral-900">{stage.stage}</span>
                  <div className="text-right">
                    <span className="text-sm font-bold text-neutral-900">{stage.count.toLocaleString()}</span>
                    <span className="text-xs text-neutral-500 ml-2">{stage.percentage}%</span>
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-300 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-green-500' :
                      index === 2 ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${stage.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
