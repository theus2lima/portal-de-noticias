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

// GET - Buscar artigo específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    if (!id) {
      return NextResponse.json(
        { error: 'ID é obrigatório' },
        { status: 400 }
      )
    }

    try {
      // Tentar buscar do Supabase primeiro
      const { data: article, error } = await supabase
        .from('articles_with_details')
        .select('*')
        .eq('id', id)
        .single()

      if (!error && article) {
        return NextResponse.json({ data: article })
      }
      
      console.log('Supabase query error, using local fallback:', error)
    } catch (supabaseError) {
      console.log('Supabase connection error, using local fallback:', supabaseError)
    }
    
    // Fallback: buscar nos arquivos locais
    console.log('Searching in local articles for ID:', id)
    const localArticles = readLocalArticles()
    const article = localArticles.find((a: any) => a.id === id)
    
    if (article) {
      console.log('Found article in local storage:', article.title)
      return NextResponse.json({ data: article })
    }

    return NextResponse.json(
      { error: 'Artigo não encontrado' },
      { status: 404 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar artigo
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()
    
    // Validação básica
    if (!body.title || !body.content || !body.category_id) {
      return NextResponse.json(
        { error: 'Título, conteúdo e categoria são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Gerar slug atualizado se o título mudou
    let slug = body.slug
    if (!slug || body.title) {
      slug = body.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove acentos
        .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
        .trim()
        .replace(/\s+/g, '-') // Substitui espaços por hífens
        .replace(/-+/g, '-') // Remove hífens duplicados
    }
    
    // Calcular tempo de leitura
    const wordCount = body.content.split(' ').filter((word: string) => word.length > 0).length
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
      published_at: body.status === 'published' && body.published_at ? body.published_at : 
                    body.status === 'published' ? new Date().toISOString() : null
    }
    
    try {
      // Tentar atualizar no Supabase
      const { data: article, error } = await supabase
        .from('articles')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()
      
      if (!error && article) {
        // Atualizar tags se fornecidas
        if (body.keywords && Array.isArray(body.keywords)) {
          // Remover tags antigas
          await supabase
            .from('article_tags')
            .delete()
            .eq('article_id', id)
          
          // Adicionar novas tags
          for (const keyword of body.keywords) {
            const tagSlug = keyword.toLowerCase().replace(/\s+/g, '-')
            
            // Buscar ou criar tag
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
              
              if (!tagError) {
                existingTag = newTag
              }
            }
            
            // Associar tag ao artigo
            if (existingTag) {
              await supabase
                .from('article_tags')
                .insert([{ article_id: id, tag_id: existingTag.id }])
            }
          }
        }
        return NextResponse.json({ data: article })
      }
      
      console.log('Supabase update error, using local fallback:', error)
    } catch (supabaseError) {
      console.log('Supabase connection error, using local fallback:', supabaseError)
    }
    
    // Fallback: atualizar nos arquivos locais
    const localArticles = readLocalArticles()
    const articleIndex = localArticles.findIndex((a: any) => a.id === id)
    
    if (articleIndex === -1) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }
    
    // Mapear category_id para category_name
    const categoryNames: { [key: string]: string } = {
      '1': 'Política',
      '2': 'Economia', 
      '3': 'Esportes',
      '4': 'Cultura',
      '5': 'Cidades'
    }
    
    // Atualizar artigo
    const updatedArticle = {
      ...localArticles[articleIndex],
      ...updateData,
      category_name: categoryNames[body.category_id] || 'Geral',
      keywords: body.keywords || localArticles[articleIndex].keywords || [],
      updated_at: new Date().toISOString()
    }
    
    localArticles[articleIndex] = updatedArticle
    
    // Salvar arquivo
    const saved = saveLocalArticles(localArticles)
    
    if (saved) {
      console.log('Article updated locally:', updatedArticle.title)
      return NextResponse.json({ 
        data: updatedArticle,
        message: 'Artigo atualizado com sucesso' 
      })
    } else {
      return NextResponse.json(
        { error: 'Erro ao salvar artigo' },
        { status: 500 }
      )
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar artigo
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    
    // Verificar se o artigo existe
    const { data: existingArticle, error: findError } = await supabase
      .from('articles')
      .select('id')
      .eq('id', id)
      .single()
    
    if (findError || !existingArticle) {
      return NextResponse.json({ error: 'Artigo não encontrado' }, { status: 404 })
    }
    
    // Deletar o artigo (as relações serão deletadas em cascata)
    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', id)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ message: 'Artigo deletado com sucesso' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PATCH - Atualizar campos específicos (ex: status, views)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    const { id } = params
    const body = await request.json()
    
    // Permitir apenas campos específicos para PATCH
    const allowedFields = ['status', 'is_featured', 'views_count']
    const updateData: any = {}
    
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
    
    // Se mudando para publicado, definir data de publicação
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
    
    return NextResponse.json({ data: article })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
