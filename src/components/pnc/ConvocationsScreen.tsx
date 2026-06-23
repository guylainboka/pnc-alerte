'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, FileText, Download, Calendar, Clock, Loader2, Bell } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { getMyConvocations, subscribeToTable, formatHeure, formatDate, type Convocation } from '@/lib/data-service'

const statusConfig: Record<Convocation['status'], { label: string; bg: string; color: string }> = {
  pending: { label: 'À confirmer', bg: 'bg-yellow-100', color: 'text-yellow-700' },
  confirmed: { label: 'Confirmée', bg: 'bg-green-100', color: 'text-green-700' },
  missed: { label: 'Manquée', bg: 'bg-red-100', color: 'text-red-700' },
  completed: { label: 'Terminée', bg: 'bg-gray-100', color: 'text-gray-600' },
}

export default function ConvocationsScreen() {
  const { navigate, darkMode } = useAppStore()
  const [convocations, setConvocations] = useState<Convocation[]>([])
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
      const data = await getMyConvocations()
      setConvocations(data)
    } catch (e) {
      setError('Impossible de charger vos convocations.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Realtime : recharger quand la table change
    const unsub = subscribeToTable('convocations', () => {
      load()
    })
    return unsub
  }, [load])

  const isExpired = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.getTime() < Date.now()
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Convocations</h1>
          {convocations.filter(c => c.status === 'pending' && !isExpired(c.dateConvocation)).length > 0 && (
            <span className="ml-auto bg-[#FF3B30] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {convocations.filter(c => c.status === 'pending' && !isExpired(c.dateConvocation)).length} active(s)
            </span>
          )}
        </div>
      </div>

      <div className="px-6 pt-4 space-y-3">
        {loading && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Loader2 className="w-8 h-8 text-[#1E5EFF] animate-spin mb-3" />
            <p className={`text-sm ${textMuted}`}>Chargement de vos convocations…</p>
          </div>
        )}

        {!loading && error && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Bell className={`w-10 h-10 ${textMuted} mb-2`} />
            <p className={`text-sm ${textMuted}`}>{error}</p>
            <button
              onClick={load}
              className="mt-3 px-4 py-2 bg-[#1E5EFF] text-white rounded-lg text-xs font-medium"
            >
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && convocations.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Calendar className={`w-10 h-10 ${textMuted} mb-2`} />
            <p className={`text-sm ${textMuted} text-center`}>
              Aucune convocation pour le moment.
            </p>
            <p className={`text-xs ${textMuted} mt-1 text-center`}>
              Vous serez notifié dès que la PNC vous convoque.
            </p>
          </div>
        )}

        {!loading && !error && convocations.map((conv) => {
          const expired = isExpired(conv.dateConvocation)
          const isActive = !expired && (conv.status === 'pending' || conv.status === 'confirmed')
          const sConf = statusConfig[conv.status] || statusConfig.pending
          return (
            <div key={conv.id} className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  isActive ? 'bg-[#1E5EFF]/10' : (darkMode ? 'bg-gray-700' : 'bg-gray-100')
                }`}>
                  <FileText className={`w-5 h-5 ${isActive ? 'text-[#1E5EFF]' : textMuted}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className={`text-sm font-medium ${textPrimary}`}>{conv.titre}</h4>
                  <div className="flex items-center gap-3 mt-1.5">
                    <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                      <Calendar className="w-3 h-3" /> {formatDate(conv.dateConvocation)}
                    </span>
                    <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                      <Clock className="w-3 h-3" /> {formatHeure(conv.heure)}
                    </span>
                  </div>
                  <p className={`text-[10px] ${textMuted} mt-1`}>{conv.lieu}</p>
                  {conv.officier && (
                    <p className={`text-[10px] ${textMuted} mt-1`}>Officier: {conv.officier}</p>
                  )}
                  {conv.motif && (
                    <p className={`text-[10px] ${textMuted} mt-1 italic`}>Motif: {conv.motif}</p>
                  )}
                  {conv.reference && (
                    <p className={`text-[10px] font-mono ${textMuted} mt-1`}>Réf: {conv.reference}</p>
                  )}
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sConf.bg} ${sConf.color}`}>
                  {expired && conv.status === 'pending' ? 'Expirée' : sConf.label}
                </span>
              </div>
              {isActive && (
                <div className={`flex gap-2 mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                  <button className="flex-1 py-2 bg-[#1E5EFF]/10 text-[#1E5EFF] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Détails
                  </button>
                  <button className="py-2 px-4 bg-[#0B9D5A]/10 text-[#0B9D5A] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" /> PDF
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
