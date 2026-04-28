// src/services/newsService.js
// All business logic. Read strategy per request:
//
//   1. swrGet (Redis SWR) → fresh hit: return immediately
//   2. Check opsState:
//      - CACHE_ONLY → skip DB entirely; return stale/empty
//      - circuitOverride FORCE_OPEN → skip DB, use fallback
//      - circuitOverride FORCE_CLOSE → bypass circuit, call DB directly
//   3. CLOSED/AUTO → circuit breaker calls DB with timeout
//   4. Deduplication: inflight Map ensures one DB query per unique key

import { supabase }                   from '../db/supabase.js'
import { swrGet, cacheGet }           from '../cache/redis.js'
import { CircuitBreaker }             from '../lib/circuitBreaker.js'
import { metrics }                    from '../lib/metrics.js'
import { opsState }                   from '../lib/opsState.js'
import { log }                        from '../lib/logBuffer.js'
import { env }                        from '../config/env.js'

// ─── Circuit breaker ──────────────────────────────────────────────────────────
export const dbBreaker = new CircuitBreaker({
  name:      'supabase',
  threshold:  5,
  timeout:    30_000,
  onStateChange: (state) => {
    if (state === 'OPEN') {
      metrics.inc('circuit_breaker_opens')
      log.warn('Circuit breaker OPEN — DB calls suspended for 30s', { state })
    } else {
      log.info(`Circuit breaker → ${state}`, { state })
    }
  },
})

// ─── Request deduplication ────────────────────────────────────────────────────
const inflight = new Map()

async function dedup(key, fn) {
  if (inflight.has(key)) return inflight.get(key)
  const promise = fn().finally(() => inflight.delete(key))
  inflight.set(key, promise)
  return promise
}

// ─── Query timeout ────────────────────────────────────────────────────────────
// Respects opsState.dbTimeoutMs (5s normal, 2s degraded)
function withTimeout(promise, label) {
  const ms = opsState.dbTimeoutMs
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        log.warn(`DB timeout: ${label} exceeded ${ms}ms`, { label, ms })
        reject(new Error(`[timeout] ${label} exceeded ${ms}ms`))
      }, ms)
    ),
  ])
}

// ─── Cache key builder ────────────────────────────────────────────────────────
function key(...parts) { return parts.join(':') }

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getNewsList({ page = 1, limit = 20, category } = {}) {
  const cacheKey = key('news:list', category ?? 'all', page, limit)

  const { data, stale } = await swrGet(
    cacheKey,
    () => dedup(cacheKey, () => fetchNewsList({ page, limit, category })),
    { softTTL: env.CACHE_TTL, hardTTL: env.CACHE_TTL * 5 }
  )

  if (stale) metrics.inc('cache_stale_total')
  return data
}

export async function getNewsById(id) {
  const cacheKey = key('news:item', id)

  const { data, stale } = await swrGet(
    cacheKey,
    () => dedup(cacheKey, () => fetchNewsById(id)),
    { softTTL: env.CACHE_TTL * 2, hardTTL: env.CACHE_TTL * 10 }
  )

  if (stale) metrics.inc('cache_stale_total')
  return data
}

// ─── DB fetchers ──────────────────────────────────────────────────────────────
// These are called only on SWR cache miss or background revalidation.

async function fetchNewsList({ page, limit, category }) {
  // ── opsState: CACHE_ONLY ───────────────────────────────────────────────────
  if (opsState.isCacheOnly) {
    log.info('CACHE_ONLY: skipping DB for getNewsList')
    // Return stale cache if available, otherwise empty shell
    const stale = await cacheGet(`swr:news:list:${category ?? 'all'}:${page}:${limit}`)
    return stale?.data ?? { data: [], total: 0, page, limit, _degraded: true }
  }

  metrics.inc('db_queries_total')

  // ── opsState: FORCE_OPEN ───────────────────────────────────────────────────
  if (opsState.circuitOverride === 'FORCE_OPEN') {
    log.warn('FORCE_OPEN override: skipping DB')
    return { data: [], total: 0, page, limit, _degraded: true }
  }

  const dbCall = async () => {
    const from = (page - 1) * limit
    const to   = from + limit - 1

    let query = supabase
      .from('articles')
      .select(
        `id, title, slug, summary, image_url, published_at, views_count,
         categories(id, name, slug), users(id, name)`,
        { count: 'exact' }
      )
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .range(from, to)

    if (category) query = query.eq('categories.slug', category)

    const { data, error, count } = await withTimeout(query, 'getNewsList')

    if (error) {
      metrics.inc('db_errors_total')
      log.error(`DB error in getNewsList: ${error.message}`, { error: error.message })
      throw new Error(`[supabase] getNewsList: ${error.message}`)
    }

    metrics.inc('cache_misses_total')
    return { data: data ?? [], total: count ?? 0, page, limit }
  }

  // ── opsState: FORCE_CLOSE → bypass circuit breaker ─────────────────────────
  if (opsState.circuitOverride === 'FORCE_CLOSE') {
    log.warn('FORCE_CLOSE override: bypassing circuit breaker')
    return dbCall()
  }

  // ── Normal path: circuit breaker decides ───────────────────────────────────
  return dbBreaker.call(dbCall, async () => {
    log.warn('Circuit OPEN: returning degraded fallback for getNewsList')
    return { data: [], total: 0, page, limit, _degraded: true }
  })
}

async function fetchNewsById(id) {
  if (opsState.isCacheOnly) {
    log.info(`CACHE_ONLY: skipping DB for getNewsById id=${id}`)
    const stale = await cacheGet(`swr:news:item:${id}`)
    return stale?.data ?? null
  }

  metrics.inc('db_queries_total')

  if (opsState.circuitOverride === 'FORCE_OPEN') {
    log.warn(`FORCE_OPEN: skipping DB for id=${id}`)
    return null
  }

  const dbCall = async () => {
    const { data, error } = await withTimeout(
      supabase
        .from('articles')
        .select(
          `id, title, slug, content, summary, image_url, published_at, views_count,
           categories(id, name, slug), users(id, name)`
        )
        .eq('id', id)
        .eq('status', 'published')
        .single(),
      'getNewsById'
    )

    if (error) {
      if (error.code === 'PGRST116') return null
      metrics.inc('db_errors_total')
      log.error(`DB error in getNewsById: ${error.message}`, { id, error: error.message })
      throw new Error(`[supabase] getNewsById: ${error.message}`)
    }

    metrics.inc('cache_misses_total')
    return data
  }

  if (opsState.circuitOverride === 'FORCE_CLOSE') return dbCall()

  return dbBreaker.call(dbCall, async () => {
    log.warn(`Circuit OPEN: null fallback for id=${id}`)
    return null
  })
}
