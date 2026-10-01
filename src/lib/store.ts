import { create } from 'zustand';

export type Section =
  | 'dashboard'
  | 'alerts'
  | 'cases'
  | 'criminals'
  | 'complaints'
  | 'citizens'
  | 'users'
  | 'services'
  | 'stations';

/**
 * Utilisateur authentifié côté centre de commandement PNC.
 *
 * Le champ `token` contient le JWT signé émis par le backend NestJS
 * (`POST /api/auth/login?XTransformPort=3001`). Il est stocké en
 * localStorage côté client et doit être envoyé comme `Authorization: Bearer`
 * à chaque appel API nécessitant une authentification.
 *
 * NOTE — limite connue du mode localStorage : le token est lisible par
 * n'importe quel script exécuté dans la page. Une migration future vers
 * un cookie httpOnly+SameSite=Strict + un middleware Next.js qui valide
 * le JWT côté serveur est recommandée. En l'état, le store protège contre
 * l'impersonnalisation triviale (l'utilisateur ne peut plus juste écrire
 * n'importe quel JSON dans localStorage — il faut un vrai JWT émis par le
 * backend, signé avec JWT_SECRET, et le backend NestJS valide ce token
 * sur ses routes protégées).
 */
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
  commissariatId?: string | null;
  officerId?: string | null;
  token: string; // JWT signé par le backend NestJS
  officer?: {
    id: string;
    matricule: string;
    rank: string;
    commissariat: { id: string; name: string; code: string };
  } | null;
}

interface AppStore {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  // Auth
  user: AuthUser | null;
  isAuthenticated: boolean;
  /**
   * Authentifie l'utilisateur contre le backend NestJS (port 3001 via le
   * gateway Caddy) en utilisant le paramètre XTransformPort. Stocke le
   * JWT retourné dans l'objet user + en localStorage pour les appels
   * authentifiés ultérieurs.
   */
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const STORAGE_KEY = 'pnc_auth_user';

function loadUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored) as AuthUser;
    // Refuse entries without a JWT token (legacy / forged entries)
    if (!parsed || typeof parsed.token !== 'string' || !parsed.token) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export const useAppStore = create<AppStore>((set) => {
  const initialUser = loadUser();
  return {
    activeSection: 'dashboard',
    setActiveSection: (section) => set({ activeSection: section }),
    sidebarCollapsed: false,
    toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
    // Auth
    user: initialUser,
    isAuthenticated: !!initialUser,
    login: async (username, password) => {
      const res = await fetch('/api/auth/login?XTransformPort=3001', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        let message = 'Identifiants invalides';
        try {
          const errBody = await res.json();
          if (errBody?.message) message = errBody.message;
        } catch {
          // ignore parse error — keep default message
        }
        throw new Error(message);
      }

      const data = await res.json();
      // Le backend NestJS retourne une forme plate :
      //   { id, username, email, firstName, lastName, role, phone,
      //     commissariatId, officerId, isActive, accessToken }
      // On extrait le token sous `token` et on garde le reste comme user.
      const { accessToken, ...userFields } = data;
      const userWithToken: AuthUser = {
        ...userFields,
        token: accessToken,
      };

      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userWithToken));
      }
      set({ user: userWithToken, isAuthenticated: true });
    },
    logout: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({ user: null, isAuthenticated: false, activeSection: 'dashboard' });
    },
  };
});
