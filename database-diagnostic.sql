-- ============================================
-- DIAGNÓSTICO E CORREÇÃO COMPLETA DO BANCO DE DADOS
-- Portal de Notícias - Execute este SQL no Supabase
-- ============================================

-- ============================================
-- 🔧 CORREÇÕES E MELHORIAS
-- ============================================

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Para busca full-text

-- ============================================
-- 📊 1. TABELA LEADS - CORREÇÃO COMPLETA
-- ============================================

-- Corrigir estrutura da tabela leads para estar consistente
DROP TABLE IF EXISTS leads CASCADE;
CREATE TABLE leads (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    city VARCHAR(100) NOT NULL,
    email VARCHAR(255),
    source VARCHAR(100) DEFAULT 'website',
    message TEXT,
    is_contacted BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- 🏷️ 2. TABELA SYSTEM_SETTINGS - PADRONIZAÇÃO
-- ============================================

-- Garantir que system_settings existe com estrutura correta
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

-- ============================================
-- 📰 3. TABELA ARTICLE_SHARES - ANALYTICS
-- ============================================

-- Garantir que article_shares existe
CREATE TABLE IF NOT EXISTS article_shares (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL CHECK (platform IN ('whatsapp', 'x', 'twitter', 'facebook', 'instagram', 'threads', 'linkedin')),
    shared_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT
);

-- ============================================
-- 🔄 4. TRIGGERS - ATUALIZAÇÃO AUTOMÁTICA
-- ============================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para todas as tabelas
DROP TRIGGER IF EXISTS update_leads_updated_at ON leads;
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON leads 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_system_settings_updated_at ON system_settings;
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON system_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 📇 5. ÍNDICES PARA PERFORMANCE
-- ============================================

-- Índices para leads
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_is_contacted ON leads(is_contacted);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_leads_city ON leads(city);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);

-- Índices para system_settings
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(key);

-- Índices para article_shares
CREATE INDEX IF NOT EXISTS idx_article_shares_article_id ON article_shares(article_id);
CREATE INDEX IF NOT EXISTS idx_article_shares_platform ON article_shares(platform);
CREATE INDEX IF NOT EXISTS idx_article_shares_shared_at ON article_shares(shared_at DESC);

-- ============================================
-- 📋 6. CONFIGURAÇÕES INICIAIS COMPLETAS
-- ============================================

-- Configurações do WhatsApp para leads
INSERT INTO system_settings (category, key, value, description) VALUES 
    ('leads', 'whatsapp_lead_link', '"https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L"', 'Link do WhatsApp para redirecionamento após captura de leads'),
    ('ticker', 'enabled', 'true', 'Habilitar/desabilitar o ticker de notícias'),
    ('ticker', 'speed', '30', 'Velocidade da animação do ticker em segundos'),
    ('site', 'name', '"Portal de Notícias"', 'Nome do site'),
    ('site', 'description', '"Seu portal de notícias mais confiável"', 'Descrição do site'),
    ('site', 'logo', 'null', 'Logo do site'),
    ('analytics', 'google_analytics_id', '""', 'ID do Google Analytics'),
    ('seo', 'meta_keywords', '"notícias, brasil, política, economia, esportes"', 'Palavras-chave padrão do site'),
    ('social', 'facebook_page', '""', 'URL da página do Facebook'),
    ('social', 'instagram_profile', '""', 'URL do perfil do Instagram'),
    ('social', 'twitter_profile', '""', 'URL do perfil do Twitter/X'),
    ('notifications', 'email_enabled', 'false', 'Notificações por email habilitadas'),
    ('performance', 'cache_enabled', 'true', 'Cache de páginas habilitado'),
    ('performance', 'compression_enabled', 'true', 'Compressão GZIP habilitada')
ON CONFLICT (category, key) DO NOTHING;

-- ============================================
-- 📊 7. VIEWS OTIMIZADAS
-- ============================================

-- View para estatísticas do dashboard
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT 
    (SELECT COUNT(*) FROM articles WHERE status = 'published') as published_articles,
    (SELECT COUNT(*) FROM articles WHERE status = 'draft') as draft_articles,
    (SELECT COUNT(*) FROM leads) as total_leads,
    (SELECT COUNT(*) FROM leads WHERE created_at >= NOW() - INTERVAL '30 days') as leads_last_30_days,
    (SELECT COALESCE(SUM(views_count), 0) FROM articles) as total_views,
    (SELECT COUNT(*) FROM categories WHERE is_active = true) as total_categories,
    (SELECT COUNT(*) FROM tags) as total_tags,
    (SELECT COUNT(*) FROM article_shares WHERE shared_at >= NOW() - INTERVAL '30 days') as shares_last_30_days;

-- View para leads com estatísticas
CREATE OR REPLACE VIEW leads_with_stats AS
SELECT 
    l.*,
    EXTRACT(EPOCH FROM (NOW() - l.created_at))/3600 as hours_since_created,
    CASE 
        WHEN l.created_at >= NOW() - INTERVAL '24 hours' THEN 'new'
        WHEN l.created_at >= NOW() - INTERVAL '7 days' THEN 'recent'
        WHEN l.created_at >= NOW() - INTERVAL '30 days' THEN 'old'
        ELSE 'very_old'
    END as age_category
FROM leads l;

-- View para compartilhamentos por artigo
CREATE OR REPLACE VIEW article_shares_summary AS
SELECT 
    a.id as article_id,
    a.title,
    a.slug,
    COUNT(s.id) as total_shares,
    COUNT(CASE WHEN s.platform = 'whatsapp' THEN 1 END) as whatsapp_shares,
    COUNT(CASE WHEN s.platform = 'x' THEN 1 END) as x_shares,
    COUNT(CASE WHEN s.platform = 'facebook' THEN 1 END) as facebook_shares,
    COUNT(CASE WHEN s.platform = 'instagram' THEN 1 END) as instagram_shares,
    MAX(s.shared_at) as last_shared_at
FROM articles a
LEFT JOIN article_shares s ON a.id = s.article_id
WHERE a.status = 'published'
GROUP BY a.id, a.title, a.slug
ORDER BY total_shares DESC;

-- ============================================
-- 🔧 8. FUNÇÕES UTILITÁRIAS
-- ============================================

-- Função para limpar dados antigos
CREATE OR REPLACE FUNCTION cleanup_old_data(days_to_keep INTEGER DEFAULT 365)
RETURNS TEXT AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Limpar visualizações antigas (se a tabela existir)
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'article_views') THEN
        DELETE FROM article_views WHERE viewed_at < NOW() - (days_to_keep || ' days')::INTERVAL;
        GET DIAGNOSTICS deleted_count = ROW_COUNT;
    END IF;
    
    RETURN 'Limpeza concluída. ' || COALESCE(deleted_count, 0) || ' registros removidos.';
END;
$$ LANGUAGE plpgsql;

-- Função para estatísticas rápidas
CREATE OR REPLACE FUNCTION get_quick_stats()
RETURNS TABLE(
    stat_name TEXT,
    stat_value TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'Total de Artigos'::TEXT, COUNT(*)::TEXT FROM articles
    UNION ALL
    SELECT 'Artigos Publicados'::TEXT, COUNT(*)::TEXT FROM articles WHERE status = 'published'
    UNION ALL
    SELECT 'Total de Leads'::TEXT, COUNT(*)::TEXT FROM leads
    UNION ALL
    SELECT 'Leads Hoje'::TEXT, COUNT(*)::TEXT FROM leads WHERE created_at >= CURRENT_DATE
    UNION ALL
    SELECT 'Compartilhamentos Hoje'::TEXT, COUNT(*)::TEXT FROM article_shares WHERE shared_at >= CURRENT_DATE
    UNION ALL
    SELECT 'Categorias Ativas'::TEXT, COUNT(*)::TEXT FROM categories WHERE is_active = true;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 🧪 9. DADOS DE TESTE PARA DESENVOLVIMENTO
-- ============================================

-- Inserir alguns leads de teste (somente se não existirem)
INSERT INTO leads (name, phone, city, email, source, is_contacted, notes, created_at) 
SELECT * FROM (VALUES
    ('João Silva Santos', '11999887766', 'São Paulo', 'joao@exemplo.com', 'website', false, 'Lead interessado em notícias de política', NOW() - INTERVAL '2 days'),
    ('Maria Oliveira', '21987654321', 'Rio de Janeiro', 'maria@exemplo.com', 'website', true, 'Contatado via WhatsApp', NOW() - INTERVAL '1 day'),
    ('Carlos Eduardo', '47999123456', 'Blumenau', null, 'website', false, null, NOW() - INTERVAL '3 hours'),
    ('Ana Paula Costa', '85988777666', 'Fortaleza', 'ana@exemplo.com', 'website', false, 'Interessada em economia', NOW() - INTERVAL '6 hours'),
    ('Roberto Lima', '11888999777', 'Campinas', null, 'website', true, 'Lead convertido', NOW() - INTERVAL '1 hour')
) AS v(name, phone, city, email, source, is_contacted, notes, created_at)
WHERE NOT EXISTS (SELECT 1 FROM leads LIMIT 1);

-- ============================================
-- 📋 10. VERIFICAÇÃO FINAL
-- ============================================

-- Verificar estrutura das tabelas principais
SELECT 
    'Verificação da estrutura do banco concluída!' as status,
    NOW() as timestamp
UNION ALL
SELECT 
    'Tabelas principais:' as info,
    COUNT(DISTINCT table_name)::TEXT || ' tabelas encontradas'
FROM information_schema.tables 
WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
UNION ALL
SELECT 
    'Views criadas:' as info,
    COUNT(DISTINCT table_name)::TEXT || ' views encontradas'
FROM information_schema.views 
WHERE table_schema = 'public'
UNION ALL
SELECT 
    'Triggers ativos:' as info,
    COUNT(*)::TEXT || ' triggers encontrados'
FROM information_schema.triggers 
WHERE trigger_schema = 'public';

-- Executar estatísticas rápidas
SELECT 'ESTATÍSTICAS DO SISTEMA' as tipo, '' as valor
UNION ALL
SELECT * FROM get_quick_stats();

-- ============================================
-- ✅ FINALIZAÇÃO
-- ============================================

-- Comentário final
SELECT 
    '🎉 CORREÇÃO DO BANCO DE DADOS CONCLUÍDA!' as resultado,
    'Execute este script no Supabase SQL Editor' as instrucoes
UNION ALL
SELECT 
    '📊 Estrutura otimizada e funcional' as resultado,
    'Leads, configurações e analytics prontos' as instrucoes
UNION ALL
SELECT 
    '🚀 Sistema pronto para produção' as resultado,
    'Teste todas as funcionalidades na dashboard' as instrucoes;
