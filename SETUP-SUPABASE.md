# 🚀 **GUIA DE CONFIGURAÇÃO - SUPABASE DATABASE**

## ⚡ **Setup Rápido (5 minutos)**

### **📋 Pré-requisitos:**
- ✅ Conta no Supabase (gratuito): https://supabase.com
- ✅ Arquivo `.env.local` já configurado

---

## **🔧 PASSO 1: Configurar Supabase**

### **1.1 Criar Projeto no Supabase**
1. Acesse https://supabase.com
2. Faça login ou crie uma conta gratuita
3. Clique em **"New Project"**
4. Configure:
   - **Name:** Portal de Notícias  
   - **Database Password:** (anote essa senha!)
   - **Region:** South America (São Paulo)
5. Clique em **"Create new project"**
6. ⏳ Aguarde ~2 minutos para o projeto ser criado

### **1.2 Obter Credenciais**
1. No painel do projeto, vá em **Settings** > **API**
2. Copie as seguintes informações:
   - **Project URL** (algo como: `https://abc123.supabase.co`)
   - **anon public key** (chave longa que começa com `eyJ...`)

### **1.3 Atualizar .env.local**
Abra o arquivo `.env.local` e verifique se as credenciais estão corretas:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://apcmpsdpocspfwxfvhnh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=portal-noticias-super-secret-key-2024
NEXT_PUBLIC_APP_URL=https://radarnoroestepr.com.br
```

---

## **🗄️ PASSO 2: Criar Estrutura do Banco**

### **2.1 Executar Script SQL**
1. No Supabase, vá para **SQL Editor**
2. Clique em **"New query"**
3. Cole TODO o conteúdo do arquivo `database-schema.sql`
4. Clique em **"Run"** (botão play ▶️)
5. ✅ Aguarde a mensagem **"Success. No rows returned"**

### **2.2 Verificar Tabelas Criadas**
Vá para **Table Editor** e confirme que essas tabelas foram criadas:

- ✅ `categories` (5 categorias pré-criadas)
- ✅ `users` (1 admin pré-criado)  
- ✅ `articles` (vazio - para suas notícias)
- ✅ `leads` (vazio - para formulário de contato)
- ✅ `tags` (20+ tags pré-criadas)
- ✅ `article_tags` (relacionamento)
- ✅ `comments` (para futuros comentários)
- ✅ `article_views` (analytics)
- ✅ `system_settings` (configurações do sistema)
- ✅ `ticker_items` (itens do ticker de notícias)

---

## **🔑 PASSO 3: Dados de Acesso**

### **Admin Padrão:**
- **Email:** `admin@portalnoticias.com.br`
- **Senha:** `123456`
- **Role:** Administrador

### **Categorias Pré-criadas:**
- 🏛️ Política (azul escuro)
- 💰 Economia (verde)  
- 🏆 Esportes (verde claro)
- 🎨 Cultura (azul claro)
- 🏙️ Cidades (verde escuro)

---

## **🧪 PASSO 4: Testar Configuração**

### **4.1 Teste Local**
```bash
npm run dev
```

### **4.2 Verificações:**
1. ✅ Acesse http://localhost:3000/admin
2. ✅ Faça login com admin@portalnoticias.com.br / 123456
3. ✅ Dashboard deve mostrar estatísticas funcionando
4. ✅ O aviso amarelo "Supabase não configurado" deve sumir
5. ✅ Teste criar um artigo em `/admin/articles/new`

---

## **🚀 PASSO 5: Deploy em Produção**

### **5.1 Vercel/Netlify - Variáveis de Ambiente:**
Configure essas variáveis no seu provedor de deploy:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua-url-do-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
JWT_SECRET=seu-jwt-secret-seguro
NEXT_PUBLIC_APP_URL=https://seu-dominio.com.br
```

### **5.2 Executar SQL no Banco de Produção:**
Execute o mesmo `database-schema.sql` no banco de produção.

---

## **🛠️ TROUBLESHOOTING**

### **❌ Erro: "Invalid API key"**
- Verifique se copiou as chaves corretas do Supabase
- Certifique-se que o projeto no Supabase está ativo
- Reinicie o servidor local (`npm run dev`)

### **❌ Erro: "relation does not exist"**
- Execute o script `database-schema.sql` novamente
- Verifique se todas as tabelas foram criadas no Table Editor

### **❌ Dashboard ainda mostra aviso**
- Limpe o cache do browser (Ctrl+F5)
- Reinicie o servidor local
- Verifique o console do browser para erros

### **❌ Login não funciona**
- Confirme que a tabela `users` tem o admin criado
- Verifique se o JWT_SECRET está configurado
- Teste com email exato: `admin@portalnoticias.com.br`

---

## **✅ VERIFICAÇÃO FINAL**

Após completar os passos, você deve conseguir:

- ✅ Acessar `/admin` sem erros
- ✅ Ver estatísticas reais no dashboard
- ✅ Navegar entre todas as páginas admin
- ✅ Criar e editar artigos
- ✅ Gerenciar categorias e leads
- ✅ Configurar o ticker de notícias

---

## **📊 DADOS PRÉ-CARREGADOS**

O banco vem com dados iniciais para você começar:

### **🏷️ Tags (20+):**
Brasil, Governo, Congresso, Presidente, Mercado, PIB, Inflação, Juros, Futebol, Copa do Mundo, Olimpíadas, Seleção Brasileira, Arte, Música, Cinema, Literatura, Infraestrutura, Transporte, Educação, Saúde

### **⚙️ Configurações do Sistema:**
- Ticker habilitado por padrão
- Velocidade: 30 segundos
- 3 mensagens iniciais no ticker

### **👤 Usuário Admin:**
- Pronto para uso imediato
- Permissões completas
- **⚠️ IMPORTANTE:** Altere a senha após primeiro login!

---

## **🎯 PRÓXIMOS PASSOS**

Após configurar o banco:

1. **Customize:** Altere cores, logos e configurações
2. **Conteúdo:** Comece a criar seus artigos
3. **SEO:** Configure meta tags e sitemap  
4. **Analytics:** Integre Google Analytics
5. **Email:** Configure SMTP para notificações

---

**🎉 Parabéns! Seu portal de notícias está com banco de dados totalmente funcional!**

---

**💡 Dica:** Mantenha sempre um backup do arquivo `database-schema.sql` para futuras instalações ou atualizações.
