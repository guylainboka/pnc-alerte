'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, MapPin, Calendar, Eye, Phone, Loader2, Search } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { getPersonnesDisparues, subscribeToTable, formatDate, type PersonneDisparue } from '@/lib/data-service'

const statusConfig: Record<PersonneDisparue['status'], { label: string; bg: string; color: string }> = {
  recherche: { label: 'Recherche active', bg: 'bg-orange-100', color: 'text-orange-700' },
  alerte: { label: 'Alerte critique', bg: 'bg-red-100', color: 'text-red-700' },
  retrouve: { label: 'Retrouvée', bg: 'bg-green-100', color: 'text-green-700' },
}

export default function PersonnesDisparuesScreen() {
  const { navigate, darkMode } = useAppStore()
  const [persons, setPersons] = useState<PersonneDisparue[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getPersonnesDisparues(true)
      setPersons(data)
    } catch (e) {
      setError('Impossible de charger les avis de recherche.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    // Realtime : recharger dès qu'un avis est publié ou mis à jour
    const unsub = subscribeToTable('personnes_disparues', () => {
      load()
    })
    return unsub
  }, [load])

  const filtered = persons.filter(p => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      p.nomComplet.toLowerCase().includes(q) ||
      (p.derniereVueLieu || '').toLowerCase().includes(q) ||
      (p.description || '').toLowerCase().includes(q)
    )
  })

  const handleCall = (phone: string) => {
    if (typeof window !== 'undefined') {
      window.location.href = `tel:${phone}`
    }
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Personnes disparues</h1>
        </div>

        {/* Recherche */}
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher par nom, lieu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-sm text-white placeholder-white/50 outline-none focus:bg-white/20"
          />
        </div>
      </div>

      <div className="px-6 pt-4 space-y-3">
        {loading && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Loader2 className="w-8 h-8 text-[#1E5EFF] animate-spin mb-3" />
            <p className={`text-sm ${textMuted}`}>Chargement des avis…</p>
          </div>
        )}

        {!loading && error && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Eye className={`w-10 h-10 ${textMuted} mb-2`} />
            <p className={`text-sm ${textMuted}`}>{error}</p>
            <button onClick={load} className="mt-3 px-4 py-2 bg-[#1E5EFF] text-white rounded-lg text-xs font-medium">
              Réessayer
            </button>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={`flex flex-col items-center justify-center py-12 ${cardBg} rounded-xl`}>
            <Eye className={`w-10 h-10 ${textMuted} mb-2`} />
            <p className={`text-sm ${textMuted} text-center`}>
              {search ? 'Aucun résultat pour cette recherche.' : 'Aucun avis de recherche actif.'}
            </p>
            {!search && (
              <p className={`text-xs ${textMuted} mt-1 text-center`}>
                Les nouveaux avis de recherche apparaîtront ici en temps réel.
              </p>
            )}
          </div>
        )}

        {!loading && !error && filtered.map((person) => {
          const sConf = statusConfig[person.status] || statusConfig.recherche
          return (
            <div key={person.id} className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
              <div className="flex items-start gap-3">
                {person.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={person.photoUrl}
                    alt={person.nomComplet}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">{person.sexe === 'F' ? '👩' : '👦'}</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h4 className={`text-sm font-semibold ${textPrimary}`}>{person.nomComplet}</h4>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sConf.bg} ${sConf.color}`}>
                      {sConf.label}
                    </span>
                  </div>
                  <p className={`text-xs ${textMuted} mt-0.5`}>
                    {person.age ? `${person.age} ans — ` : ''}
                    {person.sexe === 'F' ? 'Femme' : person.sexe === 'M' ? 'Homme' : ''}
                  </p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    {person.derniereVueDate && (
                      <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                        <Calendar className="w-3 h-3" /> Vu le {formatDate(person.derniereVueDate)}
                      </span>
                    )}
                    {person.derniereVueLieu && (
                      <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                        <MapPin className="w-3 h-3" /> {person.derniereVueLieu}
                      </span>
                    )}
                  </div>
                  {person.description && (
                    <p className={`text-xs ${textMuted} mt-2 line-clamp-2`}>{person.description}</p>
                  )}
                  {person.reference && (
                    <p className={`text-[10px] font-mono ${textMuted} mt-1`}>Réf: {person.reference}</p>
                  )}
                </div>
              </div>
              <div className={`flex gap-2 mt-3 pt-3 border-t ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                <button className="flex-1 py-2 bg-[#FF3B30]/10 text-[#FF3B30] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <Eye className="w-3.5 h-3.5" /> Signaler une observation
                </button>
                <button
                  onClick={() => handleCall(person.contactTelephone)}
                  className="py-2 px-4 bg-[#0B9D5A]/10 text-[#0B9D5A] rounded-lg text-xs font-medium flex items-center justify-center gap-1"
                >
                  <Phone className="w-3.5 h-3.5" /> Appeler
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
