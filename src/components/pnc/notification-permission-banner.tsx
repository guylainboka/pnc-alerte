'use client';

/**
 * Bandeau d'invitation à activer les notifications natives
 * ============================================================
 * Affiché en haut du dashboard tant que la permission de notification
 * est à l'état 'default' (ni accordée ni refusée). Disparaît dès que
 * l'utilisateur agit (Activer / Plus tard, ou changement de permission).
 *
 * Style : encadré orange clair (visible sans être agressif), avec deux
 * actions claires en français.
 *
 * SSR-safe : la lecture du sessionStorage se fait via `useSyncExternalStore`
 * (snapshot serveur = false), évitant tout mismatch d'hydratation.
 */

import { useState, useCallback, useSyncExternalStore } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Bell, BellRing, X } from 'lucide-react';
import { usePushNotifications } from '@/lib/use-push-notifications';

const SESSION_KEY = 'pnc-notification-banner-dismissed';

// --- Lecture réactive du flag "fermé pour cette session" ---------------
// On n'a pas besoin de souscrire à des événements 'storage' (qui de toute
// façon ne se déclenchent pas pour sessionStorage dans le même onglet) :
// le snapshot est lu à chaque rendu, et on force un re-rendu via le state
// local `userDismissed` quand l'utilisateur clique sur "Plus tard".
function subscribeStorage(_cb: () => void): () => void {
  return () => {
    /* no-op : sessionStorage ne déclenche pas d'événement dans le même onglet */
  };
}

function readStorageSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

function readServerSnapshot(): boolean {
  return false;
}

function markDismissedThisSession() {
  if (typeof window === 'undefined') return;
  try {
    window.sessionStorage.setItem(SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function NotificationPermissionBanner() {
  const { permission, requestPermission } = usePushNotifications();
  const storageDismissed = useSyncExternalStore(
    subscribeStorage,
    readStorageSnapshot,
    readServerSnapshot
  );
  const [userDismissed, setUserDismissed] = useState(false);

  const handleEnable = useCallback(async () => {
    await requestPermission();
    // useSyncExternalStore va re-déclencher un rendu quand la permission change
    // (via PermissionStatus 'change' event ou notification manuelle).
  }, [requestPermission]);

  const handleLater = useCallback(() => {
    markDismissedThisSession();
    setUserDismissed(true);
  }, []);

  // Calcul de visibilité pendants le rendu (pas de setState dans un effet) :
  // - notifications non supportées → masqué
  // - permission déjà accordée ou refusée → masqué (auto)
  // - bandeau fermé pour la session → masqué
  if (permission === 'unsupported') return null;
  if (permission === 'granted' || permission === 'denied') return null;
  if (storageDismissed || userDismissed) return null;

  return (
    <Card className="border-orange-300 bg-orange-50 dark:border-orange-900/50 dark:bg-orange-950/30">
      <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="mt-0.5 p-2 rounded-full bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-300 flex-shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-orange-900 dark:text-orange-100">
              🔔 Activez les notifications pour être alerté en temps réel des appels SOS
            </p>
            <p className="text-xs text-orange-700/80 dark:text-orange-200/70 mt-0.5">
              Notifications bureau + bip sonore d&apos;alerte, même si vous êtes sur un autre onglet.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button
            type="button"
            size="sm"
            onClick={handleEnable}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Bell className="w-4 h-4 mr-1.5" />
            Activer
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={handleLater}
            className="border-orange-300 text-orange-700 hover:bg-orange-100 dark:border-orange-800 dark:text-orange-200 dark:hover:bg-orange-900/30"
          >
            Plus tard
          </Button>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleLater}
            className="h-8 w-8 p-0 text-orange-700/60 hover:text-orange-900 dark:text-orange-200/60 dark:hover:text-orange-100"
            aria-label="Fermer le bandeau"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
