import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

interface SystemStatus {
  supabaseUrl: boolean
  supabaseKey: boolean
  databaseConnection: boolean
  tablesExist: boolean
  environment: string
  vercelDeploy: boolean
  errors: string[]
}

export async function GET(request: NextRequest) {
  try {
    const errors: string[] = []
    
    // Verificar variáveis de ambiente
    const supabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    
    if (!supabaseUrl) {
      errors.push('NEXT_PUBLIC_SUPABASE_URL não configurada')
    }
    if (!supabaseKey) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY não configurada')
    }

    let databaseConnection = false
    let tablesExist = false

    // Testar conexão com banco
    if (supabaseUrl && supabaseKey) {
      try {
        const supabase = await createClient()
        
        // Primeiro teste: tentar uma query simples
        try {
          const { data, error } = await supabase
            .from('articles')
            .select('id')
            .limit(1)
          
          if (!error) {
            databaseConnection = true
            tablesExist = true
          } else {
            // Se der erro, pode ser que não há dados ou a tabela não existe
            console.log('Erro na query articles:', error.message)
            
            // Vamos tentar outras tabelas
            const { data: catData, error: catError } = await supabase
              .from('categories')
              .select('id')
              .limit(1)
            
            if (!catError) {
              databaseConnection = true
              tablesExist = true
            } else {
              console.log('Erro na query categories:', catError.message)
              errors.push(`Erro ao acessar tabelas: ${error.message}`)
            }
          }
        } catch (queryError) {
          console.error('Erro nas queries:', queryError)
          errors.push('Erro ao executar queries no banco')
        }
        
      } catch (error) {
        console.error('Erro ao criar cliente Supabase:', error)
        errors.push(`Erro ao conectar com Supabase: ${error}`)
      }
    } else {
      errors.push('Variáveis de ambiente não configuradas')
    }

    const status: SystemStatus = {
      supabaseUrl,
      supabaseKey,
      databaseConnection,
      tablesExist,
      environment: process.env.NODE_ENV || 'development',
      vercelDeploy: !!process.env.VERCEL,
      errors
    }

    return NextResponse.json({
      success: true,
      data: status
    })
    
  } catch (error) {
    console.error('Erro ao verificar status do sistema:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor',
      data: {
        supabaseUrl: false,
        supabaseKey: false,
        databaseConnection: false,
        tablesExist: false,
        environment: 'unknown',
        vercelDeploy: false,
        errors: ['Erro interno do servidor']
      }
    }, { status: 500 })
  }
}
