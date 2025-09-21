require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function createTestArticles() {
  try {
    console.log('=== Criando Artigos de Teste ===\n')
    
    // Primeiro, buscar todas as categorias
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
    
    if (categoriesError) {
      console.error('Erro ao buscar categorias:', categoriesError)
      return
    }
    
    console.log('Categorias disponíveis:')
    categories.forEach(cat => {
      console.log(`- ${cat.name} (ID: ${cat.id}, Slug: ${cat.slug})`)
    })
    
    // Artigos de teste para cada categoria
    const testArticles = [
      {
        category_name: 'Economia',
        title: 'PIB brasileiro cresce 2,5% no primeiro trimestre de 2025',
        content: 'O Produto Interno Bruto (PIB) do Brasil registrou crescimento de 2,5% no primeiro trimestre de 2025, superando as expectativas dos analistas econômicos. O resultado foi impulsionado principalmente pelo setor de serviços e pelo aumento do consumo das famílias.',
        excerpt: 'PIB registra crescimento acima do esperado no primeiro trimestre, impulsionado por serviços e consumo.'
      },
      {
        category_name: 'Esportes',
        title: 'Flamengo conquista Campeonato Carioca 2025',
        content: 'O Clube de Regatas do Flamengo conquistou mais um título do Campeonato Carioca, vencendo o Fluminense por 2x1 na final disputada no Maracanã. Com gols de Pedro e Gabigol, o rubro-negro garantiu mais um troféu para sua galeria.',
        excerpt: 'Flamengo vence Fluminense no Maracanã e conquista o Campeonato Carioca 2025.'
      },
      {
        category_name: 'Cultura',
        title: 'Festival de Cinema de Brasília acontece em abril',
        content: 'O tradicional Festival de Cinema de Brasília está confirmado para abril de 2025, apresentando mais de 100 filmes nacionais e internacionais. O evento promete revelar novos talentos do cinema brasileiro e celebrar a sétima arte.',
        excerpt: 'Festival de Cinema de Brasília 2025 trará mais de 100 filmes e novos talentos do cinema nacional.'
      },
      {
        category_name: 'Tecnologia',
        title: 'Brasil lança primeiro satélite de comunicação 5G',
        content: 'O Brasil deu um passo importante rumo à soberania digital com o lançamento do seu primeiro satélite de comunicação 5G. A tecnologia promete revolucionar as telecomunicações no país, especialmente em áreas rurais e remotas.',
        excerpt: 'Primeiro satélite brasileiro de comunicação 5G promete revolucionar telecomunicações no país.'
      },
      {
        category_name: 'Cidades',
        title: 'São Paulo inaugura nova linha do metrô',
        content: 'A cidade de São Paulo inaugurou sua mais nova linha do metrô, a Linha 6-Laranja, que conecta a região oeste ao centro da capital paulista. A obra custou R$ 15 bilhões e vai beneficiar mais de 600 mil usuários diariamente.',
        excerpt: 'Nova Linha 6-Laranja do metrô de São Paulo conecta região oeste ao centro da cidade.'
      }
    ]
    
    console.log('\n=== Criando Artigos ===\n')
    
    for (const articleData of testArticles) {
      // Encontrar a categoria correspondente
      const category = categories.find(cat => 
        cat.name.toLowerCase() === articleData.category_name.toLowerCase()
      )
      
      if (!category) {
        console.log(`⚠️  Categoria "${articleData.category_name}" não encontrada. Pulando artigo.`)
        continue
      }
      
      // Gerar slug a partir do título
      const slug = articleData.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
      
      // Calcular tempo de leitura
      const wordCount = articleData.content.split(' ').filter(word => word.length > 0).length
      const readingTime = Math.max(1, Math.ceil(wordCount / 200))
      
      const article = {
        title: articleData.title,
        slug: `${slug}-${Date.now()}`,
        content: articleData.content,
        excerpt: articleData.excerpt,
        category_id: category.id,
        author_id: '00000000-0000-0000-0000-000000000001',
        status: 'published',
        is_featured: false,
        reading_time: readingTime,
        meta_title: articleData.title,
        meta_description: articleData.excerpt,
        keywords: [],
        published_at: new Date().toISOString(),
        views_count: Math.floor(Math.random() * 100) + 10 // Views aleatórias para teste
      }
      
      try {
        const { data: createdArticle, error: createError } = await supabase
          .from('articles')
          .insert([article])
          .select()
          .single()
        
        if (createError) {
          console.error(`❌ Erro ao criar artigo "${articleData.title}":`, createError.message)
        } else {
          console.log(`✅ Artigo criado: "${articleData.title}"`)
          console.log(`   Categoria: ${category.name} (ID: ${category.id})`)
          console.log(`   Slug: ${createdArticle.slug}`)
          console.log('')
        }
      } catch (err) {
        console.error(`❌ Erro inesperado ao criar artigo "${articleData.title}":`, err.message)
      }
    }
    
    console.log('=== CRIAÇÃO DE ARTIGOS CONCLUÍDA ===')
    
  } catch (err) {
    console.error('Erro durante a criação dos artigos:', err)
  }
}

createTestArticles()
