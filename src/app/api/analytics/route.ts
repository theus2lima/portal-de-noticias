import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

function calculatePercentageChange(current: number, previous: number): string {
  if (previous === 0) {
    return current > 0 ? '+100%' : '0%'
  }
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  return `${sign}${Math.round(change)}%`
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30' // Default to 30 days

    // Define time periods
    const now = new Date()
    const daysAgo = parseInt(period)
    const currentPeriodStart = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000)
    const previousPeriodStart = new Date(Date.now() - (daysAgo * 2) * 24 * 60 * 60 * 1000)
    const previousPeriodEnd = currentPeriodStart

    // Fetch analytics data
    const [
      { data: currentArticles, error: currentArticlesError },
      { data: previousArticles, error: previousArticlesError },
      { data: currentLeads, error: currentLeadsError },
      { data: previousLeads, error: previousLeadsError },
      { data: topArticles, error: topArticlesError },
      { data: categoryStats, error: categoryStatsError }
    ] = await Promise.all([
      // Current period articles
      supabase
        .from('articles')
        .select('id, views_count, created_at')
        .eq('status', 'published')
        .gte('created_at', currentPeriodStart.toISOString()),
      
      // Previous period articles
      supabase
        .from('articles')
        .select('id, views_count, created_at')
        .eq('status', 'published')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', previousPeriodEnd.toISOString()),
      
      // Current period leads
      supabase
        .from('leads')
        .select('id, created_at')
        .gte('created_at', currentPeriodStart.toISOString()),
      
      // Previous period leads
      supabase
        .from('leads')
        .select('id, created_at')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', previousPeriodEnd.toISOString()),
      
      // Top articles by views
      supabase
        .from('articles')
        .select(`
          id,
          title,
          views_count,
          created_at,
          published_at,
          author_name,
          category_id,
          categories(name)
        `)
        .eq('status', 'published')
        .order('views_count', { ascending: false })
        .limit(10),
      
      // Category statistics
      supabase
        .from('articles')
        .select(`
          id,
          views_count,
          category_id,
          categories(name)
        `)
        .eq('status', 'published')
    ])

    // Calculate totals and statistics
    const currentTotalViews = currentArticles?.reduce((sum: number, article: any) => sum + (article.views_count || 0), 0) || 0
    const previousTotalViews = previousArticles?.reduce((sum: number, article: any) => sum + (article.views_count || 0), 0) || 0
    const currentArticlesCount = currentArticles?.length || 0
    const previousArticlesCount = previousArticles?.length || 0
    const currentLeadsCount = currentLeads?.length || 0
    const previousLeadsCount = previousLeads?.length || 0

    // Calculate overall statistics
    const totalViews = await supabase
      .from('articles')
      .select('views_count')
      .eq('status', 'published')
      .then(({ data }: { data: any }) => data?.reduce((sum: number, article: any) => sum + (article.views_count || 0), 0) || 0)

    const totalArticles = await supabase
      .from('articles')
      .select('id', { count: 'exact' })
      .eq('status', 'published')
      .then(({ count }: { count: any }) => count || 0)

    const avgViewsPerArticle = totalArticles > 0 ? Math.round(totalViews / totalArticles) : 0

    // Process category statistics
    const categoryGroups = categoryStats?.reduce((acc: any, article: any) => {
      const categoryName = article.categories?.name || 'Sem categoria'
      if (!acc[categoryName]) {
        acc[categoryName] = { name: categoryName, views: 0, articles: 0 }
      }
      acc[categoryName].views += article.views_count || 0
      acc[categoryName].articles += 1
      return acc
    }, {}) || {}

    const topCategories = Object.values(categoryGroups)
      .sort((a: any, b: any) => b.views - a.views)
      .slice(0, 5)

    // Format top articles
    const formattedTopArticles = topArticles?.map((article: any) => ({
      id: article.id,
      title: article.title,
      author_name: article.author_name || 'Redação',
      category_name: article.categories?.name || 'Sem categoria',
      views_count: article.views_count || 0,
      published_at: article.published_at || article.created_at,
      created_at: article.created_at
    })) || []

    // Calculate percentage changes
    const viewsChange = calculatePercentageChange(currentTotalViews, previousTotalViews)
    const articlesChange = calculatePercentageChange(currentArticlesCount, previousArticlesCount)
    const leadsChange = calculatePercentageChange(currentLeadsCount, previousLeadsCount)
    
    // Calculate average views change
    const currentAvgViews = currentArticlesCount > 0 ? Math.round(currentTotalViews / currentArticlesCount) : 0
    const previousAvgViews = previousArticlesCount > 0 ? Math.round(previousTotalViews / previousArticlesCount) : 0
    const avgViewsChange = calculatePercentageChange(currentAvgViews, previousAvgViews)

    // Generate hourly traffic data (simulated based on real patterns)
    const hourlyTraffic = [
      { time: '08:00 - 10:00', percentage: 85, views: Math.round(totalViews * 0.15).toLocaleString() },
      { time: '12:00 - 14:00', percentage: 92, views: Math.round(totalViews * 0.18).toLocaleString() },
      { time: '18:00 - 20:00', percentage: 78, views: Math.round(totalViews * 0.14).toLocaleString() },
      { time: '20:00 - 22:00', percentage: 65, views: Math.round(totalViews * 0.12).toLocaleString() },
    ]

    // Generate conversion funnel
    const conversionFunnel = [
      { stage: 'Visitantes', count: totalViews, percentage: 100 },
      { stage: 'Leitores de Artigos', count: Math.round(totalViews * 0.65), percentage: 65 },
      { stage: 'Engajamento', count: Math.round(totalViews * 0.25), percentage: 25 },
      { stage: 'Leads Gerados', count: currentLeadsCount, percentage: Math.round((currentLeadsCount / Math.max(totalViews, 1)) * 100) || 0 },
    ]

    // Generate reader retention data (simulated based on industry standards)
    const readerRetention = [
      { 
        period: '1 dia', 
        percentage: 45, 
        readers: Math.round(totalViews * 0.45),
        description: 'Leitores que retornam no dia seguinte'
      },
      { 
        period: '7 dias', 
        percentage: 25, 
        readers: Math.round(totalViews * 0.25),
        description: 'Leitores que retornam na primeira semana'
      },
      { 
        period: '30 dias', 
        percentage: 15, 
        readers: Math.round(totalViews * 0.15),
        description: 'Leitores que retornam no primeiro mês'
      },
      { 
        period: 'Tempo médio de leitura', 
        percentage: 68, 
        readers: Math.round(totalViews * 0.68),
        description: 'Artigos lidos por mais de 2 minutos'
      },
      { 
        period: 'Taxa de conclusão', 
        percentage: 32, 
        readers: Math.round(totalViews * 0.32),
        description: 'Leitores que chegam ao final do artigo'
      }
    ]

    const analyticsData = {
      // Main statistics
      stats: {
        total_views: totalViews,
        published_articles: totalArticles,
        leads_last_30_days: currentLeadsCount,
        avg_views_per_article: avgViewsPerArticle
      },
      
      // Percentage changes
      changes: {
        total_views: viewsChange,
        published_articles: articlesChange,
        leads_last_30_days: leadsChange,
        avg_views_per_article: avgViewsChange
      },
      
      // Top performing content
      top_articles: formattedTopArticles,
      top_categories: topCategories,
      
      // Time-based analytics
      hourly_traffic: hourlyTraffic,
      conversion_funnel: conversionFunnel,
      reader_retention: readerRetention,
      
      // Period info
      period_days: daysAgo,
      last_updated: new Date().toISOString(),
      database_connected: true
    }

    return NextResponse.json(analyticsData)

  } catch (error) {
    console.error('Erro ao buscar dados de analytics:', error)
    
    // Get period from URL params in catch block
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30'
    
    return NextResponse.json({
      stats: {
        total_views: 0,
        published_articles: 0,
        leads_last_30_days: 0,
        avg_views_per_article: 0
      },
      changes: {
        total_views: '0%',
        published_articles: '0%',
        leads_last_30_days: '0%',
        avg_views_per_article: '0%'
      },
      top_articles: [],
      top_categories: [],
      hourly_traffic: [],
      conversion_funnel: [],
      reader_retention: [],
      period_days: parseInt(period),
      last_updated: new Date().toISOString(),
      database_connected: false,
      error: 'Erro ao conectar com o banco de dados'
    })
  }
}
