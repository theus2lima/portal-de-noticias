// src/routes/health.js
// Health check endpoint used by load balancers, Render, Railway, etc.
// Returns 200 when everything is fine, 503 when a critical dependency is down.

import { supabase } from '../db/supabase.js'
import { cachePing } from '../cache/redis.js'

/**
 * @param {import('fastify').FastifyInstance} fastify
 */
export async function healthRoutes(fastify) {
  fastify.get('/health', async (_request, reply) => {
    const [redisOk, supabaseOk] = await Promise.all([
      cachePing(),
      checkSupabase(),
    ])

    const status = redisOk && supabaseOk ? 'ok' : 'degraded'
    const code   = status === 'ok' ? 200 : 503

    return reply.code(code).send({
      status,
      timestamp: new Date().toISOString(),
      services: {
        redis:    redisOk    ? 'up' : 'down',
        supabase: supabaseOk ? 'up' : 'down',
      },
    })
  })
}

async function checkSupabase() {
  try {
    // Lightweight query — just check connectivity
    const { error } = await supabase.from('articles').select('id').limit(1)
    return !error
  } catch {
    return false
  }
}
