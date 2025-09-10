-- ============================================
-- CORREÇÃO PARA TABELAS EXISTENTES - SUPABASE
-- ============================================
-- Execute este SQL para corrigir a estrutura das tabelas

-- Adicionar colunas que podem estar faltando na tabela users
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Adicionar colunas que podem estar faltando na tabela categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS color VARCHAR(7) DEFAULT '#3B82F6';
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon VARCHAR(50) DEFAULT 'Folder';

-- Criar tabela settings se não existir
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category VARCHAR(50) NOT NULL,
    key VARCHAR(50) NOT NULL,
    value TEXT,
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Função para triggers (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para settings (se não existir)
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário admin (agora com colunas corretas)
INSERT INTO users (id, email, password_hash, name, role, bio, is_active, email_verified) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@portalnoticias.com.br', '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.', 'Administrador', 'admin', 'Administrador do Portal de Notícias', true, true)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    bio = EXCLUDED.bio,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified;

-- Inserir categorias com UUIDs fixos
INSERT INTO categories (id, name, slug, description, color, icon, is_active, sort_order) VALUES 
('11111111-1111-1111-1111-111111111111', 'Política', 'politica', 'Notícias sobre política nacional e local', '#DC2626', 'Vote', true, 1),
('22222222-2222-2222-2222-222222222222', 'Economia', 'economia', 'Economia, finanças e mercado', '#059669', 'DollarSign', true, 2),
('33333333-3333-3333-3333-333333333333', 'Esportes', 'esportes', 'Esportes nacionais e internacionais', '#DC2626', 'Trophy', true, 3),
('44444444-4444-4444-4444-444444444444', 'Cultura', 'cultura', 'Arte, cultura e entretenimento', '#7C3AED', 'Palette', true, 4),
('55555555-5555-5555-5555-555555555555', 'Cidades', 'cidades', 'Notícias das cidades e regiões', '#0EA5E9', 'Building', true, 5),
('66666666-6666-6666-6666-666666666666', 'Tecnologia', 'tecnologia', 'Inovação e tecnologia', '#3B82F6', 'Laptop', true, 6)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    color = EXCLUDED.color,
    icon = EXCLUDED.icon,
    is_active = EXCLUDED.is_active,
    sort_order = EXCLUDED.sort_order;

-- Inserir configurações padrão
INSERT INTO settings (category, key, value, type, description) VALUES 
('site', 'title', 'Portal de Notícias', 'string', 'Título do site'),
('site', 'description', 'Seu portal de notícias confiável', 'string', 'Descrição do site'),
('site', 'logo_url', '', 'string', 'URL do logo'),
('ticker', 'enabled', 'true', 'boolean', 'Ticker de notícias habilitado'),
('ticker', 'speed', '50', 'number', 'Velocidade do ticker (px/s)'),
('newsletter', 'enabled', 'true', 'boolean', 'Newsletter habilitada'),
('analytics', 'enabled', 'false', 'boolean', 'Analytics habilitado'),
('comments', 'enabled', 'false', 'boolean', 'Comentários habilitados')
ON CONFLICT (category, key) DO NOTHING;

-- Recriar VIEW articles_with_details se existir problema
DROP VIEW IF EXISTS articles_with_details;
CREATE VIEW articles_with_details AS
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
    a.author_id,
    a.status,
    a.is_featured,
    a.reading_time,
    a.views_count,
    a.meta_title,
    a.meta_description,
    a.published_at,
    a.created_at,
    a.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    u.name as author_name,
    u.email as author_email,
    u.avatar_url as author_avatar,
    ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) as keywords
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN users u ON a.author_id = u.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
GROUP BY a.id, a.title, a.subtitle, a.slug, a.content, a.excerpt, a.featured_image, a.image_alt, a.category_id, a.author_id, a.status, a.is_featured, a.reading_time, a.views_count, a.meta_title, a.meta_description, a.published_at, a.created_at, a.updated_at, c.id, c.name, c.slug, c.color, u.id, u.name, u.email, u.avatar_url;

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
