'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'
import { Bell, AlertTriangle, FileText, Users, ShieldCheck, MessageCircle, Check } from 'lucide-react'

const notifTypes = [
  { id: 'security', icon: ShieldCheck, label: 'Alertes de sécurité', desc: 'Alertes sécuritaires urgentes', color: '#FF3B30', key: 'pushNotifications' as const },
  { id: 'dossier', icon: FileText, label: 'Mises à jour des dossiers', desc: 'Changements de statut des plaintes', color: '#1E5EFF', key: 'pushNotifications' as const },
  { id: 'convocation', icon: FileText, label: 'Convocations', desc: 'Convocations officielles', color: '#8B5CF6', key: 'pushNotifications' as const },
  { id: 'recherche', icon: AlertTriangle, label: 'Avis de recherche', desc: 'Nouveaux avis de recherche', color: '#F59E0B', key: 'pushNotifications' as const },
  { id: 'disparition', icon: Users, label: 'Personnes disparues', desc: 'Alertes de disparition', color: '#F97316', key: 'pushNotifications' as const },
  { id: 'chat', icon: MessageCircle, label: 'Messages du chat', desc: 'Réponses de l\'assistant', color: '#0B9D5A', key: 'pushNotifications' as const },
]

export default function SettingsNotificationsScreen() {
  const { darkMode, pushNotifications, updateSetting } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const textDesc = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Paramètres de notifications" backScreen="settings" />

      <div className="flex-1 px-6 py-4 space-y-4">
        {/* Master toggle */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-[#1E5EFF]" />
              <div>
                <span className={`text-sm font-medium ${textPrimary}`}>Notifications push</span>
                <p className={`text-[10px] ${textDesc}`}>Activer toutes les notifications</p>
              </div>
            </div>
            <button onClick={() => updateSetting('pushNotifications', !pushNotifications)}
              className={`w-11 h-6 rounded-full transition-colors relative ${pushNotifications ? 'bg-[#1E5EFF]' : 'bg-gray-200'}`}>
              <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${pushNotifications ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Individual notification types */}
        <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider`}>Types de notifications</h3>
        <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
          {notifTypes.map((notif, idx) => {
            const Icon = notif.icon
            return (
              <div key={notif.id} className={`flex items-center gap-3 p-4 ${idx < notifTypes.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${notif.color}15` }}>
                  <Icon className="w-4 h-4" style={{ color: notif.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${textPrimary}`}>{notif.label}</span>
                  <p className={`text-[10px] ${textDesc}`}>{notif.desc}</p>
                </div>
                <button onClick={() => {}}
                  className={`w-9 h-5 rounded-full transition-colors relative ${pushNotifications ? 'bg-[#1E5EFF]' : 'bg-gray-200'}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${pushNotifications ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            )
          })}
        </div>

        {/* Priority */}
        <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-3 border border-red-200 dark:border-red-800">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
            <p className="text-xs text-red-700 dark:text-red-300">Les alertes sécuritaires urgentes ignorent le mode Ne pas déranger.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
