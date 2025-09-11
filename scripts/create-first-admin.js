#!/usr/bin/env node
/**
 * Script para criar o primeiro usuário admin
 * Execute: node scripts/create-first-admin.js
 */

const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const readline = require('readline');

// Interface para input do usuário
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Função para solicitar input
function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Função principal
async function createFirstAdmin() {
  console.log('\n🚀 CRIANDO PRIMEIRO USUÁRIO ADMIN\n');
  
  try {
    // Verificar variáveis de ambiente
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Erro: Variáveis de ambiente do Supabase não configuradas!');
      console.log('\nConfigure as variáveis:');
      console.log('- NEXT_PUBLIC_SUPABASE_URL');
      console.log('- SUPABASE_SERVICE_ROLE_KEY (ou NEXT_PUBLIC_SUPABASE_ANON_KEY)');
      process.exit(1);
    }

    // Conectar ao Supabase
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log('✅ Conectado ao Supabase');

    // Solicitar dados do admin
    const name = await askQuestion('Nome completo do admin: ');
    const email = await askQuestion('Email do admin: ');
    const password = await askQuestion('Senha do admin (mín. 6 chars): ');

    if (!name || !email || !password || password.length < 6) {
      console.error('❌ Todos os campos são obrigatórios. Senha deve ter pelo menos 6 caracteres.');
      rl.close();
      return;
    }

    // Verificar se já existe usuário com este email
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      console.error('❌ Já existe um usuário com este email!');
      rl.close();
      return;
    }

    // Hash da senha
    console.log('\n🔐 Gerando hash da senha...');
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Inserir usuário
    console.log('👤 Criando usuário admin...');
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{
        email,
        password_hash,
        name,
        role: 'admin',
        is_active: true,
        email_verified: true
      }])
      .select('id, email, name, role')
      .single();

    if (error) {
      console.error('❌ Erro ao criar usuário:', error.message);
      rl.close();
      return;
    }

    console.log('\n🎉 USUÁRIO ADMIN CRIADO COM SUCESSO!');
    console.log('\n📋 Dados:');
    console.log(`- ID: ${newUser.id}`);
    console.log(`- Nome: ${newUser.name}`);
    console.log(`- Email: ${newUser.email}`);
    console.log(`- Função: ${newUser.role}`);
    
    console.log('\n🔗 Acesso:');
    console.log(`- URL: ${supabaseUrl.replace('supabaseUrl', 'seu-site')}/admin`);
    console.log(`- Email: ${email}`);
    console.log(`- Senha: [a que você digitou]`);

  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    rl.close();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  createFirstAdmin();
}

module.exports = { createFirstAdmin };
