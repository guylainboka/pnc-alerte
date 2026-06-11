'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Bell, Shield, FileText, Users, AlertTriangle } from 'lucide-react'

const notifications = [
  { id: '1', title: 'Alerte sécurité — Quartier Matonge', body: 'Risque de vols signalé dans votre zone.', type: 'security', time: 'Il y a 2h', read: false },
  { id: '2', title: 'Mise à jour dossier PNCP-2026-X98B2', body: 'Votre plainte est maintenant en cours d\'examen.', type: 'dossier', time: 'Il y a 4h', read: false },
  { id: '3', title: 'Convocation — 15 juin 2026', body: 'Vous êtes convoqué au Commissariat Central de la Gombe.', type: 'convocation', time: 'Il y a 6h', read: false },
  { id: '4', title: 'Avis de recherche — Nouvelle alerte', body: 'Un suspect est recherché dans la commune de la Gombe.', type: 'recherche', time: 'Hier', read: true },
  { id: '5', title: 'Conseil de prévention', body: 'Nouvel article : Comment sécuriser votre domicile.', type: 'info', time: 'Hier', read: true },
]

const typeConfig: Record<string, { icon: typeof Bell; color: string; bg: string }> = {
  security: { icon: Shield, color: '#FF3B30', bg: '#FFF0EF' },
  dossier: { icon: FileText, color: '#1E5EFF', bg: '#EBF0FF' },
  convocation: { icon: FileText, color: '#8B5CF6', bg: '#F3F0FF' },
  recherche: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFF8EB' },
  info: { icon: Users, color: '#0B9D5A', bg: '#EDFFF5' },
}

export default function NotificationsScreen() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Notifications</h1>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-2">
        {notifications.map((notif) => {
          const config = typeConfig[notif.type] || typeConfig.info
          const Icon = config.icon
          return (
            <div key={notif.id} className={`bg-white rounded-xl p-4 shadow-sm ${!notif.read ? 'border-l-4 border-[#1E5EFF]' : ''}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bg }}>
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notif.read ? 'font-semibold text-[#0B2D6B]' : 'font-medium text-gray-600'}`}>
                      {notif.title}
                    </p>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-[#1E5EFF] flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{notif.body}</p>
                  <p className="text-[10px] text-gray-300 mt-1">{notif.time}</p>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
