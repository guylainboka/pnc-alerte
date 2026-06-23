'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Bell, Shield, FileText, Users, AlertTriangle, CheckCircle, Info, Loader2, CheckCheck } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToTable,
  formatRelativeTime,
  type NotificationItem,
  type NotificationType,
} from '@/lib/data-service'

const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string; bg: string }> = {
  alerte: { icon: Shield, color: '#FF3B30', bg: '#FFF0EF' },
  urgence: { icon: AlertTriangle, color: '#FF3B30', bg: '#FFF0EF' },
  info: { icon: Info, color: '#1E5EFF', bg: '#EBF0FF' },
  succes: { icon: CheckCircle, color: '#0B9D5A', bg: '#EDFFF5' },
  rappel: { icon: FileText, color: '#8B5CF6', bg: '#F3F0FF' },
}

export default function NotificationsScreen() {
  const { navigate, darkMode } = useAppStore()
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getMyNotifications(false)
      setNotifications(data)
    } catch (e) {
      setError('Impossible de charger vos notifications.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Realtime : recharger dès qu'une notification change
    const unsub = subscribeToTable('notifications', () => {
      load()
    })
    return unsub
  }, [load])

  const handleMarkAsRead = async (id: string) => {
    // Optimistic update
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
    await markNotificationAsRead(id)
  }

  const handleMarkAllRead = async () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    await markAllNotificationsAsRead()
  }

  const handleNotificationClick = (notif: NotificationItem) => {
    if (!notif.read) handleMarkAsRead(notif.id)
    if (notif.screenTarget) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      navigate(notif.screenTarget as any)
    }
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Notifications</h1>
          {unreadCount > 0 && (
            <span className="ml-auto bg-[#FF3B30] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {unreadCount} non lue(s)
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="mt-3 w-full py-2 bg-white/10 text-white rounded-lg text-xs font-medium flex items-center justify-center gap-1.5"
          >
            <CheckCheck className="w-4 h-4" /> Tout marquer comme lu
          </button>
        )}
      </div>

      <div className="px-6 pt-4 space-y-2">
        {loading && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Loader2 className="w-8 h-8 text-[#1E5EFF] animate-spin mb-3" />
            <p className={`text-sm ${textMuted}`}>Chargement…</p>
          </div>
        )}

        {!loading && error && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Bell className={`w-10 h-10 ${textMuted} mb-2`} />
            <p className={`text-sm ${textMuted}`}>{error}</p>
            <button onClick={load} className="mt-3 px-4 py-2 bg-[#1E5EFF] text-white rounded-lg text-xs font-medium">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && notifications.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Bell className={`w-10 h-10 ${textMuted} mb-2`} />
            <p className={`text-sm ${textMuted}`}>Aucune notification.</p>
            <p className={`text-xs ${textMuted} mt-1`}>Vous serez prévenu en temps réel.</p>
          </div>
        )}

        {!loading && !error && notifications.map((notif) => {
          const config = typeConfig[notif.type] || typeConfig.info
          const Icon = config.icon
          return (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className={`w-full text-left ${cardBg} rounded-xl p-4 shadow-sm ${!notif.read ? 'border-l-4 border-[#1E5EFF]' : ''} transition-colors active:scale-[0.99]`}
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: config.bg }}>
                  <Icon className="w-4 h-4" style={{ color: config.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm ${!notif.read ? `font-semibold ${textPrimary}` : `font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}`}>
                      {notif.titre}
                    </p>
                    {!notif.read && <span className="w-2 h-2 rounded-full bg-[#1E5EFF] flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className={`text-xs ${textMuted} mt-0.5`}>{notif.message}</p>
                  <p className={`text-[10px] ${darkMode ? 'text-gray-600' : 'text-gray-300'} mt-1`}>
                    {formatRelativeTime(notif.createdAt)}
                  </p>
                </div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
