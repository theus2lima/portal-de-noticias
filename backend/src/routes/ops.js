// src/routes/ops.js
// Operational control endpoints — the engine behind the ops dashboard.
//
// All routes require the x-ops-key header matching env.OPS_SECRET.
// Never expose this on a public domain — host behind VPN or internal network.
//
// Endpoints:
//   GET  /ops/status               → overall system health
//   POST /ops/mode                 → set system mode
//   POST /ops/circuit              → override circuit breaker
//   POST /ops/rate-limit           → change rate limit mode
//   POST /ops/cache/purge          → clear all or specific cache key
//   POST /ops/cache/refresh        → trigger cache warming
//   POST /ops/block-ip             → block/unblock an IP
//   POST /ops/survival             → toggle survival mode
//   GET  /ops/logs                 → recent log entries
//   GET  /ops/logs/stream          → SSE stream of live logs

import { opsState }     from '../lib/opsState.js'
import { logBuffer }    from '../lib/logBuffer.js'
import { metrics }      from '../lib/metrics.js'
import { cachePing, cacheDel, redis } from '../cache/redis.js'
import { dbBreaker }    from '../services/newsService.js'
import { warmCache }    from '../lib/cacheWarmer.js'
import { supabase }     from '../db/supabase.js'
import { env }          from '../config/env.js'

// ─── Auth middleware ──────────────────────────────────────────────────────────

async function opsAuth(request, reply) {
  const key = request.headers['x-ops-key']
  if (!key || key !== env.OPS_SECRET) {
    reply.code(401).send({ error: 'Unauthorized' })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function checkSupabase() {
  try {
    const { error } = await supabase.from('articles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}

function computeOverallStatus(redisOk, dbOk) {
  const cbOpen = dbBreaker.state === 'OPEN'
  const mode   = opsState.mode

  if (!redisOk && (!dbOk || cbOpen)) return 'CRITICAL'
  if (!redisOk || !dbOk || cbOpen || mode !== 'NORMAL') return 'DEGRADED'
  return 'OK'
}

// ─── Route plugin ─────────────────────────────────────────────────────────────

export async function opsRoutes(fastify) {
  // Apply auth to every route in this plugin
  fastify.addHook('preHandler', opsAuth)

  // ── GET /ops/status ─────────────────────────────────────────────────────────
  fastify.get('/ops/status', async (_req, reply) => {
    const [redisOk, dbOk] = await Promise.all([
      cachePing(),
      checkSupabase(),
    ])

    const snap   = metrics.snapshot()
    const status = computeOverallStatus(redisOk, dbOk)

    return reply.send({
      status,
      redis:          redisOk ? 'UP' : 'DOWN',
      database:       dbOk    ? 'OK' : 'SLOW',
      circuit_breaker: dbBreaker.state,
      mode:           opsState.mode,
      rate_limit:     opsState.rateLimitMode,
      blocked_ips:    opsState.blockedIPs.size,

      // Key metrics inline so the status panel has everything in one request
      metrics: {
        requests_per_second:   snap.rates.requests_per_second,
        db_queries_per_second: snap.rates.db_queries_per_second,
        cache_hit_rate:        snap.derived.cache_hit_rate,
        error_rate:            snap.derived.error_rate,
        p95_latency:           snap.latency['GET /news']?.p95 ?? null,
        p99_latency:           snap.latency['GET /news']?.p99 ?? null,
      },

      timestamp: new Date().toISOString(),
    })
  })

  // ── POST /ops/mode ───────────────────────────────────────────────────────────
  // body: { mode: "NORMAL" | "CACHE_ONLY" | "DEGRADED" }
  fastify.post('/ops/mode', {
    schema: {
      body: {
        type: 'object',
        required: ['mode'],
        properties: { mode: { type: 'string', enum: ['NORMAL', 'CACHE_ONLY', 'DEGRADED'] } },
      },
    },
  }, async (req, reply) => {
    opsState.setMode(req.body.mode)
    return reply.send({ ok: true, mode: opsState.mode })
  })

  // ── POST /ops/circuit ────────────────────────────────────────────────────────
  // body: { action: "AUTO" | "FORCE_OPEN" | "FORCE_CLOSE" }
  fastify.post('/ops/circuit', {
    schema: {
      body: {
        type: 'object',
        required: ['action'],
        properties: { action: { type: 'string', enum: ['AUTO', 'FORCE_OPEN', 'FORCE_CLOSE'] } },
      },
    },
  }, async (req, reply) => {
    opsState.setCircuitOverride(req.body.action)
    return reply.send({ ok: true, circuitOverride: opsState.circuitOverride })
  })

  // ── POST /ops/rate-limit ─────────────────────────────────────────────────────
  // body: { mode: "NORMAL" | "STRICT" | "DISABLED" }
  fastify.post('/ops/rate-limit', {
    schema: {
      body: {
        type: 'object',
        required: ['mode'],
        properties: { mode: { type: 'string', enum: ['NORMAL', 'STRICT', 'DISABLED'] } },
      },
    },
  }, async (req, reply) => {
    opsState.setRateLimitMode(req.body.mode)
    return reply.send({ ok: true, rateLimitMode: opsState.rateLimitMode })
  })

  // ── POST /ops/cache/purge ────────────────────────────────────────────────────
  // body: { key?: "news:list:..." }  — omit key to clear ALL cache
  fastify.post('/ops/cache/purge', {
    schema: {
      body: {
        type: 'object',
        properties: { key: { type: 'string' } },
      },
    },
  }, async (req, reply) => {
    const { key } = req.body ?? {}

    if (key) {
      // Purge a specific key (try both raw and SWR-prefixed variants)
      await Promise.all([
        cacheDel(key),
        cacheDel(`swr:${key}`),
      ])
      logBuffer.push('INFO', `Cache purged: ${key}`, { key })
      return reply.send({ ok: true, purged: key })
    }

    // Full cache flush — use FLUSHDB carefully
    await redis.flushdb()
    logBuffer.push('WARN', 'Full cache flush executed')
    return reply.send({ ok: true, purged: 'ALL' })
  })

  // ── POST /ops/cache/refresh ──────────────────────────────────────────────────
  // Triggers cache warming asynchronously
  fastify.post('/ops/cache/refresh', async (_req, reply) => {
    logBuffer.push('INFO', 'Manual cache warming triggered')
    // Non-blocking
    warmCache(fastify.log).catch((err) =>
      logBuffer.push('ERROR', `Cache warming failed: ${err.message}`)
    )
    return reply.send({ ok: true, message: 'Cache warming started (async)' })
  })

  // ── POST /ops/block-ip ───────────────────────────────────────────────────────
  // body: { ip: "1.2.3.4", action: "block" | "unblock" }
  fastify.post('/ops/block-ip', {
    schema: {
      body: {
        type: 'object',
        required: ['ip', 'action'],
        properties: {
          ip:     { type: 'string' },
          action: { type: 'string', enum: ['block', 'unblock'] },
        },
      },
    },
  }, async (req, reply) => {
    const { ip, action } = req.body
    if (action === 'block') {
      opsState.blockIP(ip)
    } else {
      opsState.unblockIP(ip)
    }
    return reply.send({ ok: true, ip, action, blockedCount: opsState.blockedIPs.size })
  })

  // ── POST /ops/survival ───────────────────────────────────────────────────────
  // body: { active: true | false }
  fastify.post('/ops/survival', {
    schema: {
      body: {
        type: 'object',
        required: ['active'],
        properties: { active: { type: 'boolean' } },
      },
    },
  }, async (req, reply) => {
    if (req.body.active) {
      opsState.activateSurvivalMode()
    } else {
      opsState.deactivateSurvivalMode()
    }
    return reply.send({ ok: true, state: opsState.toJSON() })
  })

  // ── GET /ops/logs ────────────────────────────────────────────────────────────
  fastify.get('/ops/logs', {
    schema: {
      querystring: {
        type: 'object',
        properties: {
          limit: { type: 'integer', minimum: 1, maximum: 200, default: 100 },
          level: { type: 'string', enum: ['ERROR', 'WARN', 'INFO', 'DEBUG'] },
        },
      },
    },
  }, async (req, reply) => {
    let entries = logBuffer.recent(req.query.limit)
    if (req.query.level) {
      entries = entries.filter((e) => e.level === req.query.level)
    }
    return reply.send({ entries, count: entries.length })
  })

  // ── GET /ops/logs/stream ─────────────────────────────────────────────────────
  // Server-Sent Events — browser connects once, receives entries as they arrive
  fastify.get('/ops/logs/stream', async (req, reply) => {
    const res = reply.raw

    res.setHeader('Content-Type',  'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection',    'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')  // disable nginx buffering
    res.flushHeaders()

    // Send recent entries immediately so the UI isn't blank on connect
    const recent = logBuffer.recent(50)
    for (const entry of [...recent].reverse()) {
      res.write(`data: ${JSON.stringify(entry)}\n\n`)
    }

    // Subscribe to new entries
    const unsubscribe = logBuffer.subscribe(res)

    // Keep connection alive with SSE heartbeat every 20s
    const heartbeat = setInterval(() => {
      try { res.write(': heartbeat\n\n') }
      catch { clearInterval(heartbeat) }
    }, 20_000)

    // Clean up on disconnect
    req.socket.on('close', () => {
      unsubscribe()
      clearInterval(heartbeat)
    })
  })
}
