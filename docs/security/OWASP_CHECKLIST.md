# CHECKLIST DE SEGURANÇA - OWASP TOP 10 2021
**Portal Radar Noroeste - Next.js + Vercel + Supabase**

---

## 🎯 **A01:2021 – BROKEN ACCESS CONTROL**

### Dashboard Administrativo (/admin/*)
- [ ] **Autenticação obrigatória** em todas as rotas admin
- [ ] **Verificação de role/privilégios** em cada endpoint
- [ ] **Acesso direto a APIs** protegido (sem bypass via URL)
- [ ] **Escalonamento horizontal** - usuário não acessa dados de outro usuário
- [ ] **Escalonamento vertical** - editor não acessa funções de admin
- [ ] **Logout efetivo** - invalidação de sessão/token

### Testes Específicos
```
GET /admin/users → deve retornar 401/403 sem auth
GET /api/users/[outro-user-id] → não deve retornar dados
PUT /api/articles/[id] → verificar se user pode editar apenas seus artigos
```

---

## 🎯 **A02:2021 – CRYPTOGRAPHIC FAILURES**

### Dados em Trânsito
- [ ] **HTTPS obrigatório** em produção (HSTS configurado)
- [ ] **Certificado TLS válido** e atualizado
- [ ] **Redirecionamento HTTP → HTTPS** automático
- [ ] **Cookies com Secure flag** habilitado
- [ ] **Sem mixed content** (resources HTTP em página HTTPS)

### Dados em Repouso
- [ ] **Senhas hasheadas** (bcrypt, scrypt, Argon2)
- [ ] **Tokens JWT** com tempo de expiração
- [ ] **Variáveis de ambiente** não expostas no cliente
- [ ] **Chaves de API** não commitadas no git

### Testes Específicos
```
curl -I https://radarnoroestepr.com.br → verificar headers HSTS
nslookup + SSL Labs test para certificado
Inspecionar Network tab para mixed content
```

---

## 🎯 **A03:2021 – INJECTION**

### SQL/NoSQL Injection
- [ ] **Queries parametrizadas** (Supabase client/Prisma ORM)
- [ ] **Validação de input** em todos os campos
- [ ] **Sanitização** antes de salvar no banco
- [ ] **Principle of least privilege** para usuário do banco

### Command Injection
- [ ] **Sem execução de comandos** baseada em input do usuário
- [ ] **Validação de uploads** (tipo, tamanho, conteúdo)
- [ ] **Path traversal protection** em uploads/downloads

### Testes Específicos
```
Formulários: ', ", \, ${}, {{}}
Search: ' OR 1=1 --, '; DROP TABLE--;
Upload: ../../etc/passwd, arquivo.php, .htaccess
```

---

## 🎯 **A04:2021 – INSECURE DESIGN**

### Lógica de Negócio
- [ ] **Fluxo de autenticação** bem definido
- [ ] **Rate limiting** em endpoints críticos
- [ ] **Validação no backend** (não apenas frontend)
- [ ] **Autorização granular** por recurso
- [ ] **Auditoria** de ações críticas (create, update, delete)

### Arquitetura
- [ ] **Separação frontend/backend** bem definida
- [ ] **APIs RESTful** com verbos HTTP corretos
- [ ] **Principio do menor privilégio** em todos os níveis
- [ ] **Fail secure** - erros não expõem sistema

---

## 🎯 **A05:2021 – SECURITY MISCONFIGURATION**

### Headers de Segurança HTTP
- [ ] **Content-Security-Policy (CSP)** configurado
- [ ] **X-Frame-Options:** DENY ou SAMEORIGIN
- [ ] **X-Content-Type-Options:** nosniff
- [ ] **Referrer-Policy:** strict-origin-when-cross-origin
- [ ] **Permissions-Policy** restritivo

### Configuração Next.js
- [ ] **next.config.js** com headers de segurança
- [ ] **Sem source maps** em produção
- [ ] **Error pages** personalizadas (sem stack traces)
- [ ] **CORS** configurado corretamente

### Configuração Vercel
- [ ] **Environment variables** configuradas corretamente
- [ ] **Preview deployments** protegidas se necessário
- [ ] **Domains** configurados com HTTPS

### Teste de Headers
```bash
curl -I https://radarnoroestepr.com.br
# Verificar presença de todos os headers de segurança
```

---

## 🎯 **A06:2021 – VULNERABLE COMPONENTS**

### Dependências
- [ ] **npm audit** sem vulnerabilidades críticas/altas
- [ ] **Dependabot** configurado no GitHub
- [ ] **Atualizações regulares** de dependências
- [ ] **Lock files** (package-lock.json) commitados

### Runtime
- [ ] **Node.js** em versão LTS suportada
- [ ] **Next.js** em versão estável recente
- [ ] **React** em versão suportada

### Automação
```bash
npm audit --audit-level=high
npx audit-ci --high
# Integração no CI/CD pipeline
```

---

## 🎯 **A07:2021 – IDENTIFICATION AND AUTHENTICATION**

### Gestão de Sessão
- [ ] **Tokens JWT** com tempo de vida adequado
- [ ] **Refresh tokens** implementados se necessário
- [ ] **Logout** invalida token no servidor
- [ ] **Session fixation** prevenido

### Autenticação
- [ ] **Força de senha** adequada
- [ ] **Rate limiting** em login
- [ ] **Account lockout** após tentativas falhas
- [ ] **MFA disponível** para admins

### Recuperação de Senha
- [ ] **Token temporário** para reset de senha
- [ ] **Expiração de tokens** de recuperação
- [ ] **Auditoria** de mudanças de senha

---

## 🎯 **A08:2021 – SOFTWARE AND DATA INTEGRITY**

### CI/CD Pipeline
- [ ] **Signed commits** (opcional mas recomendado)
- [ ] **Dependency verification** no build
- [ ] **Secrets management** adequado
- [ ] **Build artifacts** verificáveis

### Updates e Deploy
- [ ] **Processo de deploy** documentado
- [ ] **Rollback plan** definido
- [ ] **Health checks** após deploy
- [ ] **Monitoring** de integridade

---

## 🎯 **A09:2021 – LOGGING AND MONITORING**

### Logging
- [ ] **Logs de autenticação** (sucesso e falha)
- [ ] **Logs de autorização** (tentativas de acesso negado)
- [ ] **Logs de operações críticas** (CRUD de usuários/artigos)
- [ ] **Sem dados sensíveis** nos logs

### Monitoring
- [ ] **Alertas** para falhas críticas
- [ ] **Dashboard** de saúde do sistema
- [ ] **Retention policy** para logs
- [ ] **SIEM** ou ferramenta de análise

### Implementação Sugerida
```javascript
// Exemplo para Next.js API routes
import { createLogger } from '@/lib/logger'
const logger = createLogger('api/articles')

export default async function handler(req, res) {
  logger.info('Article creation attempt', { 
    userId: req.user?.id, 
    ip: req.ip 
  })
  // ... rest of handler
}
```

---

## 🎯 **A10:2021 – SERVER-SIDE REQUEST FORGERY (SSRF)**

### APIs Externas
- [ ] **Validação de URLs** antes de fazer requests
- [ ] **Whitelist** de domínios permitidos
- [ ] **Timeout** em requests externos
- [ ] **Sem redirecionamentos** automáticos

### Upload de Arquivos
- [ ] **Validação de tipo** de arquivo
- [ ] **Armazenamento seguro** (fora da raiz web)
- [ ] **Scan de malware** em uploads
- [ ] **Renomeação** de arquivos

---

## 🛡️ **CONFIGURAÇÕES ESPECÍFICAS NEXT.JS + VERCEL**

### next.config.js Security Headers
```javascript
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval'; style-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ]
  }
}
```

### Middleware de Autenticação
```javascript
// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Proteger rotas /admin/*
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const token = request.cookies.get('auth-token')
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
}
```

---

## 📋 **CHECKLIST DE TESTE MANUAL**

### Testes de Autenticação
- [ ] Acessar `/admin` sem login → redirecionar para `/login`
- [ ] Login com credenciais inválidas → erro apropriado
- [ ] Logout → invalidar sessão completamente
- [ ] Token expirado → requerer nova autenticação

### Testes de Autorização
- [ ] Editor tentar acessar `/admin/users` → 403 Forbidden
- [ ] Usuário tentar editar artigo de outro → 403 Forbidden
- [ ] API `/api/admin/*` sem token admin → 401/403

### Testes de Injeção
- [ ] Formulário de criação de artigo com payload SQLi
- [ ] Campo de busca com XSS payload
- [ ] Upload de arquivo malicioso

### Testes de Headers
- [ ] Verificar todos os headers de segurança
- [ ] Testar CSP com inline scripts
- [ ] Verificar HTTPS redirect

---

## 🚨 **PRIORIZAÇÃO DE CORREÇÕES**

### ⚡ **CRÍTICO** (Corrigir em 24-48h)
- Acesso não autorizado ao admin
- Injeção SQL/NoSQL
- Exposição de credenciais/secrets

### 🔴 **ALTO** (Corrigir em 1 semana)
- Headers de segurança ausentes
- Dependências vulneráveis críticas
- Falhas de autorização

### 🟡 **MÉDIO** (Corrigir em 1 mês)
- Configurações de segurança
- Logging insuficiente
- Dependências vulneráveis médias

### 🔵 **BAIXO** (Roadmap trimestral)
- Hardening adicional
- Melhorias de monitoramento
- Otimizações de performance de segurança
