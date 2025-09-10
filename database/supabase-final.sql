-- ============================================
-- CONFIGURAÇÃO FINAL - SUPABASE
-- ============================================

-- Adicionar colunas que podem estar faltando
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
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
    type VARCHAR(20) DEFAULT 'string' CHECK (type IN ('string', 'number', 'boolean', 'json')),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- Função para triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para settings
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Atualizar/Inserir usuário admin
DO $$
BEGIN
    -- Tentar inserir, se der erro atualizar
    INSERT INTO users (id, email, password_hash, name, role, bio, is_active, email_verified) 
    VALUES ('00000000-0000-0000-0000-000000000001', 'admin@portalnoticias.com.br', '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.', 'Administrador', 'admin', 'Administrador do Portal de Notícias', true, true);
EXCEPTION WHEN unique_violation THEN
    UPDATE users SET 
        password_hash = '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.',
        name = 'Administrador',
        role = 'admin',
        bio = 'Administrador do Portal de Notícias',
        is_active = true,
        email_verified = true
    WHERE email = 'admin@portalnoticias.com.br';
END $$;

-- Atualizar categorias existentes ou inserir novas
DO $$
DECLARE
    cat_record RECORD;
    categories_data CONSTANT JSON := '[
        {"id": "11111111-1111-1111-1111-111111111111", "name": "Política", "slug": "politica", "description": "Notícias sobre política nacional e local", "color": "#DC2626", "icon": "Vote"},
        {"id": "22222222-2222-2222-2222-222222222222", "name": "Economia", "slug": "economia", "description": "Economia, finanças e mercado", "color": "#059669", "icon": "DollarSign"},
        {"id": "33333333-3333-3333-3333-333333333333", "name": "Esportes", "slug": "esportes", "description": "Esportes nacionais e internacionais", "color": "#DC2626", "icon": "Trophy"},
        {"id": "44444444-4444-4444-4444-444444444444", "name": "Cultura", "slug": "cultura", "description": "Arte, cultura e entretenimento", "color": "#7C3AED", "icon": "Palette"},
        {"id": "55555555-5555-5555-5555-555555555555", "name": "Cidades", "slug": "cidades", "description": "Notícias das cidades e regiões", "color": "#0EA5E9", "icon": "Building"},
        {"id": "66666666-6666-6666-6666-666666666666", "name": "Tecnologia", "slug": "tecnologia", "description": "Inovação e tecnologia", "color": "#3B82F6", "icon": "Laptop"}
    ]';
BEGIN
    FOR cat_record IN SELECT * FROM JSON_ARRAY_ELEMENTS(categories_data)
    LOOP
        INSERT INTO categories (id, name, slug, description, color, icon, is_active, sort_order) 
        VALUES (
            (cat_record.value->>'id')::UUID,
            cat_record.value->>'name',
            cat_record.value->>'slug',
            cat_record.value->>'description',
            cat_record.value->>'color',
            cat_record.value->>'icon',
            true,
            1
        )
        ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            slug = EXCLUDED.slug,
            description = EXCLUDED.description,
            color = EXCLUDED.color,
            icon = EXCLUDED.icon,
            is_active = EXCLUDED.is_active;
    END LOOP;
END $$;

-- Inserir configurações
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

-- Recriar VIEW
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
