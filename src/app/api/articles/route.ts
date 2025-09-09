import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import fs from 'fs'
import path from 'path'

// Função para ler artigos do arquivo local
function readLocalArticles() {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles.json')
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.log('Erro ao ler artigos locais:', error)
    return []
  }
}

// Função para salvar artigos no arquivo local
function saveLocalArticles(articles: any[]) {
  try {
    const filePath = path.join(process.cwd(), 'data', 'articles.json')
    const dir = path.dirname(filePath)
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
    fs.writeFileSync(filePath, JSON.stringify(articles, null, 2))
    return true
  } catch (error) {
    console.log('Erro ao salvar artigos locais:', error)
    return false
  }
}

// GET - Buscar artigos
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    
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
      
      console.log('Supabase query error, using local fallback:', error)
    } catch (supabaseError) {
      console.log('Supabase connection error, using local fallback:', supabaseError)
    }
    
    // Fallback: usar artigos locais
    console.log('Using local articles fallback')
    let articles = readLocalArticles()
    
    // Aplicar filtros localmente
    if (status) {
      articles = articles.filter((article: any) => article.status === status)
    }
    
    if (category) {
      articles = articles.filter((article: any) => article.category_id === category)
    }
    
    if (search) {
      const searchLower = search.toLowerCase()
      articles = articles.filter((article: any) => 
        article.title.toLowerCase().includes(searchLower) ||
        article.content.toLowerCase().includes(searchLower)
      )
    }
    
    // Ordenar por data de criação (mais recente primeiro)
    articles.sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    
    // Aplicar paginação
    const total = articles.length
    const from = (page - 1) * limit
    const to = from + limit
    const paginatedArticles = articles.slice(from, to)
    
    return NextResponse.json({
      data: paginatedArticles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
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
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validação básica
    if (!body.title || !body.content || !body.category_id) {
      return NextResponse.json(
        { error: 'Título, conteúdo e categoria são obrigatórios' },
        { status: 400 }
      )
    }
    
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
      console.log('Supabase error, using fallback:', supabaseError)
      
      // Fallback: salvar artigo localmente
      const fallbackArticle = {
        id: Date.now().toString(),
        ...articleData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        author_name: 'Admin',
        category_name: body.category_id === '1' ? 'Política' :
                      body.category_id === '2' ? 'Economia' :
                      body.category_id === '3' ? 'Esportes' :
                      body.category_id === '4' ? 'Cultura' :
                      body.category_id === '5' ? 'Cidades' : 'Geral',
        views_count: 0
      }
      
      // Salvar no arquivo local
      const localArticles = readLocalArticles()
      localArticles.unshift(fallbackArticle) // Adicionar no início da lista
      saveLocalArticles(localArticles)
      
      console.log('Artigo criado e salvo localmente:', fallbackArticle.title)
      
      return NextResponse.json({ 
        data: fallbackArticle,
        message: 'Artigo criado com sucesso (salvo localmente)' 
      }, { status: 201 })
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
