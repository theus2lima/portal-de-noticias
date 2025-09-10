import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    const { data: curationItem, error } = await supabase
      .from('news_curation')
      .select(`
        *,
        scraped_news:scraped_news_id (
          id,
          title,
          summary,
          content,
          original_url,
          image_url,
          published_at,
          created_at,
          news_sources:source_id (
            id,
            name,
            url,
            type
          )
        ),
        suggested_category:suggested_category_id (
          id,
          name,
          color
        ),
        manual_category:manual_category_id (
          id,
          name,
          color
        )
      `)
      .eq('id', params.id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Notícia não encontrada'
        }, { status: 404 })
      }
      
      console.error('Erro ao buscar item de curadoria:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar notícia'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: curationItem
    })

  } catch (error) {
    console.error('Erro na API de curadoria individual:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action, data } = body

    // Buscar o item atual
    const { data: currentItem, error: fetchError } = await supabase
      .from('news_curation')
      .select('*')
      .eq('id', params.id)
      .single()

    if (fetchError || !currentItem) {
      return NextResponse.json({
        success: false,
        error: 'Notícia não encontrada'
      }, { status: 404 })
    }

    let updateData: any = {
      updated_at: new Date().toISOString()
    }

    switch (action) {
      case 'approve':
        updateData.status = 'approved'
        updateData.manual_category_id = data.categoryId || null
        updateData.curator_notes = data.notes
        updateData.approved_at = new Date().toISOString()
        break

      case 'reject':
        updateData.status = 'rejected'
        updateData.curator_notes = data.reason
        break

      case 'edit':
        updateData.manual_category_id = data.categoryId || null
        updateData.curator_notes = data.notes
        updateData.curated_title = data.title
        updateData.curated_summary = data.summary
        updateData.curated_content = data.content
        updateData.status = 'editing'
        break

      case 'publish':
        updateData.status = 'published'
        updateData.manual_category_id = data.categoryId || null
        updateData.published_at = new Date().toISOString()
        updateData.curated_title = data.title
        updateData.curated_summary = data.summary
        updateData.curated_content = data.content
        break

      default:
        return NextResponse.json({
          success: false,
          error: 'Ação não reconhecida'
        }, { status: 400 })
    }

    const { error: updateError } = await supabase
      .from('news_curation')
      .update(updateData)
      .eq('id', params.id)

    if (updateError) {
      console.error('Erro ao atualizar curadoria:', {
        error: updateError,
        updateData,
        curationId: params.id,
        action
      })
      return NextResponse.json({
        success: false,
        error: `Erro ao atualizar notícia: ${updateError.message || updateError.code || 'Erro desconhecido'}`
      }, { status: 500 })
    }

    const messages = {
      approve: 'Notícia aprovada com sucesso!',
      reject: 'Notícia rejeitada com sucesso!',
      edit: 'Edições salvas com sucesso!',
      publish: 'Notícia publicada com sucesso!'
    }

    return NextResponse.json({
      success: true,
      message: messages[action as keyof typeof messages]
    })

  } catch (error) {
    console.error('Erro ao atualizar curadoria:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
