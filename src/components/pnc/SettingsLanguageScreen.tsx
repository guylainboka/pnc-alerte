'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'
import { Globe, Check } from 'lucide-react'

const languages = [
  { code: 'fr', label: 'Français', desc: 'Langue officielle' },
  { code: 'ln', label: 'Lingala', desc: 'Langue nationale' },
  { code: 'sw', label: 'Swahili', desc: 'Langue nationale' },
  { code: 'lu', label: 'Tshiluba', desc: 'Langue nationale' },
  { code: 'kg', label: 'Kikongo', desc: 'Langue nationale' },
]

export default function SettingsLanguageScreen() {
  const { darkMode, language, updateSetting } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const textDesc = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Langue de l'application" backScreen="settings" />

      <div className="flex-1 px-6 py-4 space-y-4">
        <p className={`text-sm ${textMuted}`}>Sélectionnez la langue d'affichage de l'application.</p>

        <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
          {languages.map((lang, idx) => (
            <button key={lang.code}
              onClick={() => updateSetting('language', lang.label)}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${idx < languages.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
              <Globe className={`w-5 h-5 ${language === lang.label ? 'text-[#1E5EFF]' : textMuted}`} />
              <div className="flex-1">
                <span className={`text-sm font-medium ${textPrimary}`}>{lang.label}</span>
                <p className={`text-[10px] ${textDesc}`}>{lang.desc}</p>
              </div>
              {language === lang.label && <Check className="w-5 h-5 text-[#1E5EFF]" />}
            </button>
          ))}
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-700 dark:text-blue-300">La traduction automatique des alertes et réponses de l'assistant IA sera effectuée dans la langue sélectionnée.</p>
        </div>
      </div>
    </div>
  )
}
