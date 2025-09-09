# 🗄️ **Como Configurar o Banco de Dados Supabase**

## ⚡ **Guia Rápido (5 minutos)**

### **1. Acesse o Supabase**
- Vá para https://supabase.com
- Faça login ou crie uma conta gratuita

### **2. Execute o Script SQL**
1. No seu projeto Supabase, vá para **SQL Editor**
2. Cole todo o conteúdo do arquivo `database-schema.sql`
3. Clique em **Run** para executar
4. ✅ Aguarde a mensagem de sucesso

### **3. Verifique as Tabelas Criadas**
Suas tabelas devem aparecer em **Table Editor**:
- ✅ `categories` (5 categorias pré-criadas)
- ✅ `users` (1 admin pré-criado)  
- ✅ `articles`
- ✅ `leads`
- ✅ `tags`
- ✅ `article_tags`
- ✅ `comments`
- ✅ `article_views`

### **4. Teste a Dashboard**
- Acesse http://localhost:3000/admin
- Você deve ver as estatísticas funcionando
- O aviso amarelo deve desaparecer

---

## 🔑 **Dados de Acesso Pré-criados**

### **Usuário Admin Padrão**
- **Email:** `admin@portalnoticias.com.br`
- **Senha:** `123456` (altere após primeiro login)
- **Role:** Administrador

### **Categorias Pré-criadas**
- 🏛️ **Política** - Cor azul escuro
- 💰 **Economia** - Cor verde destaque
- 🏆 **Esportes** - Cor verde claro  
- 🎨 **Cultura** - Cor azul claro
- 🏙️ **Cidades** - Cor verde escuro

---

## 🔧 **Se Algo Der Errado**

### **Erro: "relation does not exist"**
- ✅ Execute o script SQL novamente
- ✅ Verifique se todas as tabelas foram criadas

### **Erro: "Invalid API key"**
- ✅ Verifique as variáveis no `.env.local`
- ✅ Copie as chaves corretas do Supabase

### **Dashboard ainda mostra aviso**
- ✅ Atualize a página (F5)
- ✅ Reinicie o servidor local (`npm run dev`)

---

## 📊 **Após Configurar**

### **O que funciona:**
- ✅ Dashboard com estatísticas reais
- ✅ Criar artigos funcionando
- ✅ Todas as páginas admin funcionais
- ✅ APIs REST funcionando

### **Teste Criar um Artigo:**
1. Vá para `/admin/articles/new`
2. Preencha título e conteúdo
3. Selecione uma categoria
4. Clique em "Publicar"
5. ✅ Artigo aparece na lista

---

## 🚀 **Deploy em Produção**

### **Variáveis no Vercel/Netlify:**
```bash
NEXT_PUBLIC_SUPABASE_URL=sua-url-supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

### **Script SQL:**
- Execute o mesmo `database-schema.sql` no banco de produção

---

## ✅ **Verificação Final**

Após configurar, você deve conseguir:

- ✅ Acessar `/admin` sem erros
- ✅ Ver estatísticas funcionando
- ✅ Navegar entre todas as páginas
- ✅ Criar artigos e categorias
- ✅ Visualizar leads (mesmo que vazios)

**🎉 Parabéns! Sua dashboard está 100% funcional!**

---

**💡 Dica:** Mantenha o arquivo `database-schema.sql` sempre atualizado para futuras modificações no banco.
