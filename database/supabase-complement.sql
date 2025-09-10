-- ============================================
-- COMPLEMENTO PARA O SUPABASE - PORTAL DE NOTÍCIAS
-- ============================================
-- Execute este SQL se algumas tabelas/colunas estão faltando

-- TABELA: settings (caso não tenha sido criada)
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

-- Adicionar colunas que podem estar faltando na tabela categories
ALTER TABLE categories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- TRIGGER para settings
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- INSERIR CATEGORIAS PADRÃO COM UUIDs FIXOS
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

-- INSERIR CONFIGURAÇÕES PADRÃO
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
