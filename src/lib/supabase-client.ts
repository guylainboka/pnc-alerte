/**
 * Supabase Client — PNC Alerte
 * =============================
 * Client Supabase côté application (compatible Capacitor / static export).
 *
 * CONFIGURATION:
 * 1. Créez un projet sur https://supabase.com
 * 2. Copiez `.env.local.example` vers `.env.local` et renseignez :
 *    - NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
 *    - NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxxxx
 * 3. Exécutez le schéma SQL dans Supabase SQL Editor (voir supabase/schema.sql)
 *
 * Si les variables d'env ne sont PAS définies, l'app fonctionne en MODE LOCAL
 * (zustand persist + données simulées). Aucun crash.
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const isSupabaseConfigured = (): boolean => {
  return Boolean(supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http'))
}

let _client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null
  if (_client) return _client
  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    },
    realtime: {
      params: { eventsPerSecond: 5 },
    },
  })
  return _client
}

// Singleton pratique (null si non configuré)
export const supabase = getSupabase()
