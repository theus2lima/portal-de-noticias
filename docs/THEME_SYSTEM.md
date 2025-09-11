# Sistema de Temas e Cores

## Visão Geral

O sistema de temas permite que administradores personalizem completamente a aparência do site através da dashboard, incluindo esquemas de cores, fontes, modo escuro e animações.

## Funcionalidades Implementadas

### ✅ Esquemas de Cores
- **Padrão**: Azul e verde (cores originais)
- **Azul**: Tons de azul claro e escuro
- **Verde**: Tons de verde natural
- **Roxo**: Tons de roxo e violeta
- **Laranja**: Tons de laranja e âmbar

### ✅ Fontes
- **Inter**: Fonte padrão, moderna e legível
- **Roboto**: Fonte do Google, popular e versátil
- **Open Sans**: Fonte humanista, amigável
- **Poppins**: Fonte geométrica, contemporânea

### ✅ Configurações Avançadas
- **Modo Escuro**: Alterna cores para ambiente escuro
- **Animações**: Liga/desliga todas as animações
- **Preview em Tempo Real**: Visualização das mudanças
- **Persistência**: Configurações salvas automaticamente

## Como Usar

### Para Administradores

1. **Acesse as Configurações**
   ```
   /admin/settings → Seção "Aparência e Tema"
   ```

2. **Altere o Esquema de Cores**
   - Clique em qualquer esquema de cor
   - Veja a mudança aplicada instantaneamente
   - As cores são aplicadas em todo o site

3. **Altere a Fonte**
   - Selecione uma fonte no dropdown
   - A fonte é aplicada imediatamente
   - Afeta todo o texto do site

4. **Configure Modo Escuro**
   - Ative/desative o toggle "Modo Escuro"
   - Inverte as cores principais
   - Melhora visualização noturna

5. **Gerencie Animações**
   - Ative/desative o toggle "Animações"
   - Remove todas as transições e animações
   - Melhora performance em dispositivos lentos

### Para Desenvolvedores

#### Usando o Hook useTheme

```typescript
import { useTheme } from '@/hooks/useTheme'

function MyComponent() {
  const { theme, updateTheme, resetTheme } = useTheme()
  
  return (
    <div>
      <p>Esquema atual: {theme.colorScheme}</p>
      <p>Fonte atual: {theme.fontFamily}</p>
      
      <button onClick={() => updateTheme({ colorScheme: 'green' })}>
        Mudar para Verde
      </button>
      
      <button onClick={resetTheme}>
        Resetar Tema
      </button>
    </div>
  )
}
```

## Esquemas de Cores Disponíveis

### 1. Padrão (default)
```css
Primary: rgb(59, 130, 246)   /* Azul */
Secondary: rgb(22, 163, 74)  /* Verde */
Accent: rgb(16, 185, 129)    /* Verde claro */
```

### 2. Azul (blue)
```css
Primary: rgb(59, 130, 246)   /* Azul */
Secondary: rgb(2, 132, 199)  /* Azul escuro */
Accent: rgb(14, 165, 233)    /* Azul médio */
```

### 3. Verde (green)
```css
Primary: rgb(34, 197, 94)    /* Verde */
Secondary: rgb(5, 150, 105)  /* Verde escuro */
Accent: rgb(16, 185, 129)    /* Verde claro */
```

### 4. Roxo (purple)
```css
Primary: rgb(168, 85, 247)   /* Roxo */
Secondary: rgb(124, 58, 237) /* Roxo escuro */
Accent: rgb(167, 139, 250)   /* Roxo claro */
```

### 5. Laranja (orange)
```css
Primary: rgb(249, 115, 22)   /* Laranja */
Secondary: rgb(249, 115, 22) /* Laranja escuro */
Accent: rgb(245, 158, 11)    /* Âmbar */
```

## Estrutura de Arquivos

```
src/
├── hooks/
│   └── useTheme.ts              # Hook principal de temas
├── components/
│   └── ThemeProvider.tsx        # Provider para toda aplicação
├── app/
│   ├── layout.tsx               # Layout com ThemeProvider
│   ├── globals.css              # CSS com suporte a temas
│   └── admin/settings/
│       └── page.tsx             # Página de configurações
```

## API do Hook useTheme

### Estados
```typescript
interface ThemeConfig {
  colorScheme: 'default' | 'blue' | 'green' | 'purple' | 'orange'
  fontFamily: 'inter' | 'roboto' | 'opensans' | 'poppins'
  darkMode: boolean
  animations: boolean
}
```

### Métodos
- `updateTheme(updates: Partial<ThemeConfig>)`: Atualiza configurações
- `resetTheme()`: Restaura configurações padrão
- `getCurrentColors()`: Obtém cores do esquema atual
- `getCurrentFont()`: Obtém fonte atual

### Propriedades
- `theme`: Configuração atual
- `loading`: Estado de carregamento
- `colorSchemes`: Todos os esquemas disponíveis
- `fontFamilies`: Todas as fontes disponíveis

## CSS e Variáveis

### Variáveis CSS Dinâmicas
O sistema aplica automaticamente as seguintes variáveis:

```css
:root {
  --primary-50: /* Cor primária 50 */
  --primary-100: /* Cor primária 100 */
  --primary-500: /* Cor primária 500 */
  --primary-600: /* Cor primária 600 */
  --primary-700: /* Cor primária 700 */
  --primary-800: /* Cor primária 800 */
  --primary-900: /* Cor primária 900 */
  
  --secondary-500: /* Cor secundária 500 */
  --secondary-600: /* Cor secundária 600 */
  --secondary-700: /* Cor secundária 700 */
  
  --accent-500: /* Cor de destaque 500 */
  --accent-600: /* Cor de destaque 600 */
  
  --font-family: /* Família da fonte atual */
}
```

### Classes CSS
- `.dark`: Aplicada quando modo escuro ativo
- `.no-animations`: Aplicada quando animações desabilitadas

### Usando em Tailwind
As cores são automaticamente disponibilizadas no Tailwind:

```html
<div class="bg-primary-500 text-white">
  Texto com cor primária
</div>

<button class="bg-secondary-600 hover:bg-secondary-700">
  Botão com cor secundária
</button>
```

## Persistência

### LocalStorage
As configurações são salvas em `localStorage` com a chave `site-theme`:

```typescript
// Estrutura salva
{
  "colorScheme": "green",
  "fontFamily": "roboto",
  "darkMode": false,
  "animations": true
}
```

### Carregamento Automático
- Tema é aplicado imediatamente ao carregar a página
- Fallback para tema padrão se houver erro
- Loading state durante carregamento inicial

## Melhorias Futuras

- [ ] **Cores Personalizadas**: Editor de cores manual
- [ ] **Temas Salvos**: Múltiplos temas nomeados
- [ ] **Importar/Exportar**: Compartilhar configurações
- [ ] **Tema por Horário**: Automação baseada no horário
- [ ] **Temas Sazonais**: Mudanças automáticas por época
- [ ] **API Backend**: Sincronização entre dispositivos
- [ ] **Variações de Cor**: Mais tonalidades por esquema
- [ ] **Fontes Customizadas**: Upload de fontes próprias

## Troubleshooting

### Tema não carrega
1. Verifique se `localStorage` está habilitado
2. Limpe cache do navegador
3. Verifique console para erros JavaScript

### Cores não aplicam
1. Verifique se ThemeProvider está no layout
2. Confirme se variáveis CSS estão sendo definidas
3. Teste com tema padrão primeiro

### Fontes não mudam
1. Verifique se Google Fonts estão carregando
2. Confirme import no globals.css
3. Teste conexão com fonts.googleapis.com

### Performance lenta
1. Desabilite animações
2. Use tema mais simples
3. Verifique carregamento das fontes
