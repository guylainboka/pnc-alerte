'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'
import {
  Bell, Lock, Globe, MapPin, WifiOff, Moon, Sun,
  Volume2, ChevronRight, ShieldCheck, Eye, Database,
  Smartphone, Languages, Navigation, Download
} from 'lucide-react'

function ToggleSwitch({ value, onToggle, color = '#1E5EFF' }: { value: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} className={`w-11 h-6 rounded-full transition-colors relative ${value ? '' : 'bg-gray-200'}`} style={value ? { backgroundColor: color } : {}}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${value ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  )
}

export default function SettingsScreen() {
  const { navigate, darkMode, toggleDarkMode, pushNotifications, geoNotifications, soundEnabled, offlineMode, updateSetting } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const textDesc = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Paramètres" backScreen="profil" />

      <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
        {/* Appearance */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Apparence</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                {darkMode ? <Moon className="w-5 h-5 text-[#8B5CF6]" /> : <Sun className="w-5 h-5 text-[#F59E0B]" />}
                <div>
                  <span className={`text-sm font-medium ${textPrimary}`}>Mode sombre</span>
                  <p className={`text-[10px] ${textDesc}`}>Réduire la luminosité</p>
                </div>
              </div>
              <ToggleSwitch value={darkMode} onToggle={toggleDarkMode} color="#8B5CF6" />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Notifications</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <button onClick={() => navigate('settings-notifications')} className="flex items-center gap-3 p-4 w-full text-left border-b border-gray-50 dark:border-gray-800">
              <Bell className="w-5 h-5 text-[#1E5EFF]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Paramètres de notifications</span><p className={`text-[10px] ${textDesc}`}>Configurer les types d'alertes</p></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-[#0B9D5A]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Sons</span><p className={`text-[10px] ${textDesc}`}>Sons de notification</p></div>
              </div>
              <ToggleSwitch value={soundEnabled} onToggle={() => updateSetting('soundEnabled', !soundEnabled)} color="#0B9D5A" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Navigation className="w-5 h-5 text-[#F59E0B]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Alertes géolocalisées</span><p className={`text-[10px] ${textDesc}`}>Incidents à proximité</p></div>
              </div>
              <ToggleSwitch value={geoNotifications} onToggle={() => updateSetting('geoNotifications', !geoNotifications)} color="#F59E0B" />
            </div>
          </div>
        </div>

        {/* Security */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Sécurité</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <button onClick={() => navigate('settings-security')} className="flex items-center gap-3 p-4 w-full text-left border-b border-gray-50 dark:border-gray-800">
              <Lock className="w-5 h-5 text-[#8B5CF6]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Sécurité & Biométrie</span><p className={`text-[10px] ${textDesc}`}>Mot de passe, empreinte digitale</p></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#1E5EFF]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Authentification biométrique</span><p className={`text-[10px] ${textDesc}`}>Empreinte digitale & Face ID</p></div>
              </div>
              <ToggleSwitch value={useAppStore.getState().biometricEnabled} onToggle={() => updateSetting('biometricEnabled', !useAppStore.getState().biometricEnabled)} color="#1E5EFF" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#EC4899]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Mode invisible</span><p className={`text-[10px] ${textDesc}`}>Masquer votre activité</p></div>
              </div>
              <ToggleSwitch value={false} onToggle={() => {}} color="#EC4899" />
            </div>
          </div>
        </div>

        {/* Language & Region */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Langue & Région</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <button onClick={() => navigate('settings-language')} className="flex items-center gap-3 p-4 w-full text-left border-b border-gray-50 dark:border-gray-800">
              <Globe className="w-5 h-5 text-[#0B9D5A]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Langue</span><p className={`text-[10px] ${textDesc}`}>{useAppStore.getState().language}</p></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
            <button onClick={() => navigate('settings-geolocation')} className="flex items-center gap-3 p-4 w-full text-left">
              <MapPin className="w-5 h-5 text-[#F59E0B]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Rayon de géolocalisation</span><p className={`text-[10px] ${textDesc}`}>{useAppStore.getState().geoRadius}</p></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        {/* Data & Storage */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Données & Stockage</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <WifiOff className="w-5 h-5 text-[#EC4899]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Mode hors ligne</span><p className={`text-[10px] ${textDesc}`}>Consulter les données en cache</p></div>
              </div>
              <ToggleSwitch value={offlineMode} onToggle={() => updateSetting('offlineMode', !offlineMode)} color="#EC4899" />
            </div>
            <button className="flex items-center gap-3 p-4 w-full text-left border-b border-gray-50 dark:border-gray-800">
              <Database className="w-5 h-5 text-[#06B6D4]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Vider le cache</span><p className={`text-[10px] ${textDesc}`}>12.4 MB de données en cache</p></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
            <button className="flex items-center gap-3 p-4 w-full text-left">
              <Download className="w-5 h-5 text-[#0B9D5A]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Télécharger mes données</span><p className={`text-[10px] ${textDesc}`}>Export RGPD</p></div>
              <ChevronRight className="w-4 h-4 text-gray-300" />
            </button>
          </div>
        </div>

        <div className="h-4" />
      </div>
    </div>
  )
}
