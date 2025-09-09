# 🔑 CREDENCIAIS DE LOGIN - PORTAL DE NOTÍCIAS

## 🚀 Acesso ao Painel Administrativo

### 📍 **URL de Login**
```
http://localhost:3000/admin/login
```

### 🔐 **Credenciais Temporárias**
```
Email: admin@portalnoticias.com.br
Senha: admin123
```

## ⚡ Como Fazer o Login

1. **Inicie o servidor** de desenvolvimento:
   ```bash
   npm run dev
   ```

2. **Acesse a página** de login:
   ```
   http://localhost:3000/admin/login
   ```

3. **Digite as credenciais**:
   - Email: `admin@portalnoticias.com.br`
   - Senha: `admin123`

4. **Clique em "Entrar"**

5. **Você será redirecionado** para o dashboard: `/admin/dashboard`

## 🛠️ Funcionalidades Disponíveis

Após fazer login, você terá acesso a:

- **📊 Dashboard** - Visão geral e estatísticas
- **👥 Usuários** - Criar e gerenciar administradores
- **📝 Artigos** - Gerenciar notícias e conteúdo
- **📂 Categorias** - Organizar conteúdo
- **📈 Leads** - Visualizar contatos
- **⚙️ Configurações** - Ajustes do sistema

## ⚠️ IMPORTANTE

### 🔒 Segurança
- Estas são credenciais **TEMPORÁRIAS** apenas para desenvolvimento
- **ALTERE** a senha imediatamente após o primeiro login
- **NÃO USE** em produção sem configurar o Supabase adequadamente

### 🗄️ Banco de Dados
- Atualmente usando **mock** do Supabase (dados temporários)
- Para produção, configure as variáveis de ambiente do Supabase
- Execute o `database-schema.sql` no Supabase para dados reais

### 🔄 Próximos Passos
1. Faça login com as credenciais acima
2. Vá para **"/admin/users"**
3. Crie um novo usuário administrador com **suas próprias credenciais**
4. Configure o **Supabase** para produção
5. Desative/remova o usuário temporário

## 🆘 Problemas?

Se não conseguir fazer login:

1. **Verifique** se o servidor está rodando (`npm run dev`)
2. **Confirme** a URL: `http://localhost:3000/admin/login`
3. **Use exatamente** as credenciais mostradas acima
4. **Abra o console** do navegador (F12) para ver erros
5. **Recarregue** a página e tente novamente

---

**🎉 Pronto! Agora você pode acessar o painel administrativo completo!**
