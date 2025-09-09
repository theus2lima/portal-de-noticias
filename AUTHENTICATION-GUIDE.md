# 🔐 Sistema de Autenticação - Portal de Notícias

## Funcionalidades Implementadas

✅ **Login de Administradores**
- Interface de login responsiva e moderna
- Validação de formulário em tempo real
- Autenticação JWT segura
- Proteção contra ataques de força bruta

✅ **Gestão de Usuários**
- CRUD completo de usuários administradores
- Diferentes níveis de permissão (Admin, Editor, Autor)
- Filtros e busca avançada
- Interface intuitiva com estatísticas

✅ **Proteção de Rotas**
- Middleware automático de autenticação
- Redirecionamento para login quando não autenticado
- Verificação de permissões por página

✅ **Dashboard Integrado**
- Informações do usuário logado
- Botão de logout funcional
- Interface personalizada por perfil

## Como Usar

### 1. Configuração Inicial

#### Variáveis de Ambiente
Copie o arquivo `.env.example` para `.env.local` e configure:

```bash
# JWT Secret (OBRIGATÓRIO)
JWT_SECRET=sua-chave-super-secura-aqui-min-32-caracteres

# Configurações do Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anonima
```

#### Gerar JWT Secret
```bash
# Usando OpenSSL (recomendado)
openssl rand -base64 32

# Ou usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. Configuração do Banco de Dados

Execute o script `database-schema.sql` no Supabase para criar:
- Tabelas de usuários com criptografia de senhas
- Triggers automáticos
- Usuário administrador padrão

#### Usuário Padrão
```
Email: admin@portalnoticias.com.br
Senha: admin123 (ALTERE IMEDIATAMENTE)
```

### 3. Primeiro Acesso

1. **Acesse**: `/admin/login`
2. **Faça login** com as credenciais padrão
3. **Vá para**: `/admin/users`
4. **Crie um novo usuário administrador** com suas credenciais
5. **Desative ou exclua** o usuário padrão

## Estrutura do Sistema

### Páginas
- `/admin/login` - Página de login
- `/admin/dashboard` - Dashboard principal (protegida)
- `/admin/users` - Gestão de usuários (protegida)
- Todas as outras rotas `/admin/*` são automaticamente protegidas

### APIs
- `POST /api/auth/login` - Autenticação de usuários
- `GET /api/auth/verify` - Verificação de token JWT
- `GET /api/admin/users` - Listar usuários
- `POST /api/admin/users` - Criar novo usuário

### Componentes
- `AuthContext` - Gerenciamento de estado global de autenticação
- `ProtectedRoute` - Componente de proteção de rotas
- `DashboardLayout` - Layout integrado com sistema de auth

## Níveis de Permissão

### 👑 Administrador
- Acesso total ao sistema
- Gerenciar usuários e permissões
- Configurações avançadas
- Relatórios e analytics

### ✏️ Editor
- Criar e editar artigos
- Gerenciar categorias
- Moderar comentários
- Visualizar relatórios básicos

### 📝 Autor
- Criar artigos próprios
- Editar artigos próprios
- Visualizar estatísticas pessoais

## Segurança

### Medidas Implementadas
- ✅ Senhas criptografadas com bcrypt
- ✅ JWT com expiração de 24h
- ✅ Validação de permissões no backend
- ✅ Verificação automática de sessão
- ✅ Logout seguro com limpeza de tokens

### Recomendações
- Use senhas fortes (mín. 8 caracteres)
- Altere JWT_SECRET em produção
- Configure HTTPS em produção
- Monitore logs de acesso
- Revise permissões periodicamente

## Fluxo de Autenticação

```
1. Usuário acessa /admin/*
2. ProtectedRoute verifica autenticação
3. Se não autenticado → redireciona para /admin/login
4. Login → valida credenciais → gera JWT
5. JWT armazenado no localStorage
6. Todas as requests incluem token no header
7. Backend valida token em cada request
8. Logout → remove token e redireciona
```

## Personalização

### Adicionando Novas Permissões
1. Edite a tabela `users` no Supabase
2. Adicione novos roles no enum
3. Atualize as validações no backend
4. Modifique a interface conforme necessário

### Customizando a Interface
- Edite `src/app/admin/login/page.tsx` para o login
- Modifique `src/components/Dashboard/DashboardLayout.tsx` para o layout
- Ajuste `src/app/admin/users/page.tsx` para gestão de usuários

## Problemas Comuns

### ❌ "Token inválido"
- Verifique se JWT_SECRET está configurado
- Confirme se o token não expirou
- Limpe o localStorage e faça login novamente

### ❌ "Erro de conexão"
- Verifique a configuração do Supabase
- Confirme se as credenciais estão corretas
- Teste a conectividade com o banco

### ❌ "Acesso negado"
- Confirme se o usuário tem role 'admin'
- Verifique se o usuário está ativo
- Teste com outro usuário administrador

## Logs e Monitoramento

Para facilitar o debug, ative logs no console:
- Erros de autenticação
- Tentativas de login
- Criação/edição de usuários
- Verificações de token

---

**🎉 Pronto!** Seu sistema de autenticação está funcionando. Agora você pode gerenciar usuários administradores com segurança e controlar o acesso ao painel administrativo.

Para suporte técnico, verifique os logs do browser (F12) e do servidor Next.js.
