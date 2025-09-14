import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// USUÁRIO ADMIN TEMPORÁRIO - REMOVER EM PRODUÇÃO COM SUPABASE REAL
const TEMP_ADMIN_USER = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@portalnoticias.com.br',
  password_hash: '$2a$10$FPPO8yXqVzaa4lx77XN1t.0AZEYp/7cvNcjkOFKAQoOlCZsN1qk1.', // admin123
  name: 'Administrador',
  role: 'admin',
  bio: 'Administrador do Portal de Notícias',
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};


export const createClient = async () => {
  // Garantir que Supabase está configurado
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and Key are required. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const cookieStore = await cookies()
  
  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
};
