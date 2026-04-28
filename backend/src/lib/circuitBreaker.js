// src/lib/circuitBreaker.js
// Minimal circuit breaker — no external dependencies.
//
// State machine:
//   CLOSED   → normal operation, failures counted
//   OPEN     → fast-fail, calls fallback (stale cache / error) immediately
//   HALF_OPEN → single probe request: success → CLOSED, failure → OPEN
//
// Why not use a library (e.g. opossum)?
//   At this scale a hand-rolled breaker is ~40 lines and has zero risk of
//   version conflicts. Add opossum if you need per-request timeout tracking.

export class CircuitBreaker {
  /**
   * @param {object} opts
   * @param {string}  opts.name          — used in logs/metrics
   * @param {number}  [opts.threshold=5] — consecutive failures before opening
   * @param {number}  [opts.timeout=30000] — ms before attempting HALF_OPEN
   * @param {(state: string) => void} [opts.onStateChange] — observability hook
   */
  constructor({ name, threshold = 5, timeout = 30_000, onStateChange } = {}) {
    this.name          = name ?? 'unnamed'
    this.threshold     = threshold
    this.timeout       = timeout
    this.onStateChange = onStateChange ?? (() => {})

    this._state        = 'CLOSED'
    this._failures     = 0
    this._lastFailedAt = null
    this._halfOpenLock = false
  }

  get state() { return this._state }

  /**
   * Execute `fn`. If the circuit is open, call `fallback` instead.
   *
   * @param {() => Promise<any>} fn
   * @param {() => Promise<any>} [fallback]  — called when circuit is open
   * @returns {Promise<any>}
   */
  async call(fn, fallback) {
    if (this._state === 'OPEN') {
      const elapsed = Date.now() - this._lastFailedAt
      if (elapsed >= this.timeout) {
        this._transition('HALF_OPEN')
      } else {
        return this._runFallback(fallback)
      }
    }

    if (this._state === 'HALF_OPEN') {
      // Only one probe at a time
      if (this._halfOpenLock) {
        return this._runFallback(fallback)
      }
      this._halfOpenLock = true
    }

    try {
      const result = await fn()
      this._onSuccess()
      return result
    } catch (err) {
      this._onFailure()
      if (fallback) return fallback()
      throw err
    } finally {
      if (this._state === 'HALF_OPEN') this._halfOpenLock = false
    }
  }

  // ── Private ────────────────────────────────────────────────────────────────

  _onSuccess() {
    if (this._state !== 'CLOSED') {
      console.info(`[circuit:${this.name}] recovered → CLOSED`)
    }
    this._failures = 0
    this._transition('CLOSED')
  }

  _onFailure() {
    this._failures++
    this._lastFailedAt = Date.now()

    if (this._state === 'HALF_OPEN' || this._failures >= this.threshold) {
      console.warn(
        `[circuit:${this.name}] opened after ${this._failures} failure(s) — fast-failing for ${this.timeout / 1000}s`
      )
      this._transition('OPEN')
    }
  }

  _transition(newState) {
    if (this._state !== newState) {
      this._state = newState
      this.onStateChange(newState)
    }
  }

  async _runFallback(fallback) {
    if (fallback) return fallback()
    const err = new Error(`[circuit:${this.name}] circuit is OPEN`)
    err.code = 'CIRCUIT_OPEN'
    throw err
  }

  toJSON() {
    return {
      name:       this.name,
      state:      this._state,
      failures:   this._failures,
      lastFailed: this._lastFailedAt
        ? new Date(this._lastFailedAt).toISOString()
        : null,
    }
  }
}
