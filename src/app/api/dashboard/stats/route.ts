import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

/**
 * Calcula a mudança percentual entre dois valores
 * 
 * Cenários de exemplo:
 * - Anterior: 0, Atual: 0 = 0%
 * - Anterior: 0, Atual: 1 = +50%
 * - Anterior: 0, Atual: 2 = +100%
 * - Anterior: 0, Atual: 3 = +150%
 * - Anterior: 0, Atual: 37 = +370%
 * - Anterior: 1, Atual: 0 = -100%
 * - Anterior: 10, Atual: 15 = +50%
 * - Anterior: 20, Atual: 10 = -50%
 */
function calculatePercentageChange(current: number, previous: number): string {
  // Cenário 1: Não houve valor anterior (0) mas há valor atual
  if (previous === 0) {
    if (current === 0) {
      return '0%' // Nenhuma mudança: 0 -> 0
    }
    // Crescimento desde zero - mostrar crescimento representativo
    // Para valores pequenos (1-10), mostrar percentual baseado no valor
    if (current <= 10) {
      return `+${current * 50}%` // Ex: 1=+50%, 2=+100%, 3=+150%
    }
    // Para valores maiores, usar fórmula mais moderada
    const percentIncrease = Math.min(current * 10, 999) // Ex: 37=+370%, limita a 999%
    return `+${Math.round(percentIncrease)}%`
  }
  
  // Se havia valor anterior mas agora é zero
  if (current === 0) {
    return '-100%' // Queda total
  }
  
  // Cálculo normal de percentual
  const change = ((current - previous) / previous) * 100
  const sign = change >= 0 ? '+' : ''
  
  // Se a mudança for muito grande, limitar a exibição para evitar números absurdos
  const roundedChange = Math.round(change)
  if (Math.abs(roundedChange) > 999) {
    return sign === '+' ? '+999%' : '-999%'
  }
  
  return `${sign}${roundedChange}%`
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
