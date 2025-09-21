require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkCategoriesRelationship() {
  try {
    console.log('=== Verificando Categorias ===')
    
    // Buscar todas as categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .order('name')
    
    if (categoriesError) {
      console.log('Erro ao buscar categorias:', categoriesError)
    } else {
      console.log(`Total de categorias: ${categories.length}`)
      categories.forEach(cat => {
        console.log(`- ID: ${cat.id}, Nome: ${cat.name}, Slug: ${cat.slug}, Ativa: ${cat.is_active}`)
      })
    }
    
    console.log('\n=== Verificando Artigos ===')
    
    // Buscar todos os artigos com relações
    const { data: articles, error: articlesError } = await supabase
      .from('articles')
      .select(`
        id,
        title,
        slug,
        status,
        category_id,
        categories(id, name, slug),
        created_at
      `)
      .order('created_at', { ascending: false })
    
    if (articlesError) {
      console.log('Erro ao buscar artigos:', articlesError)
      return
    }
    
    console.log(`Total de artigos: ${articles.length}`)
    
    articles.forEach(article => {
      console.log('\n--- Artigo ---')
      console.log(`ID: ${article.id}`)
      console.log(`Título: ${article.title}`)
      console.log(`Slug: ${article.slug}`)
      console.log(`Status: ${article.status}`)
      console.log(`Category ID: ${article.category_id}`)
      console.log(`Category Data:`, article.categories)
      console.log(`Created: ${article.created_at}`)
    })
    
    console.log('\n=== Verificando Artigos por Categoria ===')
    
    for (const category of categories) {
      const { data: categoryArticles, error } = await supabase
        .from('articles')
        .select('id, title, status')
        .eq('category_id', category.id)
      
      if (!error) {
        console.log(`\nCategoria "${category.name}" (ID: ${category.id}):`)
        console.log(`- Total de artigos: ${categoryArticles.length}`)
        categoryArticles.forEach(art => {
          console.log(`  • ${art.title} (Status: ${art.status})`)
        })
      }
    }
    
  } catch (err) {
    console.error('Erro:', err)
  }
}

checkCategoriesRelationship()
