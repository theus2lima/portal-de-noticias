-- ============================================
-- CONFIGURAÇÃO SIMPLES - SUPABASE
-- ============================================

-- Adicionar colunas se não existirem
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'Folder';

-- Criar tabela settings
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(50) NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Atualizar categorias existentes com UUIDs corretos
UPDATE categories SET 
    id = '11111111-1111-1111-1111-111111111111',
    slug = 'politica',
    description = 'Notícias sobre política nacional e local',
    color = '#DC2626',
    icon = 'Vote',
    is_active = true,
    sort_order = 1
WHERE name = 'Política';

-- Inserir outras categorias se não existirem
INSERT INTO categories (id, name, slug, description, color, icon, is_active, sort_order) 
SELECT '22222222-2222-2222-2222-222222222222', 'Economia', 'economia', 'Economia, finanças e mercado', '#059669', 'DollarSign', true, 2
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Economia');

INSERT INTO categories (id, name, slug, description, color, icon, is_active, sort_order) 
SELECT '33333333-3333-3333-3333-333333333333', 'Esportes', 'esportes', 'Esportes nacionais e internacionais', '#DC2626', 'Trophy', true, 3
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Esportes');

INSERT INTO categories (id, name, slug, description, color, icon, is_active, sort_order) 
SELECT '44444444-4444-4444-4444-444444444444', 'Cultura', 'cultura', 'Arte, cultura e entretenimento', '#7C3AED', 'Palette', true, 4
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Cultura');

INSERT INTO categories (id, name, slug, description, color, icon, is_active, sort_order) 
SELECT '55555555-5555-5555-5555-555555555555', 'Cidades', 'cidades', 'Notícias das cidades e regiões', '#0EA5E9', 'Building', true, 5
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Cidades');

INSERT INTO categories (id, name, slug, description, color, icon, is_active, sort_order) 
SELECT '66666666-6666-6666-6666-666666666666', 'Tecnologia', 'tecnologia', 'Inovação e tecnologia', '#3B82F6', 'Laptop', true, 6
WHERE NOT EXISTS (SELECT 1 FROM categories WHERE name = 'Tecnologia');

-- Inserir configurações
INSERT INTO settings (category, key, value, type, description) 
SELECT 'site', 'title', 'Portal de Notícias', 'string', 'Título do site'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE category = 'site' AND key = 'title');

INSERT INTO settings (category, key, value, type, description) 
SELECT 'site', 'description', 'Seu portal de notícias confiável', 'string', 'Descrição do site'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE category = 'site' AND key = 'description');

INSERT INTO settings (category, key, value, type, description) 
SELECT 'ticker', 'enabled', 'true', 'boolean', 'Ticker de notícias habilitado'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE category = 'ticker' AND key = 'enabled');

INSERT INTO settings (category, key, value, type, description) 
SELECT 'newsletter', 'enabled', 'true', 'boolean', 'Newsletter habilitada'
WHERE NOT EXISTS (SELECT 1 FROM settings WHERE category = 'newsletter' AND key = 'enabled');

-- Atualizar usuário admin existente
UPDATE users SET 
    id = '00000000-0000-0000-0000-000000000001',
    password_hash = '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.',
    role = 'admin',
    bio = 'Administrador do Portal de Notícias',
    is_active = true,
    email_verified = true
WHERE email = 'admin@portalnoticias.com.br';

-- Se não existir, inserir usuário admin
INSERT INTO users (id, email, password_hash, name, role, bio, is_active, email_verified)
SELECT '00000000-0000-0000-0000-000000000001', 'admin@portalnoticias.com.br', '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.', 'Administrador', 'admin', 'Administrador do Portal de Notícias', true, true
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@portalnoticias.com.br');

-- Verificação final
SELECT 
  'users' as tabela, COUNT(*) as registros FROM users
UNION ALL
SELECT 
  'categories' as tabela, COUNT(*) as registros FROM categories  
UNION ALL
SELECT 
  'settings' as tabela, COUNT(*) as registros FROM settings
UNION ALL
SELECT 
  'articles' as tabela, COUNT(*) as registros FROM articles
ORDER BY tabela;
