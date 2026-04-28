# News Portal

Portal de notícias completo com painel administrativo, curadoria automatizada de notícias via IA, captura de leads e analytics.

## Tecnologias

- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Banco de dados**: Supabase (PostgreSQL)
- **ORM**: Prisma
- **IA**: OpenAI (classificação e curadoria de notícias)
- **Autenticação**: JWT + bcryptjs
- **Deploy**: Vercel

## Funcionalidades

### Portal Público
- Página inicial com carrossel Hero, seções de categorias e notícias mais lidas
- Página de notícia individual com compartilhamento e rastreamento de visualizações
- Listagem de notícias por categoria (`/categoria/[slug]`)
- Busca de notícias (`/buscar`)
- Landing pages dinâmicas com múltiplos templates (`/landing/[slug]`)
- Feed RSS (`/rss`)
- Sitemap automático
- Formulário de captação de leads

### Painel Administrativo (`/admin`)
- **Dashboard** — estatísticas de artigos, visualizações e leads em tempo real
- **Artigos** — criação, edição e publicação com editor rico e upload de imagens
- **Curadoria** — fluxo de aprovação/rejeição/publicação de notícias coletadas automaticamente
- **Fontes de notícias** — gerenciamento de fontes RSS e scraping
- **Google News** — coleta automática via Google News
- **Categorias** — gestão de categorias com notificador em tempo real
- **Leads** — visualização e exportação de leads capturados
- **Landing Pages** — criador de páginas de conversão com 5 templates
- **Analytics** — relatórios de visualizações, compartilhamentos e retenção de leitores
- **WhatsApp** — configuração de grupos e envio automático de notícias
- **Configurações do site** — personalização geral, SEO e identidade visual
- **Usuários** — gerenciamento de usuários administradores

## Estrutura do Projeto

```
src/
├── app/
│   ├── api/                    # API Routes (Next.js)
│   │   ├── articles/           # CRUD de artigos
│   │   ├── curation/           # Curadoria de notícias
│   │   ├── news-collector/     # Coleta automática (RSS, scraping, Google News)
│   │   ├── analytics/          # Visualizações, compartilhamentos e retenção
│   │   ├── leads/              # Gerenciamento de leads
│   │   ├── landing-pages/      # Landing pages dinâmicas
│   │   ├── categories/         # Categorias
│   │   ├── auth/               # Autenticação JWT
│   │   └── settings/           # Configurações do sistema
│   ├── admin/                  # Páginas do painel admin
│   ├── noticia/[slug]/         # Página de artigo individual
│   ├── categoria/[slug]/       # Listagem por categoria
│   ├── landing/[slug]/         # Landing pages dinâmicas
│   └── buscar/                 # Busca de notícias
├── components/
│   ├── templates/              # Templates de landing page (5 modelos)
│   ├── admin/                  # Componentes exclusivos do admin
│   ├── Dashboard/              # Layout do dashboard
│   └── Layout/                 # Wrappers de layout
├── contexts/                   # Context API (Auth, Categories, Notifications...)
├── hooks/                      # Custom hooks (theme, settings, notifications)
├── lib/                        # Utilitários internos (SEO, storage...)
├── services/                   # Serviços externos (WhatsApp...)
├── types/                      # Tipagens TypeScript
└── utils/                      # Helpers (Supabase client, scraper, HTTP...)
```

## Configuração

### Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta na [OpenAI](https://platform.openai.com) (para curadoria com IA)

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-chave-anon
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# OpenAI
OPENAI_API_KEY=sua-openai-api-key

# JWT
JWT_SECRET=sua-chave-secreta-jwt

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Instalação

```bash
# Instalar dependências
npm install

# Configurar banco de dados
# Acesse o SQL Editor no Supabase e execute: database-schema.sql

# Iniciar em desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

### Build para produção

```bash
npm run build
npm run start
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Inicia o servidor de desenvolvimento |
| `npm run build` | Gera o build de produção |
| `npm run start` | Inicia o servidor de produção |
| `npm run lint` | Executa o ESLint |

## Curadoria de Notícias com IA

O sistema coleta notícias de fontes RSS e web scraping, classifica automaticamente por categoria usando a OpenAI e apresenta um fluxo de curadoria no admin:

1. **Coleta** — notícias são coletadas via RSS, scraping ou Google News
2. **Classificação** — a IA sugere categoria e pontuação de confiança
3. **Revisão** — curador aprova, rejeita ou edita cada notícia
4. **Publicação** — notícias aprovadas são publicadas no portal

## Landing Pages

O sistema suporta criação de landing pages customizadas com 5 templates visuais (Minimal, Bold, Modern, Business e Default) e formulário de captura de leads integrado. Cada lead pode ser direcionado a um grupo de WhatsApp configurado.

## Deploy

O projeto está preparado para deploy na **Vercel** com `@vercel/speed-insights` já integrado. Basta conectar o repositório e configurar as variáveis de ambiente no painel da Vercel.
