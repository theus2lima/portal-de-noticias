import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import { requireAuth } from '@/lib/auth'
import { auditLog, getClientIp } from '@/lib/audit'

// GET - Buscar artigos (público — necessário para o portal renderizar matérias)
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')

    let query = supabase
      .from('articles')
      .select(`
        *,
        categories(id, name, slug),
        article_tags(tags(id, name, slug))
      `, { count: 'exact' })

    if (status) query = query.eq('status', status)
    if (category) query = query.eq('category_id', category)
    if (search) query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data: articles, count, error } = await query
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erro ao carregar artigos' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: articles,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo artigo (requer autenticação)
export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth instanceof NextResponse) return auth

  try {
    const supabase = await createClient()
    const body = await request.json()

    if (!body.title || !body.content || !body.category_id) {
      return NextResponse.json(
        { error: 'Título, conteúdo e categoria são obrigatórios' },
        { status: 400 }
      )
    }

    const slug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')

    const wordCount = body.content.split(' ').filter((w: string) => w.length > 0).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))

    const articleData = {
      title: body.title,
      subtitle: body.subtitle || null,
      slug: `${slug}-${Date.now()}`,
      content: body.content,
      excerpt: body.excerpt || body.content.substring(0, 200) + '...',
      featured_image: body.featured_image || null,
      image_alt: body.image_alt || null,
      category_id: body.category_id,
      author_id: auth.userId, // usa o ID do usuário autenticado
      status: body.status || 'draft',
      is_featured: body.is_featured || false,
      reading_time: readingTime,
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.excerpt,
      keywords: body.keywords || [],
      published_at: body.status === 'published' ? new Date().toISOString() : null,
    }

    const { data: article, error } = await supabase
      .from('articles')
      .insert([articleData])
      .select()
      .single()

    if (error) {
      return NextResponse.json(
        { success: false, error: 'Erro ao criar artigo' },
        { status: 500 }
      )
    }

    // Processar tags/keywords
    if (body.keywords && body.keywords.length > 0) {
      for (const keyword of body.keywords) {
        try {
          const tagSlug = keyword.toLowerCase().replace(/\s+/g, '-')
          const { data: existingTag } = await supabase
            .from('tags')
            .select('id')
            .eq('slug', tagSlug)
            .single()

          let tagId = existingTag?.id

          if (!existingTag) {
            const { data: newTag, error: tagError } = await supabase
              .from('tags')
              .insert([{ name: keyword, slug: tagSlug }])
              .select('id')
              .single()
            if (!tagError) tagId = newTag.id
          }

          if (tagId) {
            await supabase
              .from('article_tags')
              .insert([{ article_id: article.id, tag_id: tagId }])
          }
        } catch {
          // Continuar mesmo se der erro nas tags
        }
      }
    }

    await auditLog({
      userEmail: auth.email,
      action: 'CREATE_ARTICLE',
      resourceType: 'article',
      resourceId: article.id,
      ip: getClientIp(request),
      metadata: { title: article.title, status: article.status },
    })

    return NextResponse.json({ data: article }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
