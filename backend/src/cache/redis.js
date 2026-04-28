// src/cache/redis.js
// Redis client (ioredis) with helpers for:
//   - Basic get/set/del (raw cache)
//   - Stale-While-Revalidate (SWR): serve stale + refresh in background
//   - TTL jitter: spread expiration times to prevent thundering herd
// All helpers degrade gracefully — callers fall back to DB if Redis is down.

import Redis from 'ioredis'
import { env } from '../config/env.js'

// ─── Client ──────────────────────────────────────────────────────────────────

const redis = new Redis(env.REDIS_URL, {
  enableOfflineQueue: false,
  // Give up after 3 retries (~6s) — don't pile up connections
  retryStrategy: (times) => (times > 3 ? null : Math.min(times * 500, 2000)),
  lazyConnect: true,
  // Hard timeout per command — prevents a slow Redis from hanging requests
  commandTimeout: 200,
})

redis.on('error', (err) => {
  console.warn('[redis] connection error:', err.message)
})

redis.connect().catch(() => {
  console.warn('[redis] initial connect failed — running without cache')
})

export { redis }

// ─── TTL Jitter ──────────────────────────────────────────────────────────────
// Adds ±jitterPct random offset to TTL so cache entries set at the same time
// don't expire simultaneously and cause a burst of DB queries.
//
// Example: jitteredTTL(60, 0.25) → anywhere from 60s to 75s
//
export function jitteredTTL(baseTTL = env.CACHE_TTL, jitterPct = 0.2) {
  return Math.floor(baseTTL * (1 + jitterPct * Math.random()))
}

// ─── Basic Helpers ───────────────────────────────────────────────────────────

export async function cacheGet(key) {
  try {
    const raw = await redis.get(key)
    if (!raw) return null
    return JSON.parse(raw)
  } catch (err) {
    console.warn(`[redis] GET error "${key}":`, err.message)
    return null
  }
}

export async function cacheSet(key, value, ttl = env.CACHE_TTL) {
  try {
    await redis.set(key, JSON.stringify(value), 'EX', jitteredTTL(ttl))
    return true
  } catch (err) {
    console.warn(`[redis] SET error "${key}":`, err.message)
    return false
  }
}

export async function cacheDel(...keys) {
  try {
    if (keys.length > 0) await redis.del(...keys)
  } catch (err) {
    console.warn('[redis] DEL error:', err.message)
  }
}

export async function cachePing() {
  try {
    return (await redis.ping()) === 'PONG'
  } catch {
    return false
  }
}

// ─── Stale-While-Revalidate ──────────────────────────────────────────────────
// Stores entries as { data, cachedAt } so we can reason about their age.
//
// Strategy:
//   age < softTTL  → fresh, return immediately
//   age < hardTTL  → stale, return immediately AND revalidate in background
//   age ≥ hardTTL  → expired, fetch synchronously
//
// This eliminates cache-miss latency spikes for popular but slightly stale data.
// Trade-off: clients may receive data up to hardTTL seconds old on revalidation.

const SWR_PREFIX = 'swr:'
// Tracks keys currently being revalidated to avoid duplicate background fetches
const revalidating = new Set()

/**
 * @param {string} key
 * @param {() => Promise<any>} fetcher  — called on cache miss or revalidation
 * @param {{ softTTL?: number, hardTTL?: number }} [opts]
 * @returns {Promise<{ data: any, stale: boolean }>}
 */
export async function swrGet(key, fetcher, { softTTL = 60, hardTTL = 300 } = {}) {
  const swrKey = SWR_PREFIX + key

  try {
    const raw = await redis.get(swrKey)

    if (raw) {
      const { data, cachedAt } = JSON.parse(raw)
      const ageSeconds = (Date.now() - cachedAt) / 1000

      if (ageSeconds < softTTL) {
        // ✅ Fresh — return immediately, no DB needed
        return { data, stale: false }
      }

      if (ageSeconds < hardTTL) {
        // ⚠️  Stale but usable — return now, refresh in background
        if (!revalidating.has(swrKey)) {
          revalidating.add(swrKey)
          swrSet(swrKey, fetcher, hardTTL).finally(() => revalidating.delete(swrKey))
        }
        return { data, stale: true }
      }
    }
  } catch (err) {
    console.warn(`[redis] SWR GET error "${key}":`, err.message)
    // Redis unavailable — fall through to fetcher
  }

  // Cache miss or hard-expired — fetch synchronously
  const data = await swrSet(swrKey, fetcher, hardTTL)
  return { data, stale: false }
}

async function swrSet(swrKey, fetcher, hardTTL) {
  const data = await fetcher()
  const entry = JSON.stringify({ data, cachedAt: Date.now() })
  try {
    // Store with hardTTL + jitter as the Redis TTL so the key is auto-evicted
    await redis.set(swrKey, entry, 'EX', jitteredTTL(hardTTL, 0.15))
  } catch (err) {
    console.warn(`[redis] SWR SET error "${swrKey}":`, err.message)
  }
  return data
}
