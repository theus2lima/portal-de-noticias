-- ============================================
-- SHARES FUNCTIONALITY - DATABASE SCHEMA
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- Tabela de Compartilhamentos de Artigos
CREATE TABLE IF NOT EXISTS article_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('whatsapp', 'x', 'twitter', 'facebook', 'instagram', 'threads', 'linkedin')),
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    
    -- Índices para melhor performance
    CONSTRAINT idx_article_shares_article_platform UNIQUE (article_id, platform, shared_at)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_article_shares_article_id ON article_shares(article_id);
CREATE INDEX IF NOT EXISTS idx_article_shares_platform ON article_shares(platform);
CREATE INDEX IF NOT EXISTS idx_article_shares_shared_at ON article_shares(shared_at DESC);
CREATE INDEX IF NOT EXISTS idx_article_shares_article_platform_idx ON article_shares(article_id, platform);

-- Comentários
COMMENT ON TABLE article_shares IS 'Registra compartilhamentos de artigos por plataforma social';
COMMENT ON COLUMN article_shares.platform IS 'Plataforma onde foi compartilhado (whatsapp, x, twitter, facebook, instagram, threads, linkedin)';
COMMENT ON COLUMN article_shares.shared_at IS 'Data e hora do compartilhamento';

-- View para estatísticas de compartilhamento
CREATE OR REPLACE VIEW article_shares_stats AS
SELECT 
    a.id as article_id,
    a.title as article_title,
    a.slug as article_slug,
    COUNT(s.id) as total_shares,
    COUNT(CASE WHEN s.platform = 'whatsapp' THEN 1 END) as whatsapp_shares,
    COUNT(CASE WHEN s.platform = 'x' THEN 1 END) as x_shares,
    COUNT(CASE WHEN s.platform = 'twitter' THEN 1 END) as twitter_shares,
    COUNT(CASE WHEN s.platform = 'facebook' THEN 1 END) as facebook_shares,
    COUNT(CASE WHEN s.platform = 'instagram' THEN 1 END) as instagram_shares,
    COUNT(CASE WHEN s.platform = 'threads' THEN 1 END) as threads_shares,
    COUNT(CASE WHEN s.platform = 'linkedin' THEN 1 END) as linkedin_shares,
    MAX(s.shared_at) as last_shared_at
FROM articles a
LEFT JOIN article_shares s ON a.id = s.article_id
WHERE a.status = 'published'
GROUP BY a.id, a.title, a.slug
ORDER BY total_shares DESC;

-- View para estatísticas por período
CREATE OR REPLACE VIEW daily_shares_stats AS
SELECT 
    DATE(shared_at) as share_date,
    platform,
    COUNT(*) as share_count
FROM article_shares
WHERE shared_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(shared_at), platform
ORDER BY share_date DESC, platform;

-- Função para buscar top artigos compartilhados em um período
CREATE OR REPLACE FUNCTION get_top_shared_articles(
    days_back INTEGER DEFAULT 30,
    limit_count INTEGER DEFAULT 10
)
RETURNS TABLE (
    article_id UUID,
    title TEXT,
    slug TEXT,
    total_shares BIGINT,
    whatsapp_shares BIGINT,
    x_shares BIGINT,
    twitter_shares BIGINT,
    facebook_shares BIGINT,
    instagram_shares BIGINT,
    threads_shares BIGINT
) 
LANGUAGE SQL
AS $$
    SELECT 
        a.id,
        a.title,
        a.slug,
        COUNT(s.id) as total_shares,
        COUNT(CASE WHEN s.platform = 'whatsapp' THEN 1 END) as whatsapp_shares,
        COUNT(CASE WHEN s.platform = 'x' THEN 1 END) as x_shares,
        COUNT(CASE WHEN s.platform = 'twitter' THEN 1 END) as twitter_shares,
        COUNT(CASE WHEN s.platform = 'facebook' THEN 1 END) as facebook_shares,
        COUNT(CASE WHEN s.platform = 'instagram' THEN 1 END) as instagram_shares,
        COUNT(CASE WHEN s.platform = 'threads' THEN 1 END) as threads_shares
    FROM articles a
    LEFT JOIN article_shares s ON a.id = s.article_id 
        AND s.shared_at >= NOW() - (days_back || ' days')::INTERVAL
    WHERE a.status = 'published'
    GROUP BY a.id, a.title, a.slug
    HAVING COUNT(s.id) > 0
    ORDER BY total_shares DESC
    LIMIT limit_count;
$$;

-- Inserir alguns dados de exemplo para teste
INSERT INTO article_shares (article_id, platform, shared_at, ip_address) 
SELECT 
    a.id,
    CASE (RANDOM() * 4)::INT
        WHEN 0 THEN 'whatsapp'
        WHEN 1 THEN 'x'
        WHEN 2 THEN 'facebook'
        WHEN 3 THEN 'instagram'
        ELSE 'threads'
    END as platform,
    NOW() - (RANDOM() * INTERVAL '30 days') as shared_at,
    '127.0.0.1'::INET as ip_address
FROM articles a
WHERE a.status = 'published'
AND EXISTS (SELECT 1 FROM articles WHERE status = 'published' LIMIT 1)
LIMIT 50;

-- Finalizado!
-- Execute este script no Supabase SQL Editor após o schema principal
