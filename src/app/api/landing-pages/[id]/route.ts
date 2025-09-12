import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Buscar landing page por ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { data, error } = await supabase
      .from('landing_pages')
      .select('*')
      .eq('id', params.id)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao buscar landing page:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar landing page
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    // Verificar se a landing page existe
    const { data: existingPage } = await supabase
      .from('landing_pages')
      .select('id')
      .eq('id', params.id)
      .single()

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // Se o slug foi alterado, verificar se não existe outro com o mesmo slug
    if (body.slug) {
      const { data: duplicateSlug } = await supabase
        .from('landing_pages')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', params.id)
        .single()

      if (duplicateSlug) {
        return NextResponse.json(
          { error: 'Já existe uma landing page com este slug' },
          { status: 400 }
        )
      }
    }

    // Preparar dados para atualização (apenas campos fornecidos)
    const updateData: any = {}
    
    const allowedFields = [
      'title', 'slug', 'subtitle', 'description', 'template', 
      'primary_color', 'secondary_color', 'hero_title', 'hero_subtitle',
      'hero_description', 'hero_image', 'hero_cta_text', 'about_title',
      'about_content', 'about_image', 'services_title', 'services',
      'testimonials_title', 'testimonials', 'contact_title', 'contact_description',
      'contact_phone', 'contact_email', 'contact_address', 'contact_whatsapp',
      'social_facebook', 'social_instagram', 'social_linkedin', 'social_twitter',
      'meta_title', 'meta_description', 'meta_keywords', 'og_image',
      'is_active', 'show_header', 'show_footer', 'custom_css', 'custom_js'
    ]

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field]
      }
    })

    const { data, error } = await supabase
      .from('landing_pages')
      .update(updateData)
      .eq('id', params.id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar landing page:', error)
      return NextResponse.json(
        { error: 'Erro ao atualizar landing page' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro na API de atualização de landing page:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Excluir landing page
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar se a landing page existe
    const { data: existingPage } = await supabase
      .from('landing_pages')
      .select('id, title')
      .eq('id', params.id)
      .single()

    if (!existingPage) {
      return NextResponse.json(
        { error: 'Landing page não encontrada' },
        { status: 404 }
      )
    }

    // Excluir a landing page (leads relacionados serão excluídos automaticamente pelo CASCADE)
    const { error } = await supabase
      .from('landing_pages')
      .delete()
      .eq('id', params.id)

    if (error) {
      console.error('Erro ao excluir landing page:', error)
      return NextResponse.json(
        { error: 'Erro ao excluir landing page' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Landing page excluída com sucesso' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Erro na API de exclusão de landing page:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
