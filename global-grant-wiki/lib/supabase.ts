/**
 * Supabase-клиенты (готовы к подключению реальной БД).
 *
 * - browser client: anon key, RLS ограничивает чтение только status='Active'.
 * - admin server client: service_role key, ТОЛЬКО в Server Actions / Route Handlers.
 *
 * Пока env-переменные не заданы, приложение работает на моках (lib/data.ts).
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(url && anonKey);
}

/** Client-side (публичные чтения с RLS) */
export function getPublicClient(): SupabaseClient<Database> {
  if (!url || !anonKey) throw new Error('Supabase env vars are not set');
  return createClient<Database>(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

/** Server-only (admin CRUD, парсеры). Никогда не импортировать в client-компоненты! */
export function getServerAdminClient(): SupabaseClient<Database> {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY missing (server only)');
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  });
}
