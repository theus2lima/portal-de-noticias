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
  // Se as variáveis não estão configuradas, retorna um mock
  if (!supabaseUrl || !supabaseKey) {
    return {
      from: (table: string) => ({
        select: (columns = '*') => ({
          eq: (column: string, value: any) => ({
            eq: (column2: string, value2: any) => ({
              single: () => {
                // Login de usuário admin temporário - email + is_active
                if (table === 'users' && 
                    column === 'email' && value === 'admin@portalnoticias.com.br' &&
                    column2 === 'is_active' && value2 === true) {
                  return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
                }
                // Verificação por ID (para /api/auth/verify)
                if (table === 'users' && 
                    column === 'id' && value === TEMP_ADMIN_USER.id &&
                    column2 === 'is_active' && value2 === true) {
                  return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
                }
                return Promise.resolve({ data: null, error: new Error('User not found') });
              }
            }),
            single: () => {
              // Fallback para queries com apenas um .eq()
              if (table === 'users' && column === 'email' && value === 'admin@portalnoticias.com.br') {
                return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
              }
              if (table === 'users' && column === 'id' && value === TEMP_ADMIN_USER.id) {
                return Promise.resolve({ data: TEMP_ADMIN_USER, error: null });
              }
              return Promise.resolve({ data: null, error: new Error('User not found') });
            }
          }),
          single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') }),
          order: () => ({
            limit: () => Promise.resolve({ data: [TEMP_ADMIN_USER], error: null })
          }),
          limit: () => Promise.resolve({ data: [TEMP_ADMIN_USER], error: null })
        }),
        insert: (data: any) => ({
          select: () => ({
            single: () => {
              if (table === 'articles') {
                // Mock para inserção de artigo
                const mockArticle = {
                  id: '00000000-0000-0000-0000-' + Date.now(),
                  ...data[0],
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString()
                };
                return Promise.resolve({ data: mockArticle, error: null });
              }
              return Promise.resolve({ data: null, error: new Error('Supabase not configured') });
            }
          })
        }),
        update: () => ({
          eq: () => ({
            select: () => ({
              single: () => Promise.resolve({ data: null, error: new Error('Supabase not configured') })
            })
          })
        }),
        delete: () => ({
          eq: () => Promise.resolve({ error: new Error('Supabase not configured') })
        })
      })
    } as any;
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
