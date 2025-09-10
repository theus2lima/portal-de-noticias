import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// POST - Registrar compartilhamento
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { platform } = await request.json()
    const { id } = params

    if (!platform || !id) {
      return NextResponse.json(
        { error: 'Article ID e platform são obrigatórios' },
        { status: 400 }
      )
    }

    const validPlatforms = ['facebook', 'twitter', 'x', 'whatsapp', 'instagram', 'threads']
    if (!validPlatforms.includes(platform)) {
      return NextResponse.json(
        { error: 'Platform inválida' },
        { status: 400 }
      )
    }

    try {
      // Tentar registrar no Supabase
      const { error } = await supabase
        .from('article_shares')
        .insert([{
          article_id: id,
          platform,
          shared_at: new Date().toISOString()
        }])

      if (error) {
        console.log('Erro ao registrar compartilhamento no Supabase:', error)
        // Continuar sem falhar - apenas log o erro
      }

      return NextResponse.json({ 
        success: true,
        message: 'Compartilhamento registrado'
      })
    } catch (dbError) {
      console.log('Erro de conexão com banco, continuando:', dbError)
      return NextResponse.json({ 
        success: true,
        message: 'Compartilhamento processado'
      })
    }
  } catch (error) {
    console.error('Erro ao processar compartilhamento:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
