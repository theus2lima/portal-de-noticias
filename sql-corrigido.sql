-- ============================================
-- PORTAL DE NOTÍCIAS - DATABASE SCHEMA (CORRIGIDO)
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Categorias
CREATE TABLE IF NOT EXISTS categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(20) DEFAULT '#1E3A8A',
    icon VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de Usuários (Autores)
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'author')),
    bio TEXT,
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de Artigos
CREATE TABLE IF NOT EXISTS articles (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(800),
    slug VARCHAR(500) NOT NULL UNIQUE,
    content TEXT NOT NULL,
    excerpt TEXT,
    featured_image TEXT,
    image_alt TEXT,
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    author_id UUID NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    is_featured BOOLEAN DEFAULT false,
    views_count INTEGER DEFAULT 0,
    reading_time INTEGER DEFAULT 0,
    meta_title VARCHAR(300),
    meta_description VARCHAR(500),
    keywords TEXT[],
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de Tags
CREATE TABLE IF NOT EXISTS tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de relacionamento Artigos-Tags (muitos para muitos)
CREATE TABLE IF NOT EXISTS article_tags (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(article_id, tag_id)
);

-- 6. Tabela de Leads (Formulário de contato)
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100) DEFAULT 'website',
    is_contacted BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Tabela de Comentários (futuro)
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    author_name VARCHAR(255) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Tabela de Visualizações (analytics)
CREATE TABLE IF NOT EXISTS article_views (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. Tabela de Configurações do Sistema
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    category VARCHAR(100) NOT NULL,
    key VARCHAR(100) NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(category, key)
);

-- 10. Tabela de Itens do Ticker
CREATE TABLE IF NOT EXISTS ticker_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    text TEXT NOT NULL,
    priority INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_articles_published_at ON articles(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_author ON articles(author_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(is_featured);
CREATE INDEX IF NOT EXISTS idx_article_views_article ON article_views(article_id);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);

-- ============================================
-- TRIGGERS PARA AUTO-UPDATE (CORRIGIDO)
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Remover triggers existentes se houver conflito e recriar
DROP TRIGGER IF EXISTS update_categories_updated_at ON categories;
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_articles_updated_at ON articles;
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;

-- Criar triggers novamente
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS (SEED)
-- ============================================

INSERT INTO categories (name, slug, description, color, icon) VALUES 
    ('Política', 'politica', 'Últimas decisões do governo, análises políticas e principais acontecimentos do cenário político nacional', '#1E3A8A', 'Building2'),
    ('Economia', 'economia', 'Mercado financeiro, negócios, indicadores econômicos e análises sobre a economia nacional', '#16A34A', 'TrendingUp'),
    ('Esportes', 'esportes', 'Resultados, análises e novidades do mundo esportivo nacional e internacional', '#10B981', 'Trophy'),
    ('Cultura', 'cultura', 'Arte, música, literatura, cinema e eventos culturais do Brasil', '#3B82F6', 'Palette'),
    ('Cidades', 'cidades', 'Notícias locais, infraestrutura urbana e qualidade de vida nas cidades brasileiras', '#059669', 'MapPin')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO users (email, password_hash, name, role, bio) VALUES 
    ('admin@portalnoticias.com.br', '$2b$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.', 'Administrador', 'admin', 'Administrador do Portal de Notícias')
ON CONFLICT (email) DO NOTHING;

INSERT INTO tags (name, slug) VALUES 
    ('Brasil', 'brasil'),
    ('Governo', 'governo'),
    ('Congresso', 'congresso'),
    ('Presidente', 'presidente'),
    ('Mercado', 'mercado'),
    ('PIB', 'pib'),
    ('Inflação', 'inflacao'),
    ('Juros', 'juros'),
    ('Futebol', 'futebol'),
    ('Copa do Mundo', 'copa-mundo'),
    ('Olimpíadas', 'olimpiadas'),
    ('Seleção Brasileira', 'selecao-brasileira'),
    ('Arte', 'arte'),
    ('Música', 'musica'),
    ('Cinema', 'cinema'),
    ('Literatura', 'literatura'),
    ('Infraestrutura', 'infraestrutura'),
    ('Transporte', 'transporte'),
    ('Educação', 'educacao'),
    ('Saúde', 'saude')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO system_settings (category, key, value, description) VALUES 
    ('ticker', 'enabled', 'true', 'Habilitar/desabilitar o ticker de notícias'),
    ('ticker', 'speed', '30', 'Velocidade da animação do ticker em segundos'),
    ('site', 'name', '"Portal de Notícias"', 'Nome do site'),
    ('site', 'description', '"Seu portal de notícias mais confiável"', 'Descrição do site'),
    ('site', 'logo', 'null', 'Logo do site')
ON CONFLICT (category, key) DO NOTHING;

INSERT INTO ticker_items (text, priority, active) VALUES 
    ('🔴 Portal de Notícias - Fique sempre informado com as últimas notícias', 10, true),
    ('📢 Bem-vindo ao nosso portal! Acompanhe as principais notícias do dia', 8, true),
    ('⚡ Breaking News: Configure seu ticker de notícias no painel admin', 5, true);

-- ============================================
-- VIEWS ÚTEIS PARA O DASHBOARD
-- ============================================

CREATE OR REPLACE VIEW articles_with_details AS
SELECT 
    a.id,
    a.title,
    a.subtitle,
    a.slug,
    a.excerpt,
    a.featured_image,
    a.status,
    a.is_featured,
    a.views_count,
    a.reading_time,
    a.published_at,
    a.created_at,
    a.updated_at,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    u.name as author_name,
    u.email as author_email,
    ARRAY_AGG(t.name) FILTER (WHERE t.name IS NOT NULL) as tags
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN users u ON a.author_id = u.id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
GROUP BY a.id, c.name, c.slug, c.color, u.name, u.email;

CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM articles WHERE status = 'published') as published_articles,
    (SELECT COUNT(*) FROM articles WHERE status = 'draft') as draft_articles,
    (SELECT COUNT(*) FROM leads) as total_leads,
    (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days') as leads_last_30_days,
    (SELECT COALESCE(SUM(views_count), 0) FROM articles) as total_views,
    (SELECT COUNT(*) FROM categories) as total_categories,
    (SELECT COUNT(*) FROM tags) as total_tags;

-- ============================================
-- COMENTÁRIOS DAS TABELAS
-- ============================================

COMMENT ON TABLE articles IS 'Tabela principal de artigos/notícias';
COMMENT ON TABLE categories IS 'Categorias para organização das notícias';
COMMENT ON TABLE leads IS 'Leads capturados pelo formulário de contato';
COMMENT ON TABLE users IS 'Usuários do sistema (admin, editores, autores)';
COMMENT ON TABLE tags IS 'Tags para categorização adicional dos artigos';
