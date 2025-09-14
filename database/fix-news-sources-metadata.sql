-- ============================================
-- CORREÇÃO: Adicionar coluna metadata à tabela news_sources
-- ============================================

-- Adicionar coluna metadata se não existir
ALTER TABLE news_sources 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Adicionar descrição se não existir
ALTER TABLE news_sources 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Adicionar intervalo de crawling se não existir (já existe como fetch_frequency)
ALTER TABLE news_sources 
ADD COLUMN IF NOT EXISTS crawl_interval INTEGER;

-- Atualizar registros existentes com metadata vazio
UPDATE news_sources 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;

-- Atualizar intervalo de crawling baseado no fetch_frequency existente
UPDATE news_sources 
SET crawl_interval = COALESCE(fetch_frequency / 3600, 1) 
WHERE crawl_interval IS NULL;

-- Verificar se as colunas foram criadas
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'news_sources' 
    AND column_name IN ('metadata', 'description', 'crawl_interval')
ORDER BY column_name;

-- Mostrar resultado final
SELECT 'CORREÇÃO APLICADA: Colunas metadata, description e crawl_interval adicionadas à tabela news_sources' as status;
