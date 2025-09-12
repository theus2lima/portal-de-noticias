# Sistema de Envio Automático para WhatsApp - Documentação Completa

## 📱 Visão Geral

Sistema completo para envio automático de artigos publicados para um grupo do WhatsApp, incluindo mensagens formatadas com emojis, títulos, resumos e links.

## 🚀 Funcionalidades Implementadas

### ✅ 1. Serviço de Envio WhatsApp
- **Arquivo:** `src/services/whatsappGroupService.ts`
- **Funcionalidade:** Singleton service para gerenciar envios para grupo WhatsApp
- **Recursos:**
  - Configuração persistente (localStorage)
  - Geração de mensagens formatadas
  - Logs de envio
  - Detecção de dispositivo (mobile/desktop)
  - Fallbacks para diferentes protocolos WhatsApp

### ✅ 2. Interface de Configuração
- **Arquivo:** `src/components/WhatsAppGroupConfig.tsx`
- **Localização:** `/admin/settings` (seção WhatsApp Grupo)
- **Recursos:**
  - Configurar URL do grupo WhatsApp
  - Ativar/desativar envio automático
  - Ativar/desativar sistema geral
  - Histórico de envios com logs
  - Teste de conexão com o grupo

### ✅ 3. Integração com Criação de Artigos
- **Arquivo:** `src/app/admin/articles/new/page.tsx` (modificado)
- **Funcionalidade:** Envio automático quando artigo é publicado
- **Fluxo:**
  1. Usuário publica artigo (status = 'published')
  2. Sistema automaticamente prepara dados do artigo
  3. Chama serviço WhatsApp com configuração ativa
  4. Abre WhatsApp com mensagem pré-formatada

## 📋 Como Funciona

### Fluxo de Publicação
```
1. Admin cria artigo → 2. Clica "Publicar" → 3. Artigo salvo no banco
                                            ↓
4. WhatsApp abre automaticamente ← 3. Sistema gera mensagem ← 2. Verifica se auto-send ativo
```

### Formato da Mensagem
```
📚 *Título da Notícia*

Resumo da notícia aqui... 🖼 Veja também a imagem!

🔗 Leia no Radar Noroeste: https://radarnoroestepr.com.br/noticia/slug-da-noticia
```

### Estrutura de Dados
```typescript
interface ArticleData {
  id: string
  title: string
  excerpt: string
  slug: string
  category_name: string
  featured_image?: string
  author_name: string
  published_at: string
}
```

## ⚙️ Configurações Disponíveis

### No Painel Admin (`/admin/settings`)

1. **URL do Grupo WhatsApp**
   - Link do grupo para onde as mensagens serão enviadas
   - Formato: `https://chat.whatsapp.com/IgDgvCJdgy38nFMQCyhy0L`
   - Padrão já configurado com o grupo fornecido

2. **Habilitar Sistema**
   - Liga/desliga todo o sistema de envio
   - Quando desabilitado, nenhuma mensagem é enviada

3. **Envio Automático**
   - Liga/desliga o envio automático na publicação
   - Quando desabilitado, sistema fica ativo mas não envia automaticamente

4. **Histórico de Envios**
   - Mostra últimos 50 envios realizados
   - Status (sucesso/erro) com timestamp
   - Detalhes de erros quando aplicável

## 🔧 Personalização de Emojis

### Emojis por Categoria
```javascript
'Política': '🏤',        // Prédio
'Economia': '💰',        // Dinheiro
'Esportes': '⚽',        // Futebol
'Cultura': '🎨',         // Arte
'Cidades': '🏠',         // Casa
'Tecnologia': '💻',      // Laptop
'Educação': '📚',        // Livros
'Meio Ambiente': '🌱',   // Planta
'Saúde': '❤️',          // Coração
'Segurança': '🚔',       // Polícia
'Turismo': '🏖️',        // Praia
'Entretenimento': '🎬'   // Cinema
```

### Emojis Especiais
- **🔗** - Link para artigo
- **🖼** - Indicador de imagem (quando artigo tem imagem)
- **📰** - Categoria padrão (fallback)

## 📱 Compatibilidade

### Desktop
- Abre WhatsApp Web automaticamente
- URL formato: `https://wa.me/g/[GROUP_ID]?text=[MESSAGE]`

### Mobile
1. **Prioridade 1:** Web Share API nativa (iOS/Android)
2. **Prioridade 2:** Protocolo `whatsapp://send?text=[MESSAGE]` 
3. **Prioridade 3:** Fallback para WhatsApp Web

## 🛡️ Tratamento de Erros

### Cenários Cobertos
1. **Configuração desabilitada** - Sistema não executa
2. **URL inválida** - Log de erro, não quebra fluxo principal
3. **Falha na geração da mensagem** - Log de erro detalhado
4. **Browser sem suporte** - Fallback para WhatsApp Web

### Logs Persistentes
- Armazenados em `localStorage`
- Máximo 50 entradas (FIFO)
- Inclui timestamp e detalhes do erro
- Visível no painel admin

## 🔐 Segurança

### Dados Sensíveis
- Configurações salvas apenas no cliente (localStorage)
- Não exposição de dados do grupo em logs
- Validação de URLs antes do envio

### Privacidade
- Sistema não coleta dados dos envios
- Logs ficam apenas local no navegador admin
- Fácil limpeza do histórico

## 🚀 Instruções de Uso

### Para Administradores

1. **Configuração Inicial**
   - Acesse `/admin/settings`
   - Vá até "Configurações do WhatsApp Grupo"
   - Verifique se URL do grupo está correta
   - Ative as opções desejadas
   - Clique em "Salvar Configurações"

2. **Testando o Sistema**
   - Use botão "Testar Conexão" para verificar grupo
   - Crie um artigo de teste
   - Publique e observe se WhatsApp abre automaticamente

3. **Monitoramento**
   - Verifique histórico de envios regularmente
   - Observe logs de erro para problemas
   - Limpe histórico quando necessário

### Para Redatores

1. **Processo Normal**
   - Criar artigo normalmente em `/admin/articles/new`
   - Preencher todos os campos necessários
   - **Importante:** Sempre adicionar um resumo (excerpt)
   - Usar imagem destacada quando possível

2. **Ao Publicar**
   - Clicar em "Publicar" (não "Salvar Rascunho")
   - WhatsApp abrirá automaticamente (se configurado)
   - Mensagem estará pré-formatada
   - Basta enviar no grupo

## 🔄 Manutenção

### Limpeza Regular
- Histórico de logs cresce com o tempo
- Usar "Limpar Histórico" periodicamente
- Recomendado: limpeza mensal

### Atualizações de URL
- Grupo do WhatsApp pode mudar
- Atualizar URL nas configurações quando necessário
- Usar "Testar Conexão" após mudanças

### Monitoramento
- Verificar logs de erro regularmente
- Observar padrões de falha
- Ajustar configurações se necessário

## 🐛 Solução de Problemas

### WhatsApp Não Abre
1. Verificar se sistema está habilitado
2. Verificar se auto-send está ativo
3. Testar URL do grupo manualmente
4. Verificar console do navegador por erros

### Mensagem Malformada
1. Verificar se artigo tem título e resumo
2. Confirmar categoria do artigo está correta
3. Verificar se URL do site está configurada
4. Testar com artigo simples

### Emojis Não Aparecem
- Emojis já foram otimizados para WhatsApp
- Problema pode ser do dispositivo/navegador
- Tentar em dispositivo diferente

## ✨ Funcionalidades Futuras

### Possíveis Melhorias
- [ ] Agendamento de envios
- [ ] Templates de mensagem personalizáveis
- [ ] Múltiplos grupos por categoria
- [ ] Integração com API WhatsApp Business
- [ ] Relatórios de engajamento
- [ ] Envio automático de resumos diários

---

## 📞 Suporte

Para dúvidas ou problemas:
1. Verificar logs no painel admin
2. Consultar esta documentação
3. Testar com configurações padrão
4. Verificar funcionamento básico do WhatsApp

**Sistema totalmente funcional e pronto para uso!** 🎉
