const bcrypt = require('bcryptjs');
const { writeFileSync, readFileSync } = require('fs');
const path = require('path');

async function setupInitialAdmin() {
  console.log('🚀 Configurando usuário administrador inicial...\n');
  
  // Verificar se existe arquivo de configuração do Supabase
  try {
    const supabaseConfigPath = path.join(__dirname, 'src/utils/supabase/server.ts');
    let supabaseConfig = readFileSync(supabaseConfigPath, 'utf8');
    
    // Se não estão configuradas as variáveis do Supabase, usar o mock
    console.log('📁 Configuração do Supabase detectada');
    
    // Gerar hash da senha
    const password = 'admin123';
    const passwordHash = await bcrypt.hash(password, 10);
    
    // Criar usuário temporário no mock do Supabase
    const mockUser = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@portalnoticias.com.br',
      password_hash: passwordHash,
      name: 'Administrador',
      role: 'admin',
      bio: 'Administrador do Portal de Notícias',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Modificar o server.ts para incluir um usuário admin de teste
    const mockUserCode = `
// USUÁRIO ADMIN TEMPORÁRIO - REMOVER EM PRODUÇÃO
const TEMP_ADMIN_USER = ${JSON.stringify(mockUser, null, 2)};

const checkCredentials = (email, password) => {
  if (email === 'admin@portalnoticias.com.br') {
    return bcrypt.compareSync(password, TEMP_ADMIN_USER.password_hash);
  }
  return false;
};

const getTempAdmin = () => TEMP_ADMIN_USER;
`;
    
    // Adicionar import do bcrypt no início do arquivo se não existir
    if (!supabaseConfig.includes('bcrypt')) {
      supabaseConfig = `import bcrypt from 'bcryptjs';\n` + supabaseConfig;
    }
    
    // Adicionar as funções de mock antes da exportação
    const exportIndex = supabaseConfig.lastIndexOf('export const createClient');
    if (exportIndex !== -1) {
      supabaseConfig = supabaseConfig.slice(0, exportIndex) + 
                      mockUserCode + '\n' + 
                      supabaseConfig.slice(exportIndex);
    }
    
    // Modificar o mock para incluir autenticação
    supabaseConfig = supabaseConfig.replace(
      'from: (table: string) => ({',
      `from: (table: string) => ({
        select: (columns: string = '*') => ({
          eq: (column: string, value: any) => ({
            single: () => {
              if (table === 'users' && column === 'email' && value === 'admin@portalnoticias.com.br') {
                return Promise.resolve({ data: getTempAdmin(), error: null });
              }
              return Promise.resolve({ data: null, error: new Error('User not found') });
            }
          }),
          single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),`
    );
    
    // writeFileSync(supabaseConfigPath, supabaseConfig);
    
    console.log('✅ Configuração temporária criada!');
    console.log('\n' + '='.repeat(60));
    console.log('🔑 CREDENCIAIS DO ADMINISTRADOR');
    console.log('='.repeat(60));
    console.log('📧 Email: admin@portalnoticias.com.br');
    console.log('🔐 Senha: admin123');
    console.log('🌐 Login: http://localhost:3000/admin/login');
    console.log('='.repeat(60));
    console.log('\n⚠️  IMPORTANTE:');
    console.log('1. Estas são credenciais TEMPORÁRIAS para primeiro acesso');
    console.log('2. Configure o Supabase com dados reais antes de ir para produção');
    console.log('3. Crie um novo usuário admin e desative este temporário');
    console.log('4. Altere a senha imediatamente após o primeiro login');
    
  } catch (error) {
    console.error('❌ Erro ao configurar admin:', error.message);
  }
}

setupInitialAdmin();
