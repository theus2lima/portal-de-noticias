import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

// Categorias padrão como fallback
const defaultCategories = [
  { id: '1', name: 'Política', slug: 'politica', description: 'Notícias sobre política nacional e local', color: '#DC2626', icon: 'Vote', is_active: true },
  { id: '2', name: 'Economia', slug: 'economia', description: 'Economia, finanças e mercado', color: '#059669', icon: 'DollarSign', is_active: true },
  { id: '3', name: 'Esportes', slug: 'esportes', description: 'Esportes nacionais e internacionais', color: '#DC2626', icon: 'Trophy', is_active: true },
  { id: '4', name: 'Cultura', slug: 'cultura', description: 'Arte, cultura e entretenimento', color: '#7C3AED', icon: 'Palette', is_active: true },
  { id: '5', name: 'Cidades', slug: 'cidades', description: 'Notícias das cidades e regiões', color: '#0EA5E9', icon: 'Building', is_active: true },
  { id: '6', name: 'Tecnologia', slug: 'tecnologia', description: 'Inovação e tecnologia', color: '#3B82F6', icon: 'Laptop', is_active: true }
]

// GET - Buscar categorias
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    
    const includeArticleCount = searchParams.get('include_articles') === 'true'
    
    try {
      let query = supabase
        .from('categories')
        .select('*')
        .order('name')
      
      if (includeArticleCount) {
        query = supabase
          .from('categories')
          .select(`
            id,
            name,
            slug,
            description,
            color,
            icon,
            is_active,
            created_at,
            updated_at,
            articles:articles(count)
          `)
          .order('name')
      }
      
      const { data: categories, error } = await query
      
      if (!error && categories) {
        return NextResponse.json({ data: categories })
      }
      
      console.log('Supabase query error, using fallback categories:', error)
    } catch (supabaseError) {
      console.log('Supabase connection error, using fallback categories:', supabaseError)
    }
    
    // Fallback: retornar categorias padrão
    return NextResponse.json({ data: defaultCategories })
  } catch (error) {
    console.error('Error in GET /api/categories:', error)
    return NextResponse.json({ data: defaultCategories })
  }
}

// POST - Criar nova categoria
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    // Validação básica
    if (!body.name) {
      return NextResponse.json(
        { error: 'Nome da categoria é obrigatório' },
        { status: 400 }
      )
    }
    
    // Gerar slug a partir do nome
    const slug = body.slug || body.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9\s-]/g, '') // Remove caracteres especiais
      .trim()
      .replace(/\s+/g, '-') // Substitui espaços por hífens
      .replace(/-+/g, '-') // Remove hífens duplicados
    
    // Verificar se slug já existe
    const { data: existingCategory } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .single()
    
    if (existingCategory) {
      return NextResponse.json(
        { error: 'Já existe uma categoria com esse nome/slug' },
        { status: 400 }
      )
    }
    
    const categoryData = {
      name: body.name,
      slug,
      description: body.description || null,
      color: body.color || '#3B82F6',
      icon: body.icon || 'Folder',
      is_active: body.is_active !== undefined ? body.is_active : true
    }
    
    const { data: category, error } = await supabase
      .from('categories')
      .insert([categoryData])
      .select()
      .single()
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ data: category }, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// PUT - Atualizar todas as categorias (bulk update - raramente usado)
export async function PUT(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Use PATCH para atualizações em lote ou PUT em /api/categories/[id] para categoria específica' },
      { status: 405 }
    )
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Deletar múltiplas categorias
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    
    if (!body.ids || !Array.isArray(body.ids)) {
      return NextResponse.json(
        { error: 'IDs das categorias são obrigatórios' },
        { status: 400 }
      )
    }
    
    // Verificar se alguma categoria tem artigos
    const { data: articlesInCategories, error: checkError } = await supabase
      .from('articles')
      .select('category_id')
      .in('category_id', body.ids)
    
    if (checkError) {
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }
    
    if (articlesInCategories && articlesInCategories.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar categorias que possuem artigos' },
        { status: 400 }
      )
    }
    
    const { error } = await supabase
      .from('categories')
      .delete()
      .in('id', body.ids)
    
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    return NextResponse.json({ 
      message: `${body.ids.length} categoria(s) deletada(s) com sucesso` 
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}
