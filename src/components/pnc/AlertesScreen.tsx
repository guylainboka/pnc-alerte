'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Shield, Search, ChevronRight, Clock, MapPin, Eye, Loader2, Radio } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { getOfficialAlerts, subscribeToTable, formatRelativeTime, type OfficialAlert } from '@/lib/data-service'

type AlertTab = 'officiel' | 'solidarite' | 'mes-alertes'

// Les alertes "citoyennes" restent simulées pour l'instant (module à venir)
const citizenAlerts: Array<{ id: string; title: string; type: string; status: string; time: string; author: string }> = []

const filterOptions = ['Tout', 'Recherche', 'Sécurité', 'Disparition', 'Info', 'Catastrophe']

const typeToFilter: Record<string, string> = {
  Recherche: 'Recherche',
  Sécurité: 'Sécurité',
  Disparition: 'Disparition',
  Info: 'Info',
  Catastrophe: 'Catastrophe',
}

const severityColor: Record<string, string> = {
  high: '#FF3B30',
  medium: '#F59E0B',
  low: '#1E5EFF',
}

const typeBadgeStyle: Record<string, string> = {
  Recherche: 'bg-yellow-100 text-yellow-700',
  Sécurité: 'bg-red-100 text-red-700',
  Disparition: 'bg-orange-100 text-orange-700',
  Catastrophe: 'bg-purple-100 text-purple-700',
  Info: 'bg-blue-100 text-blue-700',
}

export default function AlertesScreen() {
  const { navigate, setSelectedAlertId, darkMode } = useAppStore()
  const [tab, setTab] = useState<AlertTab>('officiel')
  const [filter, setFilter] = useState('Tout')
  const [alerts, setAlerts] = useState<OfficialAlert[]>([])
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
      const data = await getOfficialAlerts(true)
      setAlerts(data)
    } catch (e) {
      setError('Impossible de charger les alertes officielles.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Realtime : rafraîchir dès qu'une nouvelle alerte est publiée
    const unsub = subscribeToTable('alertes_officielles', (payload) => {
      // Si une alerte a été désactivée (active=false), on recharge
      if (payload.eventType === 'DELETE' || (payload.new && payload.new.active === false)) {
        load()
      } else {
        load()
      }
    })
    return unsub
  }, [load])

  const handleShare = async (title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Alerte PNC: ${title}`, text: title })
      } catch {}
    }
  }

  const filteredOfficialAlerts = alerts.filter((a) => {
    if (filter === 'Tout') return true
    return typeToFilter[a.type] === filter
  })

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Alertes</h1>
          {tab === 'officiel' && alerts.length > 0 && (
            <span className="ml-auto flex items-center gap-1 text-[10px] text-green-300">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> En direct
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2">
          {[
            { key: 'officiel' as AlertTab, label: 'Flux Officiel' },
            { key: 'solidarite' as AlertTab, label: 'Citoyenne' },
            { key: 'mes-alertes' as AlertTab, label: 'Mes Alertes' },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${
                tab === key ? 'bg-white text-[#0B2D6B]' : 'bg-white/10 text-white/70'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      {tab !== 'mes-alertes' && (
        <div className="px-6 py-3">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {filterOptions.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filter === f ? 'bg-[#1E5EFF] text-white' : `${cardBg} ${textMuted}`
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Mes Alertes tab */}
      {tab === 'mes-alertes' && (
        <div className="px-6 pt-2">
          <button
            onClick={() => navigate('mes-alertes')}
            className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform`}
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#1E5EFF]/10">
              <Eye className="w-6 h-6 text-[#1E5EFF]" />
            </div>
            <div className="flex-1 text-left">
              <p className={`text-sm font-semibold ${textPrimary}`}>Suivi de mes alertes & plaintes</p>
              <p className={`text-xs ${textMuted}`}>Voir le suivi complet, prescription et historique</p>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-300" />
          </button>
        </div>
      )}

      {/* Loading */}
      {tab === 'officiel' && loading && (
        <div className={`mx-6 mt-2 flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
          <Loader2 className="w-8 h-8 text-[#1E5EFF] animate-spin mb-3" />
          <p className={`text-sm ${textMuted}`}>Chargement des alertes officielles…</p>
        </div>
      )}

      {/* Error */}
      {tab === 'officiel' && !loading && error && (
        <div className={`mx-6 mt-2 flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
          <Radio className={`w-10 h-10 ${textMuted} mb-2`} />
          <p className={`text-sm ${textMuted}`}>{error}</p>
          <button onClick={load} className="mt-3 px-4 py-2 bg-[#1E5EFF] text-white rounded-lg text-xs font-medium">
            Réessayer
          </button>
        </div>
      )}

      {/* Empty state */}
      {tab === 'officiel' && !loading && !error && filteredOfficialAlerts.length === 0 && (
        <div className={`mx-6 mt-2 flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
          <Shield className={`w-10 h-10 ${textMuted} mb-2`} />
          <p className={`text-sm ${textMuted} text-center`}>
            {filter === 'Tout' ? 'Aucune alerte officielle active.' : `Aucune alerte « ${filter} ».`}
          </p>
          <p className={`text-xs ${textMuted} mt-1 text-center`}>
            Les alertes de la PNC apparaîtront ici en temps réel.
          </p>
        </div>
      )}

      {/* Alert list - Official */}
      {tab === 'officiel' && !loading && !error && filteredOfficialAlerts.length > 0 && (
        <div className="px-6 space-y-3">
          {filteredOfficialAlerts.map((alert) => {
            const sev = alert.severity || 'low'
            const badgeClass = typeBadgeStyle[alert.type] || typeBadgeStyle.Info
            return (
              <button
                key={alert.id}
                onClick={() => {
                  setSelectedAlertId(alert.id)
                  navigate('alerte-detail')
                }}
                className={`w-full ${cardBg} rounded-xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                    style={{ backgroundColor: severityColor[sev] }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${textPrimary}`}>{alert.titre}</p>
                    {alert.description && (
                      <p className={`text-xs ${textMuted} mt-1 line-clamp-2`}>{alert.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>
                        {alert.type}
                      </span>
                      <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                        <Clock className="w-3 h-3" /> {formatRelativeTime(alert.createdAt)}
                      </span>
                      {alert.location && (
                        <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                          <MapPin className="w-3 h-3" /> {alert.location.split(',')[1]?.trim() || alert.location}
                        </span>
                      )}
                    </div>
                    {alert.source && (
                      <p className={`text-[10px] ${textMuted} mt-1`}>Source: {alert.source}</p>
                    )}
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Citizen alerts (placeholder) */}
      {tab === 'solidarite' && (
        <div className="px-6 space-y-3">
          {citizenAlerts.length === 0 ? (
            <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
              <Search className={`w-10 h-10 ${textMuted} mb-2`} />
              <p className={`text-sm ${textMuted} text-center`}>Module alertes citoyennes bientôt disponible.</p>
              <p className={`text-xs ${textMuted} mt-1 text-center`}>
                En attendant, vous pouvez déposer un signalement.
              </p>
              <button
                onClick={() => navigate('signalement')}
                className="mt-3 px-4 py-2 bg-[#8B5CF6] text-white rounded-lg text-xs font-medium"
              >
                + Nouveau signalement
              </button>
            </div>
          ) : (
            citizenAlerts.map((alert) => (
              <div key={alert.id} className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1 bg-[#8B5CF6] flex-shrink-0" />
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${textPrimary}`}>{alert.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        alert.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {alert.status === 'published' ? 'Validée' : 'En révision'}
                      </span>
                      <span className={`text-[10px] ${textMuted}`}>Par {alert.author} — {alert.time}</span>
                    </div>
                  </div>
                  <button onClick={() => handleShare(alert.title)} className="p-1">
                    <Eye className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))
          )}

          {/* FAB */}
          <button
            onClick={() => navigate('signalement')}
            className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-95 transition-transform z-30"
          >
            <span className="text-white text-2xl leading-none">+</span>
          </button>
        </div>
      )}
    </div>
  )
}
