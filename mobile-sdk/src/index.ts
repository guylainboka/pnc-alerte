/**
 * @pnc/mobile-sdk — Client officiel PNC pour application mobile
 * ================================================================
 * Ce SDK connecte l'application mobile citoyenne au Centre de Commandement
 * PNC et au backend Supabase partagé.
 *
 * Installation (dans l'app mobile) :
 *   1. Copier ce dossier `mobile-sdk/` dans le projet mobile
 *      Ou : npm install @pnc/mobile-sdk (si publié)
 *   2. Configurer les variables d'environnement (voir MOBILE_SDK.md)
 *   3. import { PNCClient } from '@pnc/mobile-sdk'
 *
 * Usage rapide :
 *   const pnc = new PNCClient({ apiUrl, supabaseUrl, supabaseAnonKey })
 *   await pnc.auth.register({ firstName, lastName, phone, password })
 *   await pnc.alerts.sendSOS({ type: 'agression', description, location, coords })
 *   pnc.realtime.subscribeToWantedCriminals((criminal) => { ... })
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// ============================================================================
// TYPES
// ============================================================================

export interface PNCClientConfig {
  /** URL du Centre de Commandement (ex: https://pnc-command.vercel.app) */
  apiUrl: string;
  /** URL du projet Supabase (ex: https://xyz.supabase.co) */
  supabaseUrl: string;
  /** Clé ANON publique Supabase (protégée par RLS) */
  supabaseAnonKey: string;
  /** Bucket de stockage pour les preuves (défaut: pnc-evidence) */
  evidenceBucket?: string;
  /** Storage custom (React Native AsyncStorage, web localStorage, etc.) */
  storage?: PNCStorage;
  /** Timeout des requêtes en ms (défaut: 15000) */
  timeout?: number;
}

export interface PNCStorage {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
}

export interface CitizenRegisterInput {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  gender?: 'M' | 'F';
  dateOfBirth?: string;
  city?: string;
  commune?: string;
  address?: string;
}

export interface Citizen {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  gender: string | null;
  city: string | null;
  commune: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  lastLocation: string | null;
  lastLocationAt: string | null;
  status: string;
  verified: boolean;
  totalAlerts: number;
  totalComplaints: number;
  commissariatId: string | null;
  createdAt: string;
}

export interface AuthSession {
  accessToken: string;
  refreshToken: string | null;
  expiresIn: number;
  citizen: Citizen;
}

export type AlertType = 'vol' | 'agression' | 'accident' | 'incendie' | 'autre';
export type AlertPriority = 'urgente' | 'haute' | 'moyenne' | 'basse';
export type AlertStatus = 'recue' | 'en_cours' | 'traitee' | 'cloturee';

export interface Alert {
  id: string;
  reference: string;
  type: AlertType;
  priority: AlertPriority;
  status: AlertStatus;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  citizenName: string | null;
  citizenPhone: string | null;
  responseTime: number | null;
  createdAt: string;
  commissariat?: { id: string; name: string; code: string };
}

export interface SendAlertInput {
  type: AlertType;
  description: string;
  location: string;
  latitude?: number;
  longitude?: number;
  commissariatId?: string;
}

export type ComplaintType = 'vol' | 'agression' | 'harassment' | 'corruption' | 'autre';
export type ComplaintStatus = 'soumise' | 'en_revision' | 'approuvee' | 'rejetee' | 'traitee';

export interface Complaint {
  id: string;
  reference: string;
  type: ComplaintType;
  status: ComplaintStatus;
  description: string;
  location: string | null;
  plaintiffName: string;
  plaintiffPhone: string;
  reviewNotes: string | null;
  createdAt: string;
  commissariat?: { id: string; name: string; code: string };
}

export interface SendComplaintInput {
  type: ComplaintType;
  description: string;
  location?: string;
  commissariatId?: string;
}

export interface Commissariat {
  id: string;
  name: string;
  code: string;
  address: string | null;
  phone: string | null;
  sousDistrict?: string;
  district?: string;
  province?: string;
}

export interface WantedCriminal {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  alias: string | null;
  photo: string | null;
  gender: string | null;
  nationality: string | null;
  physicalDesc: string | null;
  height: string | null;
  weight: string | null;
  eyeColor: string | null;
  hairColor: string | null;
  scars: string | null;
  tattoos: string | null;
  dangerLevel: string;
  lastKnownAddr: string | null;
  lastSeenLocation: string | null;
  lastSeenAt: string | null;
  modusOperandi: string | null;
  warrantStatus: string | null;
}

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  path: string | null;
}

// ============================================================================
// CLASSE PRINCIPALE
// ============================================================================

const TOKEN_KEY = 'pnc_access_token';
const REFRESH_KEY = 'pnc_refresh_token';

export class PNCClient {
  public readonly config: Required<Omit<PNCClientConfig, 'storage'>>;
  public readonly supabase: SupabaseClient;
  private storage: PNCStorage;
  private cachedToken: string | null = null;

  constructor(config: PNCClientConfig) {
    if (!config.apiUrl) throw new Error('PNCClient: apiUrl est requis');
    if (!config.supabaseUrl) throw new Error('PNCClient: supabaseUrl est requis');
    if (!config.supabaseAnonKey) throw new Error('PNCClient: supabaseAnonKey est requis');

    this.config = {
      ...config,
      evidenceBucket: config.evidenceBucket || 'pnc-evidence',
      timeout: config.timeout || 15000,
    } as Required<Omit<PNCClientConfig, 'storage'>>;

    this.storage = config.storage || createDefaultStorage();

    // Client Supabase partagé (Auth + Realtime + Storage)
    this.supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: {
        storage: this.adaptStorageForSupabase(),
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  }

  // ------------------------------------------------------------------------
  // Initialisation — à appeler au démarrage de l'app
  // ------------------------------------------------------------------------

  /**
   * Initialise le SDK. À appeler une fois au démarrage de l'application mobile.
   * Restaure la session précédente si elle existe.
   */
  async init(): Promise<AuthSession | null> {
    const token = await this.storage.getItem(TOKEN_KEY);
    if (token) {
      this.cachedToken = token;
    }
    // Restaurer la session Supabase si présente
    const { data } = await this.supabase.auth.getSession();
    if (data.session?.access_token && !token) {
      await this.storage.setItem(TOKEN_KEY, data.session.access_token);
      this.cachedToken = data.session.access_token;
    }
    return this.getCurrentSession();
  }

  /**
   * Retourne la session actuelle ou null si non connecté.
   */
  async getCurrentSession(): Promise<AuthSession | null> {
    const token = this.cachedToken || (await this.storage.getItem(TOKEN_KEY));
    if (!token) return null;
    try {
      const res = await this.request('/api/mobile/auth/me', { method: 'GET' });
      if (res.ok) {
        const data = await res.json();
        return {
          accessToken: token,
          refreshToken: await this.storage.getItem(REFRESH_KEY),
          expiresIn: 86400,
          citizen: data.citizen,
        };
      }
      // Token invalide — nettoyer
      await this.clearSession();
      return null;
    } catch {
      return null;
    }
  }

  /** Vrai si l'utilisateur est connecté. */
  async isAuthenticated(): Promise<boolean> {
    return (await this.getCurrentSession()) !== null;
  }

  // ------------------------------------------------------------------------
  // AUTH
  // ------------------------------------------------------------------------

  public auth = {
    /**
     * Inscrit un nouveau citoyen.
     * Crée le compte dans Supabase Auth + le profil dans la base.
     */
    register: async (input: CitizenRegisterInput): Promise<AuthSession> => {
      const res = await this.request('/api/mobile/auth/register', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec de l\'inscription', res.status, data);

      if (data.accessToken) {
        await this.storeSession(data.accessToken, data.refreshToken);
      }
      return data;
    },

    /**
     * Connecte un citoyen (par téléphone ou email + mot de passe).
     */
    login: async (identifier: string, password: string): Promise<AuthSession> => {
      const res = await this.request('/api/mobile/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec de la connexion', res.status, data);

      await this.storeSession(data.accessToken, data.refreshToken);
      return data;
    },

    /** Déconnecte le citoyen. */
    logout: async (): Promise<void> => {
      try {
        await this.supabase.auth.signOut();
      } catch {}
      await this.clearSession();
    },

    /** Récupère le profil courant. */
    me: async (): Promise<Citizen | null> => {
      const session = await this.getCurrentSession();
      return session?.citizen || null;
    },

    /**
     * Met à jour la position GPS du citoyen (envoyée périodiquement).
     * Permet au Centre de Commandement de localiser le citoyen en cas d'alerte.
     */
    updateLocation: async (latitude: number, longitude: number, label?: string): Promise<void> => {
      // En mode Supabase, on met à jour directement la table citizens (RLS autorise self-update)
      const { error } = await this.supabase
        .from('citizens')
        .update({
          latitude,
          longitude,
          last_location: label || null,
          last_location_at: new Date().toISOString(),
        })
        .eq('auth_uid', (await this.supabase.auth.getUser()).data.user?.id);
      if (error) throw new PNCError(error.message, 500);
    },
  };

  // ------------------------------------------------------------------------
  // ALERTES
  // ------------------------------------------------------------------------

  public alerts = {
    /**
     * Envoie une alerte SOS au Centre de Commandement.
     * L'alerte apparaît en temps réel dans le tableau de bord PNC.
     *
     * @example
     *   await pnc.alerts.sendSOS({
     *     type: 'agression',
     *     description: 'Agression en cours au marché',
     *     location: 'Marché Central, Gombe',
     *     latitude: -4.3217,
     *     longitude: 15.3130,
     *   })
     */
    sendSOS: async (input: SendAlertInput): Promise<Alert> => {
      const res = await this.request('/api/mobile/alerts', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec de l\'envoi de l\'alerte', res.status, data);
      return data.alert;
    },

    /** Liste les alertes du citoyen connecté. */
    listMine: async (): Promise<Alert[]> => {
      const res = await this.request('/api/mobile/alerts', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec', res.status, data);
      return data.alerts || [];
    },

    /** Récupère une alerte par sa référence. */
    getByReference: async (reference: string): Promise<Alert | null> => {
      const alerts = await this.alerts.listMine();
      return alerts.find((a) => a.reference === reference) || null;
    },
  };

  // ------------------------------------------------------------------------
  // PLAINTE
  // ------------------------------------------------------------------------

  public complaints = {
    /** Dépose une nouvelle plainte. */
    submit: async (input: SendComplaintInput): Promise<Complaint> => {
      const res = await this.request('/api/mobile/complaints', {
        method: 'POST',
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec du dépôt de plainte', res.status, data);
      return data.complaint;
    },

    /** Liste les plaintes du citoyen. */
    listMine: async (): Promise<Complaint[]> => {
      const res = await this.request('/api/mobile/complaints', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec', res.status, data);
      return data.complaints || [];
    },
  };

  // ------------------------------------------------------------------------
  // DONNÉES PUBLIQUES
  // ------------------------------------------------------------------------

  public public = {
    /** Liste les commissariats (pour afficher à proximité ou choix manuel). */
    listCommissariats: async (): Promise<Commissariat[]> => {
      const res = await this.request('/api/mobile/commissariats', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec', res.status, data);
      return data.commissariats || [];
    },

    /** Liste les criminels actuellement recherchés (avis de recherche). */
    listWantedCriminals: async (): Promise<WantedCriminal[]> => {
      const res = await this.request('/api/mobile/criminals/wanted', { method: 'GET' });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec', res.status, data);
      return data.wanted || [];
    },

    /** Vérifie l'état du backend (statut de connexion). */
    getBackendStatus: async (): Promise<any> => {
      const res = await this.request('/api/mobile/status', { method: 'GET' });
      return res.json();
    },
  };

  // ------------------------------------------------------------------------
  // UPLOAD (preuves, photos)
  // ------------------------------------------------------------------------

  public upload = {
    /**
     * Téléverse un fichier (photo, vidéo, document) vers Supabase Storage.
     * @param fileUri - URI locale du fichier (ex: file:///... sur React Native)
     * @param type - 'photo' | 'video' | 'document'
     */
    evidence: async (fileUri: string, type: 'photo' | 'video' | 'document' = 'photo'): Promise<UploadResult> => {
      const formData = new FormData();
      // @ts-ignore — React Native accepte { uri, type, name }
      formData.append('file', { uri: fileUri, type: `image/jpeg`, name: `evidence.${type === 'video' ? 'mp4' : 'jpg'}` });
      formData.append('type', type);

      const res = await this.request('/api/mobile/upload', {
        method: 'POST',
        body: formData,
        // Ne pas set Content-Type pour FormData (le navigateur le fait)
      });
      const data = await res.json();
      if (!res.ok) throw new PNCError(data.error || 'Échec du téléversement', res.status, data);
      return data;
    },
  };

  // ------------------------------------------------------------------------
  // REALTIME — notifications push en temps réel
  // ------------------------------------------------------------------------

  public realtime = {
    /**
     * Écoute les nouveaux criminels recherchés.
     * Déclenche le callback à chaque nouvel avis de recherche publié par la PNC.
     *
     * @example
     *   const unsub = pnc.realtime.subscribeToWantedCriminals((criminal) => {
     *     showNotification('🚨 Avis de recherche', `${criminal.firstName} ${criminal.lastName}`)
     *   })
     *   // Plus tard : unsub()
     */
    subscribeToWantedCriminals: (onNew: (criminal: WantedCriminal) => void): (() => void) => {
      const channel = this.supabase
        .channel('wanted-criminals')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'criminals',
            filter: 'status=eq.recherche',
          },
          (payload: any) => onNew(payload.new as WantedCriminal)
        )
        .subscribe();
      return () => {
        this.supabase.removeChannel(channel);
      };
    },

    /**
     * Écoute les changements de statut des plaintes du citoyen.
     * Notifie quand une plainte est approuvée, rejetée ou traitée.
     */
    subscribeToMyComplaints: (citizenId: string, onUpdate: (complaint: Complaint) => void): (() => void) => {
      const channel = this.supabase
        .channel(`my-complaints-${citizenId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'complaints',
            filter: `citizen_id=eq.${citizenId}`,
          },
          (payload: any) => onUpdate(payload.new as Complaint)
        )
        .subscribe();
      return () => {
        this.supabase.removeChannel(channel);
      };
    },

    /**
     * Écoute les changements de statut des alertes du citoyen.
     * Notifie quand la PNC prend en charge une alerte ou la clôture.
     */
    subscribeToMyAlerts: (citizenId: string, onUpdate: (alert: Alert) => void): (() => void) => {
      const channel = this.supabase
        .channel(`my-alerts-${citizenId}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'alerts',
            filter: `citizen_id=eq.${citizenId}`,
          },
          (payload: any) => onUpdate(payload.new as Alert)
        )
        .subscribe();
      return () => {
        this.supabase.removeChannel(channel);
      };
    },

    /** Écoute générique sur une table. */
    subscribe: (
      table: string,
      event: 'INSERT' | 'UPDATE' | 'DELETE' | '*',
      filter: string | null,
      callback: (payload: any) => void
    ): (() => void) => {
      const opts: any = { event, schema: 'public', table };
      if (filter) opts.filter = filter;
      const channel = this.supabase
        .channel(`pnc-${table}-${Date.now()}`)
        .on('postgres_changes', opts, callback)
        .subscribe();
      return () => {
        this.supabase.removeChannel(channel);
      };
    },
  };

  // ------------------------------------------------------------------------
  // HELPERS INTERNES
  // ------------------------------------------------------------------------

  private async request(path: string, options: RequestInit = {}): Promise<Response> {
    const token = this.cachedToken || (await this.storage.getItem(TOKEN_KEY));
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };
    // Ne pas écraser Content-Type pour FormData
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const res = await fetch(`${this.config.apiUrl}${path}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
      return res;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async storeSession(accessToken: string, refreshToken: string | null): Promise<void> {
    this.cachedToken = accessToken;
    await this.storage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      await this.storage.setItem(REFRESH_KEY, refreshToken);
    }
  }

  private async clearSession(): Promise<void> {
    this.cachedToken = null;
    await this.storage.removeItem(TOKEN_KEY);
    await this.storage.removeItem(REFRESH_KEY);
  }

  /** Adapte PNCStorage au format attendu par Supabase Auth. */
  private adaptStorageForSupabase() {
    return {
      getItem: async (key: string) => {
        const val = await this.storage.getItem(key);
        return val;
      },
      setItem: async (key: string, value: string) => {
        await this.storage.setItem(key, value);
      },
      removeItem: async (key: string) => {
        await this.storage.removeItem(key);
      },
    };
  }
}

// ============================================================================
// ERREUR
// ============================================================================

export class PNCError extends Error {
  constructor(message: string, public statusCode: number, public details?: any) {
    super(message);
    this.name = 'PNCError';
  }
}

// ============================================================================
// STORAGE PAR DÉFAUT
// ============================================================================

function createDefaultStorage(): PNCStorage {
  // Navigateur (web)
  if (typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: async (k) => window.localStorage.getItem(k),
      setItem: async (k, v) => window.localStorage.setItem(k, v),
      removeItem: async (k) => window.localStorage.removeItem(k),
    };
  }

  // React Native AsyncStorage — chargé dynamiquement si disponible.
  // L'utilisateur peut aussi passer son propre storage via PNCClientConfig.storage.
  try {
    // @ts-ignore — module optionnel côté web
    const mod = require('@react-native-async-storage/async-storage');
    const AsyncStorage = mod?.default || mod;
    if (AsyncStorage) {
      return {
        getItem: (k) => AsyncStorage.getItem(k),
        setItem: (k, v) => AsyncStorage.setItem(k, v),
        removeItem: (k) => AsyncStorage.removeItem(k),
      };
    }
  } catch {}

  // Fallback mémoire (pas de persistance)
  const mem = new Map<string, string>();
  return {
    getItem: async (k) => mem.get(k) || null,
    setItem: async (k, v) => void mem.set(k, v),
    removeItem: async (k) => void mem.delete(k),
  };
}
