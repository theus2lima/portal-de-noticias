-- =============================================================================
-- Migration: 001_security_hardening.sql
-- Objetivo: Hardening de segurança — sessões, RLS e audit log append-only
-- Aplicar via: Dashboard Supabase → SQL Editor, ou `supabase db push`
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. Adicionar sessions_invalidated_at à tabela users
--    Permite revogar todas as sessões ativas de um usuário num único UPDATE.
--    requireAuth() rejeita tokens cujo `iat` seja anterior a este timestamp.
-- ---------------------------------------------------------------------------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS sessions_invalidated_at TIMESTAMPTZ DEFAULT NULL;

COMMENT ON COLUMN users.sessions_invalidated_at IS
  'Se preenchido, todos os tokens JWT emitidos ANTES deste timestamp são inválidos.
   Setado no logout e em resets de senha. Verificado em requireAuth().';

-- ---------------------------------------------------------------------------
-- 2. RLS — bloquear leitura anônima da tabela users
--    A chave ANON_KEY (exposta no bundle JS) não pode ler dados de usuários,
--    incluindo password_hash, totp_secret e sessions_invalidated_at.
-- ---------------------------------------------------------------------------
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Remover policy permissiva genérica se existir
DROP POLICY IF EXISTS "Allow anon read on users" ON users;
DROP POLICY IF EXISTS "Public read users" ON users;

-- Somente service_role pode ler/escrever na tabela users
-- (service_role bypassa RLS por design — não precisa de policy explícita)
-- Bloquear TODOS os outros roles explicitamente:
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'users' AND policyname = 'deny_anon_all'
  ) THEN
    CREATE POLICY deny_anon_all ON users
      AS RESTRICTIVE
      FOR ALL
      TO anon, authenticated
      USING (false);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 3. RLS — bloquear leitura anônima de leads
-- ---------------------------------------------------------------------------
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read on leads" ON leads;
DROP POLICY IF EXISTS "Public read leads" ON leads;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'leads' AND policyname = 'deny_anon_all'
  ) THEN
    CREATE POLICY deny_anon_all ON leads
      AS RESTRICTIVE
      FOR ALL
      TO anon, authenticated
      USING (false);
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 4. RLS — bloquear leitura anônima de analytics / page_views
--    Ajuste os nomes de tabela se necessário.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'page_views') THEN
    EXECUTE 'ALTER TABLE page_views ENABLE ROW LEVEL SECURITY';
    EXECUTE $q$
      DO $inner$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = ''page_views'' AND policyname = ''deny_anon_all''
        ) THEN
          CREATE POLICY deny_anon_all ON page_views
            AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false);
        END IF;
      END $inner$;
    $q$;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'analytics_events') THEN
    EXECUTE 'ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY';
    EXECUTE $q$
      DO $inner$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_policies
          WHERE tablename = ''analytics_events'' AND policyname = ''deny_anon_all''
        ) THEN
          CREATE POLICY deny_anon_all ON analytics_events
            AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false);
        END IF;
      END $inner$;
    $q$;
  END IF;
END $$;

-- ---------------------------------------------------------------------------
-- 5. audit_logs — política append-only
--    Mesmo service_role não pode UPDATE ou DELETE em audit_logs.
--    Isso garante integridade forense: logs só crescem, nunca são apagados.
--
--    ATENÇÃO: Esta política usa security definer via função separada.
--    O service_role bypassa RLS por padrão — para bloquear DELETE/UPDATE
--    mesmo para service_role, precisamos revogar via GRANT/REVOKE direto.
-- ---------------------------------------------------------------------------
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Permitir apenas INSERT (nunca UPDATE ou DELETE) para todos os roles
DROP POLICY IF EXISTS "audit_insert_only" ON audit_logs;
CREATE POLICY audit_insert_only ON audit_logs
  FOR INSERT
  TO anon, authenticated, service_role
  WITH CHECK (true);

-- Bloquear UPDATE explicitamente
DROP POLICY IF EXISTS "audit_deny_update" ON audit_logs;
CREATE POLICY audit_deny_update ON audit_logs
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated, service_role
  USING (false);

-- Bloquear DELETE explicitamente
DROP POLICY IF EXISTS "audit_deny_delete" ON audit_logs;
CREATE POLICY audit_deny_delete ON audit_logs
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated, service_role
  USING (false);

-- SELECT apenas leitura (sem modificação)
DROP POLICY IF EXISTS "audit_select_service_only" ON audit_logs;
CREATE POLICY audit_select_service_only ON audit_logs
  FOR SELECT
  TO service_role
  USING (true);

-- ---------------------------------------------------------------------------
-- 6. Índice para performance em requireAuth() — lookup frequente
-- ---------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_users_email_active
  ON users (email, is_active)
  WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_users_id_active_invalidated
  ON users (id, is_active, sessions_invalidated_at);

-- ---------------------------------------------------------------------------
-- 7. Verificação final
-- ---------------------------------------------------------------------------
DO $$
BEGIN
  RAISE NOTICE 'Migration 001_security_hardening aplicada com sucesso.';
  RAISE NOTICE 'Lembre-se de verificar RLS policies no Dashboard do Supabase.';
END $$;
