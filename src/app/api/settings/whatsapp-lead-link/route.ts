import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

// GET - Buscar link do WhatsApp para leads
export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('*')
      .eq('category', 'leads')
      .eq('key', 'whatsapp_lead_link')
      .single()

    if (error) {
      console.log('Erro ao buscar configuração do WhatsApp para leads:', error)
      // Retornar configuração padrão se não encontrar
      return NextResponse.json({
        success: true,
        data: {
          whatsapp_lead_link: 'https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L'
        }
      })
    }

    const linkValue = typeof settings.value === 'string' 
      ? settings.value.replace(/"/g, '') // Remove aspas se for string
      : settings.value

    return NextResponse.json({
      success: true,
      data: {
        whatsapp_lead_link: linkValue
      }
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    // Fallback para o link padrão
    return NextResponse.json({
      success: true,
      data: {
        whatsapp_lead_link: 'https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L'
      }
    })
  }
}

// PUT - Atualizar link do WhatsApp para leads
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (!body.whatsapp_lead_link) {
      return NextResponse.json(
        { error: 'Link do WhatsApp é obrigatório' },
        { status: 400 }
      )
    }

    // Validação básica de URL
    try {
      const url = new URL(body.whatsapp_lead_link)
      if (!url.hostname.includes('whatsapp.com') && !url.hostname.includes('wa.me')) {
        return NextResponse.json(
          { error: 'Link deve ser um URL válido do WhatsApp' },
          { status: 400 }
        )
      }
    } catch (urlError) {
      return NextResponse.json(
        { error: 'URL inválido' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    
    // Tentar atualizar se existe, senão inserir novo
    const { data: existingRecord } = await supabase
      .from('system_settings')
      .select('id')
      .eq('category', 'leads')
      .eq('key', 'whatsapp_lead_link')
      .single()

    let result
    if (existingRecord) {
      // Atualizar registro existente
      result = await supabase
        .from('system_settings')
        .update({
          value: JSON.stringify(body.whatsapp_lead_link),
          updated_at: new Date().toISOString()
        })
        .eq('category', 'leads')
        .eq('key', 'whatsapp_lead_link')
        .select()
        .single()
    } else {
      // Inserir novo registro
      result = await supabase
        .from('system_settings')
        .insert([{
          category: 'leads',
          key: 'whatsapp_lead_link',
          value: JSON.stringify(body.whatsapp_lead_link),
          description: 'Link do WhatsApp para redirecionamento após captura de leads'
        }])
        .select()
        .single()
    }

    if (result.error) {
      console.error('Erro ao salvar configuração:', result.error)
      return NextResponse.json(
        { error: 'Erro ao salvar configuração' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      message: 'Link do WhatsApp atualizado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao processar requisição:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
