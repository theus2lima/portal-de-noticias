// src/lib/logBuffer.js
// In-memory ring buffer of recent log entries + SSE subscriber management.
//
// Usage:
//   import { log } from './logBuffer.js'
//   log.error('DB timeout', { requestId: 'abc', ms: 5001 })
//   log.warn('Cache miss spike')
//   log.info('Circuit breaker OPEN')
//
// The /ops/logs endpoint reads logBuffer.recent().
// The /ops/logs/stream endpoint streams new entries via SSE.

const MAX_ENTRIES = 300
const entries     = []
const subscribers = new Set()  // active SSE response streams

// ─── Core buffer ─────────────────────────────────────────────────────────────

export const logBuffer = {
  push(level, message, meta = {}) {
    const entry = {
      ts:      Date.now(),
      time:    new Date().toISOString(),
      level,   // ERROR | WARN | INFO | DEBUG
      message,
      ...meta,
    }

    // Prepend so index 0 is always the newest
    entries.unshift(entry)
    if (entries.length > MAX_ENTRIES) entries.pop()

    // Broadcast to connected SSE clients
    const payload = `data: ${JSON.stringify(entry)}\n\n`
    for (const sub of subscribers) {
      try {
        sub.write(payload)
      } catch {
        // Client disconnected — clean up
        subscribers.delete(sub)
      }
    }

    return entry
  },

  recent(limit = 100) {
    return entries.slice(0, Math.min(limit, MAX_ENTRIES))
  },

  // Returns an unsubscribe function
  subscribe(stream) {
    subscribers.add(stream)
    return () => subscribers.delete(stream)
  },

  subscriberCount() {
    return subscribers.size
  },

  clear() {
    entries.length = 0
  },
}

// ─── Convenience log methods ──────────────────────────────────────────────────

export const log = {
  error: (message, meta) => logBuffer.push('ERROR', message, meta),
  warn:  (message, meta) => logBuffer.push('WARN',  message, meta),
  info:  (message, meta) => logBuffer.push('INFO',  message, meta),
  debug: (message, meta) => logBuffer.push('DEBUG', message, meta),
}
