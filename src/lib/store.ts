'use client'
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

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
  | 'mes-alertes'
  | 'carte'
  | 'commissariats'
  | 'plainte'
  | 'verification-identite'
  | 'verification-vehicule'
  | 'personnes-disparues'
  | 'convocations'
  | 'conseils'
  | 'conseil-detail'
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
  | 'suivi-plainte'
  | 'about'
  | 'urgence-numeros'

interface UserAlert {
  id: string
  type: 'signalement' | 'plainte' | 'sos' | 'alerte-citoyenne'
  title: string
  status: 'en-attente' | 'en-cours' | 'traite' | 'rejete' | 'cloture'
  reference: string
  date: string
  description: string
  updates: { date: string; status: string; message: string }[]
}

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
  selectedConseilId: string | null
  profileImage: string | null
  // Settings
  language: string
  geoRadius: string
  biometricEnabled: boolean
  offlineMode: boolean
  pushNotifications: boolean
  geoNotifications: boolean
  soundEnabled: boolean
  // Carte électeur
  carteElecteurValidated: boolean
  carteElecteurNumero: string
  // User alerts / suivi
  userAlerts: UserAlert[]
  // Geolocation
  userLatitude: number | null
  userLongitude: number | null
  // Actions
  navigate: (screen: Screen) => void
  goBack: () => void
  login: (name: string, email: string, phone: string) => void
  logout: () => void
  toggleDarkMode: () => void
  setSelectedAlertId: (id: string | null) => void
  setSelectedConseilId: (id: string | null) => void
  setProfileImage: (img: string | null) => void
  updateProfile: (data: Partial<Pick<AppState, 'userName' | 'userEmail' | 'userPhone' | 'userProvince' | 'userCommune'>>) => void
  updateSetting: (key: string, value: string | boolean) => void
  setCarteElecteur: (validated: boolean, numero: string) => void
  addUserAlert: (alert: UserAlert) => void
  updateUserAlertStatus: (id: string, status: UserAlert['status']) => void
  setLocation: (lat: number, lng: number) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
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
  selectedConseilId: null,
  profileImage: null,
  // Settings defaults
  language: 'Français',
  geoRadius: '1 km',
  biometricEnabled: false,
  offlineMode: false,
  pushNotifications: true,
  geoNotifications: true,
  soundEnabled: true,
  // Carte électeur
  carteElecteurValidated: false,
  carteElecteurNumero: '',
  // User alerts
  userAlerts: [],
  // Geolocation
  userLatitude: null,
  userLongitude: null,

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
      carteElecteurValidated: false,
      carteElecteurNumero: '',
    }),

  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
  setSelectedAlertId: (id) => set({ selectedAlertId: id }),
  setSelectedConseilId: (id) => set({ selectedConseilId: id }),
  setProfileImage: (img) => set({ profileImage: img }),
  updateProfile: (data) => set((state) => ({ ...state, ...data })),
  updateSetting: (key, value) => set((state) => ({ ...state, [key]: value })),
  setCarteElecteur: (validated, numero) => set({ carteElecteurValidated: validated, carteElecteurNumero: numero }),
  addUserAlert: (alert) => set((state) => ({ userAlerts: [alert, ...state.userAlerts] })),
  updateUserAlertStatus: (id, status) =>
    set((state) => ({
      userAlerts: state.userAlerts.map((a) =>
        a.id === id ? { ...a, status, updates: [...a.updates, { date: new Date().toISOString(), status: status === 'traite' ? 'Traité' : status === 'cloture' ? 'Clôturé' : 'Mis à jour', message: 'Statut mis à jour' }] } : a
      ),
    })),
  setLocation: (lat, lng) => set({ userLatitude: lat, userLongitude: lng }),
    }),
    {
      name: 'pnc-alerte-store',
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') {
          return window.localStorage
        }
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        }
      }),
      // Ne pas persister l'écran courant (toujours démarrer sur splash pour vérifier la session)
      // Ni la géoloc (toujours la réacquérir)
      partialize: (state) => ({
        isAuthenticated: state.isAuthenticated,
        userName: state.userName,
        userEmail: state.userEmail,
        userPhone: state.userPhone,
        userProvince: state.userProvince,
        userCommune: state.userCommune,
        darkMode: state.darkMode,
        profileImage: state.profileImage,
        language: state.language,
        geoRadius: state.geoRadius,
        biometricEnabled: state.biometricEnabled,
        offlineMode: state.offlineMode,
        pushNotifications: state.pushNotifications,
        geoNotifications: state.geoNotifications,
        soundEnabled: state.soundEnabled,
        carteElecteurValidated: state.carteElecteurValidated,
        carteElecteurNumero: state.carteElecteurNumero,
      }),
    }
  )
)
