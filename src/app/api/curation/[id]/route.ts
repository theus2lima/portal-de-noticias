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
      .select(`
        *,
        scraped_news:scraped_news_id (
          id,
          title,
          summary,
          content,
          image_url
        )
      `)
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
        
        // Criar artigo quando publicar
        try {
          // Gerar slug a partir do título
          const slug = data.title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Remove acentos
            .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
            .trim()
            .replace(/\s+/g, '-') // Substitui espaços por hífens
            .replace(/-+/g, '-') // Remove hífens duplicados
          
          // Calcular tempo de leitura (média de 200 palavras por minuto)
          const wordCount = (data.content || '').split(' ').filter((word: string) => word.length > 0).length
          const readingTime = Math.max(1, Math.ceil(wordCount / 200))
          
          const articleData = {
            title: data.title,
            slug: `${slug}-${Date.now()}`, // Adiciona timestamp para garantir unicidade
            content: data.content || '',
            excerpt: data.summary || (data.content || '').substring(0, 200) + '...',
            featured_image: currentItem.scraped_news?.image_url || null,
            category_id: data.categoryId || currentItem.suggested_category_id,
            author_id: '00000000-0000-0000-0000-000000000001', // TODO: Pegar do usuário logado
            status: 'published',
            is_featured: false,
            reading_time: readingTime,
            meta_title: data.title,
            meta_description: data.summary || (data.content || '').substring(0, 160),
            published_at: new Date().toISOString()
          }
          
          const { data: article, error: articleError } = await supabase
            .from('articles')
            .insert([articleData])
            .select()
            .single()
          
          if (!articleError && article) {
            updateData.published_article_id = article.id
          }
        } catch (articleError) {
          console.error('Erro ao criar artigo:', articleError)
          // Continuar com a publicação mesmo se der erro no artigo
        }
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

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Verificar se o item existe
    const { data: existingItem, error: fetchError } = await supabase
      .from('news_curation')
      .select('id, status')
      .eq('id', params.id)
      .single()
    
    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json({
          success: false,
          error: 'Notícia não encontrada'
        }, { status: 404 })
      }
      
      console.error('Erro ao buscar item para deletar:', fetchError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao buscar notícia'
      }, { status: 500 })
    }
    
    // Não permitir deletar itens publicados
    if (existingItem.status === 'published') {
      return NextResponse.json({
        success: false,
        error: 'Não é possível excluir notícias já publicadas'
      }, { status: 400 })
    }
    
    // Deletar o item da curadoria
    const { error: deleteError } = await supabase
      .from('news_curation')
      .delete()
      .eq('id', params.id)
    
    if (deleteError) {
      console.error('Erro ao excluir item de curadoria:', deleteError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao excluir notícia'
      }, { status: 500 })
    }
    
    // Log da ação (opcional - só se a tabela curation_logs existir)
    try {
      await supabase
        .from('curation_logs')
        .insert({
          curation_id: params.id,
          user_id: '00000000-0000-0000-0000-000000000001', // TODO: Pegar do usuário logado
          action: 'deleted',
          details: { deleted_at: new Date().toISOString() }
        })
    } catch (logError) {
      // Ignorar erros de log - não deve impedir a operação principal
      console.warn('Erro ao registrar log de exclusão:', logError)
    }
    
    return NextResponse.json({
      success: true,
      message: 'Notícia excluída com sucesso'
    })
    
  } catch (error) {
    console.error('Erro ao excluir curadoria:', error)
    return NextResponse.json({
      success: false,
      error: 'Erro interno do servidor'
    }, { status: 500 })
  }
}
