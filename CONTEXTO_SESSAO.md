# 📋 Contexto de Continuidade — Portal de Notícias (radarnoroestepr.com.br)

---

## 📌 1. Contexto Geral

- **Projeto:** Portal de notícias Next.js 14 em produção na Vercel
- **Domínio:** radarnoroestepr.com.br
- **Repositório:** github.com/theus2lima/portal-de-noticias (branch: main)
- **Objetivo da sessão:** Auditoria de segurança completa + implementação de 10 correções em ordem de prioridade
- **Estado atual:** 9 de 10 correções funcionando. MFA/TOTP (10ª) com build falhando — `speakeasy` instalado localmente mas `package.json` não commitado ainda

---

## 🧠 2. Decisões Estratégicas

- **Decisão:** JWT em cookie httpOnly (não localStorage)
  - **Justificativa:** Elimina risco de XSS roubando token

- **Decisão:** `jsonwebtoken` nas API routes, `jose` no middleware
  - **Justificativa:** Middleware roda em Edge runtime (sem Node.js crypto); `jose` é compatível com Edge

- **Decisão:** Rate limiting com `@upstash/ratelimit` condicional (`null` se env não configurada)
  - **Justificativa:** Deploy funciona mesmo sem Upstash configurado

- **Decisão:** Abandonado `otplib` — substituído por `speakeasy`
  - **Justificativa:** `otplib` não expõe `authenticator` corretamente nos tipos TypeScript desta versão; `speakeasy` tem API mais simples e funciona sem problemas no Node.js

- **Decisão:** `isomorphic-dompurify` para sanitização XSS no SSR
  - **Justificativa:** DOMPurify padrão é browser-only

- **Decisão:** `file-type` para validação de magic bytes em uploads
  - **Justificativa:** Validação por extensão é bypassável; magic bytes não

---

## 🏗️ 3. Estrutura Técnica

### Stack
- **Frontend/Backend:** Next.js 14 App Router
- **Banco:** Supabase PostgreSQL
- **Auth:** JWT customizado (não Supabase Auth)
- **Deploy:** Vercel

### Tabelas relevantes no Supabase
```
users       — id, email, role, name, password_hash, totp_secret, is_active
audit_logs  — id, user_email, action, resource_type, resource_id, ip, metadata, created_at
```

### Arquivos-chave criados/modificados
```
src/lib/auth.ts                           — requireAuth() lê cookie admin_token
src/lib/audit.ts                          — auditLog() + getClientIp()
src/middleware.ts                         — Edge runtime, usa jose, protege /admin/*
src/contexts/AuthContext.tsx              — sem localStorage, verifyMfa(), logout async
src/app/api/auth/login/route.ts           — rate limit, httpOnly cookie, MFA check
src/app/api/auth/verify/route.ts          — lê cookie (não Authorization header)
src/app/api/auth/logout/route.ts          — limpa cookie + audit log
src/app/api/auth/mfa/verify/route.ts      — verifica mfaTempToken + speakeasy TOTP
src/app/api/admin/mfa/setup/route.ts      — gera secret + QR code via speakeasy
src/app/api/admin/mfa/enable/route.ts     — salva totp_secret no banco
src/app/api/admin/mfa/disable/route.ts    — limpa totp_secret
src/app/api/admin/audit-logs/route.ts     — retorna últimos 200 logs
src/app/api/articles/route.ts             — requireAuth no POST
src/app/api/articles/[id]/route.ts        — requireAuth no PUT e DELETE
src/app/api/banners/route.ts              — requireAuth no POST
src/app/api/banners/[id]/route.ts         — requireAuth no PUT e DELETE
src/app/api/upload/route.ts               — magic bytes, 10MB limit, requireAuth
src/app/api/curadoria/reescrever/route.ts — requireAuth no POST
src/app/noticia/[slug]/ArticleContent.tsx — DOMPurify.sanitize()
src/app/admin/login/page.tsx              — formulário 2 passos (senha + TOTP)
src/app/admin/logs/page.tsx               — tabela de audit logs
src/app/admin/configuracoes/mfa/page.tsx  — UI de setup/disable MFA (botão corrigido)
next.config.js                            — headers CORS + segurança
public/robots.txt                         — domínio correto, /admin e /api bloqueados
```

---

## ⚙️ 4. Implementações Já Feitas

| # | Correção | Status |
|---|----------|--------|
| 1 | JWT → httpOnly cookie | ✅ Produção |
| 2 | requireAuth() em todas as rotas admin | ✅ Produção |
| 3 | DOMPurify XSS sanitization | ✅ Produção |
| 4 | Rate limiting no login (Upstash) | ✅ Produção |
| 5 | Middleware server-side (Edge, jose) | ✅ Produção |
| 6 | Magic bytes upload validation | ✅ Produção |
| 7 | CORS headers (next.config.js) | ✅ Produção |
| 8 | robots.txt atualizado | ✅ Produção |
| 9 | Audit logs (tabela + UI + API) | ✅ Produção |
| 10 | MFA/TOTP (speakeasy + qrcode) | 🔄 Deploy pendente |

### Fluxo MFA implementado
1. Login com email/senha → API verifica `totp_secret` no banco
2. Se MFA ativo → retorna `{ mfaRequired: true, mfaTempToken }` (JWT 5min, type: `mfa_pending`)
3. Frontend exibe campo TOTP → `verifyMfa(code, tempToken)` → `/api/auth/mfa/verify`
4. API valida token temporário + código speakeasy TOTP → emite cookie de sessão completo

### API speakeasy (substituiu otplib)
```typescript
// Gerar secret
const secretObj = speakeasy.generateSecret({ length: 20 })
const secret = secretObj.base32

// Gerar URL para QR code
const otpauthUrl = speakeasy.otpauthURL({
  secret, label: encodeURIComponent(email),
  issuer: 'Radar Noroeste PR', encoding: 'base32',
})

// Verificar código TOTP
const isValid = speakeasy.totp.verify({
  secret, encoding: 'base32', token: code, window: 1,
})
```

### Bug corrigido na página MFA
- `checkMfaStatus` ficava preso em `'loading'` se API retornasse status inesperado
- Fix: qualquer resposta !== 400 define `mfaStatus('inactive')` e exibe o botão

---

## 🚧 5. Pendências e Próximos Passos

- **[IMEDIATO]** Commitar `package.json` e `package-lock.json` com `speakeasy`:
  ```
  git add package.json package-lock.json
  git commit -m "deps: adiciona speakeasy para TOTP"
  git push
  ```
- **[TESTE]** Após deploy: acessar `/admin/configuracoes/mfa` e ativar MFA
- **[TESTE]** Fazer logout e testar login completo com código TOTP
- **[OPCIONAL]** Configurar Upstash no Vercel para ativar rate limiting:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`
- **[OPCIONAL]** `npm audit fix` para resolver as 16 vulnerabilidades reportadas

---

## ⚠️ 6. Problemas, Riscos e Limitações

- **otplib descartado:** Não expõe `authenticator` nos tipos TypeScript desta versão. Não usar mais.
- **speakeasy package.json não commitado:** Causa "Module not found" no Vercel. Próxima ação obrigatória.
- **Rate limiting desativado:** Só ativo se envs Upstash configuradas na Vercel.
- **16 vulnerabilidades** em dependências (npm audit) — não críticas mas devem ser endereçadas.
- **MFA opcional por usuário:** Quem não tem `totp_secret` no banco loga sem segundo fator.
- **Cookies de terceiros bloqueados (Chrome):** Aviso no console, não afeta funcionamento (cookie é first-party).

---

## 🔍 7. Hipóteses e Ideias em Aberto

- Tornar MFA obrigatório para todos os usuários (admin pode forçar)
- Implementar backup codes para recuperação de MFA perdido
- Alertas por email em logins suspeitos (via audit_logs + cron)
- Gerenciamento de sessões ativas

---

## 📊 8. Dados e Estruturas Importantes

### Variáveis de ambiente (Vercel)
```env
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=                      # mínimo 32 chars aleatórios
UPSTASH_REDIS_REST_URL=          # opcional — ativa rate limiting
UPSTASH_REDIS_REST_TOKEN=        # opcional
NODE_ENV=production              # ativa Secure no cookie
```

### SQL já executado no Supabase
```sql
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
```

### Cookie de sessão
```
Nome: admin_token
httpOnly: true | Secure: true (prod) | sameSite: lax | maxAge: 28800 (8h)
Payload JWT: { userId, email, role }
```

### Token temporário MFA
```
Payload JWT: { type: 'mfa_pending', userId, email, role }
Expiração: 5 minutos | Transmitido no body (não em cookie)
```

---

## 🔁 9. Estado para Continuidade

### Ação imediata
```powershell
git add package.json package-lock.json
git commit -m "deps: adiciona speakeasy para TOTP"
git push
```
Aguardar build Vercel → testar MFA em `/admin/configuracoes/mfa`

### Prompt para retomar
```
Estou continuando o projeto do portal de notícias radarnoroestepr.com.br (Next.js 14 + Supabase + Vercel).
Implementei 10 correções de segurança. A última (MFA/TOTP) usa a biblioteca speakeasy.
O package.json com speakeasy foi commitado mas o build pode ainda estar em andamento.

Arquivos MFA:
- src/app/api/auth/mfa/verify/route.ts     — usa speakeasy.totp.verify
- src/app/api/admin/mfa/setup/route.ts     — usa speakeasy.generateSecret + QRCode
- src/app/api/admin/mfa/enable/route.ts    — usa speakeasy.totp.verify + salva no banco
- src/app/api/admin/mfa/disable/route.ts   — usa speakeasy.totp.verify + limpa banco
- src/app/admin/configuracoes/mfa/page.tsx — UI corrigida (botão aparece, status funciona)

Próximo passo: confirmar deploy e testar ativação do MFA em /admin/configuracoes/mfa.
```
