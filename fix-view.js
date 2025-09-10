require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function updateView() {
  try {
    console.log('=== Atualizando view articles_with_details ===\n')
    
    // Primeiro, dropar a view existente
    const dropViewSQL = `DROP VIEW IF EXISTS articles_with_details;`
    
    console.log('Removendo view antiga...')
    const { error: dropError } = await supabase.rpc('execute_sql', { 
      sql_text: dropViewSQL 
    })
    
    if (dropError) {
      console.log('Erro ao remover view (pode ser que não exista):', dropError)
    }
    
    // Criar nova view incluindo o campo content
    const createViewSQL = `
    CREATE OR REPLACE VIEW articles_with_details AS
    SELECT 
        a.id,
        a.title,
        a.subtitle,
        a.slug,
        a.content,
        a.excerpt,
        a.featured_image,
        a.image_alt,
        a.category_id,
        a.status,
        a.is_featured,
        a.views_count,
        a.reading_time,
        a.meta_title,
        a.meta_description,
        a.keywords,
        a.published_at,
        a.created_at,
        a.updated_at,
        c.name AS category_name,
        c.slug AS category_slug,
        c.color AS category_color,
        u.name AS author_name,
        u.email AS author_email,
        COALESCE(
            ARRAY_AGG(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL),
            '{}'::text[]
        ) AS tags
    FROM articles a
    LEFT JOIN categories c ON a.category_id = c.id
    LEFT JOIN users u ON a.author_id = u.id
    LEFT JOIN article_tags at ON a.id = at.article_id
    LEFT JOIN tags t ON at.tag_id = t.id
    GROUP BY 
        a.id, a.title, a.subtitle, a.slug, a.content, a.excerpt, 
        a.featured_image, a.image_alt, a.category_id, a.status, 
        a.is_featured, a.views_count, a.reading_time, a.meta_title, 
        a.meta_description, a.keywords, a.published_at, a.created_at, 
        a.updated_at, c.name, c.slug, c.color, u.name, u.email;
    `
    
    console.log('Criando nova view com campo content...')
    const { error: createError } = await supabase.rpc('execute_sql', { 
      sql_text: createViewSQL 
    })
    
    if (createError) {
      console.error('Erro ao criar view:', createError)
      
      // Tentar método alternativo usando SQL direto
      console.log('Tentando método alternativo...')
      
      const { error: altError } = await supabase
        .from('_supabase_admin')
        .insert([{
          query: createViewSQL
        }])
      
      if (altError) {
        console.error('Método alternativo também falhou:', altError)
        return
      }
    }
    
    console.log('✅ View atualizada com sucesso!')
    
    // Testar a nova view
    console.log('\n=== Testando nova view ===\n')
    
    const { data: testArticle, error: testError } = await supabase
      .from('articles_with_details')
      .select('id, title, content, category_name')
      .limit(1)
      .single()
    
    if (testError) {
      console.log('❌ Erro ao testar view:', testError)
    } else {
      console.log('✅ View funcionando!')
      console.log('Título:', testArticle.title)
      console.log('Categoria:', testArticle.category_name)
      console.log('Content existe?', !!testArticle.content)
      console.log('Content preview:', testArticle.content ? testArticle.content.substring(0, 100) + '...' : 'VAZIO')
    }
    
  } catch (err) {
    console.error('Erro geral:', err)
  }
}

updateView()
