'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Shield, Search, Filter, ChevronRight, Clock, MapPin } from 'lucide-react'
import { useState } from 'react'

type AlertTab = 'officiel' | 'solidarite'

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
  const { navigate, setSelectedAlertId } = useAppStore()
  const [tab, setTab] = useState<AlertTab>('officiel')
  const [filter, setFilter] = useState('Tout')

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
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
          <button
            onClick={() => setTab('officiel')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'officiel' ? 'bg-white text-[#0B2D6B]' : 'bg-white/10 text-white/70'
            }`}
          >
            Flux Officiel PNC
          </button>
          <button
            onClick={() => setTab('solidarite')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              tab === 'solidarite' ? 'bg-white text-[#0B2D6B]' : 'bg-white/10 text-white/70'
            }`}
          >
            Solidarité Citoyenne
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="px-6 py-3">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                filter === f ? 'bg-[#1E5EFF] text-white' : 'bg-white text-gray-500'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Alert list */}
      <div className="px-6 space-y-3">
        {tab === 'officiel' ? (
          officialAlerts
            .filter((a) => filter === 'Tout' || a.type === filter)
            .map((alert) => (
              <button
                key={alert.id}
                onClick={() => { setSelectedAlertId(alert.id); navigate('alerte-detail') }}
                className="w-full bg-white rounded-xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-3 h-3 rounded-full mt-1 flex-shrink-0 ${
                      alert.severity === 'high' ? 'bg-[#FF3B30]' : alert.severity === 'medium' ? 'bg-[#F59E0B]' : 'bg-[#1E5EFF]'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#0B2D6B]">{alert.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        alert.type === 'Recherche' ? 'bg-yellow-100 text-yellow-700' :
                        alert.type === 'Sécurité' ? 'bg-red-100 text-red-700' :
                        alert.type === 'Disparition' ? 'bg-orange-100 text-orange-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {alert.type}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {alert.time}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
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
              <div key={alert.id} className="bg-white rounded-xl p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-3 h-3 rounded-full mt-1 bg-[#8B5CF6] flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#0B2D6B]">{alert.title}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        alert.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {alert.status === 'published' ? 'Validée' : 'En révision'}
                      </span>
                      <span className="text-[10px] text-gray-400">Par {alert.author} — {alert.time}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* FAB */}
            <button className="fixed bottom-24 right-6 w-14 h-14 bg-[#8B5CF6] rounded-full flex items-center justify-center shadow-lg shadow-purple-500/30 active:scale-95 transition-transform z-30">
              <span className="text-white text-2xl leading-none">+</span>
            </button>
          </>
        )}
      </div>
    </div>
  )
}
