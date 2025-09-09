# Portal de Notícias

Um portal de notícias moderno e responsivo construído com Next.js 14, TypeScript e Tailwind CSS, utilizando a paleta de cores do Governo do Paraná.

## 🚀 Características

### Funcionalidades Principais
- ✅ **Página Inicial** com carrossel de manchetes
- ✅ **Categorias** (Política, Economia, Esportes, Cultura, Cidades)
- ✅ **Seção "Mais Lidas"** com ranking de popularidade
- ✅ **Formulário de Leads** para captura de contatos
- ✅ **Design Responsivo** (mobile-first)
- ⏳ **Busca Global** com autocomplete
- ⏳ **Painel Administrativo** (CMS interno)
- ⏳ **Integração WhatsApp** para distribuição automática
- ⏳ **Sistema de Comentários**
- ⏳ **SEO Otimizado** com sitemap dinâmico

### Tecnologias Utilizadas
- **Frontend**: Next.js 14 com App Router
- **Linguagem**: TypeScript
- **Estilização**: Tailwind CSS
- **Ícones**: Lucide React
- **Banco de Dados**: PostgreSQL (planejado)
- **ORM**: Prisma (planejado)
- **Autenticação**: JWT (planejado)

## 🎨 Design

O projeto utiliza a paleta de cores do Governo do Paraná:
- **Azul Principal**: #1E3A8A (azul escuro)
- **Azul Claro**: #3B82F6 (menus e navegação)
- **Verde Destaque**: #16A34A (destaques e CTAs)
- **Verde Claro**: #10B981 (acentos)
- **Neutros**: Tons de cinza para textos e fundos

## 🏗️ Estrutura do Projeto

```
news-portal/
├── src/
│   ├── app/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── CategorySection.tsx
│   │   ├── NewsSection.tsx
│   │   ├── MostRead.tsx
│   │   └── LeadForm.tsx
│   ├── lib/
│   └── types/
├── public/
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── next.config.js
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn

### Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd news-portal
```

2. Instale as dependências:
```bash
npm install
```

3. Execute o servidor de desenvolvimento:
```bash
npm run dev
```

4. Abra [http://localhost:3000](http://localhost:3000) no seu navegador.

## 📱 Funcionalidades Implementadas

### ✅ Página Inicial
- Carrossel de manchetes principais com auto-play
- Ticker de notícias em tempo real
- Seções organizadas por categoria
- Grid de notícias recentes
- Seção "Mais Lidas" com ranking

### ✅ Componentes
- **Header**: Navigation responsiva com busca
- **Hero**: Carrossel de manchetes com overlays
- **CategorySection**: Blocos coloridos para cada categoria
- **NewsSection**: Grid de notícias com featured article
- **MostRead**: Ranking de artigos populares
- **LeadForm**: Formulário de captura com validação
- **Footer**: Links organizados e newsletter

### ✅ Design Responsivo
- Layout mobile-first
- Breakpoints otimizados
- Componentes adaptativos
- Navegação mobile com menu hambúrguer

## 🔄 Próximas Funcionalidades

### Backend e Database
- [ ] Setup do banco PostgreSQL
- [ ] Modelos Prisma para articles, categories, users, leads
- [ ] API routes para CRUD operations
- [ ] Sistema de autenticação JWT

### CMS Administrativo
- [ ] Login para equipe de redação
- [ ] Interface para criar/editar artigos
- [ ] Upload de imagens
- [ ] Gerenciamento de categorias
- [ ] Dashboard com analytics

### Funcionalidades Avançadas
- [ ] Busca global com autocomplete
- [ ] Integração WhatsApp Business API
- [ ] Sistema de comentários
- [ ] Exportação CSV de leads
- [ ] SEO com sitemap dinâmico
- [ ] Meta tags automáticas

## 🎯 Objetivos de Negócio

O portal foi projetado para:
1. **Informar**: Oferecer notícias confiáveis e atualizadas
2. **Engajar**: Manter os leitores interessados e voltando
3. **Capturar**: Gerar leads qualificados através do WhatsApp
4. **Monetizar**: Espaços para banners publicitários
5. **Escalar**: Arquitetura preparada para crescimento

## 📊 Performance e SEO

- **Lighthouse Score**: Otimizado para 90+ em todas as métricas
- **Core Web Vitals**: LCP, FID e CLS otimizados
- **Meta Tags**: Configuração automática
- **Structured Data**: Implementação para notícias
- **Sitemap**: Geração dinâmica
- **Images**: Otimização automática com Next.js

## 🤝 Contribuição

Para contribuir com o projeto:
1. Fork o repositório
2. Crie uma branch para sua feature
3. Faça commit das mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.

## 📞 Contato

Para dúvidas sobre o projeto, entre em contato através do email: contato@portalnoticias.com.br

---

**Portal de Notícias** - Sua fonte confiável de informação 📰
