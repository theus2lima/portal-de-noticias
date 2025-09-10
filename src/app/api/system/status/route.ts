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
        
        // Testar conexão básica
        const { data: authData, error: authError } = await supabase.auth.getUser()
        if (!authError || authError.message === 'JWT expired') {
          databaseConnection = true
        }

        // Verificar se as tabelas existem
        const { data: tablesData, error: tablesError } = await supabase
          .from('articles')
          .select('id')
          .limit(1)
        
        if (!tablesError) {
          tablesExist = true
        } else {
          errors.push('Tabelas do banco não encontradas')
        }
        
      } catch (error) {
        console.error('Erro ao testar conexão:', error)
        errors.push('Erro ao conectar com Supabase')
      }
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
