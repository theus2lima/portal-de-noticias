require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkView() {
  try {
    console.log('=== Verificando estrutura da view articles_with_details ===\n')
    
    // Buscar um artigo da view para ver a estrutura
    const { data: sample, error } = await supabase
      .from('articles_with_details')
      .select('*')
      .limit(1)
      .single()
    
    if (error) {
      console.log('Erro ao buscar da view:', error)
    } else {
      console.log('Campos disponíveis na view:')
      console.log(Object.keys(sample))
      console.log('\nCampo "content" existe?', 'content' in sample)
      console.log('Valor do content:', sample.content ? sample.content.substring(0, 100) + '...' : 'NULL/UNDEFINED')
    }
    
    console.log('\n=== Verificando tabela articles diretamente ===\n')
    
    // Buscar diretamente da tabela articles
    const { data: directArticle, error: directError } = await supabase
      .from('articles')
      .select('*')
      .limit(1)
      .single()
    
    if (directError) {
      console.log('Erro ao buscar da tabela:', directError)
    } else {
      console.log('Campos disponíveis na tabela:')
      console.log(Object.keys(directArticle))
      console.log('\nCampo "content" existe na tabela?', 'content' in directArticle)
      console.log('Valor do content na tabela:', directArticle.content ? directArticle.content.substring(0, 100) + '...' : 'NULL/UNDEFINED')
    }
    
    // Verificar artigo específico com IA
    console.log('\n=== Verificando artigo específico da IA ===\n')
    
    const { data: iaArticle, error: iaError } = await supabase
      .from('articles')
      .select('id, title, content, slug, status')
      .ilike('title', '%ia generativa%')
      .single()
    
    if (iaError) {
      console.log('Erro ao buscar artigo da IA:', iaError)
    } else {
      console.log('Artigo da IA encontrado:')
      console.log('ID:', iaArticle.id)
      console.log('Título:', iaArticle.title)
      console.log('Slug:', iaArticle.slug)
      console.log('Status:', iaArticle.status)
      console.log('Content existe?', !!iaArticle.content)
      console.log('Content length:', iaArticle.content ? iaArticle.content.length : 0)
      console.log('Content preview:', iaArticle.content ? iaArticle.content.substring(0, 200) : 'VAZIO')
    }
    
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

checkView()
