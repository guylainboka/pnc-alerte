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

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone?: string | null;
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
  login: (user: AuthUser) => void;
  logout: () => void;
}

const STORAGE_KEY = 'pnc_auth_user';

function loadUser(): AuthUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export const useAppStore = create<AppStore>((set) => ({
  activeSection: 'dashboard',
  setActiveSection: (section) => set({ activeSection: section }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  // Auth
  user: loadUser(),
  isAuthenticated: !!loadUser(),
  login: (user) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }
    set({ user, isAuthenticated: true });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    set({ user: null, isAuthenticated: false, activeSection: 'dashboard' });
  },
}));
