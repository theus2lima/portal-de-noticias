// src/server.js
// Entry point — builds the app and starts listening.

import { buildApp }   from './app.js'
import { env }         from './config/env.js'
import { warmCache }   from './lib/cacheWarmer.js'

async function start() {
  const app = await buildApp()

  const shutdown = async () => {
    app.log.info('Shutting down gracefully...')
    await app.close()
    process.exit(0)
  }
  process.on('SIGTERM', shutdown)
  process.on('SIGINT',  shutdown)

  try {
    await app.listen({ port: env.PORT, host: '0.0.0.0' })
    app.log.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`)

    // Warm cache after server is ready — non-blocking, never throws
    warmCache(app.log).catch((err) => app.log.warn('[cacheWarmer] unexpected error:', err))
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}

start()
