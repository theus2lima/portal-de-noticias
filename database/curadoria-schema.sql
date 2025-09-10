-- ============================================
-- MÓDULO DE CURADORIA DE NOTÍCIAS - ESTRUTURA
-- ============================================

-- 1. Tabela de fontes de notícias
CREATE TABLE IF NOT EXISTS news_sources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    rss_url TEXT,
    type VARCHAR(50) DEFAULT 'rss' CHECK (type IN ('rss', 'api', 'scraping')),
    is_active BOOLEAN DEFAULT true,
    scraping_config JSONB, -- Configurações específicas de scraping
    last_fetch TIMESTAMP WITH TIME ZONE,
    fetch_frequency INTEGER DEFAULT 3600, -- segundos (1 hora)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de notícias coletadas (raw)
CREATE TABLE IF NOT EXISTS scraped_news (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_id UUID NOT NULL REFERENCES news_sources(id) ON DELETE CASCADE,
    original_url TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    author VARCHAR(255),
    published_at TIMESTAMP WITH TIME ZONE,
    image_url TEXT,
    tags TEXT[],
    raw_data JSONB, -- Dados originais completos
    content_hash VARCHAR(64) UNIQUE, -- Para evitar duplicatas
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de curadoria (processo de aprovação)
CREATE TABLE IF NOT EXISTS news_curation (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    scraped_news_id UUID NOT NULL REFERENCES scraped_news(id) ON DELETE CASCADE,
    curator_id UUID REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'published', 'editing')),
    suggested_category_id UUID REFERENCES categories(id),
    ai_confidence DECIMAL(3,2), -- 0.00 a 1.00
    ai_category_reasoning TEXT,
    manual_category_id UUID REFERENCES categories(id),
    curated_title TEXT,
    curated_summary TEXT,
    curated_content TEXT,
    curator_notes TEXT,
    approved_at TIMESTAMP WITH TIME ZONE,
    published_article_id UUID REFERENCES articles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de logs de curadoria
CREATE TABLE IF NOT EXISTS curation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    curation_id UUID NOT NULL REFERENCES news_curation(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Tabela de configurações do sistema de curadoria
CREATE TABLE IF NOT EXISTS curation_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ÍNDICES PARA PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_scraped_news_source ON scraped_news(source_id);
CREATE INDEX IF NOT EXISTS idx_scraped_news_published ON scraped_news(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_scraped_news_hash ON scraped_news(content_hash);

CREATE INDEX IF NOT EXISTS idx_curation_status ON news_curation(status);
CREATE INDEX IF NOT EXISTS idx_curation_curator ON news_curation(curator_id);
CREATE INDEX IF NOT EXISTS idx_curation_created ON news_curation(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_curation_logs_curation ON curation_logs(curation_id);
CREATE INDEX IF NOT EXISTS idx_curation_logs_user ON curation_logs(user_id);

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger para updated_at nas tabelas principais
CREATE TRIGGER update_news_sources_updated_at 
    BEFORE UPDATE ON news_sources 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_news_curation_updated_at 
    BEFORE UPDATE ON news_curation 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_curation_settings_updated_at 
    BEFORE UPDATE ON curation_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir fontes de exemplo
INSERT INTO news_sources (name, url, rss_url, type) VALUES
    ('G1', 'https://g1.globo.com', 'https://g1.globo.com/rss/g1/', 'rss'),
    ('UOL Notícias', 'https://noticias.uol.com.br', 'https://rss.uol.com.br/feed/noticias.xml', 'rss'),
    ('Folha de S.Paulo', 'https://folha.uol.com.br', 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml', 'rss'),
    ('Estadão', 'https://estadao.com.br', 'https://www.estadao.com.br/rss/geral.xml', 'rss'),
    ('CNN Brasil', 'https://cnnbrasil.com.br', 'https://www.cnnbrasil.com.br/rss/', 'rss')
ON CONFLICT DO NOTHING;

-- Configurações iniciais
INSERT INTO curation_settings (key, value, description) VALUES
    ('ai_classification_enabled', 'true', 'Habilitar classificação automática por IA'),
    ('auto_approve_threshold', '0.85', 'Limiar de confiança para aprovação automática'),
    ('fetch_interval_hours', '1', 'Intervalo de coleta em horas'),
    ('max_articles_per_fetch', '50', 'Máximo de artigos por coleta'),
    ('openai_model', 'gpt-3.5-turbo', 'Modelo de IA para classificação'),
    ('duplicate_check_enabled', 'true', 'Verificar duplicatas baseado em hash do conteúdo')
ON CONFLICT (key) DO NOTHING;

-- ============================================
-- VIEWS ÚTEIS
-- ============================================

-- View para notícias pendentes de curadoria
CREATE OR REPLACE VIEW pending_curation AS
SELECT 
    nc.id as curation_id,
    sn.id as news_id,
    sn.title,
    sn.summary,
    sn.published_at,
    sn.image_url,
    ns.name as source_name,
    nc.suggested_category_id,
    c.name as suggested_category_name,
    nc.ai_confidence,
    nc.status,
    nc.created_at as collected_at
FROM news_curation nc
JOIN scraped_news sn ON nc.scraped_news_id = sn.id
JOIN news_sources ns ON sn.source_id = ns.id
LEFT JOIN categories c ON nc.suggested_category_id = c.id
WHERE nc.status = 'pending'
ORDER BY nc.created_at DESC;

-- View para estatísticas de curadoria
CREATE OR REPLACE VIEW curation_stats AS
SELECT 
    COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
    COUNT(*) FILTER (WHERE status = 'approved') as approved_count,
    COUNT(*) FILTER (WHERE status = 'rejected') as rejected_count,
    COUNT(*) FILTER (WHERE status = 'published') as published_count,
    COUNT(*) as total_count,
    DATE(created_at) as date
FROM news_curation
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Relatório final
SELECT 
    'MÓDULO DE CURADORIA' as info,
    'Estrutura criada com sucesso!' as status
UNION ALL
SELECT 
    'Tabelas criadas:',
    '5 tabelas + views + índices + triggers'
UNION ALL
SELECT 
    'Fontes de exemplo:',
    CAST(COUNT(*) AS TEXT) || ' portais brasileiros'
FROM news_sources
UNION ALL
SELECT 
    'Configurações:',
    CAST(COUNT(*) AS TEXT) || ' settings padrão'
FROM curation_settings;
