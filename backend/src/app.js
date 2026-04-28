// src/app.js
// Fastify application factory.

import Fastify     from 'fastify'
import cors        from '@fastify/cors'
import rateLimit   from '@fastify/rate-limit'

import { env }          from './config/env.js'
import { newsRoutes }   from './routes/news.js'
import { healthRoutes } from './routes/health.js'
import { opsRoutes }    from './routes/ops.js'
import { metrics }      from './lib/metrics.js'
import { opsState }     from './lib/opsState.js'
import { log }          from './lib/logBuffer.js'
import { dbBreaker }    from './services/newsService.js'

export async function buildApp() {
  const fastify = Fastify({
    genReqId: (req) => req.headers['x-request-id'] ?? crypto.randomUUID(),
    logger: {
      level: env.NODE_ENV === 'production' ? 'info' : 'debug',
      transport: env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:HH:MM:ss' } }
        : undefined,
      redact: ['req.headers.authorization', 'req.headers.cookie', 'req.headers["x-ops-key"]'],
    },
    ajv: {
      customOptions: { allErrors: true, coerceTypes: 'array' },
    },
    // Trust proxy headers (X-Forwarded-For) for Railway, Render, nginx
    trustProxy: true,
  })

  // ── IP blocking ───────────────────────────────────────────────────────────────
  // Checked before rate limiting — blocked IPs get 403 immediately
  fastify.addHook('onRequest', async (req, reply) => {
    const ip = req.ip
    if (opsState.isBlocked(ip)) {
      log.warn(`Blocked IP attempted request: ${ip}`, { ip, url: req.url })
      reply.code(403).send({ error: 'Forbidden' })
    }
  })

  // ── Request ID propagation ────────────────────────────────────────────────────
  fastify.addHook('onSend', async (req, reply) => {
    reply.header('x-request-id', req.id)
  })

  // ── Observability hooks ───────────────────────────────────────────────────────
  fastify.addHook('onRequest', async () => {
    metrics.inc('http_requests_total')
  })

  fastify.addHook('onResponse', async (req, reply) => {
    const ms    = reply.elapsedTime
    const route = req.routeOptions?.url ?? req.url

    if (route === '/api/v1/news')     metrics.recordLatency('GET /news', ms)
    if (route === '/api/v1/news/:id') metrics.recordLatency('GET /news/:id', ms)

    if (reply.statusCode >= 500) metrics.inc('http_errors_total')

    // Feed slow requests into the ops log buffer
    if (ms > 2000) {
      log.warn(`Slow request: ${ms.toFixed(0)}ms ${req.url}`, {
        ms: Math.round(ms),
        url:    req.url,
        status: reply.statusCode,
        requestId: req.id,
      })
    }
  })

  // ── CORS ──────────────────────────────────────────────────────────────────────
  const allowedOrigins = env.CORS_ORIGINS === '*'
    ? '*'
    : env.CORS_ORIGINS.split(',').map((s) => s.trim())

  await fastify.register(cors, {
    origin:  allowedOrigins,
    methods: ['GET', 'OPTIONS', 'POST'],
  })

  // ── Rate Limiting ──────────────────────────────────────────────────────────────
  // Dynamic: respects opsState.rateLimitMode at request time.
  //   NORMAL   → env.RATE_LIMIT_MAX
  //   STRICT   → 20% of max (emergency throttle)
  //   DISABLED → no limit (use to unblock false positives)
  await fastify.register(rateLimit, {
    // Skip entirely when DISABLED
    skip: () => opsState.rateLimitMode === 'DISABLED',

    // Max is evaluated per-request so mode changes take effect immediately
    max: () => {
      if (opsState.rateLimitMode === 'STRICT') {
        return Math.max(1, Math.floor(env.RATE_LIMIT_MAX * 0.2))
      }
      return env.RATE_LIMIT_MAX
    },

    timeWindow: env.RATE_LIMIT_WINDOW,
    onExceeding: (_req) => metrics.inc('rate_limit_hits'),
    errorResponseBuilder: (_req, context) => ({
      error:      'Too Many Requests',
      message:    `Rate limit exceeded. Retry in ${context.after}.`,
      retryAfter: context.after,
    }),
  })

  // ── Global error handler ───────────────────────────────────────────────────────
  fastify.setErrorHandler((error, request, reply) => {
    const statusCode = error.statusCode ?? 500
    const message    = env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal Server Error'
      : error.message

    if (statusCode >= 500) {
      log.error(`${statusCode} ${request.method} ${request.url}: ${error.message}`, {
        requestId: request.id,
        statusCode,
      })
    }

    request.log.error({ err: error, requestId: request.id }, 'Request error')
    reply.code(statusCode).send({ error: message, requestId: request.id })
  })

  fastify.setNotFoundHandler((_req, reply) => {
    reply.code(404).send({ error: 'Not Found' })
  })

  // ── Routes ────────────────────────────────────────────────────────────────────
  await fastify.register(healthRoutes)
  await fastify.register(newsRoutes,  { prefix: '/api/v1' })
  await fastify.register(opsRoutes)   // /ops/* — protected by x-ops-key

  // ── Internal metrics (unprotected — consider IP-limiting in prod) ─────────────
  fastify.get('/metrics', async (_req, reply) => {
    return reply.send({
      ...metrics.snapshot(),
      circuit_breaker: dbBreaker.toJSON(),
      ops_state:       opsState.toJSON(),
    })
  })

  return fastify
}
