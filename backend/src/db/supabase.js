// src/db/supabase.js
// Singleton Supabase client using the service role key.
// This client bypasses Row Level Security — keep it server-side only.

import { createClient } from '@supabase/supabase-js'
import { env } from '../config/env.js'

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_KEY, {
  auth: {
    // Disable session persistence — we're in a stateless server context
    persistSession: false,
    autoRefreshToken: false,
  },
})
