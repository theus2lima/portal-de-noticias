import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/lib/auth'
import { auditLog, getClientIp } from '@/lib/audit'

// GET - Buscar artigo específico (público)
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: 'ID é obrigatório' }, { status: 400 })
    }

    const { data: article, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(id, name, slug),
        article_tags(tags(id, name, slug))
      `)
      .eq('id', id)
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    return NextResponse.json({ data: article })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PUT - Atualizar artigo (requer autenticação)
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    if (!body.title || !body.content || !body.category_id) {
      return NextResponse.json(
        { error: 'Título, conteúdo e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    let slug = body.slug
    if (!slug || body.title) {
      slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
    }

    const wordCount = body.content.split(' ').filter((w: string) => w.length > 0).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const updateData = {
      title: body.title,
      subtitle: body.subtitle || null,
      slug,
      content: body.content,
      excerpt: body.excerpt || body.content.substring(0, 200) + '...',
      featured_image: body.featured_image || null,
      image_alt: body.image_alt || null,
      category_id: body.category_id,
      status: body.status,
      is_featured: body.is_featured || false,
      reading_time: readingTime,
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.excerpt,
      published_at:
        body.status === 'published' && body.published_at
          ? body.published_at
          : body.status === 'published'
          ? new Date().toISOString()
          : null,
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error || !article) {
      return NextResponse.json({ error: 'Erro ao atualizar artigo' }, { status: 500 })
    }

    // Atualizar tags se fornecidas
    if (body.keywords && Array.isArray(body.keywords)) {
      await supabase.from('article_tags').delete().eq('article_id', id)

      for (const keyword of body.keywords) {
        try {
          const tagSlug = keyword.toLowerCase().replace(/\s+/g, '-')
          let { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', tagSlug)
            .single()

          if (!existingTag) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert([{ name: keyword, slug: tagSlug }])
              .select('id')
              .single()
            if (!tagError) existingTag = newTag
          }

          if (existingTag) {
            await supabase
              .from('article_tags')
              .insert([{ article_id: id, tag_id: existingTag.id }])
          }
        } catch {
          // Continuar mesmo se der erro nas tags
        }
      }
    }

    await auditLog({
      userEmail: auth.email,
      action: 'UPDATE_ARTICLE',
      resourceType: 'article',
      resourceId: id,
      ip: getClientIp(request),
      metadata: { title: article.title, status: article.status },
    })

    return NextResponse.json({ data: article })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// DELETE - Deletar artigo (requer autenticação)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = await createClient()
    const { id } = params

    const { data: existingArticle, error: findError } = await supabase
      .from('articles')
      .select('id, title')
      .eq('id', id)
      .single()

    if (findError || !existingArticle) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }

    const { error } = await supabase.from('articles').delete().eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await auditLog({
      userEmail: auth.email,
      action: 'DELETE_ARTICLE',
      resourceType: 'article',
      resourceId: id,
      ip: getClientIp(request),
      metadata: { title: existingArticle.title },
    })

    return NextResponse.json({ message: 'Artigo deletado com sucesso' })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}

// PATCH - Atualizar campos específicos (requer autenticação)
// Usado para publicar/despublicar e marcar como destaque
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()

    // Permitir apenas campos específicos para PATCH
    const allowedFields = ['status', 'is_featured', 'views_count']
    const updateData: Record<string, unknown> = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'Nenhum campo válido para atualização' },
        { status: 400 }
      )
    }

    if (updateData.status === 'published') {
      updateData.published_at = new Date().toISOString()
    }

    const { data: article, error } = await supabase
      .from('articles')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    await auditLog({
      userEmail: auth.email,
      action: 'UPDATE_ARTICLE',
      resourceType: 'article',
      resourceId: id,
      ip: getClientIp(request),
      metadata: { fields: Object.keys(updateData) },
    })

    return NextResponse.json({ data: article })
  } catch (error) {
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 })
  }
}
