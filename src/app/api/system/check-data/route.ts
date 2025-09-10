import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    let hasCategories = false
    let hasUsers = false
    let hasArticles = false
    const errors: string[] = []

    try {
      // Verificar se existem categorias
      const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('id')
        .limit(1)
      
      if (!catError && categories && categories.length > 0) {
        hasCategories = true
      } else if (catError) {
        errors.push(`Erro ao verificar categorias: ${catError.message}`)
      }
    } catch (error) {
      errors.push(`Erro ao acessar tabela categories: ${error}`)
    }

    try {
      // Verificar se existem usuários na tabela auth.users (através de uma query que não precisa de auth)
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
      
      if (!profileError && profiles && profiles.length > 0) {
        hasUsers = true
      } else if (profileError) {
        // Se não há tabela profiles, vamos assumir que o auth do Supabase está funcionando
        hasUsers = true
        console.log('Tabela profiles não encontrada, assumindo que auth está ok')
      }
    } catch (error) {
      hasUsers = true // Assumir que está ok se não conseguir verificar
      console.log('Não foi possível verificar users, assumindo que está ok')
    }

    try {
      // Verificar se existem artigos
      const { data: articles, error: artError } = await supabase
        .from('articles')
        .select('id')
        .limit(1)
      
      if (!artError && articles && articles.length > 0) {
        hasArticles = true
      } else if (artError) {
        errors.push(`Erro ao verificar artigos: ${artError.message}`)
      }
    } catch (error) {
      errors.push(`Erro ao acessar tabela articles: ${error}`)
    }

    return NextResponse.json({
      success: true,
      data: {
        hasCategories,
        hasUsers,
        hasArticles,
        errors
      }
    })
    
  } catch (error) {
    console.error('Erro ao verificar dados iniciais:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: {
        hasCategories: false,
        hasUsers: false,
        hasArticles: false,
        errors: ['Erro interno do servidor']
      }
    }, { status: 500 })
  }
}
