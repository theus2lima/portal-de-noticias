import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

interface TickerItem {
  id: string
  text: string
  priority: number
  active: boolean
  created_at: string
  updated_at?: string
}

interface TickerSettings {
  tickerEnabled: boolean
  tickerSpeed: number
  tickerItems: TickerItem[]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const supabase = await createClient()
    
    if (category === 'ticker') {
      // Buscar configurações do ticker
      const { data: tickerSettings, error: settingsError } = await supabase
        .from('system_settings')
        .select('key, value')
        .eq('category', 'ticker')
      
      if (settingsError) {
        console.error('Erro ao buscar configurações do ticker:', settingsError)
        // Fallback para dados mockados
        return NextResponse.json({
          success: true,
          data: {
            tickerEnabled: true,
            tickerSpeed: 30,
            tickerItems: [
              {
                id: '1',
                text: '🔴 Portal de Notícias - Sistema funcionando perfeitamente!',
                priority: 10,
                active: true,
                created_at: new Date().toISOString()
              }
            ]
          }
        })
      }
      
      // Buscar itens do ticker
      const { data: tickerItems, error: itemsError } = await supabase
        .from('ticker_items')
        .select('*')
        .eq('active', true)
        .order('priority', { ascending: false })
      
      if (itemsError) {
        console.error('Erro ao buscar itens do ticker:', itemsError)
      }
      
      // Processar configurações
      const settings = tickerSettings?.reduce((acc: { tickerEnabled: boolean; tickerSpeed: number }, setting: { key: string; value: any }) => {
        if (setting.key === 'enabled') {
          acc.tickerEnabled = setting.value === true || setting.value === 'true'
        } else if (setting.key === 'speed') {
          acc.tickerSpeed = parseInt(setting.value) || 30
        }
        return acc
      }, { tickerEnabled: true, tickerSpeed: 30 }) || { tickerEnabled: true, tickerSpeed: 30 }
      
      return NextResponse.json({
        success: true,
        data: {
          ...settings,
          tickerItems: tickerItems || []
        }
      })
    }
    
    // Retornar todas as configurações
    const { data: allSettings, error } = await supabase
      .from('system_settings')
      .select('category, key, value')
    
    if (error) {
      console.error('Erro ao buscar configurações:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar configurações do banco de dados'
      }, { status: 500 })
    }
    
    // Processar e organizar configurações
    const organizedSettings = allSettings?.reduce((acc: { [key: string]: { [key: string]: any } }, setting: { category: string; key: string; value: any }) => {
      if (!acc[setting.category]) {
        acc[setting.category] = {}
      }
      acc[setting.category][setting.key] = setting.value
      return acc
    }, {}) || {}
    
    return NextResponse.json({
      success: true,
      data: organizedSettings
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { category, action, data } = body
    const supabase = await createClient()
    
    if (category === 'ticker') {
      switch (action) {
        case 'add_item':
          const { data: newTickerItem, error: addError } = await supabase
            .from('ticker_items')
            .insert({
              text: data.text,
              priority: 0,
              active: true
            })
            .select()
            .single()
          
          if (addError) {
            console.error('Erro ao adicionar item do ticker:', addError)
            return NextResponse.json({
              success: false,
              error: 'Erro ao adicionar item do ticker'
            }, { status: 500 })
          }
          break
          
        case 'update_item':
          const updateData: any = {}
          if (data.text !== undefined) updateData.text = data.text
          if (data.active !== undefined) updateData.active = data.active
          if (data.priority !== undefined) updateData.priority = data.priority
          
          const { error: updateError } = await supabase
            .from('ticker_items')
            .update(updateData)
            .eq('id', data.id)
          
          if (updateError) {
            console.error('Erro ao atualizar item do ticker:', updateError)
            return NextResponse.json({
              success: false,
              error: 'Erro ao atualizar item do ticker'
            }, { status: 500 })
          }
          break
          
        case 'delete_item':
          const { error: deleteError } = await supabase
            .from('ticker_items')
            .delete()
            .eq('id', data.id)
          
          if (deleteError) {
            console.error('Erro ao excluir item do ticker:', deleteError)
            return NextResponse.json({
              success: false,
              error: 'Erro ao excluir item do ticker'
            }, { status: 500 })
          }
          break
          
        case 'update_settings':
          // Atualizar configurações do ticker
          if (data.enabled !== undefined) {
            await supabase
              .from('system_settings')
              .upsert({
                category: 'ticker',
                key: 'enabled',
                value: data.enabled
              })
          }
          
          if (data.speed !== undefined) {
            await supabase
              .from('system_settings')
              .upsert({
                category: 'ticker',
                key: 'speed',
                value: data.speed
              })
          }
          break
          
        default:
          return NextResponse.json({
            success: false,
            error: 'Ação inválida'
          }, { status: 400 })
      }
      
      // Buscar dados atualizados para retornar
      const { data: tickerSettings } = await supabase
        .from('system_settings')
        .select('key, value')
        .eq('category', 'ticker')
      
      const { data: tickerItems } = await supabase
        .from('ticker_items')
        .select('*')
        .order('priority', { ascending: false })
      
      const settings = tickerSettings?.reduce((acc: { tickerEnabled: boolean; tickerSpeed: number }, setting: { key: string; value: any }) => {
        if (setting.key === 'enabled') {
          acc.tickerEnabled = setting.value === true || setting.value === 'true'
        } else if (setting.key === 'speed') {
          acc.tickerSpeed = parseInt(setting.value) || 30
        }
        return acc
      }, { tickerEnabled: true, tickerSpeed: 30 }) || { tickerEnabled: true, tickerSpeed: 30 }
      
      return NextResponse.json({
        success: true,
        message: 'Configurações do ticker atualizadas com sucesso',
        data: {
          ...settings,
          tickerItems: tickerItems || []
        }
      })
    }
    
    // Atualizar outras configurações
    for (const [key, value] of Object.entries(data)) {
      await supabase
        .from('system_settings')
        .upsert({
          category: 'general',
          key: key,
          value: value
        })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const supabase = await createClient()
    
    // Atualizar configurações específicas
    for (const [key, value] of Object.entries(body)) {
      await supabase
        .from('system_settings')
        .upsert({
          category: 'general',
          key: key,
          value: value
        })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso'
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
