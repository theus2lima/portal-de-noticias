# Sistema de Configurações do Site

## Visão Geral

O sistema de configurações do site permite que os administradores gerenciem todas as informações do rodapé, redes sociais e newsletter através de uma interface administrativa intuitiva.

## Funcionalidades Implementadas

### ✅ Página de Configurações Admin
- **Localização**: `/admin/site-config`
- **Menu**: Administração > Config do Site
- **Acesso**: Apenas usuários autenticados no admin

### ✅ Seções de Configuração

#### 1. Informações do Site
- Nome do site
- Descrição do site
- URL do site

#### 2. Configurações do Cabeçalho
- Texto do cabeçalho superior (ex: "📍 Últimas notícias em tempo real")
- Preview em tempo real
- Integração automática com redes sociais

#### 3. Informações de Contato
- E-mail de contato
- Telefone de contato
- Endereço

#### 4. Redes Sociais
- Gerenciamento dinâmico de links sociais
- Suporte aos ícones: Facebook, Twitter, Instagram, WhatsApp, Genérico
- Ativação/desativação individual
- Adição/remoção de redes sociais
- **Integração automática**: Aparecem tanto no cabeçalho (máx. 4) quanto no rodapé

#### 5. Newsletter
- Habilitação/desabilitação do newsletter
- Título customizável
- Descrição customizável
- Formulário funcional com feedback

#### 6. Configurações do Rodapé
- Descrição personalizada do rodapé
- Copyright personalizado

#### 7. Links Úteis
- Gerenciamento dinâmico de links úteis
- Ativação/desativação individual
- Adição/remoção de links

### ✅ Integração com o Frontend
- **Hook personalizado**: `useSiteConfig()`
- **Componentes atualizados**: `Header.tsx` e `Footer.tsx`
- **Sincronização automática**: As mudanças aparecem imediatamente no site
- **Persistência**: Configurações salvas no localStorage
- **Preview em tempo real**: Visualização do cabeçalho na dashboard

## Como Usar

### Para Administradores

1. **Acesse o Admin**
   ```
   /admin/login
   ```

2. **Navegue para Configurações**
   ```
   Admin → Administração → Config do Site
   ```

3. **Modifique as Configurações**
   - Edite qualquer campo desejado
   - **Altere o texto do cabeçalho superior**
   - Adicione/remova redes sociais
   - Ative/desative funcionalidades
   - Adicione/remova links úteis

4. **Salve as Alterações**
   - Clique em "Salvar Alterações"
   - Aguarde a confirmação de sucesso

5. **Visualize o Resultado**
   - Clique em "Visualizar Site"
   - As mudanças aparecerão imediatamente no **cabeçalho e rodapé**

### Para Desenvolvedores

#### Usando o Hook useSiteConfig

```typescript
import { useSiteConfig } from '@/hooks/useSiteConfig'

function MyComponent() {
  const { config, loading } = useSiteConfig()
  
  if (loading) return <div>Carregando...</div>
  
  return (
    <div>
      <h1>{config.siteName}</h1>
      <p>{config.siteDescription}</p>
    </div>
  )
}
```

#### Estrutura de Dados

```typescript
interface SiteConfig {
  siteName: string
  siteDescription: string
  siteUrl: string
  headerText: string // NOVO: Texto do cabeçalho superior
  contactEmail: string
  contactPhone: string
  contactAddress: string
  newsletterEnabled: boolean
  newsletterTitle: string
  newsletterDescription: string
  socialLinks: SocialLink[] // Usado tanto no cabeçalho quanto no rodapé
  footerDescription: string
  footerCopyright: string
  usefulLinks: Link[]
}
```

## Arquivos Principais

```
src/
├── app/admin/site-config/
│   └── page.tsx                 # Página de configurações admin
├── hooks/
│   └── useSiteConfig.ts         # Hook para carregar configurações
├── components/
│   ├── Header.tsx               # Cabeçalho que consome as configurações
│   └── Footer.tsx               # Rodapé que consome as configurações
└── components/Dashboard/
    └── DashboardLayout.tsx      # Menu admin com link
```

## Funcionalidades do Newsletter

- Formulário funcional com validação
- Estados de loading e feedback
- Simulação de inscrição (1 segundo de delay)
- Mensagens de sucesso/erro
- Campo obrigatório de e-mail
- Desabilitação durante envio

## Persistência dos Dados

Atualmente, as configurações são salvas no `localStorage` do navegador. Para produção, recomenda-se:

1. **API Backend**
   - Criar endpoints para salvar/carregar configurações
   - Banco de dados para persistência
   - Validação server-side

2. **Cache e Performance**
   - Implementar cache para configurações
   - Compressão de dados
   - CDN para static assets

## Melhorias Futuras

- [ ] API backend para persistência
- [ ] Upload de logos personalizados
- [ ] Configuração de cores/temas
- [ ] Analytics de newsletter
- [ ] Import/Export de configurações
- [ ] Histórico de mudanças
- [ ] Preview em tempo real
- [ ] Configurações de SEO

## Troubleshooting

### Configurações não aparecem no site
1. Verifique se o `localStorage` está habilitado
2. Limpe o cache do navegador
3. Verifique o console para erros JavaScript

### Erro ao salvar configurações
1. Verifique se há espaço suficiente no localStorage
2. Teste com configurações menores
3. Verifique logs do navegador

### Newsletter não funciona
1. Verifique se `newsletterEnabled` está `true`
2. Confirme que o formulário tem validação de e-mail
3. Teste o estado de loading
