require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function testCategoryFilter() {
  try {
    console.log('=== Testando Filtro de Artigos por Categoria ===\n')
    
    // Simular o que a API de artigos retorna
    console.log('1. Buscando artigos da API...')
    const { data: articles, error } = await supabase
      .from('articles')
      .select(`
        *,
        categories(id, name, slug),
        article_tags(tags(id, name, slug))
      `)
      .eq('status', 'published')
    
    if (error) {
      console.error('Erro:', error)
      return
    }
    
    console.log(`Total de artigos publicados: ${articles.length}\n`)
    
    // Testar filtro para categoria "Política"
    const politicaCategoryId = '11111111-1111-1111-1111-111111111111'
    const politicaCategoryName = 'Política'
    const politicaSlug = 'politica'
    
    console.log('2. Testando filtro para categoria "Política"...')
    console.log(`   - ID da categoria: ${politicaCategoryId}`)
    console.log(`   - Nome: ${politicaCategoryName}`)
    console.log(`   - Slug: ${politicaSlug}`)
    
    // Simular a lógica de filtro atualizada
    const filteredArticles = articles.filter((article) => {
      // Se temos um categoryId real (não fallback), usar ele para filtrar
      if (politicaCategoryId && !politicaCategoryId.startsWith('fallback-') && article.category_id) {
        return String(article.category_id) === String(politicaCategoryId)
      }
      
      // Para categorias fallback ou quando não temos category_id, filtrar por nome/slug
      const categoryLower = politicaCategoryName.toLowerCase()
      const categorySlugLower = politicaSlug.toLowerCase()
      
      // Verificar se o artigo tem dados de categoria relacionados
      if (article.categories && article.categories.name) {
        const articleCategoryName = article.categories.name.toLowerCase()
        const articleCategorySlug = article.categories.slug?.toLowerCase()
        return articleCategoryName === categoryLower || articleCategorySlug === categorySlugLower
      }
      
      // Fallback para campos diretos no artigo
      const categoryNameMatch = article.category_name?.toLowerCase() === categoryLower
      const categoryMatch = article.category?.toLowerCase() === categoryLower
      
      return categoryNameMatch || categoryMatch
    })
    
    console.log(`\n3. Resultado do filtro:`)
    console.log(`   - Artigos encontrados na categoria "Política": ${filteredArticles.length}`)
    
    if (filteredArticles.length > 0) {
      console.log('\n   - Artigos filtrados:')
      filteredArticles.forEach(article => {
        console.log(`     • ${article.title}`)
        console.log(`       - ID: ${article.id}`)
        console.log(`       - Category ID: ${article.category_id}`)
        console.log(`       - Category Data:`, article.categories ? `${article.categories.name} (${article.categories.slug})` : 'N/A')
        console.log('')
      })
    } else {
      console.log('   ⚠️  NENHUM ARTIGO ENCONTRADO! Pode haver um problema no filtro.')
    }
    
    // Testar com categoria fallback
    console.log('4. Testando com categoria fallback...')
    const fallbackCategoryId = 'fallback-politica'
    
    const fallbackFilteredArticles = articles.filter((article) => {
      // Se temos um categoryId real (não fallback), usar ele para filtrar
      if (fallbackCategoryId && !fallbackCategoryId.startsWith('fallback-') && article.category_id) {
        return String(article.category_id) === String(fallbackCategoryId)
      }
      
      // Para categorias fallback ou quando não temos category_id, filtrar por nome/slug
      const categoryLower = politicaCategoryName.toLowerCase()
      const categorySlugLower = politicaSlug.toLowerCase()
      
      // Verificar se o artigo tem dados de categoria relacionados
      if (article.categories && article.categories.name) {
        const articleCategoryName = article.categories.name.toLowerCase()
        const articleCategorySlug = article.categories.slug?.toLowerCase()
        return articleCategoryName === categoryLower || articleCategorySlug === categorySlugLower
      }
      
      // Fallback para campos diretos no artigo
      const categoryNameMatch = article.category_name?.toLowerCase() === categoryLower
      const categoryMatch = article.category?.toLowerCase() === categoryLower
      
      return categoryNameMatch || categoryMatch
    })
    
    console.log(`   - Com fallback ID (${fallbackCategoryId}): ${fallbackFilteredArticles.length} artigos encontrados`)
    
    console.log('\n=== TESTE CONCLUÍDO ===')
    
    if (filteredArticles.length > 0) {
      console.log('✅ O filtro está funcionando corretamente!')
    } else {
      console.log('❌ O filtro não está funcionando. Verifique a lógica.')
    }
    
  } catch (err) {
    console.error('Erro durante o teste:', err)
  }
}

testCategoryFilter()
