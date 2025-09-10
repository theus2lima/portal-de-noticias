-- ============================================
-- SCRIPT DE VERIFICAÇÃO E MIGRAÇÃO SEGURA
-- ============================================
-- Este script verifica o que já existe e só adiciona o que está faltando

-- 1. VERIFICAR ESTRUTURA ATUAL
DO $$
DECLARE
    table_count INTEGER;
    user_count INTEGER;
    category_count INTEGER;
BEGIN
    -- Verificar se as tabelas principais existem
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name IN ('articles', 'categories', 'users', 'system_settings');
    
    RAISE NOTICE 'Tabelas principais encontradas: %', table_count;
    
    -- Verificar se há usuários
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        SELECT COUNT(*) INTO user_count FROM users;
        RAISE NOTICE 'Usuários encontrados: %', user_count;
    ELSE
        RAISE NOTICE 'Tabela users não existe ainda';
    END IF;
    
    -- Verificar se há categorias
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        SELECT COUNT(*) INTO category_count FROM categories;
        RAISE NOTICE 'Categorias encontradas: %', category_count;
    ELSE
        RAISE NOTICE 'Tabela categories não existe ainda';
    END IF;
END $$;

-- 2. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 3. VERIFICAR E CRIAR COLUNAS FALTANTES (apenas se as tabelas existirem)
DO $$
BEGIN
    -- Adicionar colunas faltantes na tabela users (se existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        -- Verificar e adicionar email_verified
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'email_verified') THEN
            ALTER TABLE users ADD COLUMN email_verified BOOLEAN DEFAULT false;
            RAISE NOTICE 'Adicionada coluna email_verified à tabela users';
        END IF;
        
        -- Verificar e adicionar last_login
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'last_login') THEN
            ALTER TABLE users ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;
            RAISE NOTICE 'Adicionada coluna last_login à tabela users';
        END IF;
    END IF;

    -- Adicionar colunas faltantes na tabela categories (se existir)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'sort_order') THEN
            ALTER TABLE categories ADD COLUMN sort_order INTEGER DEFAULT 0;
            RAISE NOTICE 'Adicionada coluna sort_order à tabela categories';
        END IF;
    END IF;
END $$;

-- 4. VERIFICAR SE PRECISA CRIAR USUÁRIO ADMIN
DO $$
DECLARE
    admin_exists BOOLEAN := FALSE;
BEGIN
    -- Só criar admin se a tabela users existir e não houver admin
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        SELECT EXISTS(SELECT 1 FROM users WHERE email = 'admin@portalnoticias.com.br') INTO admin_exists;
        
        IF NOT admin_exists THEN
            -- Usar hash da senha "admin123"
            INSERT INTO users (id, email, password_hash, name, role, bio, is_active, email_verified) 
            VALUES (
                '00000000-0000-0000-0000-000000000001'::UUID,
                'admin@portalnoticias.com.br',
                '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.',
                'Administrador',
                'admin',
                'Administrador do Portal de Notícias',
                true,
                true
            );
            RAISE NOTICE 'Usuário admin criado com sucesso! Email: admin@portalnoticias.com.br | Senha: admin123';
        ELSE
            RAISE NOTICE 'Usuário admin já existe, pulando criação';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela users não existe, não é possível criar admin';
    END IF;
END $$;

-- 5. VERIFICAR E CRIAR CATEGORIAS BÁSICAS
DO $$
DECLARE
    categories_exist BOOLEAN := FALSE;
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        SELECT EXISTS(SELECT 1 FROM categories LIMIT 1) INTO categories_exist;
        
        IF NOT categories_exist THEN
            INSERT INTO categories (id, name, slug, description, color, icon, is_active) VALUES 
                ('11111111-1111-1111-1111-111111111111'::UUID, 'Política', 'politica', 'Notícias sobre política nacional e local', '#DC2626', 'Vote', true),
                ('22222222-2222-2222-2222-222222222222'::UUID, 'Economia', 'economia', 'Economia, finanças e mercado', '#059669', 'DollarSign', true),
                ('33333333-3333-3333-3333-333333333333'::UUID, 'Esportes', 'esportes', 'Esportes nacionais e internacionais', '#DC2626', 'Trophy', true),
                ('44444444-4444-4444-4444-444444444444'::UUID, 'Cultura', 'cultura', 'Arte, cultura e entretenimento', '#7C3AED', 'Palette', true),
                ('55555555-5555-5555-5555-555555555555'::UUID, 'Cidades', 'cidades', 'Notícias das cidades e regiões', '#0EA5E9', 'Building', true),
                ('66666666-6666-6666-6666-666666666666'::UUID, 'Tecnologia', 'tecnologia', 'Inovação e tecnologia', '#3B82F6', 'Laptop', true)
            ON CONFLICT (slug) DO NOTHING;
            RAISE NOTICE 'Categorias criadas com sucesso!';
        ELSE
            RAISE NOTICE 'Já existem categorias, pulando criação';
        END IF;
    ELSE
        RAISE NOTICE 'Tabela categories não existe, não é possível criar categorias';
    END IF;
END $$;

-- 6. VERIFICAR CONFIGURAÇÕES DO SISTEMA
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'system_settings') THEN
        -- Inserir configurações básicas se não existirem
        INSERT INTO system_settings (category, key, value, description) VALUES 
            ('site', 'title', '"Portal de Notícias"', 'Título do site'),
            ('site', 'description', '"Seu portal de notícias confiável"', 'Descrição do site'),
            ('ticker', 'enabled', 'true', 'Ticker de notícias habilitado'),
            ('ticker', 'speed', '50', 'Velocidade do ticker (px/s)')
        ON CONFLICT (category, key) DO NOTHING;
        RAISE NOTICE 'Configurações do sistema verificadas/criadas';
    ELSE
        RAISE NOTICE 'Tabela system_settings não existe ainda';
    END IF;
END $$;

-- 7. RELATÓRIO FINAL DO QUE FOI ENCONTRADO
DO $$
DECLARE
    report TEXT := '';
    table_name TEXT;
    record_count INTEGER;
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE 'RELATÓRIO FINAL - ESTRUTURA DO BANCO';
    RAISE NOTICE '============================================';
    
    -- Verificar cada tabela importante
    FOR table_name IN 
        SELECT t.table_name 
        FROM information_schema.tables t 
        WHERE t.table_schema = 'public' 
        AND t.table_name IN ('users', 'categories', 'articles', 'system_settings', 'leads', 'tags')
        ORDER BY t.table_name
    LOOP
        EXECUTE format('SELECT COUNT(*) FROM %I', table_name) INTO record_count;
        RAISE NOTICE '% : % registros', UPPER(table_name), record_count;
    END LOOP;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'VERIFICAÇÃO CONCLUÍDA COM SUCESSO!';
    RAISE NOTICE '============================================';
END $$;
