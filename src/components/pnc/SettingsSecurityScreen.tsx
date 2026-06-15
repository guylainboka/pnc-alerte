'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'
import { Lock, Fingerprint, Eye, ShieldCheck, KeyRound, Smartphone } from 'lucide-react'

function ToggleSwitch({ value, onToggle, color = '#1E5EFF' }: { value: boolean; onToggle: () => void; color?: string }) {
  return (
    <button onClick={onToggle} className={`w-11 h-6 rounded-full transition-colors relative ${value ? '' : 'bg-gray-200'}`} style={value ? { backgroundColor: color } : {}}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${value ? 'right-0.5' : 'left-0.5'}`} />
    </button>
  )
}

export default function SettingsSecurityScreen() {
  const { darkMode, biometricEnabled, updateSetting } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const textDesc = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Sécurité & Biométrie" backScreen="settings" />

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* Password */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Mot de passe</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <button className="flex items-center gap-3 p-4 w-full text-left border-b border-gray-50 dark:border-gray-800">
              <KeyRound className="w-5 h-5 text-[#1E5EFF]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Changer le mot de passe</span><p className={`text-[10px] ${textDesc}`}>Dernière modification il y a 30 jours</p></div>
            </button>
            <button className="flex items-center gap-3 p-4 w-full text-left">
              <Lock className="w-5 h-5 text-[#8B5CF6]" />
              <div className="flex-1"><span className={`text-sm font-medium ${textPrimary}`}>Historique des connexions</span><p className={`text-[10px] ${textDesc}`}>Voir les appareils connectés</p></div>
            </button>
          </div>
        </div>

        {/* Biometric */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Authentification biométrique</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Fingerprint className="w-5 h-5 text-[#0B9D5A]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Empreinte digitale</span><p className={`text-[10px] ${textDesc}`}>Déverrouiller avec l'empreinte</p></div>
              </div>
              <ToggleSwitch value={biometricEnabled} onToggle={() => updateSetting('biometricEnabled', !biometricEnabled)} color="#0B9D5A" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Smartphone className="w-5 h-5 text-[#1E5EFF]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Reconnaissance faciale</span><p className={`text-[10px] ${textDesc}`}>Déverrouiller avec Face ID</p></div>
              </div>
              <ToggleSwitch value={false} onToggle={() => {}} color="#1E5EFF" />
            </div>
          </div>
        </div>

        {/* Privacy */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Confidentialité</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5 text-[#EC4899]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Masquer ma position</span><p className={`text-[10px] ${textDesc}`}>Ne pas partager votre GPS</p></div>
              </div>
              <ToggleSwitch value={false} onToggle={() => {}} color="#EC4899" />
            </div>
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-[#F59E0B]" />
                <div><span className={`text-sm font-medium ${textPrimary}`}>Verrouillage automatique</span><p className={`text-[10px] ${textDesc}`}>Après 5 minutes d'inactivité</p></div>
              </div>
              <ToggleSwitch value={true} onToggle={() => {}} color="#F59E0B" />
            </div>
          </div>
        </div>

        {/* Account actions */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Compte</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            <button className="flex items-center gap-3 p-4 w-full text-left border-b border-gray-50 dark:border-gray-800">
              <Lock className="w-5 h-5 text-[#FF3B30]" />
              <span className="text-sm font-medium text-[#FF3B30]">Bloquer temporairement mon compte</span>
            </button>
            <button className="flex items-center gap-3 p-4 w-full text-left">
              <ShieldCheck className="w-5 h-5 text-[#FF3B30]" />
              <span className="text-sm font-medium text-[#FF3B30]">Supprimer mon compte</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
