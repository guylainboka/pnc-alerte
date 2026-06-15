'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import SplashScreen from '@/components/pnc/SplashScreen'
import OnboardingScreen from '@/components/pnc/OnboardingScreen'
import LoginScreen from '@/components/pnc/LoginScreen'
import RegisterScreen from '@/components/pnc/RegisterScreen'
import ForgotPasswordScreen from '@/components/pnc/ForgotPasswordScreen'
import DashboardScreen from '@/components/pnc/DashboardScreen'
import SOSScreen from '@/components/pnc/SOSScreen'
import SignalementScreen from '@/components/pnc/SignalementScreen'
import AlertesScreen from '@/components/pnc/AlertesScreen'
import AlerteDetailScreen from '@/components/pnc/AlerteDetailScreen'
import CarteScreen from '@/components/pnc/CarteScreen'
import CommissariatsScreen from '@/components/pnc/CommissariatsScreen'
import PlainteScreen from '@/components/pnc/PlainteScreen'
import VerificationIdentiteScreen from '@/components/pnc/VerificationIdentiteScreen'
import VerificationVehiculeScreen from '@/components/pnc/VerificationVehiculeScreen'
import PersonnesDisparuesScreen from '@/components/pnc/PersonnesDisparuesScreen'
import ConvocationsScreen from '@/components/pnc/ConvocationsScreen'
import ConseilsScreen from '@/components/pnc/ConseilsScreen'
import ConseilDetailScreen from '@/components/pnc/ConseilDetailScreen'
import AssistantScreen from '@/components/pnc/AssistantScreen'
import CoffreFortScreen from '@/components/pnc/CoffreFortScreen'
import AmendesScreen from '@/components/pnc/AmendesScreen'
import NotificationsScreen from '@/components/pnc/NotificationsScreen'
import ProfilScreen from '@/components/pnc/ProfilScreen'
import ProfilEditScreen from '@/components/pnc/ProfilEditScreen'
import SettingsScreen from '@/components/pnc/SettingsScreen'
import SettingsNotificationsScreen from '@/components/pnc/SettingsNotificationsScreen'
import SettingsSecurityScreen from '@/components/pnc/SettingsSecurityScreen'
import SettingsLanguageScreen from '@/components/pnc/SettingsLanguageScreen'
import SettingsGeolocationScreen from '@/components/pnc/SettingsGeolocationScreen'
import SettingsOfflineScreen from '@/components/pnc/SettingsOfflineScreen'
import MesAlertesScreen from '@/components/pnc/MesAlertesScreen'
import UrgenceNumerosScreen from '@/components/pnc/UrgenceNumerosScreen'
import AboutScreen from '@/components/pnc/AboutScreen'
import BottomNav from '@/components/pnc/BottomNav'
import { isNative } from '@/lib/capacitor'
import { App } from '@capacitor/app'
import { StatusBar, Style } from '@capacitor/status-bar'
import { SplashScreen } from '@capacitor/splash-screen'
import { nativeGeolocation } from '@/lib/native-services'

const screensWithNav = ['dashboard', 'alertes', 'sos', 'assistant', 'profil']

// Écrans principaux de tab — le bouton retour Android sur ces écrans doit quitter l'app
const mainTabScreens = ['dashboard', 'alertes', 'sos', 'assistant', 'profil']

export default function Home() {
  const { currentScreen, darkMode, goBack, screenHistory, setLocation } = useAppStore()

  const screenMap: Record<string, React.ReactNode> = {
    splash: <SplashScreen />,
    onboarding: <OnboardingScreen />,
    login: <LoginScreen />,
    register: <RegisterScreen />,
    'forgot-password': <ForgotPasswordScreen />,
    dashboard: <DashboardScreen />,
    sos: <SOSScreen />,
    signalement: <SignalementScreen />,
    'signalement-anonyme': <SignalementScreen />,
    alertes: <AlertesScreen />,
    'mes-alertes': <MesAlertesScreen />,
    carte: <CarteScreen />,
    commissariats: <CommissariatsScreen />,
    plainte: <PlainteScreen />,
    'verification-identite': <VerificationIdentiteScreen />,
    'verification-vehicule': <VerificationVehiculeScreen />,
    'personnes-disparues': <PersonnesDisparuesScreen />,
    convocations: <ConvocationsScreen />,
    conseils: <ConseilsScreen />,
    'conseil-detail': <ConseilDetailScreen />,
    assistant: <AssistantScreen />,
    'coffre-fort': <CoffreFortScreen />,
    amendes: <AmendesScreen />,
    notifications: <NotificationsScreen />,
    profil: <ProfilScreen />,
    'profil-edit': <ProfilEditScreen />,
    settings: <SettingsScreen />,
    'settings-notifications': <SettingsNotificationsScreen />,
    'settings-security': <SettingsSecurityScreen />,
    'settings-language': <SettingsLanguageScreen />,
    'settings-geolocation': <SettingsGeolocationScreen />,
    'settings-offline': <SettingsOfflineScreen />,
    'alerte-detail': <AlerteDetailScreen />,
    'suivi-plainte': <MesAlertesScreen />,
    'urgence-numeros': <UrgenceNumerosScreen />,
    about: <AboutScreen />,
  }

  const showNav = screensWithNav.includes(currentScreen)

  // ====== BOUTON RETOUR ANDROID ======
  useEffect(() => {
    if (!isNative()) return

    // Configurer la status bar
    const setupStatusBar = async () => {
      try {
        await StatusBar.setStyle({ style: darkMode ? Style.Dark : Style.Light })
        await StatusBar.setBackgroundColor({ color: darkMode ? '#0a1a3a' : '#0B2D6B' })
      } catch {}
    }
    setupStatusBar()

    // Gérer le bouton retour hardware Android
    const backButtonHandle = App.addListener('backButton', () => {
      const { currentScreen, screenHistory, goBack } = useAppStore.getState()

      // Sur les écrans principaux (tabs), ne pas revenir en arrière mais quitter l'app
      if (mainTabScreens.includes(currentScreen)) {
        // Sur le dashboard, quitter l'app
        App.exitApp()
        return
      }

      // Sur login/onboarding, aussi quitter
      if (currentScreen === 'login' || currentScreen === 'onboarding' || currentScreen === 'splash') {
        App.exitApp()
        return
      }

      // Sinon, revenir en arrière dans l'historique
      if (screenHistory.length > 0) {
        goBack()
      } else {
        // Pas d'historique, aller au dashboard
        useAppStore.getState().navigate('dashboard')
      }
    })

    return () => {
      backButtonHandle.then(handle => handle.remove()).catch(() => {})
    }
  }, [darkMode])

  // ====== GÉOLOCALISATION AUTOMATIQUE ======
  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Demander la permission d'abord
        await nativeGeolocation.requestPermissions()
        const pos = await nativeGeolocation.getCurrentPosition()
        setLocation(pos.coords.latitude, pos.coords.longitude)
      } catch (err) {
        console.log('Géolocalisation non disponible:', err)
      }
    }
    fetchLocation()

    // Surveiller la position en continu si natif
    if (isNative()) {
      const watchPromise = nativeGeolocation.watchPosition((pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude)
      })
      return () => {
        watchPromise.then(clear => clear()).catch(() => {})
      }
    }
  }, [])

  // ====== CACHER LE SPLASH SCREEN ======
  useEffect(() => {
    if (isNative()) {
      setTimeout(async () => {
        try { await SplashScreen.hide({ fadeOutDuration: 500 }) } catch {}
      }, 2000)
    }
  }, [])

  return (
    <main className={`min-h-screen transition-colors ${darkMode ? 'dark bg-[#0a1a3a]' : 'bg-white'}`}>
      {screenMap[currentScreen] || <DashboardScreen />}
      {showNav && <BottomNav />}
    </main>
  )
}
