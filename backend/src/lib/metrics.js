// src/lib/metrics.js
// In-process metrics: counters + latency histograms + sliding-window rates.
//
// Rates (req/s, db/s, error_rate) are computed from a 60-second sliding window
// of timestamps — no external state, no timer loops, computed on demand.
//
// Expose via GET /metrics. In production, scrape from there or push to Datadog.

// ─── Counters ─────────────────────────────────────────────────────────────────

const counters = {
  http_requests_total:    0,
  http_errors_total:      0,
  cache_hits_total:       0,
  cache_misses_total:     0,
  cache_stale_total:      0,
  db_queries_total:       0,
  db_errors_total:        0,
  circuit_breaker_opens:  0,
  rate_limit_hits:        0,
}

// ─── Sliding-window timestamps (last 60s) ─────────────────────────────────────

const WINDOW_MS = 60_000
const timestamps = {
  requests: [],
  dbQueries: [],
  errors: [],
}

function push(bucket) {
  const now = Date.now()
  timestamps[bucket].push(now)
  // Evict entries older than the window
  const cutoff = now - WINDOW_MS
  while (timestamps[bucket].length > 0 && timestamps[bucket][0] < cutoff) {
    timestamps[bucket].shift()
  }
}

function ratePerSecond(bucket) {
  const now    = Date.now()
  const cutoff = now - WINDOW_MS
  const count  = timestamps[bucket].filter((t) => t > cutoff).length
  return Math.round((count / (WINDOW_MS / 1000)) * 10) / 10  // 1 decimal
}

// ─── Latency histograms ───────────────────────────────────────────────────────

const LATENCY_WINDOW = 1000
const latencySamples = {
  'GET /news':     [],
  'GET /news/:id': [],
}

function percentile(arr, p) {
  if (arr.length === 0) return null
  const sorted = [...arr].sort((a, b) => a - b)
  const idx    = Math.ceil((p / 100) * sorted.length) - 1
  return sorted[Math.max(0, idx)]
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const metrics = {
  // Increment a named counter and optionally track its rate
  inc(name, by = 1) {
    if (name in counters) {
      counters[name] += by
      if (name === 'http_requests_total') push('requests')
      if (name === 'db_queries_total')    push('dbQueries')
      if (name === 'http_errors_total')   push('errors')
    }
  },

  // Record a latency sample (ms) for a known route
  recordLatency(route, ms) {
    const bucket = latencySamples[route]
    if (!bucket) return
    bucket.push(ms)
    if (bucket.length > LATENCY_WINDOW) bucket.shift()
  },

  // Full snapshot used by /metrics and /ops/status
  snapshot() {
    const totalRequests = counters.http_requests_total
    const totalErrors   = counters.http_errors_total
    const cacheTotal    = counters.cache_hits_total + counters.cache_misses_total

    const latency = {}
    for (const [route, samples] of Object.entries(latencySamples)) {
      latency[route] = samples.length === 0 ? null : {
        p50:     percentile(samples, 50),
        p95:     percentile(samples, 95),
        p99:     percentile(samples, 99),
        avg:     Math.round(samples.reduce((a, b) => a + b, 0) / samples.length),
        samples: samples.length,
      }
    }

    return {
      // Rates (computed from sliding window)
      rates: {
        requests_per_second:  ratePerSecond('requests'),
        db_queries_per_second: ratePerSecond('dbQueries'),
        errors_per_second:    ratePerSecond('errors'),
      },

      // Derived ratios
      derived: {
        cache_hit_rate: cacheTotal === 0
          ? null
          : Math.round((counters.cache_hits_total / cacheTotal) * 1000) / 10,
        error_rate: totalRequests === 0
          ? null
          : Math.round((totalErrors / totalRequests) * 10000) / 100,
      },

      // Raw counters (lifetime, since last restart)
      counters: { ...counters },

      // Latency histograms (last 1000 samples per route)
      latency,

      // Process health
      process: {
        uptime_seconds: Math.floor(process.uptime()),
        memory_mb:      Math.round(process.memoryUsage().rss / 1024 / 1024),
        node_version:   process.version,
      },

      timestamp: new Date().toISOString(),
    }
  },
}
