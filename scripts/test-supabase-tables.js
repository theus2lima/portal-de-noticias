const { createClient } = require('@supabase/supabase-js');

// Carregar variáveis de ambiente
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Configurações do Supabase não encontradas!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testTables() {
  console.log('🔍 TESTANDO TABELAS DO SUPABASE');
  console.log('================================\n');

  const tables = [
    { name: 'users', description: 'Usuários do sistema' },
    { name: 'categories', description: 'Categorias de artigos' },
    { name: 'articles', description: 'Artigos do portal' },
    { name: 'tags', description: 'Tags/palavras-chave' },
    { name: 'article_tags', description: 'Relacionamento artigos-tags' },
    { name: 'leads', description: 'Leads de newsletter' },
    { name: 'settings', description: 'Configurações do sistema' }
  ];

  let allTablesExist = true;

  for (const table of tables) {
    try {
      console.log(`🔄 Testando tabela: ${table.name}`);
      
      const { data, error } = await supabase
        .from(table.name)
        .select('*')
        .limit(1);

      if (error) {
        console.log(`❌ Tabela ${table.name} - ERRO: ${error.message}`);
        allTablesExist = false;
      } else {
        console.log(`✅ Tabela ${table.name} - OK (${data.length} registros encontrados)`);
      }
    } catch (error) {
      console.log(`❌ Tabela ${table.name} - ERRO: ${error.message}`);
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allTablesExist) {
    console.log('🎉 TODAS AS TABELAS EXISTEM!');
    console.log('O Supabase está configurado corretamente.');
    console.log('Você pode executar a migração dos dados.');
  } else {
    console.log('❌ ALGUMAS TABELAS ESTÃO FALTANDO!');
    console.log('Você precisa executar o SQL completo no Supabase:');
    console.log('1. Abra o SQL Editor no Supabase');
    console.log('2. Cole TODO o conteúdo do arquivo database/supabase-schema.sql');
    console.log('3. Execute clicando em "Run"');
  }
}

testTables().catch(error => {
  console.error('❌ Erro no teste:', error);
});
