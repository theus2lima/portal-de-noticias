# PROMPT TÉCNICO PARA TESTES DE SEGURANÇA INICIAIS
**Reconhecimento Passivo e Coleta de Asset Inventory**

---

## ⚠️ **PREREQUISITOS OBRIGATÓRIOS**

**ANTES DE EXECUTAR QUALQUER COMANDO:**

1. ✅ **Carta de Autorização** assinada
2. ✅ **Backup completo** do sistema realizado  
3. ✅ **Contato de emergência** disponível
4. ✅ **Janela de teste** aprovada

**🚨 SEM AUTORIZAÇÃO = CRIME FEDERAL 🚨**

---

## 🔍 **FASE 1: RECONHECIMENTO PASSIVO**

### Objetivo: Mapear superfície de ataque sem interagir diretamente

### A. Descoberta de Ativos
```bash
# 1. Verificar domínios e subdomínios (SEM ferramentas agressivas)
nslookup radarnoroestepr.com.br
nslookup portal-de-noticias-navy.vercel.app

# 2. Informações DNS básicas
dig radarnoroestepr.com.br ANY
dig portal-de-noticias-navy.vercel.app ANY

# 3. Verificar certificado SSL (informações passivas)
echo | openssl s_client -connect radarnoroestepr.com.br:443 -servername radarnoroestepr.com.br 2>/dev/null | openssl x509 -noout -text
```

### B. Headers HTTP (Reconhecimento Passivo)
```bash
# Verificar headers de segurança
curl -I -s https://radarnoroestepr.com.br
curl -I -s https://portal-de-noticias-navy.vercel.app

# Verificar redirect HTTP -> HTTPS
curl -I -s http://radarnoroestepr.com.br
curl -I -s http://portal-de-noticias-navy.vercel.app
```

### C. Tecnologias Utilizadas
```bash
# Detectar tecnologias (passive fingerprinting)
curl -s https://radarnoroestepr.com.br | grep -i "generator\|framework\|next.js\|react"
curl -s https://portal-de-noticias-navy.vercel.app | grep -i "generator\|framework\|next.js\|react"
```

---

## 📋 **FASE 2: INVENTORY DE ENDPOINTS**

### A. Mapeamento de Rotas (Manual - Não Automatizado)
**⚠️ Fazer manualmente para não sobrecarregar o servidor**

#### Rotas Públicas (Verificar se existem):
```
GET https://radarnoroestepr.com.br/
GET https://radarnoroestepr.com.br/noticias
GET https://radarnoroestepr.com.br/categoria/[categoria]
GET https://radarnoroestepr.com.br/noticia/[slug]
GET https://radarnoroestepr.com.br/buscar
GET https://radarnoroestepr.com.br/rss
GET https://radarnoroestepr.com.br/sitemap.xml
```

#### Rotas Admin (Verificar se redirecionam para login):
```
GET https://portal-de-noticias-navy.vercel.app/admin
GET https://portal-de-noticias-navy.vercel.app/admin/dashboard  
GET https://portal-de-noticias-navy.vercel.app/admin/articles
GET https://portal-de-noticias-navy.vercel.app/admin/users
GET https://portal-de-noticias-navy.vercel.app/admin/categories
```

#### APIs (Verificar resposta sem auth):
```
GET https://portal-de-noticias-navy.vercel.app/api/articles
GET https://portal-de-noticias-navy.vercel.app/api/categories  
GET https://portal-de-noticias-navy.vercel.app/api/auth/verify
GET https://portal-de-noticias-navy.vercel.app/api/dashboard/stats
```

### B. Teste Manual de Cada Endpoint
**Para cada endpoint, documentar:**
- Status code retornado (200, 401, 403, 404, 500)
- Headers de resposta
- Se retorna dados sensíveis
- Se requer autenticação
- Tipo de conteúdo (JSON, HTML, etc.)

---

## 🛡️ **FASE 3: ANÁLISE DE HEADERS DE SEGURANÇA**

### Script para Verificação Completa
```bash
#!/bin/bash
# security_headers_check.sh

check_headers() {
  local url=$1
  echo "=== Verificando headers de segurança para $url ==="
  
  # Fazer requisição e salvar headers
  headers=$(curl -I -s "$url")
  
  echo "Headers recebidos:"
  echo "$headers"
  echo ""
  
  # Verificar headers específicos
  echo "Análise de headers de segurança:"
  
  if echo "$headers" | grep -i "strict-transport-security" > /dev/null; then
    echo "✅ HSTS configurado"
  else
    echo "❌ HSTS ausente"
  fi
  
  if echo "$headers" | grep -i "x-frame-options" > /dev/null; then
    echo "✅ X-Frame-Options configurado"
  else
    echo "❌ X-Frame-Options ausente"
  fi
  
  if echo "$headers" | grep -i "x-content-type-options" > /dev/null; then
    echo "✅ X-Content-Type-Options configurado"  
  else
    echo "❌ X-Content-Type-Options ausente"
  fi
  
  if echo "$headers" | grep -i "content-security-policy" > /dev/null; then
    echo "✅ CSP configurado"
  else
    echo "❌ CSP ausente"
  fi
  
  if echo "$headers" | grep -i "referrer-policy" > /dev/null; then
    echo "✅ Referrer-Policy configurado"
  else
    echo "❌ Referrer-Policy ausente"
  fi
  
  echo "==========================================\n"
}

# Executar verificação
check_headers "https://radarnoroestepr.com.br"
check_headers "https://portal-de-noticias-navy.vercel.app"
```

---

## 📊 **FASE 4: VERIFICAÇÃO DE DEPENDÊNCIAS**

### A. Análise do Package.json (Se disponível publicamente)
```bash
# Verificar se package.json é acessível (NÃO deve ser)
curl -s https://portal-de-noticias-navy.vercel.app/package.json
curl -s https://radarnoroestepr.com.br/package.json

# Verificar outros arquivos sensíveis que NÃO devem estar expostos
curl -s https://portal-de-noticias-navy.vercel.app/.env
curl -s https://portal-de-noticias-navy.vercel.app/.env.local  
curl -s https://portal-de-noticias-navy.vercel.app/next.config.js
```

### B. Análise Client-Side (DevTools)
**Manual no browser:**
1. Abrir DevTools (F12)
2. Na aba **Network**, analisar requests:
   - APIs chamadas no load inicial
   - Tokens expostos em headers
   - Dados sensíveis em responses
3. Na aba **Sources**, verificar:
   - Source maps em produção (não devem existir)
   - Arquivos JS com secrets/keys
4. Na aba **Application**:
   - LocalStorage/SessionStorage com dados sensíveis
   - Cookies com flags de segurança

---

## 🔒 **FASE 5: TESTES BÁSICOS DE CONFIGURAÇÃO**

### A. Teste de Force HTTPS
```bash
# Verificar se HTTP redireciona para HTTPS
curl -I -L http://radarnoroestepr.com.br
curl -I -L http://portal-de-noticias-navy.vercel.app

# Verificar se HTTPS é forçado
curl -I --insecure http://radarnoroestepr.com.br
```

### B. Teste de Rate Limiting Básico
**⚠️ CUIDADO: Fazer apenas 3-5 requests por minuto**
```bash
# Teste muito básico de rate limiting (SEM flood)
for i in {1..5}; do
  echo "Request $i:"
  curl -w "%{http_code} - %{time_total}s\n" -s -o /dev/null https://portal-de-noticias-navy.vercel.app/api/articles
  sleep 10  # Aguardar 10 segundos entre requests
done
```

---

## 📝 **TEMPLATE DE DOCUMENTAÇÃO**

### Para cada descoberta, documentar:

```markdown
## ENDPOINT: [URL]

### Status: [200/401/403/404/500]

### Headers de Resposta:
```
[Cole os headers aqui]
```

### Análise:
- **Autenticação necessária:** [Sim/Não]  
- **Dados sensíveis expostos:** [Sim/Não/Detalhes]
- **Headers de segurança:** [Lista dos presentes/ausentes]
- **Vulnerabilidade potencial:** [Descrição se houver]

### Recomendação:
[Se aplicável]
```

---

## 🚨 **ALERTAS E LIMITES**

### ⚡ **PARE IMEDIATAMENTE SE:**
- Servidor retornar muitos errors 500
- Rate limiting ativo (429 responses)  
- Qualquer indício de instabilidade
- Dados de usuários reais forem expostos

### 📞 **CONTATE EMERGÊNCIA SE:**
- Encontrar credenciais/secrets expostos
- Vulnerabilidade crítica confirmada
- Acesso não autorizado possível
- Qualquer coisa que exponha dados pessoais

### ⏰ **CRONOMETRAGEM:**
- **Reconnaissance:** Máximo 2 horas
- **Headers Check:** Máximo 30 minutos  
- **Endpoint Discovery:** Máximo 1 hora
- **Documentation:** Máximo 1 hora

**TOTAL MÁXIMO FASE INICIAL: 4,5 horas**

---

## 📋 **CHECKLIST DE ENTREGA**

Ao final desta fase, entregar:

- [ ] **Lista completa de endpoints** encontrados
- [ ] **Análise de headers** de segurança  
- [ ] **Tecnologias identificadas** e versões (se possível)
- [ ] **Vulnerabilidades evidentes** encontradas (se houver)
- [ ] **Recomendações iniciais** de segurança
- [ ] **Log de todas as atividades** realizadas

---

## ⚖️ **DISCLAIMER LEGAL**

Este documento pressupõe:
✅ Autorização legal expressa por escrito  
✅ Escopo claramente definido  
✅ Responsabilidade civil acordada  
✅ Contatos de emergência disponíveis  

**Executar sem autorização é CRIME conforme:**
- Lei 12.737/2012 (Lei Carolina Dieckmann)  
- Art. 154-A do Código Penal
- Marco Civil da Internet

🛡️ **Use com responsabilidade e apenas com autorização adequada.**
