import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import OpenAI from 'openai'

// Configurar OpenAI (em produção, use variável de ambiente)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ''
})

// POST - Classificar notícias pendentes
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { newsId, batchSize = 10 } = body

    if (newsId) {
      // Classificar uma notícia específica
      const result = await classifyNews(supabase, newsId)
      return NextResponse.json(result)
    } else {
      // Classificar notícias em lote
      const result = await classifyNewsBatch(supabase, batchSize)
      return NextResponse.json(result)
    }

  } catch (error) {
    console.error('Erro na classificação:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// GET - Status da classificação
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Buscar estatísticas
    const [unclassifiedResult, categoriesResult] = await Promise.all([
      // Notícias não classificadas
      supabase
        .from('scraped_news')
        .select('id')
        .is('ai_category_id', null),

      // Categorias disponíveis
      supabase
        .from('categories')
        .select('id, name, description')
        .eq('is_active', true)
    ])

    const unclassified = unclassifiedResult.data?.length || 0
    const categories = categoriesResult.data || []

    return NextResponse.json({
      success: true,
      data: {
        unclassified_count: unclassified,
        available_categories: categories.length,
        categories: categories
      }
    })

  } catch (error) {
    console.error('Erro ao buscar status:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

// Função para classificar uma notícia específica
async function classifyNews(supabase: any, newsId: string) {
  // Buscar dados da notícia
  const { data: news, error: newsError } = await supabase
    .from('scraped_news')
    .select('*')
    .eq('id', newsId)
    .single()

  if (newsError || !news) {
    return {
      success: false,
      error: 'Notícia não encontrada'
    }
  }

  // Buscar categorias disponíveis
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('is_active', true)

  if (categoriesError || !categories?.length) {
    return {
      success: false,
      error: 'Categorias não encontradas'
    }
  }

  try {
    // Classificar com IA
    const classification = await classifyWithAI(news, categories)
    
    // Criar registro de curadoria
    const { error: curationError } = await supabase
      .from('news_curation')
      .insert({
        scraped_news_id: news.id,
        suggested_category_id: classification.category_id,
        ai_confidence: classification.confidence,
        ai_category_reasoning: classification.reasoning,
        status: 'pending'
      })

    if (curationError) {
      console.error('Erro ao criar curadoria:', curationError)
      return {
        success: false,
        error: 'Erro ao salvar classificação'
      }
    }

    return {
      success: true,
      data: {
        news_id: newsId,
        suggested_category: classification.category_name,
        confidence: classification.confidence,
        reasoning: classification.reasoning
      }
    }

  } catch (error) {
    console.error('Erro na classificação IA:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro na classificação'
    }
  }
}

// Função para classificar notícias em lote
async function classifyNewsBatch(supabase: any, batchSize: number) {
  // Buscar notícias não classificadas
  const { data: newsList, error: newsError } = await supabase
    .from('scraped_news')
    .select('id, title, summary, content')
    .is('ai_category_id', null)
    .limit(batchSize)

  if (newsError || !newsList?.length) {
    return {
      success: true,
      data: {
        processed: 0,
        message: 'Nenhuma notícia para classificar'
      }
    }
  }

  // Buscar categorias disponíveis
  const { data: categories, error: categoriesError } = await supabase
    .from('categories')
    .select('id, name, description')
    .eq('is_active', true)

  if (categoriesError || !categories?.length) {
    return {
      success: false,
      error: 'Categorias não encontradas'
    }
  }

  const results = []
  let successCount = 0
  let errorCount = 0

  for (const news of newsList) {
    try {
      const classification = await classifyWithAI(news, categories)
      
      // Criar registro de curadoria
      const { error: curationError } = await supabase
        .from('news_curation')
        .insert({
          scraped_news_id: news.id,
          suggested_category_id: classification.category_id,
          ai_confidence: classification.confidence,
          ai_category_reasoning: classification.reasoning,
          status: 'pending'
        })

      if (curationError) {
        console.error('Erro ao criar curadoria:', curationError)
        errorCount++
        results.push({
          news_id: news.id,
          success: false,
          error: 'Erro ao salvar'
        })
      } else {
        successCount++
        results.push({
          news_id: news.id,
          success: true,
          category: classification.category_name,
          confidence: classification.confidence
        })
      }

    } catch (error) {
      console.error('Erro na classificação:', error)
      errorCount++
      results.push({
        news_id: news.id,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      })
    }

    // Adicionar delay para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  return {
    success: errorCount === 0,
    data: {
      processed: newsList.length,
      successful: successCount,
      errors: errorCount,
      results
    }
  }
}

// Função para classificar com IA
async function classifyWithAI(news: any, categories: any[]) {
  const categoryList = categories.map(cat => 
    `${cat.name}: ${cat.description || 'Sem descrição'}`
  ).join('\n')

  const prompt = `
Classifique a seguinte notícia em uma das categorias disponíveis.

NOTÍCIA:
Título: ${news.title}
Resumo: ${news.summary || ''}
Conteúdo: ${news.content ? news.content.substring(0, 1000) : ''}

CATEGORIAS DISPONÍVEIS:
${categoryList}

Responda APENAS com um JSON no seguinte formato:
{
  "category_name": "nome_da_categoria",
  "confidence": 0.85,
  "reasoning": "breve explicação da escolha"
}

A confiança deve ser um número entre 0 e 1.
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Você é um especialista em classificação de notícias. Sempre responda com JSON válido.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    })

    const result = response.choices[0]?.message?.content
    if (!result) {
      throw new Error('Resposta vazia da IA')
    }

    // Parse do JSON
    const classification = JSON.parse(result.trim())
    
    // Encontrar ID da categoria
    const category = categories.find(cat => 
      cat.name.toLowerCase() === classification.category_name.toLowerCase()
    )

    if (!category) {
      throw new Error(`Categoria não encontrada: ${classification.category_name}`)
    }

    return {
      category_id: category.id,
      category_name: category.name,
      confidence: Math.min(Math.max(classification.confidence, 0), 1),
      reasoning: classification.reasoning || 'Sem explicação fornecida'
    }

  } catch (error) {
    console.error('Erro na classificação IA:', error)
    
    // Fallback: categoria padrão com baixa confiança
    const defaultCategory = categories.find(cat => 
      cat.name.toLowerCase().includes('geral') || 
      cat.name.toLowerCase().includes('outros')
    ) || categories[0]

    return {
      category_id: defaultCategory.id,
      category_name: defaultCategory.name,
      confidence: 0.1,
      reasoning: `Erro na classificação automática: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    }
  }
}

// PUT - Treinar o classificador com feedback
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { curationId, feedback } = body

    // Salvar feedback para melhorar o modelo
    const { error } = await supabase
      .from('ai_feedback')
      .insert({
        curation_id: curationId,
        feedback_type: feedback.type, // 'correct', 'incorrect', 'suggestion'
        original_category: feedback.original_category,
        correct_category: feedback.correct_category,
        confidence_score: feedback.confidence,
        notes: feedback.notes
      })

    if (error) {
      console.error('Erro ao salvar feedback:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao salvar feedback'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Feedback registrado com sucesso'
    })

  } catch (error) {
    console.error('Erro ao processar feedback:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
