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
  userAlerts: [
    {
      id: 'UA-001',
      type: 'signalement',
      title: 'Vol à la tire — Marché Central',
      status: 'en-cours',
      reference: 'SIG-2026-A3K9F',
      date: '2026-06-10',
      description: 'Signalement de vol à la tire au Marché Central de Kinshasa',
      updates: [
        { date: '2026-06-10 14:30', status: 'Reçu', message: 'Signalement enregistré par le centre opérationnel' },
        { date: '2026-06-11 09:00', status: 'En cours', message: 'Transmis au commissariat de la Gombe pour enquête' },
        { date: '2026-06-12 16:00', status: 'En cours', message: 'Enquête en cours — Suspect identifié' },
      ],
    },
    {
      id: 'UA-002',
      type: 'plainte',
      title: 'Plainte pour escroquerie',
      status: 'en-attente',
      reference: 'PLT-2026-B7M2X',
      date: '2026-06-12',
      description: 'Plainte déposée pour escroquerie par faux agent administratif',
      updates: [
        { date: '2026-06-12 10:00', status: 'Reçu', message: 'Plainte enregistrée au commissariat central' },
        { date: '2026-06-12 10:05', status: 'En attente', message: 'En attente de validation par un officier de police judiciaire' },
      ],
    },
    {
      id: 'UA-003',
      type: 'sos',
      title: 'Alerte SOS — 10 juin 2026',
      status: 'cloture',
      reference: 'SOS-2026-C1P5R',
      date: '2026-06-10',
      description: 'Alerte d\'urgence déclenchée à 22h15, position GPS transmise',
      updates: [
        { date: '2026-06-10 22:15', status: 'Reçu', message: 'Alerte SOS reçue — Position GPS capturée' },
        { date: '2026-06-10 22:18', status: 'En cours', message: 'Patrouille dépêchée sur les lieux' },
        { date: '2026-06-10 22:35', status: 'Clôturé', message: 'Patrouille arrivée sur les lieux — Situation sécurisée' },
      ],
    },
    {
      id: 'UA-004',
      type: 'alerte-citoyenne',
      title: 'Disparition de mon frère — Kinsuka',
      status: 'traite',
      reference: 'ACZ-2026-D4N8L',
      date: '2026-06-08',
      description: 'Alerte citoyenne de disparition dans le quartier Kinsuka',
      updates: [
        { date: '2026-06-08 08:00', status: 'Reçu', message: 'Alerte citoyenne soumise pour validation' },
        { date: '2026-06-08 12:00', status: 'Publiée', message: 'Alerte validée et publiée' },
        { date: '2026-06-09 15:00', status: 'Traitée', message: 'Personne retrouvée — Alerte résolue' },
      ],
    },
  ],
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
}))
