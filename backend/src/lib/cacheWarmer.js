// src/lib/cacheWarmer.js
// Pre-populates cache for critical endpoints at server startup.
//
// Why: the first request after a cold start (or after Redis flush) hits the DB.
// At 10k concurrent users, a cold start during peak hours means thousands of
// simultaneous DB queries before any cache entry is written. Warming prevents this.
//
// What to warm: only the most-requested, cheapest-to-compute entries.
//   - Page 1 of the news list (covers ~80% of homepage traffic)
//   - Top 3-5 categories
//   - Nothing more — warming too much adds startup time and DB load

import { getNewsList } from '../services/newsService.js'

// Add your most-visited category slugs here
const TOP_CATEGORIES = ['politica', 'economia', 'esportes']

/**
 * Run cache warming asynchronously after server is ready.
 * Errors are caught and logged — a warming failure must never block startup.
 *
 * @param {import('fastify').FastifyInstance} log
 */
export async function warmCache(log) {
  log.info('[cacheWarmer] starting...')

  const tasks = [
    // Main listing — page 1, default limit
    () => getNewsList({ page: 1, limit: 20 }),
    // Per-category first pages
    ...TOP_CATEGORIES.map((cat) => () => getNewsList({ page: 1, limit: 20, category: cat })),
  ]

  const results = await Promise.allSettled(tasks.map((t) => t()))

  const failed = results.filter((r) => r.status === 'rejected')
  if (failed.length) {
    log.warn(`[cacheWarmer] ${failed.length}/${tasks.length} tasks failed`)
  } else {
    log.info(`[cacheWarmer] warmed ${tasks.length} cache entries ✓`)
  }
}
