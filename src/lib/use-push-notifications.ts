/**
 * Hook React — Notifications push natives du navigateur
 * ============================================================
 * Active les notifications système (OS-level) pour le Centre de Commandement
 * PNC. Quand un citoyen déclenche un SOS ou envoie un signalement depuis
 * l'app mobile, une notification native s'affiche sur le bureau de l'agent —
 * même si l'agent est sur un autre onglet ou une autre application.
 *
 * Implémentation volontairement SANS service worker : on utilise l'API
 * `Notification` directe (foreground notifications). C'est suffisant tant que
 * l'onglet du Centre de Commandement est ouvert.
 *
 * En plus de la notification visuelle, on joue un court "bip" d'alerte via
 * la Web Audio API (oscillateur 880 Hz, 200 ms, répété deux fois) pour
 * attirer l'attention de l'agent — indispensable en contexte d'urgence SOS.
 *
 * SSR-safe : utilise `useSyncExternalStore` pour lire `Notification.permission`
 * sans mismatch d'hydratation.
 */

'use client';

import { useCallback, useSyncExternalStore } from 'react';

export type PushPermission = 'default' | 'granted' | 'denied' | 'unsupported';

export interface NotifyOptions {
  /** URL de l'icône affichée dans la notification (défaut : /pnc-icon.png). */
  icon?: string;
  /** Tag de regroupement — les notifications identiques se remplacent. */
  tag?: string;
  /** Si true, la notification reste affichée jusqu'à interaction utilisateur. */
  requireInteraction?: boolean;
  /** Si true, désactive le bip sonore (par défaut : false = bip activé). */
  silent?: boolean;
}

export interface UsePushNotificationsResult {
  /** État courant de la permission. */
  permission: PushPermission;
  /** true si l'API Notification est supportée par le navigateur. */
  supported: boolean;
  /** Demande la permission à l'utilisateur (retourne l'état final). */
  requestPermission: () => Promise<PushPermission>;
  /** Affiche une notification native + joue un bip. Ne fait rien si permission refusée. */
  notify: (title: string, body?: string, options?: NotifyOptions) => void;
}

const DEFAULT_ICON = '/pnc-icon.png';
const DEFAULT_TAG = 'pnc-sos';
const BEEP_FREQUENCY = 880; // Hz — La5 pur, sonore sans être strident
const BEEP_DURATION_MS = 200;
const BEEP_REPEAT = 2;
const BEEP_GAIN = 0.1; // Subtil mais audible
const BEEP_INTERVAL_MS = 250;

function isClient() {
  return typeof window !== 'undefined';
}

function isSupported() {
  return isClient() && typeof window.Notification !== 'undefined';
}

function readCurrentPermission(): PushPermission {
  if (!isSupported()) return 'unsupported';
  // Notification.permission est 'default' | 'granted' | 'denied'
  return window.Notification.permission as PushPermission;
}

// ---------------------------------------------------------------------------
// Souscription aux changements de permission via l'API Permissions.
// ---------------------------------------------------------------------------
// `Notification.permission` ne déclenche pas d'événement par lui-même, mais
// `navigator.permissions.query({ name: 'notifications' })` renvoie un
// `PermissionStatus` qui émet un événement `change` quand l'utilisateur
// interagit avec la popup de permission. On mutualise cette souscription au
// niveau module (un seul statut partagé entre tous les consommateurs du hook).

const permissionSubscribers = new Set<() => void>();
let permissionStatusCached: PermissionStatus | null = null;
let permissionStatusInitStarted = false;

function notifyAllPermissionSubscribers() {
  permissionSubscribers.forEach((cb) => cb());
}

function ensurePermissionStatusSubscribed() {
  if (permissionStatusInitStarted) return;
  permissionStatusInitStarted = true;
  if (
    typeof navigator === 'undefined' ||
    typeof navigator.permissions === 'undefined' ||
    typeof navigator.permissions.query !== 'function'
  ) {
    return;
  }
  try {
    const promise = navigator.permissions.query({
      name: 'notifications' as PermissionName,
    });
    promise
      .then((status) => {
        permissionStatusCached = status;
        status.addEventListener('change', notifyAllPermissionSubscribers);
      })
      .catch(() => {
        /* Certains navigateurs rejettent 'notifications' — on retombera sur
           la notification manuelle déclenchée après requestPermission(). */
      });
  } catch {
    /* ignore */
  }
}

function subscribePermission(callback: () => void): () => void {
  permissionSubscribers.add(callback);
  ensurePermissionStatusSubscribed();
  return () => {
    permissionSubscribers.delete(callback);
  };
}

function getPermissionSnapshot(): PushPermission {
  return readCurrentPermission();
}

function getPermissionServerSnapshot(): PushPermission {
  return 'unsupported';
}

/**
 * Joue un court bip d'alerte via la Web Audio API.
 * Oscillateur sinusoïdal à 880 Hz, 200 ms, répété 2 fois.
 * Gain volontairement faible (0.1) pour rester discret.
 */
function playAlertBeep() {
  if (!isClient()) return;
  const AudioCtx =
    (window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext })
      .AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AudioCtx) return;

  let ctx: AudioContext | null = null;
  try {
    ctx = new AudioCtx();
  } catch {
    return;
  }
  if (!ctx) return;

  const now = ctx.currentTime;

  for (let i = 0; i < BEEP_REPEAT; i++) {
    const start = now + (i * BEEP_INTERVAL_MS) / 1000;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = BEEP_FREQUENCY;
    gain.gain.setValueAtTime(0, start);
    gain.gain.linearRampToValueAtTime(BEEP_GAIN, start + 0.01);
    gain.gain.setValueAtTime(BEEP_GAIN, start + BEEP_DURATION_MS / 1000 - 0.02);
    gain.gain.linearRampToValueAtTime(0, start + BEEP_DURATION_MS / 1000);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(start);
    osc.stop(start + BEEP_DURATION_MS / 1000);
  }

  // Fermer le contexte audio après la fin du dernier bip pour libérer les ressources
  const totalMs = BEEP_INTERVAL_MS * BEEP_REPEAT + BEEP_DURATION_MS + 100;
  window.setTimeout(() => {
    try {
      ctx?.close();
    } catch {
      /* ignore */
    }
  }, totalMs);
}

export function usePushNotifications(): UsePushNotificationsResult {
  // Lecture réactive de la permission via useSyncExternalStore — gère
  // automatiquement le SSR (snapshot serveur = 'unsupported') et la
  // souscription aux changements (PermissionStatus 'change' event).
  const permission = useSyncExternalStore(
    subscribePermission,
    getPermissionSnapshot,
    getPermissionServerSnapshot
  );

  const requestPermission = useCallback(async (): Promise<PushPermission> => {
    if (!isSupported()) return 'unsupported';
    try {
      // API moderne : Notification.requestPermission() retourne une Promise
      const result = await window.Notification.requestPermission();
      // Re-notifier manuellement les abonnés : couvre le cas où
      // `PermissionStatus.change` ne se déclenche pas (ex: vieux navigateurs).
      notifyAllPermissionSubscribers();
      return result as PushPermission;
    } catch {
      // Sur très vieux navigateurs, requestPermission pouvait utiliser un callback
      // — on tombe alors sur l'état courant.
      return readCurrentPermission();
    }
  }, []);

  const notify = useCallback(
    (title: string, body?: string, options: NotifyOptions = {}) => {
      // Toujours jouer le bip en cas d'urgence, mais seulement si la
      // permission a été accordée (sinon c'est qu'on n'est pas censé alerter).
      if (permission !== 'granted') return;

      const icon = options.icon ?? DEFAULT_ICON;
      const tag = options.tag ?? DEFAULT_TAG;
      const requireInteraction = options.requireInteraction ?? true;

      try {
        const n = new window.Notification(title, {
          body,
          icon,
          tag,
          requireInteraction,
        });
        // Focus la fenêtre du Centre de Commandement quand l'agent clique
        n.onclick = () => {
          try {
            window.focus();
          } catch {
            /* ignore */
          }
          try {
            n.close();
          } catch {
            /* ignore */
          }
        };
      } catch {
        // Si la construction échoue (ex: mode silencieux sur certains OS),
        // on a au moins le bip sonore ci-dessous.
      }

      if (!options.silent) {
        playAlertBeep();
      }
    },
    [permission]
  );

  return {
    permission,
    supported: isSupported(),
    requestPermission,
    notify,
  };
}
