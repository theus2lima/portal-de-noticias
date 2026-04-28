# Backend Optimization — Análise e Decisões

## Prioridade das melhorias (impacto × esforço)

| # | Melhoria | Impacto | Já implementado |
|---|----------|---------|-----------------|
| 1 | **Stale-While-Revalidate** | 🔴 Alto — elimina picos de latência em expiração de cache | ✅ |
| 2 | **TTL Jitter** | 🔴 Alto — evita thundering herd na expiração simultânea | ✅ |
| 3 | **Circuit Breaker** | 🔴 Alto — impede cascata de falhas quando o banco trava | ✅ |
| 4 | **Query timeout** | 🟠 Médio-Alto — impede queries lentas de travar conexões | ✅ |
| 5 | **Cache warming no startup** | 🟠 Médio — elimina cold start em deploys e reinicializações | ✅ |
| 6 | **Métricas estruturadas + /metrics** | 🟠 Médio — sem observabilidade você opera no escuro | ✅ |
| 7 | **Índices no Postgres** | 🔴 Alto — impacto direto nas queries mais executadas | ⚠️ Manual |
| 8 | **Rate limit por IP** | 🟡 Médio — já existe; refinamentos abaixo | ✅ |
| 9 | **Horizontal scaling** | 🟡 Médio — já stateless; gargalos ocultos documentados abaixo | ✅ |

---

## 1. Cache: Stale-While-Revalidate + TTL Jitter

### Por que SWR importa sob carga

Sem SWR, quando um cache entry expira às 14:00:00 e há 500 usuários ativos, todos os 500 requests que chegam no mesmo segundo vão ao banco — mesmo que o conteúdo tenha mudado menos de 1%. O SWR serve o dado levemente desatualizado para 499 usuários enquanto apenas 1 request (em background) revalida.

```
softTTL (60s):  serve fresco
softTTL..hardTTL (60–300s): serve stale + revalida em background
> hardTTL: força fetch síncrono
```

**Trade-off:** usuários podem ver dados com até `hardTTL` segundos de atraso. Para notícias, 5 minutos é aceitável. Para preços ou resultados ao vivo, reduza `hardTTL`.

### TTL Jitter

Sem jitter, se você fizer um cache warming de 50 entradas com `TTL=60s`, todas expiram simultaneamente no segundo 60. Com jitter de 20%, a expiração é distribuída entre 60s e 72s, transformando um pico de 50 queries em 50 queries espalhadas.

---

## 2. Circuit Breaker

### Estados

```
CLOSED → operação normal, erros contados
  ↓ (5 falhas consecutivas)
OPEN → fast-fail por 30s, fallback para cache stale
  ↓ (após 30s)
HALF_OPEN → 1 request de probe
  ↓ sucesso       ↓ falha
CLOSED          OPEN (reinicia o timer)
```

### O que acontece quando o banco fica lento

Sem circuit breaker: cada request aguarda 5s (timeout) antes de falhar. Com 10k usuários e 200ms de TTL do load balancer, você acumula milhares de conexões abertas até esgotar o pool.

Com circuit breaker: após 5 falhas, o breaker abre. Os próximos 30s de requests recebem resposta em <1ms (fallback do cache), zero pressão no banco, zero novas conexões abertas.

### Configuração recomendada por ambiente

| Parâmetro | Desenvolvimento | Produção |
|-----------|-----------------|---------|
| threshold | 3 | 5 |
| timeout | 10s | 30s |
| DB_TIMEOUT_MS | 3s | 5s |

---

## 3. Índices no Postgres (executar no Supabase SQL Editor)

Esses índices cobrem ~90% das queries geradas pelo backend. Use `CONCURRENTLY` para não travar a tabela em produção.

```sql
-- Cobre a query principal: filtro por status + ordenação por data
-- Usada em TODA listagem de notícias
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_status_published
ON articles (status, published_at DESC);

-- Cobre buscas por slug (página de artigo individual)
-- Partial index: só indexa publicados, menor tamanho, mais rápido
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_slug_published
ON articles (slug)
WHERE status = 'published';

-- Cobre filtro por categoria + status + ordenação (listagem por categoria)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_articles_category_status
ON articles (category_id, status, published_at DESC);

-- Cobre o JOIN com categories nas queries de listagem
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_categories_slug
ON categories (slug);
```

**Como verificar se os índices estão sendo usados:**
```sql
EXPLAIN ANALYZE
SELECT id, title, slug FROM articles
WHERE status = 'published'
ORDER BY published_at DESC
LIMIT 20;
-- Deve mostrar "Index Scan" em vez de "Seq Scan"
```

---

## 4. Rate Limiting — Refinamentos

### Configuração atual
- Limite global por IP, todos os endpoints com o mesmo teto.

### O que ajustar em produção

**Problema:** um bot que bate em `/news/uuid-aleatorio` 120x por minuto consome a mesma quota de um usuário legítimo navegando pela homepage. O usuário legítimo pode ser bloqueado por culpa do bot.

**Solução: limites por rota**

```js
// Dentro de src/routes/news.js
fastify.get('/news', {
  config: { rateLimit: { max: 60, timeWindow: '1 minute' } },
  schema: listNewsSchema,
}, listNews)

fastify.get('/news/:id', {
  config: { rateLimit: { max: 120, timeWindow: '1 minute' } },
  schema: getNewsSchema,
}, getNews)
```

**Usuários atrás de NAT:** uma empresa com 50 funcionários pode aparecer como 50 requests do mesmo IP. Considere usar um token de API para clientes confiáveis com limite elevado.

**Cabeçalhos de resposta** (já inclusos pelo @fastify/rate-limit):
```
X-RateLimit-Limit: 120
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1714235060
```

---

## 5. Observabilidade

### Métricas expostas em `GET /metrics`

```json
{
  "counters": {
    "http_requests_total": 48291,
    "cache_hits_total": 45810,
    "cache_misses_total": 2481,
    "cache_stale_total": 312,
    "db_queries_total": 2481,
    "db_errors_total": 3,
    "circuit_breaker_opens": 0,
    "rate_limit_hits": 14
  },
  "latency": {
    "GET /news":    { "p50": 4, "p95": 12, "p99": 38 },
    "GET /news/:id": { "p50": 3, "p95": 9,  "p99": 22 }
  }
}
```

**Cache hit rate saudável:** > 95%. Se estiver abaixo de 90%, o TTL está muito curto ou o volume de content único é alto demais.

**Alarmes recomendados:**
- `p99 > 500ms` durante 2 minutos consecutivos → investigar banco
- `cache_hit_rate < 85%` → revisar TTLs
- `circuit_breaker_opens > 0` → ação imediata
- `db_errors_total` crescendo → verificar Supabase

### Logging estruturado

Cada request já loga com `requestId` único. Em produção com Loki ou Datadog, você consegue fazer:

```bash
# Rastrear um request específico
{service="news-backend"} | json | requestId="abc-123"

# Ver todos os erros 500 da última hora
{service="news-backend"} | json | statusCode >= 500
```

### Monitoramento recomendado (por orçamento)

| Opção | Custo | Quando usar |
|-------|-------|-------------|
| **Betterstack** | Free tier generoso | Startups / projetos pequenos |
| **Datadog** | ~$15/host/mês | Quando precisar de APM e tracing |
| **Grafana Cloud** | Free até 50GB logs | Quando já usar Prometheus |
| **Sentry** | Free até 5k erros/mês | Para rastreamento de exceptions |

---

## 6. Escalabilidade Horizontal — Gargalos Ocultos

### O que já funciona perfeitamente em multi-instância
- Stateless: sem sessão, sem estado local entre requests ✅
- Redis como cache compartilhado: todas as instâncias leem/escrevem no mesmo cache ✅
- Circuit breaker: cada instância tem o seu — é o comportamento correto (falhas locais) ✅

### Gargalos reais ao adicionar instâncias

**1. O `inflight` Map (deduplicação) é por instância**

Com 3 instâncias e um cache miss simultâneo, cada instância pode disparar 1 query ao banco — ou seja, 3 queries em vez de 1. Isso é aceitável e não configura bug, mas é importante saber.

Para deduplicação cross-instância real, precisaria de Redis locks (Redlock). Não recomendo — a complexidade não justifica o ganho para a maioria dos cenários.

**2. Supabase tem pool de conexões limitado**

O Supabase usa PgBouncer, mas o pool padrão tem ~60 conexões. Com 5 instâncias cada fazendo 10 queries paralelas = 50 conexões simultâneas — próximo do limite.

**Mitigação:** use o modo `transaction` do PgBouncer (já é o default no Supabase) e nunca abra conexões longas (sem `listen/notify` via cliente).

**3. Cache warming no startup**

Com 3 instâncias subindo ao mesmo tempo, todas elas dispararão `warmCache()` simultâneamente — gerando 3x as queries de warming. Solução simples: adicionar um delay aleatório de 0–5s antes do warming.

```js
// Em server.js
const delay = Math.random() * 5000
setTimeout(() => warmCache(app.log), delay)
```

---

## 7. Cenários de Falha

### Redis cai completamente

1. `cacheGet` retorna `null` (não lança exceção)
2. `swrGet` cai direto no fetcher
3. Cada request vai ao Supabase individualmente
4. O `inflight` Map ainda deduplica por instância
5. **Impacto:** carga no banco aumenta 10–20x; sem redis o sistema funciona mas vai lento

**Recuperação:** quando Redis volta, o cache é populado progressivamente. Não precisa de ação manual.

**Proteção adicional:** se Redis cair durante alta carga, o circuit breaker pode abrir (banco sobrecarregado). O sistema entra em modo degradado: retorna respostas vazias com `_degraded: true`. Configure o frontend para mostrar um banner de "Conteúdo temporariamente indisponível".

### Banco fica lento (>5s por query)

1. Requests aguardam até `DB_TIMEOUT_MS` (5s) e falham
2. Após 5 falhas consecutivas, o circuit breaker abre
3. Requests seguintes recebem fallback instantâneo (cache stale ou lista vazia)
4. Após 30s, o breaker testa uma probe request
5. Se o banco recuperou → CLOSED; se ainda lento → OPEN por mais 30s

**Durante o período OPEN:** usuários recebem dados do cache (potencialmente com até `hardTTL` segundos de atraso). O site funciona em modo leitura degradado. Sem timeouts visíveis para o usuário.

### Pico repentino de tráfego (10x normal)

1. **SWR absorve a maioria**: requests para conteúdo já cacheado (hardTTL ainda válido) respondem em <5ms sem tocar no banco
2. **Deduplicação absorve o restante**: múltiplos requests simultâneos para o mesmo cache-miss disparam uma única query
3. **Rate limit bloqueia abuso**: bots ou scrapers que disparam centenas de requests por segundo são cortados no limite por IP
4. **Circuit breaker como último recurso**: se o banco não aguentar, abre o breaker e serve stale ao invés de deixar o banco cair em cascata

**O risco real em picos:** a deduplicação é por instância. Se você escalar para 10 instâncias durante o pico, um cache miss pode gerar 10 queries ao banco simultâneas para o mesmo recurso. Monitore `db_queries_total` vs `http_requests_total`; a proporção deve ser < 5% em condições normais.

---

## 8. O que NÃO fazer (overengineering)

- ❌ **Redlock** para deduplicação cross-instância: complexidade alta, ganho marginal
- ❌ **Message queue** (Redis Pub/Sub) para invalidação de cache: desnecessário sem cache distribuído entre serviços
- ❌ **Distributed tracing** (OpenTelemetry): relevante acima de 5+ serviços; aqui é 1
- ❌ **Redis Cluster**: um único Redis aguenta 100k+ ops/s; desnecessário a 10k usuários
- ❌ **GraphQL caching**: adiciona camada de complexidade sem benefício claro em leitura simples
