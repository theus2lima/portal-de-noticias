// src/lib/opsState.js
// Runtime control state — changed by /ops endpoints without restart.
//
// ⚠️  In-memory: each instance has its own copy.
//     On multi-instance deploys, push state changes to Redis and subscribe
//     on startup. Not implemented here — needed only at 5+ instances.
//
// Modes:
//   NORMAL     → standard operation
//   CACHE_ONLY → skip DB entirely; serve cache or return _degraded flag
//   DEGRADED   → DB timeout reduced (2s), all fallbacks aggressive
//
// CircuitOverride:
//   AUTO        → circuit breaker decides (default)
//   FORCE_OPEN  → always use fallback, DB is never called
//   FORCE_CLOSE → ignore circuit state, always call DB (careful!)
//
// RateLimitMode:
//   NORMAL   → env.RATE_LIMIT_MAX (default)
//   STRICT   → 20% of normal limit
//   DISABLED → no rate limiting (use only to unblock false positives)

import { log } from './logBuffer.js'

export const opsState = {
  mode:            'NORMAL',
  circuitOverride: 'AUTO',
  rateLimitMode:   'NORMAL',
  blockedIPs:      new Set(),

  // ── Convenience getters ───────────────────────────────────────────────────

  get isCacheOnly()  { return this.mode === 'CACHE_ONLY' },
  get isDegraded()   { return this.mode === 'DEGRADED' },
  get dbTimeoutMs()  { return this.isDegraded ? 2_000 : 5_000 },

  // ── Mode control ──────────────────────────────────────────────────────────

  setMode(mode) {
    const valid = ['NORMAL', 'CACHE_ONLY', 'DEGRADED']
    if (!valid.includes(mode)) throw new Error(`Invalid mode: ${mode}`)
    const prev = this.mode
    this.mode = mode
    log.info(`Mode changed: ${prev} → ${mode}`, { prev, next: mode })
  },

  // ── Circuit override ──────────────────────────────────────────────────────

  setCircuitOverride(action) {
    const valid = ['AUTO', 'FORCE_OPEN', 'FORCE_CLOSE']
    if (!valid.includes(action)) throw new Error(`Invalid circuit action: ${action}`)
    this.circuitOverride = action
    log.warn(`Circuit override → ${action}`, { action })
  },

  // ── Rate limit ────────────────────────────────────────────────────────────

  setRateLimitMode(mode) {
    const valid = ['NORMAL', 'STRICT', 'DISABLED']
    if (!valid.includes(mode)) throw new Error(`Invalid rate limit mode: ${mode}`)
    this.rateLimitMode = mode
    log.info(`Rate limit mode → ${mode}`, { mode })
  },

  // ── IP blocking ───────────────────────────────────────────────────────────

  blockIP(ip) {
    this.blockedIPs.add(ip)
    log.warn(`IP blocked: ${ip}`, { ip })
  },

  unblockIP(ip) {
    this.blockedIPs.delete(ip)
    log.info(`IP unblocked: ${ip}`, { ip })
  },

  isBlocked(ip) {
    return this.blockedIPs.has(ip)
  },

  // ── Survival mode (combo action) ──────────────────────────────────────────
  // Activates CACHE_ONLY + STRICT rate limit in one click.
  // Use during: pico de tráfego + banco lento.

  activateSurvivalMode() {
    this.mode = 'CACHE_ONLY'
    this.rateLimitMode = 'STRICT'
    log.warn('🔥 SURVIVAL MODE activated: CACHE_ONLY + STRICT rate limit')
  },

  deactivateSurvivalMode() {
    this.mode = 'NORMAL'
    this.rateLimitMode = 'NORMAL'
    log.info('Survival mode deactivated — back to NORMAL')
  },

  // ── Serialization ─────────────────────────────────────────────────────────

  toJSON() {
    return {
      mode:            this.mode,
      circuitOverride: this.circuitOverride,
      rateLimitMode:   this.rateLimitMode,
      blockedIPs:      [...this.blockedIPs],
      blockedIPCount:  this.blockedIPs.size,
    }
  },
}
