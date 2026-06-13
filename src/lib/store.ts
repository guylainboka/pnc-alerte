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
  | 'profil-edit'
  | 'settings'
  | 'settings-notifications'
  | 'settings-security'
  | 'settings-language'
  | 'settings-geolocation'
  | 'settings-offline'
  | 'alerte-detail'

interface AppState {
  currentScreen: Screen
  screenHistory: Screen[]
  isAuthenticated: boolean
  userName: string
  userEmail: string
  userPhone: string
  userProvince: string
  userCommune: string
  darkMode: boolean
  selectedAlertId: string | null
  profileImage: string | null
  // Settings
  language: string
  geoRadius: string
  biometricEnabled: boolean
  offlineMode: boolean
  pushNotifications: boolean
  geoNotifications: boolean
  soundEnabled: boolean
  // Actions
  navigate: (screen: Screen) => void
  goBack: () => void
  login: (name: string, email: string, phone: string) => void
  logout: () => void
  toggleDarkMode: () => void
  setSelectedAlertId: (id: string | null) => void
  setProfileImage: (img: string | null) => void
  updateProfile: (data: Partial<Pick<AppState, 'userName' | 'userEmail' | 'userPhone' | 'userProvince' | 'userCommune'>>) => void
  updateSetting: (key: string, value: string | boolean) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'splash',
  screenHistory: [],
  isAuthenticated: false,
  userName: '',
  userEmail: '',
  userPhone: '',
  userProvince: 'Kinshasa',
  userCommune: 'Gombe',
  darkMode: false,
  selectedAlertId: null,
  profileImage: null,
  // Settings defaults
  language: 'Français',
  geoRadius: '1 km',
  biometricEnabled: false,
  offlineMode: false,
  pushNotifications: true,
  geoNotifications: true,
  soundEnabled: true,

  navigate: (screen) =>
    set((state) => ({
      screenHistory: [...state.screenHistory, state.currentScreen],
      currentScreen: screen,
    })),

  goBack: () => {
    const { screenHistory } = get()
    if (screenHistory.length > 0) {
      const prev = screenHistory[screenHistory.length - 1]
      set({
        currentScreen: prev,
        screenHistory: screenHistory.slice(0, -1),
      })
    }
  },

  login: (name, email, phone) =>
    set({
      isAuthenticated: true,
      userName: name,
      userEmail: email,
      userPhone: phone,
      currentScreen: 'dashboard',
      screenHistory: [],
    }),

  logout: () =>
    set({
      isAuthenticated: false,
      userName: '',
      userEmail: '',
      userPhone: '',
      currentScreen: 'login',
      screenHistory: [],
      profileImage: null,
    }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedAlertId: (id) => set({ selectedAlertId: id }),
  setProfileImage: (img) => set({ profileImage: img }),

  updateProfile: (data) => set((state) => ({ ...state, ...data })),

  updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
}))
