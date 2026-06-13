'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'
import { MapPin, Check } from 'lucide-react'

const radiusOptions = [
  { value: '500 m', label: '500 mètres', desc: 'Zone très rapprochée' },
  { value: '1 km', label: '1 kilomètre', desc: 'Quartier immédiat' },
  { value: '2 km', label: '2 kilomètres', desc: 'Quartier élargi' },
  { value: '5 km', label: '5 kilomètres', desc: 'Commune' },
  { value: '10 km', label: '10 kilomètres', desc: 'Maximum recommandé' },
]

export default function SettingsGeolocationScreen() {
  const { darkMode, geoRadius, updateSetting } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const textDesc = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Rayon de géolocalisation" backScreen="settings" />

      <div className="flex-1 px-6 py-4 space-y-4">
        <p className={`text-sm ${textMuted}`}>Définissez le rayon autour de votre position pour recevoir les alertes d'incidents à proximité.</p>

        {/* Visual radius indicator */}
        <div className={`${cardBg} rounded-xl p-6 shadow-sm flex items-center justify-center transition-colors`}>
          <div className="relative w-48 h-48">
            <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700" />
            <div className="absolute inset-4 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600" />
            <div className="absolute inset-8 rounded-full border-2 border-dashed border-gray-400 dark:border-gray-500" />
            <div className="absolute inset-12 rounded-full bg-[#1E5EFF]/10 border-2 border-[#1E5EFF]/30" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-[#1E5EFF] shadow-lg" />
            </div>
            <div className="absolute top-2 right-2 bg-[#1E5EFF] text-white text-[10px] px-2 py-0.5 rounded-full font-medium">{geoRadius}</div>
          </div>
        </div>

        <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
          {radiusOptions.map((opt, idx) => (
            <button key={opt.value}
              onClick={() => updateSetting('geoRadius', opt.value)}
              className={`w-full flex items-center gap-3 p-4 text-left transition-colors ${idx < radiusOptions.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
              <MapPin className={`w-5 h-5 ${geoRadius === opt.value ? 'text-[#1E5EFF]' : textMuted}`} />
              <div className="flex-1">
                <span className={`text-sm font-medium ${textPrimary}`}>{opt.label}</span>
                <p className={`text-[10px] ${textDesc}`}>{opt.desc}</p>
              </div>
              {geoRadius === opt.value && <Check className="w-5 h-5 text-[#1E5EFF]" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
