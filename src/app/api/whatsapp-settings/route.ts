import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

interface WhatsAppSettings {
  id: string
  isActive: boolean
  groupLink: string
  popupText: string
  triggerType: 'time' | 'scroll'
  delaySeconds: number
  scrollPercentage: number
  updatedAt: string
}

const settingsPath = path.join(process.cwd(), 'data', 'whatsapp-settings.json')

// Função para ler as configurações
async function readSettings(): Promise<WhatsAppSettings> {
  try {
    const data = await fs.readFile(settingsPath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    // Configurações padrão se o arquivo não existir
    const defaultSettings: WhatsAppSettings = {
      id: 'whatsapp-config',
      isActive: false,
      groupLink: '',
      popupText: 'Entre no nosso grupo do WhatsApp para receber notícias em primeira mão!',
      triggerType: 'time',
      delaySeconds: 5,
      scrollPercentage: 50,
      updatedAt: new Date().toISOString()
    }
    
    // Criar o diretório data se não existir
    try {
      await fs.mkdir(path.dirname(settingsPath), { recursive: true })
      await fs.writeFile(settingsPath, JSON.stringify(defaultSettings, null, 2))
    } catch (writeError) {
      console.error('Erro ao criar configurações padrão:', writeError)
    }
    
    return defaultSettings
  }
}

// Função para salvar as configurações
async function saveSettings(settings: WhatsAppSettings): Promise<void> {
  try {
    await fs.mkdir(path.dirname(settingsPath), { recursive: true })
    await fs.writeFile(settingsPath, JSON.stringify(settings, null, 2))
  } catch (error) {
    console.error('Erro ao salvar configurações:', error)
    throw new Error('Erro ao salvar configurações')
  }
}

// GET - Buscar configurações
export async function GET() {
  try {
    const settings = await readSettings()
    return NextResponse.json({
      success: true,
      data: settings
    })
  } catch (error) {
    console.error('Erro ao buscar configurações:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar configurações
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validar dados obrigatórios
    if (body.isActive && !body.groupLink) {
      return NextResponse.json(
        { success: false, error: 'Link do grupo é obrigatório quando ativo' },
        { status: 400 }
      )
    }

    if (!body.popupText) {
      return NextResponse.json(
        { success: false, error: 'Texto do popup é obrigatório' },
        { status: 400 }
      )
    }

    if (body.delaySeconds < 1 || body.delaySeconds > 60) {
      return NextResponse.json(
        { success: false, error: 'Delay deve estar entre 1 e 60 segundos' },
        { status: 400 }
      )
    }

    if (body.scrollPercentage < 10 || body.scrollPercentage > 100) {
      return NextResponse.json(
        { success: false, error: 'Porcentagem de scroll deve estar entre 10% e 100%' },
        { status: 400 }
      )
    }

    const currentSettings = await readSettings()
    const updatedSettings: WhatsAppSettings = {
      id: currentSettings.id,
      isActive: Boolean(body.isActive),
      groupLink: body.groupLink || '',
      popupText: body.popupText,
      triggerType: body.triggerType === 'scroll' ? 'scroll' : 'time',
      delaySeconds: Number(body.delaySeconds) || 5,
      scrollPercentage: Number(body.scrollPercentage) || 50,
      updatedAt: new Date().toISOString()
    }

    await saveSettings(updatedSettings)

    return NextResponse.json({
      success: true,
      message: 'Configurações atualizadas com sucesso',
      data: updatedSettings
    })
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error)
    return NextResponse.json(
      { success: false, error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
