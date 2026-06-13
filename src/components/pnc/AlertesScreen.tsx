'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Shield, Search, Filter, ChevronRight, Clock, MapPin, Eye } from 'lucide-react'
import { useState } from 'react'

type AlertTab = 'officiel' | 'solidarite' | 'mes-alertes'

const officialAlerts = [
  { id: '1', title: 'Avis de recherche — Suspect de braquage', type: 'Recherche', severity: 'high', time: 'Il y a 2h', location: 'Kinshasa, Gombe', description: 'Un individu est activement recherché pour braquage à main armée commis dans la commune de la Gombe. Toute information est à transmettre au commissariat le plus proche.' },
  { id: '2', title: 'Alerte sécurité — Zone Matonge', type: 'Sécurité', severity: 'high', time: 'Il y a 4h', location: 'Kinshasa, Barumbu', description: 'Risque élevé de vols à la tire signalé dans le quartier Matonge. Soyez vigilants et signalez toute activité suspecte.' },
  { id: '3', title: 'Personne disparue — Enfant de 8 ans', type: 'Disparition', severity: 'high', time: 'Il y a 6h', location: 'Kinshasa, Kintambo', description: 'Un enfant de 8 ans a été signalé disparu dans le quartier Kintambo depuis le 9 juin 2026. Toute observation est à signaler d\'urgence.' },
  { id: '4', title: 'Travaux routiers — Bd du 30 Juin', type: 'Info', severity: 'low', time: 'Il y a 8h', location: 'Kinshasa, Gombe', description: 'Des travaux de réfection sont en cours sur le Boulevard du 30 Juin. Circulation perturbée jusqu\'au 20 juin 2026.' },
  { id: '5', title: 'Opération de sécurité — Ndili', type: 'Sécurité', severity: 'medium', time: 'Il y a 12h', location: 'Kinshasa, Ndjili', description: 'Une opération de sécurisation est en cours dans la commune de Ndjili. Présence renforcée des forces de l\'ordre.' },
]

const citizenAlerts = [
  { id: '6', title: 'Disparition de mon frère — Kinsuka', type: 'Disparition', status: 'published', time: 'Il y a 1j', author: 'M.A.' },
  { id: '7', title: 'Véhicule Toyota Corolla volé', type: 'Vol', status: 'review', time: 'Il y a 2j', author: 'J.K.' },
]

const filterOptions = ['Tout', 'Recherche', 'Sécurité', 'Disparition', 'Info', 'Catastrophe']

export default function AlertesScreen() {
  const { navigate, setSelectedAlertId, darkMode } = useAppStore()
  const [tab, setTab] = useState<AlertTab>('officiel')
  const [filter, setFilter] = useState('Tout')

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const handleShare = async (title: string) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: `Alerte PNC: ${title}`, text: title })
      } catch {}
    }
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Alertes</h1>
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

      {/* Alert list */}
      {tab !== 'mes-alertes' && (
        <div className="px-6 space-y-3">
          {tab === 'officiel' ? (
            officialAlerts
              .filter((a) => filter === 'Tout' || a.type === filter)
              .map((alert) => (
                <button
                  key={alert.id}
                  onClick={() => { setSelectedAlertId(alert.id); navigate('alerte-detail') }}
                  className={`w-full ${cardBg} rounded-xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                        alert.severity === 'high' ? 'bg-[#FF3B30]' : alert.severity === 'medium' ? 'bg-[#F59E0B]' : 'bg-[#1E5EFF]'
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium ${textPrimary}`}>{alert.title}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                          alert.type === 'Recherche' ? 'bg-yellow-100 text-yellow-700' :
                          alert.type === 'Sécurité' ? 'bg-red-100 text-red-700' :
                          alert.type === 'Disparition' ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {alert.type}
                        </span>
                        <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                          <Clock className="w-3 h-3" /> {alert.time}
                        </span>
                        <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                          <MapPin className="w-3 h-3" /> {alert.location.split(',')[1]?.trim()}
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0 mt-1" />
                  </div>
                </button>
              ))
          ) : (
            <>
              {citizenAlerts.map((alert) => (
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
              ))}

              {/* FAB */}
              <button
                onClick={() => navigate('signalement')}
                className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-95 transition-transform z-30"
              >
                <span className="text-white text-2xl leading-none">+</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
