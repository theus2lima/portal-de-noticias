import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// GET - Buscar artigos
export async function GET(request: NextRequest) {
  console.log('=== GET /api/articles called ===')
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
    console.log('Query params:', { page, limit, status, category, search })
    
    // Primeiro tentar buscar do Supabase
    try {
      let query = supabase
        .from('articles_with_details')
        .select('*', { count: 'exact' })
      
      // Aplicar filtros
      if (status) {
        query = query.eq('status', status)
      }
      
      if (category) {
        query = query.eq('category_id', category)
      }
      
      if (search) {
        query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`)
      }
      
      // Paginação
      const from = (page - 1) * limit
      const to = from + limit - 1
      
      const { data: articles, count, error } = await query
        .order('created_at', { ascending: false })
        .range(from, to)
      
      if (!error && articles) {
        return NextResponse.json({
          data: articles,
          pagination: {
            page,
            limit,
            total: count || 0,
            totalPages: Math.ceil((count || 0) / limit)
          }
        })
      }
      
      console.error('Erro ao buscar artigos no Supabase:', error)
      return NextResponse.json({
        success: false,
        error: 'Erro ao carregar artigos',
        details: error.message
      }, { status: 500 })
    } catch (supabaseError) {
      console.error('Erro de conexão com Supabase:', supabaseError)
      return NextResponse.json({
        success: false,
        error: 'Erro de conexão com o banco de dados',
        details: supabaseError instanceof Error ? supabaseError.message : 'Erro desconhecido'
      }, { status: 500 })
    }
  } catch (error) {
    console.error('Error in GET /api/articles:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// POST - Criar novo artigo
export async function POST(request: NextRequest) {
  console.log('🚀 POST /api/articles - INÍCIO');
  console.log('Environment:', process.env.NODE_ENV);
  console.log('Vercel Region:', process.env.VERCEL_REGION || 'local');
  
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    console.log('📄 Dados recebidos do frontend:');
    console.log('- Title:', body.title ? `'${body.title.substring(0, 50)}...'` : 'VAZIO');
    console.log('- Content:', body.content ? `${body.content.length} caracteres` : 'VAZIO');
    console.log('- Category ID:', body.category_id || 'VAZIO');
    console.log('- Status:', body.status || 'VAZIO');
    console.log('- Keywords:', Array.isArray(body.keywords) ? `${body.keywords.length} tags` : body.keywords);
    
    // Validação básica
    if (!body.title || !body.content || !body.category_id) {
      const error = 'Título, conteúdo e categoria são obrigatórios';
      console.log('❌ FALHA NA VALIDAÇÃO:', error);
      console.log('- Title presente:', !!body.title);
      console.log('- Content presente:', !!body.content);
      console.log('- Category ID presente:', !!body.category_id);
      
      return NextResponse.json(
        { error },
        { status: 400 }
      )
    }
    
    console.log('✅ Validação básica passou');
    
    // Gerar slug a partir do título
    const slug = body.title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
    
    // Calcular tempo de leitura (média de 200 palavras por minuto)
    const wordCount = body.content.split(' ').filter((word: string) => word.length > 0).length
    const readingTime = Math.max(1, Math.ceil(wordCount / 200))
    
    const articleData = {
      title: body.title,
      subtitle: body.subtitle || null,
      slug: `${slug}-${Date.now()}`, // Adiciona timestamp para garantir unicidade
      content: body.content,
      excerpt: body.excerpt || body.content.substring(0, 200) + '...',
      featured_image: body.featured_image || null,
      image_alt: body.image_alt || null,
      category_id: body.category_id,
      author_id: '00000000-0000-0000-0000-000000000001', // TODO: Pegar do usuário logado
      status: body.status || 'draft',
      is_featured: body.is_featured || false,
      reading_time: readingTime,
      meta_title: body.meta_title || body.title,
      meta_description: body.meta_description || body.excerpt,
      keywords: body.keywords || [],
      published_at: body.status === 'published' ? new Date().toISOString() : null
    }
    
    try {
      const { data: article, error } = await supabase
        .from('articles')
        .insert([articleData])
        .select()
        .single()
      
      if (error) {
        throw error
      }
      
      // Se há tags/keywords, inserir na tabela de tags
      if (body.keywords && body.keywords.length > 0) {
        for (const keyword of body.keywords) {
          try {
            // Inserir tag se não existir
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
              
              if (!tagError) {
                tagId = newTag.id
              }
            }
            
            // Associar tag ao artigo
            if (tagId) {
              await supabase
                .from('article_tags')
                .insert([{ article_id: article.id, tag_id: tagId }])
            }
          } catch (tagError) {
            console.log('Erro ao processar tag:', tagError)
            // Continuar mesmo se der erro nas tags
          }
        }
      }
      
      return NextResponse.json({ data: article }, { status: 201 })
    } catch (supabaseError) {
      console.error('Erro ao criar artigo no Supabase:', supabaseError)
      return NextResponse.json({
        success: false,
        error: 'Erro ao criar artigo',
        details: supabaseError instanceof Error ? supabaseError.message : 'Erro desconhecido'
      }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
