// src/config/env.js
// Validates and exports all environment variables at startup.
// The app crashes fast with a clear message if any required var is missing.

import 'dotenv/config'

function required(key) {
  const val = process.env[key]
  if (!val) throw new Error(`[config] Missing required environment variable: ${key}`)
  return val
}

function optional(key, defaultValue) {
  return process.env[key] ?? defaultValue
}

export const env = {
  NODE_ENV:           optional('NODE_ENV', 'development'),
  PORT:               parseInt(optional('PORT', '3001'), 10),

  // Supabase — use service role key (server-side only, never expose to frontend)
  SUPABASE_URL:       required('SUPABASE_URL'),
  SUPABASE_SERVICE_KEY: required('SUPABASE_SERVICE_KEY'),

  // Redis / Upstash
  REDIS_URL:          required('REDIS_URL'),

  // Cache TTL in seconds (default 60s)
  CACHE_TTL:          parseInt(optional('CACHE_TTL', '60'), 10),

  // Rate limiting
  RATE_LIMIT_MAX:     parseInt(optional('RATE_LIMIT_MAX', '120'), 10),
  RATE_LIMIT_WINDOW:  optional('RATE_LIMIT_WINDOW', '1 minute'),

  // CORS — comma-separated list of allowed origins
  CORS_ORIGINS:       optional('CORS_ORIGINS', '*'),

  // Ops dashboard secret — required to access /ops/* endpoints
  OPS_SECRET:         required('OPS_SECRET'),
}
