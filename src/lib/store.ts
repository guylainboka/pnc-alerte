'use client'
import { create } from 'zustand'

export type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'register'
  | 'forgot-password'
  | 'dashboard'
  | 'sos'
  | 'signalement'
  | 'signalement-anonyme'
  | 'alertes'
  | 'carte'
  | 'commissariats'
  | 'plainte'
  | 'verification-identite'
  | 'verification-vehicule'
  | 'personnes-disparues'
  | 'convocations'
  | 'conseils'
  | 'assistant'
  | 'coffre-fort'
  | 'amendes'
  | 'notifications'
  | 'profil'
  | 'alerte-detail'

interface AppState {
  currentScreen: Screen
  previousScreen: Screen | null
  isAuthenticated: boolean
  userName: string
  userEmail: string
  userPhone: string
  userProvince: string
  darkMode: boolean
  selectedAlertId: string | null
  navigate: (screen: Screen) => void
  goBack: () => void
  login: (name: string, email: string, phone: string) => void
  logout: () => void
  toggleDarkMode: () => void
  setSelectedAlertId: (id: string | null) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'splash',
  previousScreen: null,
  isAuthenticated: false,
  userName: '',
  userEmail: '',
  userPhone: '',
  userProvince: 'Kinshasa',
  darkMode: false,
  selectedAlertId: null,
  navigate: (screen) =>
    set((state) => ({
      previousScreen: state.currentScreen,
      currentScreen: screen,
    })),
  goBack: () => {
    const { previousScreen } = get()
    if (previousScreen) {
      set((state) => ({
        currentScreen: state.previousScreen!,
        previousScreen: null,
      }))
    }
  },
  login: (name, email, phone) =>
    set({
      isAuthenticated: true,
      userName: name,
      userEmail: email,
      userPhone: phone,
      currentScreen: 'dashboard',
      previousScreen: 'login',
    }),
  logout: () =>
    set({
      isAuthenticated: false,
      userName: '',
      userEmail: '',
      userPhone: '',
      currentScreen: 'login',
      previousScreen: null,
    }),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedAlertId: (id) => set({ selectedAlertId: id }),
}))
