require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkArticles() {
  try {
    console.log('Verificando artigos...')
    
    // Buscar todos os artigos
    const { data: articles, error } = await supabase
      .from('articles_with_details')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.log('Erro na query:', error)
      return
    }
    
    console.log(`Total de artigos: ${articles.length}`)
    
    // Buscar especificamente artigos com "IA" no título
    const iaArticles = articles.filter(article => 
      article.title.toLowerCase().includes('ia') || 
      article.title.toLowerCase().includes('generativa')
    )
    
    console.log('\n=== Artigos relacionados à IA ===')
    iaArticles.forEach(article => {
      console.log(`ID: ${article.id}`)
      console.log(`Título: ${article.title}`)
      console.log(`Slug: ${article.slug}`)
      console.log(`Status: ${article.status}`)
      console.log(`Content preview: ${article.content ? article.content.substring(0, 100) : 'SEM CONTEÚDO'}...`)
      console.log(`Content length: ${article.content ? article.content.length : 0}`)
      console.log('---')
    })
    
    // Verificar se há artigo com o slug específico
    const specificSlug = 'ia-generativa-revoluciona-educacao-brasileira-em-2025'
    const specificArticle = articles.find(a => a.slug.includes('ia-generativa'))
    
    if (specificArticle) {
      console.log('\n=== Artigo específico encontrado ===')
      console.log('Título:', specificArticle.title)
      console.log('Slug:', specificArticle.slug)
      console.log('Status:', specificArticle.status)
      console.log('Tem conteúdo:', !!specificArticle.content)
      console.log('Tamanho do conteúdo:', specificArticle.content ? specificArticle.content.length : 0)
      if (specificArticle.content) {
        console.log('Início do conteúdo:', specificArticle.content.substring(0, 200))
      }
    }
    
  } catch (err) {
    console.error('Erro:', err)
  }
}

checkArticles()
