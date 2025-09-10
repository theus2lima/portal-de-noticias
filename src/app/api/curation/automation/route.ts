import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Status do sistema de automação
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    if (action === 'stats') {
      // Buscar estatísticas do sistema
      const [sourcesRes, pendingRes, recentRes] = await Promise.all([
        supabase.from('news_sources').select('count').eq('is_active', true),
        supabase.from('news_curation').select('count').eq('status', 'pending'),
        supabase.from('scraped_news').select('count').gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      ])

      return NextResponse.json({
        success: true,
        data: {
          active_sources: sourcesRes.data?.length || 0,
          pending_curation: pendingRes.data?.length || 0,
          collected_24h: recentRes.data?.length || 0
        }
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        automation_enabled: true,
        last_run: new Date().toISOString(),
        next_run: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      }
    })

  } catch (error) {
    console.error('Erro na automação:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// POST - Executar automação manualmente
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, options = {} } = body

    switch (action) {
      case 'collect':
        return await runCollection(options)
      case 'classify':
        return await runClassification(options)
      case 'full':
        return await runFullPipeline(options)
      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida'
        }, { status: 400 })
    }

  } catch (error) {
    console.error('Erro na automação:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função para executar coleta
async function runCollection(options: any) {
  try {
    // Chamar o endpoint de coleta
    const response = await fetch('/api/news-collector', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        forceRefresh: options.force || false 
      })
    })

    const result = await response.json()
    return NextResponse.json({
      success: true,
      action: 'collect',
      result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      action: 'collect',
      error: error instanceof Error ? error.message : 'Erro na coleta'
    }, { status: 500 })
  }
}

// Função para executar classificação
async function runClassification(options: any) {
  try {
    // Chamar o endpoint de classificação
    const response = await fetch('/api/ai-classifier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        batchSize: options.batchSize || 10 
      })
    })

    const result = await response.json()
    return NextResponse.json({
      success: true,
      action: 'classify',
      result
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      action: 'classify',
      error: error instanceof Error ? error.message : 'Erro na classificação'
    }, { status: 500 })
  }
}

// Função para executar pipeline completo
async function runFullPipeline(options: any) {
  const results = []

  try {
    // 1. Coletar notícias
    console.log('Iniciando coleta...')
    const collectResult = await runCollection(options)
    results.push({ step: 'collect', result: collectResult })

    // Aguardar um pouco antes da classificação
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 2. Classificar notícias
    console.log('Iniciando classificação...')
    const classifyResult = await runClassification(options)
    results.push({ step: 'classify', result: classifyResult })

    return NextResponse.json({
      success: true,
      action: 'full_pipeline',
      steps: results,
      message: 'Pipeline completo executado com sucesso'
    })

  } catch (error) {
    return NextResponse.json({
      success: false,
      action: 'full_pipeline',
      steps: results,
      error: error instanceof Error ? error.message : 'Erro no pipeline'
    }, { status: 500 })
  }
}
