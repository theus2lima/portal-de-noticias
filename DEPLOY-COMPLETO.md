# 🚀 DEPLOY COMPLETO - PORTAL DE NOTÍCIAS

## ✅ Status do Build
Build compilado com sucesso! ✓ Pronto para deploy.

---

## 🎯 **MÉTODO RECOMENDADO: VERCEL**

### **Passo 1: Preparar o Supabase**
1. Acesse: https://supabase.com
2. Crie um novo projeto (se ainda não tiver)
3. Execute o schema do banco:
   - Vá em **SQL Editor**
   - Execute o conteúdo do arquivo `database/supabase-schema-fixed.sql`
4. Anote as chaves do projeto:
   - **URL do projeto**: `https://seuprojetosupabase.supabase.co`
   - **Chave anônima**: Na aba **Settings > API**

### **Passo 2: Deploy na Vercel**
1. **Acesse**: https://vercel.com
2. **Faça login** com GitHub/Google
3. **Clique em**: "Add New Project"
4. **Conecte o GitHub** e importe este repositório
5. **Configure as variáveis de ambiente**:

#### **Variáveis Obrigatórias (Environment Variables):**
```bash
# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://seuprojetosupabase.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima-aqui

# JWT SECRET (gerar nova chave)
JWT_SECRET=sua-chave-jwt-super-segura-aqui-minimo-32-chars
```

#### **Como gerar JWT_SECRET:**
Execute no terminal ou no console do navegador:
```javascript
// No Node.js ou console do navegador
btoa(Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2))
// Ou use: https://generate-secret.vercel.app/32
```

6. **Clique em "Deploy"**
7. **Aguarde o build** (2-3 minutos)
8. **Site publicado!** 🎉

---

## 🌐 **ALTERNATIVA: NETLIFY**

### **Deploy no Netlify**
1. **Acesse**: https://netlify.com
2. **"Add new site" > "Import from Git"**
3. **Conecte o GitHub** e selecione o repositório
4. **Build settings**:
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Node version: `18` (em Environment)

5. **Variáveis de ambiente** (Settings > Environment variables):
   - Mesmas variáveis do Vercel acima

---

## 🐙 **OPÇÃO: SUBIR NO GITHUB PRIMEIRO**

Se ainda não está no GitHub:

### **Via Upload (Mais Fácil)**
1. Acesse: https://github.com
2. Crie um novo repositório: `portal-de-noticias`
3. Clique em "uploading an existing file"
4. **Arraste TODOS os arquivos** EXCETO:
   - ❌ `node_modules/`
   - ❌ `.next/`
   - ❌ `.env*` (nunca envie arquivos .env!)

### **Via Git (Se tiver instalado)**
```bash
git init
git add .
git commit -m "Portal de Notícias - Deploy inicial"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/portal-de-noticias.git
git push -u origin main
```

---

## 🔧 **CONFIGURAÇÕES PÓS-DEPLOY**

### **1. Configurar Domínio (Opcional)**
- **Vercel**: Settings > Domains > Add domain
- **Netlify**: Domain settings > Add custom domain

### **2. Configurar HTTPS**
- Automático nas duas plataformas ✓

### **3. Configurar Analytics (Opcional)**
- Google Analytics
- Vercel Analytics
- Netlify Analytics

### **4. Testar Funcionalidades**
- ✅ Homepage carrega
- ✅ Categorias funcionam
- ✅ Admin login funciona
- ✅ Criação de usuários funciona
- ✅ Sistema de leads funciona

---

## 🎯 **ESTRUTURA DO PROJETO**

### **Páginas Públicas:**
- `/` - Homepage com carrossel
- `/categoria/[slug]` - Páginas de categoria
- `/noticia/[slug]` - Páginas de notícias
- `/buscar` - Página de busca
- `/noticias` - Lista todas as notícias

### **Admin (Protegido):**
- `/admin` - Dashboard
- `/admin/login` - Login do admin
- `/admin/users` - Gerenciar usuários
- `/admin/articles` - Gerenciar artigos
- `/admin/categories` - Gerenciar categorias
- `/admin/leads` - Ver leads capturados
- `/admin/settings` - Configurações gerais

### **APIs:**
- `/api/articles` - CRUD de artigos
- `/api/categories` - CRUD de categorias  
- `/api/leads` - Captura de leads
- `/api/admin/users` - Gerenciar usuários
- `/api/auth/login` - Autenticação

---

## ⚡ **URLs DEPOIS DO DEPLOY**

### **Vercel:**
- **Site**: `https://seu-projeto.vercel.app`
- **Admin**: `https://seu-projeto.vercel.app/admin`

### **Netlify:**
- **Site**: `https://seu-projeto.netlify.app`
- **Admin**: `https://seu-projeto.netlify.app/admin`

---

## 🔐 **PRIMEIRO ACESSO ADMIN**

Depois do deploy, crie o primeiro usuário admin:

1. Acesse seu Supabase
2. Vá em **Table Editor > users**
3. **Insert row** com dados:
```sql
INSERT INTO users (email, password_hash, name, role, is_active) 
VALUES (
  'admin@seusite.com',
  '$2a$10$hash-da-senha-aqui', -- Use bcrypt para gerar
  'Administrador',
  'admin',
  true
);
```

Ou use o script auxiliar: `node create-admin.js`

---

## 📞 **SUPORTE**

Se houver problemas no deploy:

1. **Verifique logs** na plataforma de deploy
2. **Teste local** com `npm run build && npm start`  
3. **Variáveis de ambiente** estão todas configuradas?
4. **Supabase** está funcionando?
5. **Domínio** está apontando corretamente?

---

## 🎉 **PRONTO!**

Seu portal de notícias está online! 

**Próximos passos:**
- ✅ Configurar domínio personalizado
- ✅ Adicionar conteúdo inicial
- ✅ Configurar Google Analytics
- ✅ SEO e meta tags
- ✅ Backup automático

**Sucesso! 🚀**
