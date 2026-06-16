/**
 * Supabase Client - Configuration et clients partagés
 * ====================================================
 * Backend partagé entre le Centre de Commandement PNC (web)
 * et l'Application Mobile Citoyenne.
 *
 * Les deux applications utilisent le MÊME projet Supabase :
 *  - Le web app utilise la clé SERVICE_ROLE (admin, bypass RLS)
 *  - Le mobile app utilise la clé ANON (citoyen, protégé par RLS)
 *
 * Documentation complète : voir MOBILE_INTEGRATION.md
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * Indique si Supabase est configuré (URL + clés présentes dans l'environnement).
 * Quand `false`, l'application bascule automatiquement en mode local (Prisma/SQLite).
 */
export const isSupabaseConfigured = Boolean(
  supabaseUrl && supabaseAnonKey && supabaseUrl.startsWith('http')
);

/**
 * Détermine le mode de fonctionnement du backend.
 * - "supabase" : backend Supabase partagé (production)
 * - "local"    : SQLite/Prisma local (démo/développement)
 */
export type BackendMode = 'supabase' | 'local';

export function getBackendMode(): BackendMode {
  const forced = process.env.PNC_BACKEND_MODE;
  if (forced === 'supabase') return 'supabase';
  if (forced === 'local') return 'local';
  // auto : basé sur la présence des variables Supabase
  return isSupabaseConfigured ? 'supabase' : 'local';
}

export const isSupabaseMode = () => getBackendMode() === 'supabase';

// Cache des clients (évite de recréer à chaque appel)
let _serverClient: SupabaseClient | null = null;
let _browserClient: SupabaseClient | null = null;

/**
 * Client Supabase CÔTÉ SERVEUR (API routes, Server Components).
 * Utilise la clé SERVICE_ROLE → bypass Row Level Security.
 *
 * ⚠️ NE JAMAIS exposer ce client au navigateur ou à l'application mobile.
 * À utiliser uniquement dans /api/* ou 'use server'.
 */
export function getSupabaseServer(): SupabaseClient | null {
  if (!isSupabaseConfigured || !supabaseServiceKey) return null;
  if (!_serverClient) {
    _serverClient = createClient(supabaseUrl!, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return _serverClient;
}

/**
 * Client Supabase CÔTÉ NAVIGATEUR (Client Components).
 * Utilise la clé ANON → soumis au Row Level Security.
 *
 * L'application mobile utilise un client équivalent avec la MÊME clé ANON.
 */
export function getSupabaseBrowser(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (typeof window === 'undefined') return null;
  if (!_browserClient) {
    _browserClient = createClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    });
  }
  return _browserClient;
}

/**
 * Crée un client Supabase pour une session utilisateur spécifique.
 * Utilisé pour effectuer des requêtes au nom d'un citoyen authentifié
 * (respecte les politiques RLS basées sur l'utilisateur).
 *
 * @param accessToken - Jeton d'accès Supabase Auth de l'utilisateur
 */
export function getSupabaseForUser(accessToken: string): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  return createClient(supabaseUrl!, supabaseAnonKey!, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  });
}

/**
 * Nom du bucket de stockage pour les preuves et images.
 */
export const EVIDENCE_BUCKET =
  process.env.SUPABASE_EVIDENCE_BUCKET || 'pnc-evidence';
