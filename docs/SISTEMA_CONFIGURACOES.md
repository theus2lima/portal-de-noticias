# Sistema de Configurações - Portal de Notícias

## Visão Geral

Implementamos um sistema completo de configurações que permite gerenciar todos os aspectos do portal de notícias através de uma interface administrativa amigável. O sistema oferece salvamento automático, importação/exportação de configurações, e integração com múltiplos aspectos do portal.

## Componentes Implementados

### 1. Hook `useSystemSettings`

**Localização:** `src/hooks/useSystemSettings.ts`

**Responsabilidades:**
- Gerenciamento de estado de todas as configurações do sistema
- Salvamento automático no localStorage (com preparação para API futura)
- Funcionalidades de teste (especialmente para configurações de email)
- Importação e exportação de configurações
- Reset para configurações padrão

**Principais funcionalidades:**
- `updateSettings()` - Atualiza configurações específicas
- `resetSettings()` - Restaura configurações padrão
- `testEmailSettings()` - Testa configurações de SMTP
- `exportSettings()` - Exporta configurações como JSON
- `importSettings()` - Importa configurações de arquivo JSON

### 2. Context Provider `SystemSettingsContext`

**Localização:** `src/hooks/SystemSettingsContext.tsx`

Fornece as configurações do sistema para toda a aplicação através do React Context.

### 3. Interface Administrativa Atualizada

**Localização:** `src/app/admin/settings/page.tsx`

A página de configurações foi completamente reformulada para incluir:

## Seções de Configurações

### 📱 Configurações do WhatsApp para Leads
- Link do grupo/chat do WhatsApp para redirecionamento de leads
- Botões para testar, copiar e salvar o link
- Documentação sobre como funciona o sistema

### 🌐 Configurações do Site
- Nome do portal
- Descrição do site
- URL do site
- Upload e gerenciamento de logotipo

### 📧 Configurações de Email
- Email do administrador
- Email de contato
- Configurações completas de SMTP (servidor, porta, usuário, senha, criptografia)
- **Botão de teste** - Testa as configurações de email
- Resultado visual do teste

### 🛡️ Configurações de Segurança
- Autenticação em duas etapas
- Login com Google
- Captcha em formulários
- Timeout de sessão

### 📚 Configurações de Conteúdo
- Número de artigos por página
- Permitir comentários
- Moderação de comentários
- Sistema de newsletter

### 🎨 Aparência e Tema
- Esquemas de cores (integrado com sistema de temas existente)
- Seleção de fonte
- Modo escuro
- Animações
- Preview em tempo real

### 📰 Gerenciador de Ticker News
- Sistema de drag-and-drop para reorganizar notícias (já existente)

### 🔔 Configurações de Notificações
- Notificações por email (novos artigos, comentários, leads)
- Notificações push (atualizações, relatórios, alertas)

## Funcionalidades Avançadas

### ⚡ Salvamento Automático
- Todas as configurações são salvas automaticamente quando alteradas
- Indicador visual do status de salvamento
- Timestamp da última alteração

### 📤 Exportar/Importar Configurações
- **Exportar:** Gera um arquivo JSON com todas as configurações
- **Importar:** Permite importar configurações de um arquivo JSON
- Merge inteligente com configurações padrão

### 🔄 Reset de Configurações
- Botão para restaurar todas as configurações para os valores padrão
- Confirmação antes de executar a ação

### 📊 Feedback Visual
- Mensagens de sucesso/erro
- Estados de loading
- Indicadores de progresso

## Estrutura de Dados

### Configurações do Sistema (`SystemSettings`)

```typescript
interface SystemSettings {
  // Configurações do Site
  siteName: string
  siteDescription: string
  siteUrl: string
  logo: string | null
  
  // Configurações de Email
  adminEmail: string
  contactEmail: string
  smtpServer: string
  smtpPort: number
  smtpUsername: string
  smtpPassword: string
  encryption: 'tls' | 'ssl' | 'none'
  
  // Configurações de Segurança
  twoFactorAuth: boolean
  googleLogin: boolean
  captcha: boolean
  sessionTimeout: number
  passwordMinLength: number
  allowPasswordReset: boolean
  
  // Configurações de Conteúdo
  articlesPerPage: number
  allowComments: boolean
  moderateComments: boolean
  autoApproveComments: boolean
  newsletter: boolean
  enableCategories: boolean
  enableTags: boolean
  
  // Configurações de Notificações
  emailNewArticles: boolean
  emailNewComments: boolean
  emailNewLeads: boolean
  pushSystemUpdates: boolean
  pushWeeklyReports: boolean
  pushSecurityAlerts: boolean
  
  // Configurações de Performance
  enableCache: boolean
  cacheTimeout: number
  enableCompression: boolean
  enableMinification: boolean
  
  // SEO
  metaKeywords: string
  metaDescription: string
  enableSitemap: boolean
  enableRobots: boolean
}
```

## Como Usar

### Para Administradores
1. Acesse `/admin/settings` no painel administrativo
2. Modifique as configurações desejadas
3. As alterações são salvas automaticamente
4. Use os botões de exportar/importar para backup das configurações
5. Teste as configurações de email usando o botão "Testar Configurações de Email"

### Para Desenvolvedores

#### Usando o Hook
```typescript
import { useSystemSettings } from '@/hooks/useSystemSettings'

function MinhaComponente() {
  const { settings, updateSettings, saving } = useSystemSettings()
  
  const handleChange = (field: string, value: any) => {
    updateSettings({ [field]: value })
  }
  
  return (
    <div>
      <input 
        value={settings.siteName}
        onChange={(e) => handleChange('siteName', e.target.value)}
      />
      {saving && <span>Salvando...</span>}
    </div>
  )
}
```

#### Usando o Context
```typescript
import { SystemSettingsProvider, useSystemSettingsContext } from '@/hooks/SystemSettingsContext'

// No layout ou componente pai
function App() {
  return (
    <SystemSettingsProvider>
      <MinhaApp />
    </SystemSettingsProvider>
  )
}

// Em qualquer componente filho
function MinhaComponente() {
  const { settings } = useSystemSettingsContext()
  return <div>{settings.siteName}</div>
}
```

## Integração com o Sistema Existente

### Sistema de Temas
- Mantém a integração com o sistema de temas existente
- Configurações de aparência funcionam em conjunto

### Sistema de Configurações de Site
- Integrado com o sistema de configurações de rodapé existente
- Mantém compatibilidade com APIs existentes (WhatsApp leads)

## Persistência de Dados

### Atual (Fase 1)
- **localStorage:** Armazenamento local para desenvolvimento
- Simulação de delay de rede para testar UX

### Futura (Fase 2)
- **API Backend:** Implementação de endpoints REST
- **Banco de Dados:** Persistência permanente
- **Validação Server-side:** Validações adicionais no backend

## Próximos Passos

1. **Implementar API Backend:**
   - `GET /api/system-settings` - Buscar configurações
   - `PUT /api/system-settings` - Atualizar configurações
   - `DELETE /api/system-settings` - Resetar configurações
   - `POST /api/test-email` - Testar configurações de email

2. **Adicionar Validações:**
   - Validação de formato de email
   - Validação de URLs
   - Validação de configurações SMTP

3. **Implementar Funcionalidades Adicionais:**
   - Histórico de alterações
   - Backup automático
   - Notificações de alterações
   - Logs de auditoria

4. **Otimizações:**
   - Debounce para salvamento automático
   - Validação em tempo real
   - Cache inteligente

## Conclusão

O sistema de configurações está agora completamente funcional e integrado ao portal. Oferece uma experiência de usuário moderna com salvamento automático, feedback visual, e ferramentas avançadas de gerenciamento. O código está estruturado para facilitar futuras expansões e melhorias.
