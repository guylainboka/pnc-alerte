'use client'

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

const screensWithNav = ['dashboard', 'alertes', 'sos', 'assistant', 'profil']

export default function Home() {
  const { currentScreen, darkMode } = useAppStore()

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

  return (
    <main className={`min-h-screen transition-colors ${darkMode ? 'dark bg-[#0a1a3a]' : 'bg-white'}`}>
      {screenMap[currentScreen] || <DashboardScreen />}
      {showNav && <BottomNav />}
    </main>
  )
}
