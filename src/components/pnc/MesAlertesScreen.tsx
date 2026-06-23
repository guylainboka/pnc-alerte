'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Search, Clock, FileText, AlertTriangle, Siren, Users, ChevronRight, Eye, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { getMySignalements, getMyPlaintes, getSignalementUpdates, type Signalement, type Plainte } from '@/lib/signalements-service'
import { getMySOSCalls, formatRelativeTime, formatDate, type SOSCall } from '@/lib/data-service'

type FilterTab = 'tout' | 'signalement' | 'plainte' | 'sos'

type AlertStatus = 'en-attente' | 'en-cours' | 'traite' | 'rejete' | 'cloture'

const statusConfig: Record<AlertStatus, { label: string; color: string; bg: string }> = {
  'en-attente': { label: 'En attente', color: '#F59E0B', bg: '#FFF8EB' },
  'en-cours': { label: 'En cours', color: '#1E5EFF', bg: '#EBF0FF' },
  'traite': { label: 'Traité', color: '#0B9D5A', bg: '#EDFFF5' },
  'rejete': { label: 'Rejeté', color: '#FF3B30', bg: '#FFF0EF' },
  'cloture': { label: 'Clôturé', color: '#64748B', bg: '#F1F5F9' },
}

type AlertType = 'signalement' | 'plainte' | 'sos'

const typeConfig: Record<AlertType, { icon: typeof FileText; label: string; color: string }> = {
  signalement: { icon: AlertTriangle, label: 'Signalement', color: '#FF3B30' },
  plainte: { icon: FileText, label: 'Plainte', color: '#EC4899' },
  sos: { icon: Siren, label: 'SOS', color: '#1E5EFF' },
}

interface UnifiedAlert {
  id: string
  type: AlertType
  title: string
  status: AlertStatus
  reference: string
  date: string
  description: string
  raw: Signalement | Plainte | SOSCall
}

export default function MesAlertesScreen() {
  const { goBack, darkMode, navigate } = useAppStore()
  const [filter, setFilter] = useState<FilterTab>('tout')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAlert, setSelectedAlert] = useState<UnifiedAlert | null>(null)
  const [alerts, setAlerts] = useState<UnifiedAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [updates, setUpdates] = useState<Array<{ date: string; status: string; message: string }>>([])

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sig, plt, sos] = await Promise.all([
        getMySignalements(),
        getMyPlaintes(),
        getMySOSCalls(),
      ])

      const unified: UnifiedAlert[] = [
        ...sig.map(s => ({
          id: s.id,
          type: 'signalement' as AlertType,
          title: `Signalement — ${s.type}`,
          status: s.status as AlertStatus,
          reference: s.reference,
          date: s.createdAt,
          description: s.description,
          raw: s,
        })),
        ...plt.map(p => ({
          id: p.id,
          type: 'plainte' as AlertType,
          title: `Plainte — ${p.typePlainte}`,
          status: p.status as AlertStatus,
          reference: p.reference,
          date: p.createdAt,
          description: p.description,
          raw: p,
        })),
        ...sos.map(s => {
          const sosStatus: AlertStatus =
            s.status === 'actif' ? 'en-cours'
            : s.status === 'en-route' ? 'en-cours'
            : s.status === 'sur-place' ? 'en-cours'
            : s.status === 'cloture' ? 'cloture'
            : 'rejete'
          return {
            id: s.id,
            type: 'sos' as AlertType,
            title: `SOS — ${s.locationText || 'Position envoyée'}`,
            status: sosStatus,
            reference: s.reference,
            date: s.createdAt,
            description: s.notes || s.locationText || `Position: ${s.latitude || '?'}, ${s.longitude || '?'}`,
            raw: s,
          }
        }),
      ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      setAlerts(unified)
    } catch (e) {
      setAlerts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  // Charger les updates quand on sélectionne une alerte
  useEffect(() => {
    if (selectedAlert?.type === 'signalement') {
      getSignalementUpdates(selectedAlert.id).then(ups => {
        setUpdates(ups.map(u => ({
          date: u.createdAt,
          status: u.status,
          message: u.message || '',
        })))
      })
    } else if (selectedAlert) {
      // Pour les plaintes et SOS, on simule un update initial
      setUpdates([{
        date: selectedAlert.date,
        status: 'Reçu',
        message: `${typeConfig[selectedAlert.type].label} enregistré(e)`,
      }])
    } else {
      setUpdates([])
    }
  }, [selectedAlert])

  const filteredAlerts = alerts
    .filter((a) => filter === 'tout' || a.type === filter)
    .filter(
      (a) =>
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.reference.toLowerCase().includes(searchQuery.toLowerCase())
    )

  if (selectedAlert) {
    const tConf = typeConfig[selectedAlert.type]
    const sConf = statusConfig[selectedAlert.status]
    return (
      <div className={`min-h-screen ${bg} pb-8 transition-colors`}>
        <div className="bg-[#0B2D6B] pt-12 pb-6 px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setSelectedAlert(null)} className="text-white">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-lg font-bold">Suivi — {selectedAlert.reference}</h1>
          </div>
        </div>

        <div className="px-6 pt-4 space-y-4">
          {/* Alert info card */}
          <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${tConf.color}15` }}>
                <tConf.icon className="w-5 h-5" style={{ color: tConf.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-sm font-bold ${textPrimary}`}>{selectedAlert.title}</h3>
                <p className={`text-xs ${textMuted} mt-1`}>{selectedAlert.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: sConf.bg, color: sConf.color }}>
                    {sConf.label}
                  </span>
                  <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                    <Clock className="w-3 h-3" /> {formatDate(selectedAlert.date)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Reference */}
          <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
            <p className={`text-xs ${textMuted}`}>Référence</p>
            <p className={`text-base font-mono font-bold ${textPrimary} mt-1`}>{selectedAlert.reference}</p>
          </div>

          {/* Timeline */}
          <div>
            <h3 className={`text-sm font-bold ${textPrimary} mb-3`}>Historique du suivi</h3>
            <div className="space-y-0">
              {updates.length === 0 ? (
                <p className={`text-xs ${textMuted} italic`}>Aucun historique pour le moment.</p>
              ) : (
                updates.map((update, idx) => (
                  <div key={idx} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-[#1E5EFF] flex-shrink-0 mt-1.5" />
                      {idx < updates.length - 1 && (
                        <div className="w-0.5 flex-1 bg-[#1E5EFF]/20 mt-1" />
                      )}
                    </div>
                    <div className={`flex-1 ${cardBg} rounded-xl p-3 shadow-sm mb-2 transition-colors`}>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-semibold ${textPrimary}`}>{update.status}</span>
                        <span className={`text-[10px] ${textMuted}`}>{formatRelativeTime(update.date)}</span>
                      </div>
                      <p className={`text-xs ${textMuted} mt-1`}>{update.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Prescription info */}
          {(selectedAlert.type === 'plainte') && (
            <div className={`${cardBg} rounded-xl p-4 border-l-4 border-[#F59E0B] shadow-sm transition-colors`}>
              <p className={`text-sm font-semibold ${textPrimary}`}>Prescription à suivre</p>
              <p className={`text-xs ${textMuted} mt-1 leading-relaxed`}>
                Conformément au Code Pénal congolais, les plaintes pour délits sont prescrites après 3 ans. Pour les crimes, la prescription est de 10 ans. Veuillez vous assurer de fournir toutes les preuves nécessaires dans les délais requis.
              </p>
              <ul className={`text-xs ${textMuted} mt-2 space-y-1`}>
                <li>• Rassemblez tous les documents justificatifs</li>
                <li>• Conservez les preuves matérielles</li>
                <li>• Notez les noms des témoins éventuels</li>
                <li>• Suivez régulièrement l&apos;avancement de votre dossier</li>
              </ul>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({
                    title: `Suivi ${selectedAlert.reference}`,
                    text: `Référence: ${selectedAlert.reference}\nStatut: ${sConf.label}\n${selectedAlert.title}`,
                  }).catch(() => {})
                }
              }}
              className={`flex-1 ${cardBg} rounded-xl p-3 shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform`}
            >
              <Eye className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-sm font-medium ${textPrimary}`}>Partager</span>
            </button>
            <button
              onClick={() => navigate('plainte')}
              className="flex-1 bg-[#1E5EFF] rounded-xl p-3 shadow-sm flex items-center justify-center gap-2 text-white active:scale-[0.98] transition-transform"
            >
              <FileText className="w-4 h-4" />
              <span className="text-sm font-medium">Nouvelle plainte</span>
            </button>
          </div>
        </div>
      </div>
    )
  }

  const filterTabs: { key: FilterTab; label: string }[] = [
    { key: 'tout', label: 'Tout' },
    { key: 'signalement', label: 'Signalements' },
    { key: 'plainte', label: 'Plaintes' },
    { key: 'sos', label: 'SOS' },
  ]

  const stats = {
    total: alerts.length,
    enCours: alerts.filter((a) => a.status === 'en-cours').length,
    traite: alerts.filter((a) => a.status === 'traite' || a.status === 'cloture').length,
    enAttente: alerts.filter((a) => a.status === 'en-attente').length,
  }

  return (
    <div className={`min-h-screen ${bg} pb-8 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={goBack} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Mes Alertes — Suivi</h1>
          <button
            onClick={load}
            className="ml-auto text-white/70 text-xs underline"
          >
            Actualiser
          </button>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher par titre ou référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-sm text-white placeholder-white/50 outline-none focus:bg-white/20"
          />
        </div>
      </div>

      <div className="px-6 pt-4 space-y-4">
        {/* Loading */}
        {loading && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Loader2 className="w-8 h-8 text-[#1E5EFF] animate-spin mb-3" />
            <p className={`text-sm ${textMuted}`}>Chargement de vos alertes…</p>
          </div>
        )}

        {!loading && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Total', value: stats.total, color: '#1E5EFF' },
                { label: 'En cours', value: stats.enCours, color: '#F59E0B' },
                { label: 'Traité', value: stats.traite, color: '#0B9D5A' },
                { label: 'En attente', value: stats.enAttente, color: '#8B5CF6' },
              ].map((s) => (
                <div key={s.label} className={`${cardBg} rounded-xl p-2.5 shadow-sm text-center transition-colors`}>
                  <p className={`text-lg font-bold ${textPrimary}`}>{s.value}</p>
                  <p className={`text-[9px] ${textMuted}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Filter tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {filterTabs.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                    filter === f.key ? 'bg-[#1E5EFF] text-white' : `${cardBg} ${textMuted}`
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {/* Alerts list */}
            <div className="space-y-3">
              {filteredAlerts.length === 0 ? (
                <div className={`text-center py-8 ${cardBg} rounded-xl`}>
                  <AlertTriangle className={`w-10 h-10 mx-auto ${textMuted} mb-2`} />
                  <p className={`text-sm ${textMuted}`}>
                    {alerts.length === 0
                      ? 'Aucune alerte pour le moment.'
                      : 'Aucune alerte trouvée pour ce filtre.'}
                  </p>
                  {alerts.length === 0 && (
                    <button
                      onClick={() => navigate('signalement')}
                      className="mt-3 px-4 py-2 bg-[#1E5EFF] text-white rounded-lg text-xs font-medium"
                    >
                      + Nouveau signalement
                    </button>
                  )}
                </div>
              ) : (
                filteredAlerts.map((alert) => {
                  const tConf = typeConfig[alert.type]
                  const sConf = statusConfig[alert.status]
                  return (
                    <button
                      key={alert.id}
                      onClick={() => setSelectedAlert(alert)}
                      className={`w-full ${cardBg} rounded-xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${tConf.color}15` }}>
                          <tConf.icon className="w-5 h-5" style={{ color: tConf.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${textPrimary}`}>{alert.title}</p>
                          <p className={`text-[10px] ${textMuted} mt-0.5`}>{alert.reference}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ backgroundColor: sConf.bg, color: sConf.color }}>
                              {sConf.label}
                            </span>
                            <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                              <Clock className="w-3 h-3" /> {formatRelativeTime(alert.date)}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                      </div>
                    </button>
                  )
                })
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
