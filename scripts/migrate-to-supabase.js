const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

// Configuração do Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configurações do Supabase não encontradas!');
  console.log('Certifique-se de ter o arquivo .env.local configurado com:');
  console.log('NEXT_PUBLIC_SUPABASE_URL=...');
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY=...');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Mapeamento de categorias locais para UUIDs do Supabase
const CATEGORY_MAPPING = {
  '1': '11111111-1111-1111-1111-111111111111', // Política
  '2': '22222222-2222-2222-2222-222222222222', // Economia
  '3': '33333333-3333-3333-3333-333333333333', // Esportes
  '4': '44444444-4444-4444-4444-444444444444', // Cultura
  '5': '55555555-5555-5555-5555-555555555555', // Cidades
  '6': '66666666-6666-6666-6666-666666666666', // Tecnologia
};

async function loadLocalData() {
  try {
    // Carregar artigos locais
    const articlesPath = path.join(process.cwd(), 'data', 'articles.json');
    const articlesData = fs.existsSync(articlesPath) 
      ? JSON.parse(fs.readFileSync(articlesPath, 'utf8'))
      : [];

    console.log(`📄 ${articlesData.length} artigos encontrados no arquivo local`);
    return { articles: articlesData };
  } catch (error) {
    console.error('❌ Erro ao carregar dados locais:', error);
    return { articles: [] };
  }
}

async function migrateArticles(articles) {
  console.log('\n🔄 Iniciando migração de artigos...');
  
  let migratedCount = 0;
  let errorCount = 0;
  
  for (const article of articles) {
    try {
      // Converter dados do formato local para Supabase
      const supabaseArticle = {
        // Remover ID - deixar o Supabase gerar automaticamente
        title: article.title,
        subtitle: article.subtitle,
        slug: article.slug,
        content: article.content,
        excerpt: article.excerpt,
        featured_image: article.featured_image,
        image_alt: article.image_alt,
        category_id: CATEGORY_MAPPING[article.category_id] || null,
        author_id: '00000000-0000-0000-0000-000000000001', // Admin padrão
        status: article.status || 'draft',
        is_featured: article.is_featured || false,
        reading_time: article.reading_time || 1,
        views_count: article.views_count || 0,
        meta_title: article.meta_title,
        meta_description: article.meta_description,
        published_at: article.published_at,
        created_at: article.created_at,
        updated_at: article.updated_at
      };

      // Inserir artigo
      const { data, error } = await supabase
        .from('articles')
        .insert([supabaseArticle])
        .select()
        .single();

      if (error) {
        throw error;
      }

      console.log(`✅ Artigo migrado: "${article.title}"`);

      // Migrar tags/keywords se existirem
      if (article.keywords && article.keywords.length > 0) {
        await migrateArticleTags(data.id, article.keywords);
      }

      migratedCount++;
    } catch (error) {
      console.error(`❌ Erro ao migrar artigo "${article.title}":`, error.message);
      errorCount++;
    }
  }

  console.log(`\n📊 Migração de artigos concluída:`);
  console.log(`   ✅ ${migratedCount} migrados com sucesso`);
  console.log(`   ❌ ${errorCount} com erro`);
  
  return migratedCount;
}

async function migrateArticleTags(articleId, keywords) {
  try {
    for (const keyword of keywords) {
      // Criar slug da tag
      const tagSlug = keyword.toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');

      // Verificar se a tag já existe
      let { data: existingTag, error } = await supabase
        .from('tags')
        .select('id')
        .eq('slug', tagSlug)
        .single();

      let tagId = existingTag?.id;

      // Criar tag se não existir
      if (!existingTag) {
        const { data: newTag, error: tagError } = await supabase
          .from('tags')
          .insert([{ name: keyword, slug: tagSlug }])
          .select('id')
          .single();

        if (!tagError) {
          tagId = newTag.id;
        }
      }

      // Associar tag ao artigo
      if (tagId) {
        await supabase
          .from('article_tags')
          .insert([{ article_id: articleId, tag_id: tagId }]);
      }
    }
  } catch (error) {
    console.log(`⚠️  Erro ao migrar tags: ${error.message}`);
  }
}

async function testConnection() {
  console.log('🔄 Testando conexão com Supabase...');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, name')
      .limit(1);

    if (error) {
      throw error;
    }

    console.log('✅ Conexão com Supabase estabelecida com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com Supabase:', error.message);
    return false;
  }
}

async function ensureCategories() {
  console.log('🔄 Verificando categorias no Supabase...');
  
  const categories = [
    { id: '11111111-1111-1111-1111-111111111111', name: 'Política', slug: 'politica' },
    { id: '22222222-2222-2222-2222-222222222222', name: 'Economia', slug: 'economia' },
    { id: '33333333-3333-3333-3333-333333333333', name: 'Esportes', slug: 'esportes' },
    { id: '44444444-4444-4444-4444-444444444444', name: 'Cultura', slug: 'cultura' },
    { id: '55555555-5555-5555-5555-555555555555', name: 'Cidades', slug: 'cidades' },
    { id: '66666666-6666-6666-6666-666666666666', name: 'Tecnologia', slug: 'tecnologia' },
  ];

  for (const category of categories) {
    try {
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('id', category.id)
        .single();

      if (!existing) {
        const { error } = await supabase
          .from('categories')
          .insert([{
            id: category.id,
            name: category.name,
            slug: category.slug,
            description: `Notícias de ${category.name.toLowerCase()}`,
            color: '#3B82F6',
            icon: 'Folder',
            is_active: true,
            sort_order: 1
          }]);

        if (error) {
          console.log(`⚠️  Erro ao criar categoria ${category.name}:`, error.message);
        } else {
          console.log(`✅ Categoria criada: ${category.name}`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Erro ao verificar categoria ${category.name}:`, error.message);
    }
  }
}

async function main() {
  console.log('🚀 MIGRAÇÃO PARA SUPABASE - PORTAL DE NOTÍCIAS');
  console.log('================================================\n');

  // Testar conexão
  const connected = await testConnection();
  if (!connected) {
    console.log('\n💡 Instruções:');
    console.log('1. Certifique-se de que o Supabase está configurado');
    console.log('2. Execute o schema SQL no Supabase');
    console.log('3. Configure o arquivo .env.local');
    process.exit(1);
  }

  // Garantir que as categorias existem
  await ensureCategories();

  // Carregar dados locais
  const { articles } = await loadLocalData();

  if (articles.length === 0) {
    console.log('⚠️  Nenhum dado local encontrado para migrar.');
    process.exit(0);
  }

  // Confirmar migração
  console.log(`\n📋 Dados encontrados:`);
  console.log(`   📄 ${articles.length} artigos`);
  
  // Migrar dados
  const migratedArticles = await migrateArticles(articles);

  console.log('\n🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!');
  console.log('================================');
  console.log(`✅ ${migratedArticles} artigos migrados`);
  console.log('\n💡 Próximos passos:');
  console.log('1. Teste o funcionamento do admin');
  console.log('2. Verifique se os artigos aparecem no site');
  console.log('3. Faça backup do arquivo articles.json');
}

// Executar migração
main().catch(error => {
  console.error('❌ Erro na migração:', error);
  process.exit(1);
});
