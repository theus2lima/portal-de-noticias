-- ============================================
-- ATUALIZAÇÃO DA TABELA CATEGORIES
-- Execute este SQL no Supabase SQL Editor para adicionar o campo is_active
-- ============================================

-- Adicionar coluna is_active na tabela categories se ela não existir
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'categories' 
        AND column_name = 'is_active'
    ) THEN
        ALTER TABLE categories ADD COLUMN is_active BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Atualizar registros existentes para is_active = true (se necessário)
UPDATE categories SET is_active = true WHERE is_active IS NULL;

-- Comentário
COMMENT ON COLUMN categories.is_active IS 'Define se a categoria está ativa e visível no site';
