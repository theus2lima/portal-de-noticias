# Sistema de Drag-and-Drop do Ticker

## Visão Geral

O sistema de drag-and-drop permite aos administradores reorganizar facilmente a ordem dos itens no ticker de notícias através de uma interface intuitiva.

## Funcionalidades Implementadas

### ✅ Interface Drag-and-Drop
- **Biblioteca**: `react-beautiful-dnd`
- **Localização**: Página de administração do ticker
- **Acesso**: Menu Admin > Dashboard > Ticker

### ✅ Recursos Visuais

#### 1. Feedback Visual Durante o Drag
- Items ganham sombra e rotação leve quando arrastados
- Área de drop muda de cor quando um item está sendo arrastado sobre ela
- Cursor muda para "grabbing" durante o arraste

#### 2. Controles de Estado
- Drag desabilitado durante operações de salvamento
- Drag desabilitado quando um item está sendo editado
- Indicadores de posição (#1, #2, #3...) para mostrar ordem atual

#### 3. Handle de Arraste
- Ícone `GripVertical` claramente identificável
- Tooltip explicativo: "Arraste para reordenar"
- Hover effects para indicar interatividade

### ✅ Funcionamento

#### 1. Drag Local
- Atualização imediata da interface para feedback rápido
- Reorganização visual instantânea dos itens

#### 2. Sincronização com Backend
- Envio automático da nova ordem para a API
- Atualização das prioridades no banco de dados
- Sistema de fallback em caso de erro

#### 3. Sistema de Prioridades
- Prioridade calculada baseada na posição: `items.length - index`
- Item no topo = maior prioridade
- Item no final = menor prioridade

## Como Usar

### Para Administradores

1. **Acesse o Ticker Admin**
   ```
   /admin/dashboard (seção do ticker)
   ```

2. **Identifique os Items**
   - Cada item tem um handle de arraste (⋮⋮) à esquerda
   - Indicador de posição (#1, #2, etc.)
   - Status visual (ativo/inativo)

3. **Reorganize**
   - Clique e segure o handle de arraste
   - Arraste o item para a nova posição
   - Solte para confirmar a mudança

4. **Confirmação**
   - Sistema salva automaticamente
   - Mensagem de sucesso/erro é exibida
   - Preview atualizado imediatamente

## API Endpoints

### POST /api/settings (reorder_items)

```typescript
// Request
{
  "category": "ticker",
  "action": "reorder_items",
  "data": {
    "items": [
      { "id": "1", "text": "Item 1", ... },
      { "id": "2", "text": "Item 2", ... }
    ]
  }
}

// Response
{
  "success": true,
  "message": "Ordem dos itens atualizada com sucesso!",
  "data": {
    "tickerEnabled": true,
    "tickerSpeed": 30,
    "tickerItems": [...]
  }
}
```

## Estrutura de Arquivos

```
src/
├── components/admin/
│   └── TickerNewsManager.tsx     # Componente com drag-and-drop
├── app/api/settings/
│   └── route.ts                  # API com suporte a reordenação
└── app/globals.css               # Animações e estilos
```

## Dependências

### Bibliotecas Principais
- `react-beautiful-dnd`: Sistema de drag-and-drop
- `@types/react-beautiful-dnd`: Tipagens TypeScript

### Instalação
```bash
npm install react-beautiful-dnd @types/react-beautiful-dnd
```

## Estados e Comportamentos

### Estados do Drag
- **Normal**: Item visível com handle interativo
- **Dragging**: Item com sombra e rotação, cursor mudado
- **Disabled**: Handle opaco quando salvando ou editando

### Área de Drop
- **Normal**: Background transparente
- **Drag Over**: Background azul claro (`bg-blue-50`)

### Feedback de Erro
- Reversão automática da ordem local em caso de erro
- Recarregamento dos dados do servidor
- Mensagem de erro específica

## Melhorias Implementadas

### 1. UX Aprimorada
- Indicadores de posição visíveis
- Tooltips informativos
- Animações suaves
- Feedback visual imediato

### 2. Robustez
- Tratamento de erros completo
- Sistema de fallback
- Validação de dados
- Estados de loading

### 3. Acessibilidade
- Handles bem definidos
- Estados visuais claros
- Tooltips descritivos
- Contraste adequado

## Troubleshooting

### Drag não funciona
1. Verifique se não há operações de salvamento em andamento
2. Confirme que o item não está em modo de edição
3. Verifique console para erros JavaScript

### Ordem não salva no servidor
1. Verifique logs da API no console do servidor
2. Confirme conectividade com banco de dados
3. Teste endpoints manualmente

### Performance lenta
1. Limite número de itens simultâneos
2. Otimize queries de banco de dados
3. Considere paginação para muitos itens

## Futuras Melhorias

- [ ] Drag entre diferentes categorias
- [ ] Seleção múltipla para reorganização em lote
- [ ] Histórico de mudanças de ordem
- [ ] Arrastar para ativar/desativar
- [ ] Ordenação automática por prioridade/data
- [ ] Animações mais elaboradas
- [ ] Suporte a touch devices
- [ ] Keyboard navigation para acessibilidade
