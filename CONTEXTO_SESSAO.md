# 📋 Contexto de Continuidade — Portal de Notícias (radarnoroestepr.com.br)

---

## 📌 1. Contexto Geral

- **Projeto:** Portal de notícias Next.js 14 em produção na Vercel
- **Domínio:** radarnoroestepr.com.br
- **Repositório:** github.com/theus2lima/portal-de-noticias (branch: main)
- **Objetivo:** Auditoria de segurança completa + hardening assume-breach + correções adicionais
- **Estado atual:** Todas as correções implementadas e em produção. Login funcionando com MFA, RLS ativo, sessões revogáveis, audit trail completo.

---

## 🧠 2. Decisões Estratégicas

- **Decisão:** JWT em cookie httpOnly (não localStorage)
  - **Justificativa:** Elimina risco de XSS roubando token

- **Decisão:** `jsonwebtoken` nas API routes, `jose` no middleware
  - **Justificativa:** Middleware roda em Edge runtime (sem Node.js crypto); `jose` é compatível com Edge

- **Decisão:** Rate limiting com `@upstash/ratelimit` condicional (`null` se env não configurada)
  - **Justificativa:** Deploy funciona mesmo sem Upstash configurado

- **Decisão:** `speakeasy` para TOTP (substituiu `otplib`)
  - **Justificativa:** `otplib` não expõe `authenticator` corretamente nos tipos TypeScript desta versão

- **Decisão:** `isomorphic-dompurify` para sanitização XSS no SSR
  - **Justificativa:** DOMPurify padrão é browser-only

- **Decisão:** `file-type` para validação de magic bytes em uploads
  - **Justificativa:** Validação por extensão é bypassável; magic bytes não

- **Decisão:** service_role para todas as queries na tabela `users`
  - **Justificativa:** RLS bloqueia leitura anônima de `users`; anon key está exposta no bundle JS

- **Decisão:** `sessions_invalidated_at` para revogação de sessão no logout
  - **Justificativa:** Simples, sem necessidade de blocklist JTI; logout invalida todos os tokens anteriores

- **Decisão:** TOTP anti-replay via Redis (TTL 90s)
  - **Justificativa:** Sem proteção, o mesmo código TOTP poderia ser reutilizado dentro da janela de 30s

---

## 🏗️ 3. Estrutura Técnica

### Stack
- **Frontend/Backend:** Next.js 14 App Router
- **Banco:** Supabase PostgreSQL
- **Auth:** JWT customizado (não Supabase Auth)
- **Cache/Rate limit:** Upstash Redis
- **Deploy:** Vercel (nodejs22.x)

### Tabelas relevantes no Supabase
```
users       — id, email, role, name, password_hash, totp_secret, is_active, sessions_invalidated_at
audit_logs  — id, user_email, action, resource_type, resource_id, ip, metadata, created_at
landing_pages, leads, ticker_items, system_settings, articles, banners, tags, article_tags
```

### Arquivos-chave criados/modificados
```
src/lib/auth.ts                           — requireAuth() fail-closed: verifica is_active + sessions_invalidated_at via service_role
src/lib/audit.ts                          — auditLog() + getClientIp() + 18 tipos de ação
src/lib/ssrf.ts                           — validateExternalUrl() + SsrfBlockedError
src/middleware.ts                         — Edge runtime, usa jose, protege /admin/*
src/contexts/AuthContext.tsx              — LoginResult com rateLimited, retryAfter, remaining
src/app/api/auth/login/route.ts           — service_role, rate limit, MFA check, audit LOGIN_FAILED
src/app/api/auth/verify/route.ts          — service_role (RLS bloqueia anon em users)
src/app/api/auth/logout/route.ts          — seta sessions_invalidated_at + limpa cookie + audit
src/app/api/auth/mfa/verify/route.ts      — anti-replay TOTP via Redis + speakeasy
src/app/api/admin/mfa/setup/route.ts      — gera secret + QR code via speakeasy
src/app/api/admin/mfa/enable/route.ts     — salva totp_secret no banco
src/app/api/admin/mfa/disable/route.ts    — limpa totp_secret + audit DISABLE_MFA
src/app/api/admin/audit-logs/route.ts     — retorna últimos 200 logs
src/app/api/admin/users/route.ts          — service_role, requireAuth, audit CREATE_USER
src/app/api/admin/users/[id]/route.ts     — service_role, requireAuth, audit UPDATE_USER/DELETE_USER/CHANGE_ROLE
src/app/api/articles/route.ts             — requireAuth POST, author_id=auth.userId, sem console.logs
src/app/api/articles/[id]/route.ts        — requireAuth PUT/DELETE/PATCH, audit log
src/app/api/landing-pages/route.ts        — requireAuth, audit CREATE_LANDING_PAGE
src/app/api/landing-pages/[id]/route.ts   — requireAuth, audit UPDATE/DELETE_LANDING_PAGE
src/app/api/settings/route.ts             — requireAuth POST/PUT, audit UPDATE_SETTINGS
src/app/api/whatsapp-settings/route.ts    — requireAuth PUT, audit UPDATE_WHATSAPP_SETTINGS
src/app/api/curadoria/reescrever/route.ts — SSRF validation + requireAuth
src/app/api/news-collector/route.ts       — SSRF validation
src/app/admin/login/page.tsx              — aviso de tentativas restantes + contador de bloqueio
next.config.js                            — CSP admin strict / public permissive + Permissions-Policy
supabase/migrations/001_security_hardening.sql — sessions_invalidated_at, RLS, append-only audit_logs
```

---

## ⚙️ 4. Implementações Já Feitas

### Fase 1 — Correções básicas (sessão anterior)
| # | Correção | Status |
|---|----------|--------|
| 1 | JWT → httpOnly cookie | ✅ Produção |
| 2 | requireAuth() em todas as rotas admin | ✅ Produção |
| 3 | DOMPurify XSS sanitization | ✅ Produção |
| 4 | Rate limiting no login (Upstash) | ✅ Produção |
| 5 | Middleware server-side (Edge, jose) | ✅ Produção |
| 6 | Magic bytes upload validation | ✅ Produção |
| 7 | CORS / security headers (next.config.js) | ✅ Produção |
| 8 | robots.txt atualizado | ✅ Produção |
| 9 | Audit logs (tabela + UI + API) | ✅ Produção |
| 10 | MFA/TOTP (speakeasy + qrcode) | ✅ Produção |

### Fase 2 — Hardening assume-breach (esta sessão)
| # | Correção | Status |
|---|----------|--------|
| 11 | SSRF protection (lib/ssrf.ts) em reescrever + news-collector | ✅ Produção |
| 12 | Unificar auth admin/users para cookie-based (remover Bearer) | ✅ Produção |
| 13 | Content-Security-Policy (admin strict, público permissivo) | ✅ Produção |
| 14 | Migration SQL: sessions_invalidated_at + RLS + audit append-only | ✅ Produção |
| 15 | requireAuth() fail-closed com DB check (is_active + sessions_invalidated_at) | ✅ Produção |
| 16 | Logout invalida sessão via sessions_invalidated_at | ✅ Produção |
| 17 | Anti-replay TOTP via Redis (TTL 90s) | ✅ Produção |
| 18 | Expandir tipos de ação no audit log (8 novos tipos) | ✅ Produção |
| 19 | Audit logs faltantes: users, settings, whatsapp, mfa/disable, landing-pages | ✅ Produção |
| 20 | Login usa service_role (RLS bloqueia anon em users) | ✅ Produção |
| 21 | PATCH /api/articles/[id] agora requer autenticação | ✅ Produção |
| 22 | author_id hardcoded → auth.userId | ✅ Produção |
| 23 | Remover console.logs com dados sensíveis em articles | ✅ Produção |
| 24 | Audit logs em landing-pages (POST, PUT, DELETE) | ✅ Produção |
| 25 | /api/auth/verify usa service_role (corrige logout após MFA) | ✅ Produção |
| 26 | admin/users usa service_role (corrige listagem/criação de usuários) | ✅ Produção |
| 27 | Aviso de tentativas restantes + contador de bloqueio na tela de login | ✅ Produção |

---

## 🔐 5. Fluxos de Autenticação

### Login sem MFA
1. POST /api/auth/login (service_role busca user + bcrypt)
2. Cookie `admin_token` (JWT 8h, httpOnly, Secure, SameSite=lax)
3. requireAuth() em cada rota: verifica JWT + is_active + sessions_invalidated_at via service_role

### Login com MFA
1. POST /api/auth/login → retorna `{ mfaRequired: true, mfaTempToken }` (JWT 5min)
2. Frontend exibe campo TOTP
3. POST /api/auth/mfa/verify → valida mfaTempToken + código speakeasy + anti-replay Redis
4. Cookie de sessão completo emitido

### Logout
1. POST /api/auth/logout → seta `sessions_invalidated_at = NOW()` no banco (service_role)
2. Cookie `admin_token` zerado (maxAge: 0)
3. Tokens emitidos antes do logout são rejeitados pelo requireAuth()

### Anti-replay TOTP
- Redis key: `totp_replay:{userId}:{code}`, TTL 90s
- Rejeita reutilização do mesmo código na mesma janela

### Rate limiting (login)
- 5 tentativas / 15 min / IP (Upstash sliding window)
- Frontend mostra: aviso amarelo (≤3 tentativas restantes), bloqueio vermelho com countdown

---

## ⚠️ 6. Regras críticas — NUNCA violar

- **Toda query em `users` deve usar service_role** — RLS bloqueia anon. Rotas afetadas: login, verify, requireAuth, admin/users
- **requireAuth() é fail-closed** — qualquer erro de I/O retorna 401, nunca assume válido
- **audit_logs é append-only** — RLS bloqueia UPDATE e DELETE mesmo para service_role
- **SSRF validation** obrigatória antes de qualquer `fetch()` com URL externa
- **JWT_SECRET** nunca pode ter fallback hardcoded — lança exceção se ausente

---

## 📊 7. Variáveis de Ambiente (Vercel)

```env
NEXT_PUBLIC_SUPABASE_URL=          # URL do projeto Supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=     # Chave anon (pública, apenas para tabelas sem RLS restritivo)
SUPABASE_SERVICE_ROLE_KEY=         # Chave service_role (secreta, nunca no bundle)
JWT_SECRET=                        # Mínimo 64 chars aleatórios (node -e "crypto.randomBytes(64).toString('hex')")
UPSTASH_REDIS_REST_URL=            # Ativa rate limiting + anti-replay TOTP
UPSTASH_REDIS_REST_TOKEN=          # Token Upstash
NEXT_PUBLIC_SITE_URL=              # URL pública do portal
GROQ_API_KEY=                      # IA para reescrita de artigos
OPENAI_API_KEY=                    # Alternativa IA
GEMINI_API_KEY=                    # Alternativa IA
```

---

## 🗄️ 8. SQL já executado no Supabase

```sql
-- Sessão anterior
ALTER TABLE users ADD COLUMN IF NOT EXISTS totp_secret TEXT;

CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email TEXT,
  action TEXT NOT NULL,
  resource_type TEXT,
  resource_id TEXT,
  ip TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Esta sessão (supabase/migrations/001_security_hardening.sql)
ALTER TABLE users ADD COLUMN IF NOT EXISTS sessions_invalidated_at TIMESTAMPTZ DEFAULT NULL;

-- RLS em users (bloqueia anon e authenticated — service_role bypassa por padrão)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_anon_all ON users AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false);

-- RLS em leads
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY deny_anon_all ON leads AS RESTRICTIVE FOR ALL TO anon, authenticated USING (false);

-- audit_logs append-only
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY audit_insert_only ON audit_logs FOR INSERT TO anon, authenticated, service_role WITH CHECK (true);
CREATE POLICY audit_deny_update ON audit_logs AS RESTRICTIVE FOR UPDATE TO anon, authenticated, service_role USING (false);
CREATE POLICY audit_deny_delete ON audit_logs AS RESTRICTIVE FOR DELETE TO anon, authenticated, service_role USING (false);
CREATE POLICY audit_select_service_only ON audit_logs FOR SELECT TO service_role USING (true);
```

---

## 🔍 9. Hipóteses e Ideias em Aberto

- Tornar MFA obrigatório para todos os usuários (admin pode forçar)
- Implementar backup codes para recuperação de MFA perdido
- Alertas por email em logins suspeitos (via audit_logs + scheduled task)
- Gerenciamento de sessões ativas (listar e revogar individualmente)
- npm audit fix (vulnerabilidades em dependências)

---

## 🔁 10. Prompt para Retomar

```
Estou continuando o projeto do portal de notícias radarnoroestepr.com.br
(Next.js 14 + Supabase + Vercel). Todas as correções de segurança foram implementadas
e estão em produção. O login funciona com MFA (speakeasy), sessões revogáveis via
sessions_invalidated_at, RLS bloqueando anon em users/leads/audit_logs, e audit trail
completo cobrindo todas as operações sensíveis.

Arquivos críticos de auth:
- src/lib/auth.ts          — requireAuth() fail-closed (DB check: is_active + sessions_invalidated_at)
- src/lib/audit.ts         — auditLog() + 18 tipos de ação
- src/lib/ssrf.ts          — validateExternalUrl() para URLs externas
- src/app/api/auth/login   — service_role, rate limit, MFA, audit
- src/app/api/auth/verify  — service_role (RLS bloqueia anon)
- src/app/api/auth/logout  — invalida sessions_invalidated_at + cookie

Regra crítica: toda query em users usa service_role (não createClient() anon).
Migration aplicada: supabase/migrations/001_security_hardening.sql
```
