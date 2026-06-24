'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Shield, MapPin, Clock, Share2, Eye, Loader2 } from 'lucide-react'
import { useState, useEffect } from 'react'
import { getOfficialAlertById, formatRelativeTime, type OfficialAlert } from '@/lib/data-service'

export default function AlerteDetailScreen() {
  const { navigate, darkMode, selectedAlertId } = useAppStore()
  const [alert, setAlert] = useState<OfficialAlert | null>(null)
  const [loading, setLoading] = useState(true)

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    if (!selectedAlertId) {
      setLoading(false)
      return
    }
    getOfficialAlertById(selectedAlertId).then((found) => {
      if (cancelled) return
      setAlert(found)
      setLoading(false)
    }).catch(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedAlertId])

  const severityColors: Record<string, string> = {
    high: '#FF3B30',
    medium: '#F59E0B',
    low: '#1E5EFF',
  }

  const severity = alert?.severity || 'low'
  const typeBadgeStyle: Record<string, string> = {
    Recherche: 'bg-yellow-100 text-yellow-700',
    Sécurité: 'bg-red-100 text-red-700',
    Disparition: 'bg-orange-100 text-orange-700',
    Catastrophe: 'bg-purple-100 text-purple-700',
    Info: 'bg-blue-100 text-blue-700',
  }
  const badgeClass = typeBadgeStyle[alert?.type || ''] || typeBadgeStyle.Info

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('alertes')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Détails de l&apos;alerte</h1>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-4">
        {loading && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Loader2 className="w-8 h-8 text-[#1E5EFF] animate-spin mb-3" />
            <p className={`text-sm ${textMuted}`}>Chargement de l&apos;alerte…</p>
          </div>
        )}

        {!loading && !alert && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Shield className={`w-10 h-10 ${textMuted} mb-2`} />
            <p className={`text-sm ${textMuted}`}>Alerte introuvable.</p>
            <button onClick={() => navigate('alertes')} className="mt-3 px-4 py-2 bg-[#1E5EFF] text-white rounded-lg text-xs font-medium">
              Retour aux alertes
            </button>
          </div>
        )}

        {!loading && alert && (
          <>
            {/* Main card */}
            <div className={`${cardBg} rounded-xl p-5 shadow-sm transition-colors`}>
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${severityColors[severity]}15` }}>
                  <Shield className="w-5 h-5" style={{ color: severityColors[severity] }} />
                </div>
                <div className="flex-1">
                  <h2 className={`text-base font-bold ${textPrimary}`}>{alert.titre}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${badgeClass}`}>{alert.type}</span>
                    <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                      <Clock className="w-3 h-3" /> {formatRelativeTime(alert.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-50'} pt-3 mt-3 space-y-2`}>
                {alert.location && (
                  <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
                    <MapPin className="w-3.5 h-3.5 text-[#1E5EFF]" />
                    <span>{alert.location}</span>
                  </div>
                )}
                {alert.source && (
                  <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
                    <Shield className="w-3.5 h-3.5 text-[#1E5EFF]" />
                    <span>Source : {alert.source}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className={`${cardBg} rounded-xl p-5 shadow-sm transition-colors`}>
              <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Description</h3>
              <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                {alert.description || 'Aucune description complémentaire.'}
              </p>
              {alert.reference && (
                <p className={`text-[10px] ${textMuted} mt-3`}>Réf : {alert.reference}</p>
              )}
            </div>

            {/* Actions */}
            <div className="space-y-2">
              <button
                onClick={() => navigate('signalement')}
                className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform`}
              >
                <Eye className="w-5 h-5 text-[#1E5EFF]" />
                <span className={`text-sm font-medium ${textPrimary}`}>Signaler une observation</span>
              </button>
              <button
                onClick={async () => {
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: `Alerte PNC: ${alert.titre}`,
                        text: `${alert.titre}\n${alert.description || ''}\nRéf: ${alert.reference || ''}`,
                      })
                    } catch {}
                  }
                }}
                className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform`}
              >
                <Share2 className="w-5 h-5 text-[#0B9D5A]" />
                <span className={`text-sm font-medium ${textPrimary}`}>Partager cette alerte</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
