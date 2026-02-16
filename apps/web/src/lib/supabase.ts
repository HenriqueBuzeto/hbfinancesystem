/**
 * Cliente Supabase para HB Finance.
 * Usar para Auth, Realtime, Storage quando integrar com Supabase.
 * O banco principal continua via Prisma (DATABASE_URL).
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

/** Cliente para uso no browser (Auth, Realtime, Storage). Retorna null se as env vars não estiverem definidas. */
export function createBrowserClient() {
  if (!supabaseUrl || !supabaseAnonKey) return null;
  return createClient(supabaseUrl, supabaseAnonKey);
}

/** Cliente para uso no server (service role; operações privilegiadas). Retorna null se as env vars não estiverem definidas. */
export function createServerClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_ANON_KEY;
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });
}

/** Cliente padrão (browser). Use em componentes e client components. Null se Supabase não estiver configurado. */
export const supabase = typeof window !== 'undefined' ? createBrowserClient() : null;
