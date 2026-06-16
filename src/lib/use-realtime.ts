/**
 * Hook React pour la synchronisation en temps réel via Supabase Realtime
 * ============================================================
 * Écoute les changements sur les tables (alerts, complaints) et déclenche
 * un rafraîchissement automatique des données dans le Centre de Commandement.
 *
 * Quand un citoyen envoie une alerte depuis l'application mobile :
 *   → Supabase insert dans la table alerts
 *   → Realtime diffuse l'événement INSERT
 *   → Ce hook déclenche un callback (ex: refetch, toast notification)
 *
 * En mode local (sans Supabase), le hook utilise un polling périodique
 * comme solution de repli.
 */

'use client';

import { useEffect, useRef, useCallback } from 'react';
import { getSupabaseBrowser, isSupabaseConfigured } from '@/lib/supabase';

export type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';
export type RealtimeTable = 'alerts' | 'complaints' | 'citizens' | 'cases';

interface UseRealtimeOptions {
  table: RealtimeTable;
  event?: RealtimeEvent | '*';
  onUpdate?: (payload: any) => void;
  // En mode local, intervalle de polling en ms (0 = désactivé)
  pollInterval?: number;
  onPoll?: () => void;
}

export function useRealtime({
  table,
  event = '*',
  onUpdate,
  pollInterval = 0,
  onPoll,
}: UseRealtimeOptions) {
  const callbackRef = useRef(onUpdate);
  const pollRef = useRef(onPoll);
  // Mettre à jour les refs dans un effet (pas pendant le rendu)
  useEffect(() => {
    callbackRef.current = onUpdate;
    pollRef.current = onPoll;
  });

  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Mode local : polling périodique
      if (pollInterval > 0 && pollRef.current) {
        const id = setInterval(() => pollRef.current?.(), pollInterval);
        return () => clearInterval(id);
      }
      return;
    }

    const supabase = getSupabaseBrowser();
    if (!supabase) return;

    const channel = supabase
      .channel(`pnc-${table}-${Date.now()}`)
      .on(
        'postgres_changes',
        {
          event,
          schema: 'public',
          table,
        },
        (payload) => {
          callbackRef.current?.(payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [table, event, pollInterval]);
}

/**
 * Hook spécialisé pour les alertes en temps réel.
 * Déclenche un callback à chaque nouvelle alerte reçue depuis le mobile.
 */
export function useLiveAlerts(onNewAlert?: (alert: any) => void, refetch?: () => void) {
  const handleUpdate = useCallback(
    (payload: any) => {
      if (payload.eventType === 'INSERT') {
        onNewAlert?.(payload.new);
      }
      // Recharger la liste dans tous les cas
      refetch?.();
    },
    [onNewAlert, refetch]
  );

  useRealtime({
    table: 'alerts',
    event: '*',
    onUpdate: handleUpdate,
    pollInterval: 15000, // 15s en mode local
    onPoll: refetch,
  });
}
