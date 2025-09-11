-- ============================================
-- PORTAL DE NOTÍCIAS - SCHEMA SUPABASE (VERSÃO CORRIGIDA)
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Remover view existente se houver conflito
DROP VIEW IF EXISTS articles_with_details;

-- ============================================
-- TABELA: users (Usuários do sistema)
-- ============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'author')),
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: categories (Categorias)
-- ============================================
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'Folder',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: articles (Artigos)
-- ============================================
CREATE TABLE IF NOT EXISTS articles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    subtitle TEXT,
    slug VARCHAR(200) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    image_alt TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    reading_time INTEGER DEFAULT 1,
    views_count INTEGER DEFAULT 0,
    meta_title VARCHAR(200),
    meta_description TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: tags (Tags/Palavras-chave)
-- ============================================
CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: article_tags (Relacionamento N:N)
-- ============================================
CREATE TABLE IF NOT EXISTS article_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, tag_id)
);

-- ============================================
-- TABELA: leads (Leads de newsletter)
-- ============================================
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    source VARCHAR(50) DEFAULT 'newsletter',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed', 'bounced')),
    subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    unsubscribed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- TABELA: settings (Configurações do sistema)
-- ============================================
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

-- ============================================
-- TABELA: shares (Para analytics de compartilhamentos)
-- ============================================
CREATE TABLE IF NOT EXISTS shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    article_id UUID REFERENCES articles(id) ON DELETE CASCADE,
    platform VARCHAR(20) NOT NULL CHECK (platform IN ('facebook', 'twitter', 'whatsapp', 'linkedin', 'email')),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- VIEW: articles_with_details (Para facilitar consultas)
-- ============================================
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
    COALESCE(ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL), '{}') as keywords
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN users u ON a.author_id = u.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
GROUP BY a.id, a.title, a.subtitle, a.slug, a.content, a.excerpt, a.featured_image, a.image_alt, a.category_id, a.author_id, a.status, a.is_featured, a.reading_time, a.views_count, a.meta_title, a.meta_description, a.published_at, a.created_at, a.updated_at, c.id, c.name, c.slug, c.color, u.id, u.name, u.email, u.avatar_url;

-- ============================================
-- ÍNDICES para performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_active ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_slug ON categories(slug);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_tags_slug ON tags(slug);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);

CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);

CREATE INDEX IF NOT EXISTS idx_shares_article ON shares(article_id);
CREATE INDEX IF NOT EXISTS idx_shares_platform ON shares(platform);
CREATE INDEX IF NOT EXISTS idx_shares_created_at ON shares(created_at);

-- ============================================
-- TRIGGERS para updated_at automático
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar triggers apenas se não existirem
DO $$ BEGIN
    CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_tags_updated_at BEFORE UPDATE ON tags
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir categorias padrão
INSERT INTO categories (id, name, slug, description, color, icon, sort_order) VALUES 
('11111111-1111-1111-1111-111111111111', 'Política', 'politica', 'Notícias sobre política nacional e local', '#DC2626', 'Vote', 1),
('22222222-2222-2222-2222-222222222222', 'Economia', 'economia', 'Economia, finanças e mercado', '#059669', 'DollarSign', 2),
('33333333-3333-3333-3333-333333333333', 'Esportes', 'esportes', 'Esportes nacionais e internacionais', '#DC2626', 'Trophy', 3),
('44444444-4444-4444-4444-444444444444', 'Cultura', 'cultura', 'Arte, cultura e entretenimento', '#7C3AED', 'Palette', 4),
('55555555-5555-5555-5555-555555555555', 'Cidades', 'cidades', 'Notícias das cidades e regiões', '#0EA5E9', 'Building', 5),
('66666666-6666-6666-6666-666666666666', 'Tecnologia', 'tecnologia', 'Inovação e tecnologia', '#3B82F6', 'Laptop', 6)
ON CONFLICT (slug) DO NOTHING;

-- Inserir algumas tags padrão
INSERT INTO tags (name, slug, color) VALUES 
('Brasil', 'brasil', '#22C55E'),
('Governo', 'governo', '#EF4444'),
('Eleições', 'eleicoes', '#3B82F6'),
('Mercado', 'mercado', '#F59E0B'),
('Copa', 'copa', '#DC2626'),
('Olimpíadas', 'olimpiadas', '#6366F1'),
('Cinema', 'cinema', '#8B5CF6'),
('Música', 'musica', '#EC4899'),
('Curitiba', 'curitiba', '#06B6D4'),
('Paraná', 'parana', '#10B981')
ON CONFLICT (slug) DO NOTHING;

-- Inserir configurações iniciais do sistema
INSERT INTO settings (category, key, value, type, description) VALUES 
('site', 'name', 'Portal de Notícias', 'string', 'Nome do site'),
('site', 'description', 'Seu portal de notícias sempre atualizado', 'string', 'Descrição do site'),
('site', 'logo_url', '/images/logo.png', 'string', 'URL do logo'),
('site', 'primary_color', '#1B365D', 'string', 'Cor primária do site'),
('site', 'secondary_color', '#2563EB', 'string', 'Cor secundária do site'),
('newsletter', 'enabled', 'true', 'boolean', 'Newsletter habilitada'),
('analytics', 'ga_id', '', 'string', 'ID do Google Analytics'),
('social', 'facebook_url', '', 'string', 'URL do Facebook'),
('social', 'twitter_url', '', 'string', 'URL do Twitter'),
('social', 'instagram_url', '', 'string', 'URL do Instagram'),
('whatsapp', 'phone_number', '', 'string', 'Número do WhatsApp para leads'),
('whatsapp', 'message_template', 'Olá! Tenho interesse em receber mais informações.', 'string', 'Template de mensagem do WhatsApp')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- COMENTÁRIOS FINAIS
-- ============================================

-- Este schema cria uma estrutura completa para um portal de notícias com:
-- 1. Sistema de usuários com roles (admin, editor, author)
-- 2. Sistema de artigos com categorias e tags
-- 3. Sistema de leads para newsletter
-- 4. Analytics de compartilhamentos
-- 5. Configurações flexíveis do sistema
-- 6. Índices para performance otimizada
-- 7. Triggers para atualização automática de timestamps
-- 8. Dados iniciais para começar a usar imediatamente

-- Para usar este schema:
-- 1. Execute todo este código no SQL Editor do Supabase
-- 2. Verifique se todas as tabelas foram criadas
-- 3. Configure as políticas RLS se necessário
-- 4. Comece a usar o sistema!
