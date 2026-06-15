'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'
import { WifiOff, Database, Download, RefreshCw, Check } from 'lucide-react'

export default function SettingsOfflineScreen() {
  const { darkMode, offlineMode, updateSetting } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const textDesc = darkMode ? 'text-gray-500' : 'text-gray-400'

  const offlineFeatures = [
    { label: 'Consulter les alertes en cache', available: true },
    { label: 'Créer des signalements', available: true },
    { label: 'Consulter les documents du coffre-fort', available: true },
    { label: 'Consulter les statistiques en cache', available: true },
    { label: 'Synchronisation automatique à la reconnexion', available: true },
    { label: 'Appels d\'urgence', available: false },
    { label: 'Assistant IA', available: false },
    { label: 'Paiement en ligne', available: false },
  ]

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Mode hors ligne" backScreen="settings" />

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* Toggle */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <WifiOff className="w-5 h-5 text-[#EC4899]" />
              <div>
                <span className={`text-sm font-medium ${textPrimary}`}>Mode hors ligne</span>
                <p className={`text-[10px] ${textDesc}`}>Consulter les données sans connexion</p>
              </div>
            </div>
            <button onClick={() => updateSetting('offlineMode', !offlineMode)}
              className={`w-11 h-6 rounded-full transition-colors relative ${offlineMode ? 'bg-[#EC4899]' : 'bg-gray-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${offlineMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Cache info */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
          <div className="flex items-center gap-3 mb-3">
            <Database className="w-5 h-5 text-[#06B6D4]" />
            <span className={`text-sm font-medium ${textPrimary}`}>Données en cache</span>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Alertes</span><span className={`text-xs font-medium ${textPrimary}`}>24 alertes — 2.1 MB</span></div>
            <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Signalements</span><span className={`text-xs font-medium ${textPrimary}`}>3 brouillons — 0.8 MB</span></div>
            <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Coffre-fort</span><span className={`text-xs font-medium ${textPrimary}`}>4 documents — 8.2 MB</span></div>
            <div className="flex justify-between border-t border-gray-50 dark:border-gray-800 pt-2 mt-2"><span className={`text-xs font-medium ${textPrimary}`}>Total</span><span className={`text-xs font-bold ${textPrimary}`}>12.4 MB</span></div>
          </div>
        </div>

        {/* Available features */}
        <div>
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>Fonctionnalités hors ligne</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            {offlineFeatures.map((feat, idx) => (
              <div key={feat.label} className={`flex items-center gap-3 p-3.5 ${idx < offlineFeatures.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                {feat.available ? (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border-2 border-gray-300 flex-shrink-0" />
                )}
                <span className={`text-sm ${feat.available ? textPrimary : textMuted}`}>{feat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sync button */}
        <button className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform`}>
          <RefreshCw className="w-5 h-5 text-[#0B9D5A]" />
          <span className={`text-sm font-medium ${textPrimary}`}>Synchroniser maintenant</span>
        </button>
      </div>
    </div>
  )
}
