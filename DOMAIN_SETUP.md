# 🌐 Configuração de Domínio - Radar Noroeste PR

Este guia explica como configurar o domínio `radarnoroeste.com.br` para produção e desenvolvimento.

## 📋 Resumo da Configuração

- **Desenvolvimento**: `http://localhost:3000`
- **Produção**: `https://radarnoroeste.com.br`
- **Domínio registrado**: registro.br

## 🔧 Configuração Atual

### Ambiente de Desenvolvimento (.env.local)
```bash
# Desenvolvimento - localhost
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Ambiente de Produção
```bash
# Produção - domínio real
NEXT_PUBLIC_SITE_URL=https://radarnoroeste.com.br
```

## 🚀 Deploy e Configuração do Domínio

### Passo 1: Configurar DNS no Registro.br

No painel do Registro.br:

1. **Acesse a zona DNS** do seu domínio `radarnoroeste.com.br`
2. **Configure os seguintes registros**:

**Para Vercel:**
```
Tipo: CNAME
Nome: www
Destino: cname.vercel-dns.com

Tipo: A
Nome: @
Destino: 76.76.19.61
```

**Para Netlify:**
```
Tipo: CNAME
Nome: www
Destino: your-site-name.netlify.app

Tipo: A
Nome: @
Destino: 75.2.60.5
```

### Passo 2: Deploy na Vercel

1. **Conecte seu repositório** à Vercel
2. **Configure as variáveis de ambiente**:
   ```bash
   NEXT_PUBLIC_SITE_URL=https://radarnoroeste.com.br
   NEXT_PUBLIC_SUPABASE_URL=sua_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_supabase
   JWT_SECRET=seu_jwt_secret
   ```

3. **Adicione o domínio customizado**:
   - Vá em Settings > Domains
   - Adicione `radarnoroeste.com.br`
   - Adicione `www.radarnoroeste.com.br`

### Passo 3: Configurar SSL/HTTPS

A Vercel configurará automaticamente o certificado SSL usando Let's Encrypt.

## 🔍 Verificação da Configuração

### Teste DNS
```bash
nslookup radarnoroeste.com.br
```

### Teste SSL
```bash
curl -I https://radarnoroeste.com.br
```

### Verificar Compartilhamento

1. Acesse uma notícia no site
2. Clique nos botões de compartilhamento
3. Verifique se as URLs geradas usam `https://radarnoroeste.com.br`

## ⚙️ Como a Configuração Funciona

### Detecção de Ambiente
O sistema detecta automaticamente o ambiente:

- **Desenvolvimento** (`localhost`): Usa `http://localhost:3000`
- **Produção**: Usa a variável `NEXT_PUBLIC_SITE_URL`

### ShareButtons Inteligente
- Detecta se está em localhost e ajusta URLs automaticamente
- Em produção, usa o domínio configurado
- Fallback para origin atual se necessário

### Configuração Flexível
- ✅ Desenvolvimento: localhost automático
- ✅ Produção: domínio real configurável
- ✅ Fallback: sempre funciona

## 🛠️ Troubleshooting

### Links de compartilhamento não funcionam
1. Verifique se `NEXT_PUBLIC_SITE_URL` está configurado
2. Confirme se o DNS está propagado
3. Teste a URL manualmente no navegador

### SSL não carregou
1. Aguarde até 24h para propagação DNS
2. Verifique configuração do CNAME/A records
3. Force renovação do SSL na Vercel

### Domínio não resolve
1. Verifique configuração DNS no registro.br
2. Teste com `dig radarnoroeste.com.br`
3. Confirme TTL dos registros DNS

## 📞 Suporte

- **DNS**: Suporte registro.br
- **Hospedagem**: Documentação Vercel
- **Código**: Este repositório

## ✅ Checklist de Deploy

- [ ] DNS configurado no registro.br
- [ ] Domínio adicionado na Vercel
- [ ] Variáveis de ambiente configuradas
- [ ] SSL ativo e funcionando
- [ ] Links de compartilhamento testados
- [ ] SEO/Open Graph funcionando

---

**Data da última atualização**: Janeiro 2025
**Status**: Domínio ativo e configurado ✅
