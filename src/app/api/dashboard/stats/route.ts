import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

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

    // Definir períodos de tempo
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const last60Days = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)

    // Buscar estatísticas atuais
    const [
      { data: publishedArticles, error: publishedError },
      { data: draftArticles, error: draftError },
      { data: totalViews, error: viewsError },
      { data: currentLeads, error: currentLeadsError },
      { data: categories, error: categoriesError },
      { data: tags, error: tagsError },
      
      // Buscar dados do período anterior para comparação
      { data: lastMonthPublished, error: lastMonthPublishedError },
      { data: lastMonthDrafts, error: lastMonthDraftsError },
      { data: lastMonthViews, error: lastMonthViewsError },
      { data: previousLeads, error: previousLeadsError }
    ] = await Promise.all([
      // Dados atuais
      supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('status', 'published'),
      
      supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('status', 'draft'),
      
      supabase
        .from('articles')
        .select('views_count, created_at')
        .eq('status', 'published'),
      
      supabase
        .from('leads')
        .select('id', { count: 'exact' })
        .gte('created_at', last30Days.toISOString()),
      
      supabase
        .from('categories')
        .select('id', { count: 'exact' }),
      
      supabase
        .from('tags')
        .select('id', { count: 'exact' }),
      
      // Dados do mês anterior para comparação
      supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('status', 'published')
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString()),
      
      supabase
        .from('articles')
        .select('id', { count: 'exact' })
        .eq('status', 'draft')
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString()),
      
      supabase
        .from('articles')
        .select('views_count')
        .eq('status', 'published')
        .gte('created_at', lastMonthStart.toISOString())
        .lt('created_at', lastMonthEnd.toISOString()),
      
      supabase
        .from('leads')
        .select('id', { count: 'exact' })
        .gte('created_at', last60Days.toISOString())
        .lt('created_at', last30Days.toISOString())
    ])

    // Calcular totais atuais
    const currentPublishedCount = publishedArticles?.length || 0
    const currentDraftCount = draftArticles?.length || 0
    const currentTotalViews = totalViews?.reduce((sum: number, article: any) => sum + (article.views_count || 0), 0) || 0
    const currentLeadsCount = currentLeads?.length || 0
    
    // Calcular totais do período anterior
    const lastMonthPublishedCount = lastMonthPublished?.length || 0
    const lastMonthDraftCount = lastMonthDrafts?.length || 0
    const lastMonthTotalViews = lastMonthViews?.reduce((sum: number, article: any) => sum + (article.views_count || 0), 0) || 0
    const previousLeadsCount = previousLeads?.length || 0

    // Calcular mudanças percentuais
    const publishedChange = calculatePercentageChange(currentPublishedCount, lastMonthPublishedCount)
    const draftChange = calculatePercentageChange(currentDraftCount, lastMonthDraftCount)
    const viewsChange = calculatePercentageChange(currentTotalViews, lastMonthTotalViews)
    const leadsChange = calculatePercentageChange(currentLeadsCount, previousLeadsCount)

    const stats = {
      published_articles: currentPublishedCount,
      draft_articles: currentDraftCount,
      total_views: currentTotalViews,
      leads_last_30_days: currentLeadsCount,
      total_categories: categories?.length || 0,
      total_tags: tags?.length || 0,
      database_connected: true,
      
      // Mudanças percentuais reais
      changes: {
        published_articles: publishedChange,
        draft_articles: draftChange,
        total_views: viewsChange,
        leads_last_30_days: leadsChange
      }
    }

    return NextResponse.json(stats)

  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    
    // Retornar dados padrão em caso de erro
    return NextResponse.json({
      published_articles: 0,
      draft_articles: 0,
      total_views: 0,
      leads_last_30_days: 0,
      total_categories: 0,
      total_tags: 0,
      database_connected: false,
      error: 'Erro de conectividade com o banco'
    })
  }
}
