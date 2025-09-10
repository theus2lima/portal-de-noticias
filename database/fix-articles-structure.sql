-- ============================================
-- VERIFICAR E CORRIGIR ESTRUTURA DA TABELA ARTICLES
-- ============================================

-- 1. Primeiro vamos ver a estrutura atual da tabela articles
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;

-- 2. Verificar se a coluna views_count existe
DO $$
BEGIN
    -- Adicionar coluna views_count se não existir
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'views_count'
    ) THEN
        ALTER TABLE articles ADD COLUMN views_count INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna views_count adicionada à tabela articles';
    ELSE
        RAISE NOTICE 'Coluna views_count já existe na tabela articles';
    END IF;
    
    -- Verificar outras colunas importantes que podem estar faltando
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'reading_time'
    ) THEN
        ALTER TABLE articles ADD COLUMN reading_time INTEGER DEFAULT 0;
        RAISE NOTICE 'Coluna reading_time adicionada à tabela articles';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'meta_title'
    ) THEN
        ALTER TABLE articles ADD COLUMN meta_title VARCHAR(300);
        RAISE NOTICE 'Coluna meta_title adicionada à tabela articles';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'meta_description'
    ) THEN
        ALTER TABLE articles ADD COLUMN meta_description VARCHAR(500);
        RAISE NOTICE 'Coluna meta_description adicionada à tabela articles';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'keywords'
    ) THEN
        ALTER TABLE articles ADD COLUMN keywords TEXT[];
        RAISE NOTICE 'Coluna keywords adicionada à tabela articles';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'articles' AND column_name = 'image_alt'
    ) THEN
        ALTER TABLE articles ADD COLUMN image_alt TEXT;
        RAISE NOTICE 'Coluna image_alt adicionada à tabela articles';
    END IF;
    
END $$;

-- 3. Ver a estrutura final da tabela
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'articles' 
ORDER BY ordinal_position;

-- 4. Criar índices se não existirem
DO $$
BEGIN
    -- Índice para views_count
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'articles' AND indexname = 'idx_articles_views_count'
    ) THEN
        CREATE INDEX idx_articles_views_count ON articles(views_count DESC);
        RAISE NOTICE 'Índice idx_articles_views_count criado';
    END IF;
    
    -- Índice para status
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'articles' AND indexname = 'idx_articles_status'
    ) THEN
        CREATE INDEX idx_articles_status ON articles(status);
        RAISE NOTICE 'Índice idx_articles_status criado';
    END IF;
    
    -- Índice para published_at
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE tablename = 'articles' AND indexname = 'idx_articles_published_at'
    ) THEN
        CREATE INDEX idx_articles_published_at ON articles(published_at DESC);
        RAISE NOTICE 'Índice idx_articles_published_at criado';
    END IF;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'ESTRUTURA DA TABELA ARTICLES VERIFICADA!';
    RAISE NOTICE '============================================';
    
END $$;
