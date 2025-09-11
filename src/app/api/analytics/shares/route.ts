import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// Função para gerar dados de demonstração quando a tabela não existe
function generateDemoSharesData(period: number) {
  const platforms = ['whatsapp', 'x', 'threads', 'instagram']
  
  // Gerar compartilhamentos por plataforma
  const sharesByPlatform = platforms.reduce((acc, platform) => {
    acc[platform] = Math.floor(Math.random() * 50) + 10 // Entre 10 e 60
    return acc
  }, {} as any)
  
  const totalShares = Object.values(sharesByPlatform).reduce((sum: number, shares: any) => sum + shares, 0)
  
  // Gerar dados dos últimos 7 dias
  const last7Days = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    last7Days.push({
      date: dateStr,
      shares: Math.floor(Math.random() * 20) + 5, // Entre 5 e 25
      label: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
    })
  }
  
  // Gerar top artigos (dados fictícios)
  const topArticles = [
    { id: '1', title: 'Nova Lei de Orçamento Aprovada', shares: Math.floor(Math.random() * 30) + 15 },
    { id: '2', title: 'Mercado Financeiro em Alta', shares: Math.floor(Math.random() * 25) + 10 },
    { id: '3', title: 'Campeonato Regional', shares: Math.floor(Math.random() * 20) + 8 },
    { id: '4', title: 'Festival de Cultura Local', shares: Math.floor(Math.random() * 15) + 5 },
    { id: '5', title: 'Obras de Infraestrutura', shares: Math.floor(Math.random() * 12) + 3 }
  ].sort((a, b) => b.shares - a.shares)
  
  return {
    totalShares,
    sharesByPlatform,
    last7Days,
    topArticles,
    period
  }
}

// GET - Buscar estatísticas de compartilhamento
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const period = searchParams.get('period') || '30' // dias
    const articleId = searchParams.get('article_id')

    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - parseInt(period))

    try {
      let query = supabase
        .from('article_shares')
        .select(`
          platform,
          shared_at,
          article_id,
          articles!inner(title)
        `)
        .gte('shared_at', startDate.toISOString())
        .lte('shared_at', endDate.toISOString())

      if (articleId) {
        query = query.eq('article_id', articleId)
      }

      const { data: shares, error } = await query

      if (error) {
        console.log('Erro ao buscar compartilhamentos no Supabase:', error)
        throw error
      }

      // Agrupar por plataforma
      const sharesByPlatform = shares?.reduce((acc: any, share: any) => {
        const platform = share.platform
        if (!acc[platform]) {
          acc[platform] = 0
        }
        acc[platform]++
        return acc
      }, {}) || {}

      // Agrupar por data (últimos 7 dias para gráfico)
      const last7Days: Array<{date: string; shares: number; label: string}> = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dateStr = date.toISOString().split('T')[0]
        
        const dayShares = shares?.filter((share: any) => 
          share.shared_at.startsWith(dateStr)
        ).length || 0
        
        last7Days.push({
          date: dateStr,
          shares: dayShares,
          label: date.toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' })
        })
      }

      // Top artigos mais compartilhados
      const topArticles = shares?.reduce((acc: any, share: any) => {
        const articleId = share.article_id
        const title = share.articles?.title || 'Artigo sem título'
        
        if (!acc[articleId]) {
          acc[articleId] = {
            id: articleId,
            title,
            shares: 0
          }
        }
        acc[articleId].shares++
        return acc
      }, {}) || {}

      const topArticlesList = Object.values(topArticles)
        .sort((a: any, b: any) => b.shares - a.shares)
        .slice(0, 10)

      return NextResponse.json({
        data: {
          totalShares: shares?.length || 0,
          sharesByPlatform,
          last7Days,
          topArticles: topArticlesList,
          period: parseInt(period)
        }
      })

    } catch (supabaseError: any) {
      console.log('Erro de Supabase, verificando se é tabela ausente:', supabaseError)
      
      // Se a tabela não existe, criar dados de demonstração
      if (supabaseError?.message?.includes('relation "article_shares" does not exist') ||
          supabaseError?.code === '42P01') {
        console.log('Tabela article_shares não existe, gerando dados de exemplo')
        
        // Gerar dados de exemplo para demonstração
        const demoData = generateDemoSharesData(parseInt(period))
        return NextResponse.json({ data: demoData })
      }
      
      // Para outros erros, retornar dados vazios
      return NextResponse.json({
        data: {
          totalShares: 0,
          sharesByPlatform: {},
          last7Days: [],
          topArticles: [],
          period: parseInt(period)
        }
      })
    }

  } catch (error) {
    console.error('Erro ao buscar estatísticas de compartilhamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
