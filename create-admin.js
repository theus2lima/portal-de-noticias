const bcrypt = require('bcryptjs');

async function createAdminUser() {
  const password = 'admin123';
  const saltRounds = 10;
  
  try {
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    console.log('='.repeat(50));
    console.log('🔑 USUÁRIO ADMINISTRADOR INICIAL');
    console.log('='.repeat(50));
    console.log('Email:', 'admin@portalnoticias.com.br');
    console.log('Senha:', password);
    console.log('Hash gerado:', passwordHash);
    console.log('='.repeat(50));
    console.log('');
    console.log('📋 SQL para inserir no Supabase:');
    console.log('');
    console.log(`INSERT INTO users (email, password_hash, name, role, bio, is_active) VALUES `);
    console.log(`  ('admin@portalnoticias.com.br', '${passwordHash}', 'Administrador', 'admin', 'Administrador do Portal de Notícias', true)`);
    console.log(`ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;`);
    console.log('');
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');
    
  } catch (error) {
    console.error('Erro ao gerar hash:', error);
  }
}

createAdminUser();
