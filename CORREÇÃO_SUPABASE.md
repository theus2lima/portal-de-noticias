# 🛠️ Correção do Erro no Google News Collector

## Problema Identificado
O coletor do Google News estava apresentando erro "Erro interno do servidor" devido à falta da coluna `metadata` na tabela `news_sources` do Supabase.

## ✅ Correções Aplicadas no Código
1. **Removida dependência da coluna `metadata`** na função de atualização de estatísticas
2. **Simplificada a criação da fonte Google News** para usar apenas campos existentes
3. **Removida referência ao `metadata.last_results`** na função GET
4. **Código deployado** com sucesso no Vercel

## 📋 Próximos Passos - Correção no Supabase

### Opção 1: Executar SQL via Dashboard do Supabase
1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Vá para o projeto do Portal de Notícias
3. Navegue até **SQL Editor**
4. Execute o seguinte comando SQL:

```sql
-- Adicionar coluna metadata se não existir
ALTER TABLE news_sources 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Adicionar descrição se não existir
ALTER TABLE news_sources 
ADD COLUMN IF NOT EXISTS description TEXT;

-- Atualizar registros existentes com metadata vazio
UPDATE news_sources 
SET metadata = '{}'::jsonb 
WHERE metadata IS NULL;
```

### Opção 2: Via CLI do Supabase (se disponível)
```bash
supabase db reset
# ou
supabase db push
```

## 🧪 Teste da Correção
Após aplicar a correção no Supabase:

1. Acesse: https://portal-de-noticias-f75r0hw8t-theus2limaas-projects.vercel.app/admin
2. Faça login no painel administrativo
3. Vá para: **Curadoria** → **Google News**
4. Teste a coleta com termo "Brasil" ou "Paraná"

## 📄 Arquivos Relacionados
- `database/fix-news-sources-metadata.sql` - Script de correção completo
- `src/app/api/news-collector/google-news/route.ts` - API corrigida
- `src/components/admin/GoogleNewsCollector.tsx` - Interface do usuário

## 🔄 Status
- ✅ Código corrigido e deployado
- ⏳ **PENDENTE: Aplicar correção no banco Supabase**
- ⏳ Teste final do coletor

---

**Nota:** O coletor funcionará normalmente após a aplicação da correção no Supabase. O código já está preparado para funcionar com ou sem a coluna metadata.
