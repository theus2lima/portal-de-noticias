import { NextRequest, NextResponse } from 'next/server'

// Simulação de banco de dados para configurações
let systemSettings = {
  siteName: 'Portal de Notícias',
  siteDescription: 'Seu portal de notícias mais confiável',
  siteUrl: 'https://portal-noticias.com',
  logo: null,
  adminEmail: 'admin@portal-noticias.com',
  contactEmail: 'contato@portal-noticias.com',
  
  // Configurações do Ticker
  tickerEnabled: true,
  tickerSpeed: 30, // segundos para completar a animação
  tickerItems: [
    {
      id: '1',
      text: '🔴 Nova lei aprovada no Senado',
      priority: 1,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2', 
      text: '🏆 Brasil conquista medalha de ouro',
      priority: 2,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      text: '💰 Bolsa de valores atinge recorde histórico',
      priority: 3,
      active: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      text: '🌿 Projeto ambiental recebe investimento de R$ 50 milhões',
      priority: 4,
      active: true,
      createdAt: new Date().toISOString()
    }
  ]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    
    if (category === 'ticker') {
      return NextResponse.json({
        success: true,
        data: {
          tickerEnabled: systemSettings.tickerEnabled,
          tickerSpeed: systemSettings.tickerSpeed,
          tickerItems: systemSettings.tickerItems.filter(item => item.active)
        }
      })
    }
    
    // Retornar todas as configurações (sem informações sensíveis)
    const publicSettings = {
      siteName: systemSettings.siteName,
      siteDescription: systemSettings.siteDescription,
      siteUrl: systemSettings.siteUrl,
      logo: systemSettings.logo,
      tickerEnabled: systemSettings.tickerEnabled,
      tickerSpeed: systemSettings.tickerSpeed,
      tickerItems: systemSettings.tickerItems
    }
    
    return NextResponse.json({
      success: true,
      data: publicSettings
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
    
    if (category === 'ticker') {
      switch (action) {
        case 'add_item':
          const newItem = {
            id: Date.now().toString(),
            text: data.text,
            priority: systemSettings.tickerItems.length + 1,
            active: true,
            createdAt: new Date().toISOString()
          }
          systemSettings.tickerItems.push(newItem)
          break
          
        case 'update_item':
          const itemIndex = systemSettings.tickerItems.findIndex(item => item.id === data.id)
          if (itemIndex !== -1) {
            systemSettings.tickerItems[itemIndex] = {
              ...systemSettings.tickerItems[itemIndex],
              ...data,
              updatedAt: new Date().toISOString()
            }
          }
          break
          
        case 'delete_item':
          systemSettings.tickerItems = systemSettings.tickerItems.filter(item => item.id !== data.id)
          break
          
        case 'reorder_items':
          systemSettings.tickerItems = data.items
          break
          
        case 'update_settings':
          systemSettings.tickerEnabled = data.enabled ?? systemSettings.tickerEnabled
          systemSettings.tickerSpeed = data.speed ?? systemSettings.tickerSpeed
          break
          
        default:
          return NextResponse.json({
            success: false,
            error: 'Ação inválida'
          }, { status: 400 })
      }
      
      return NextResponse.json({
        success: true,
        message: 'Configurações do ticker atualizadas com sucesso',
        data: {
          tickerEnabled: systemSettings.tickerEnabled,
          tickerSpeed: systemSettings.tickerSpeed,
          tickerItems: systemSettings.tickerItems
        }
      })
    }
    
    // Atualizar configurações gerais
    Object.keys(data).forEach(key => {
      if (key in systemSettings) {
        (systemSettings as any)[key] = data[key]
      }
    })
    
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
    
    // Atualizar configurações específicas
    Object.keys(body).forEach(key => {
      if (key in systemSettings) {
        (systemSettings as any)[key] = body[key]
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      data: systemSettings
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
