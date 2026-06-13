'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Search, ShieldCheck, ShieldAlert, Car } from 'lucide-react'
import { useState } from 'react'

export default function VerificationVehiculeScreen() {
  const { navigate, darkMode } = useAppStore()
  const [plaque, setPlaque] = useState('')
  const [chassis, setChassis] = useState('')
  const [checking, setChecking] = useState(false)
  const [result, setResult] = useState<any>(null)

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a] text-white' : 'bg-[#F5F6FA] border-transparent'

  const handleCheck = () => {
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      setResult({
        status: 'valid',
        vol: false,
        assurance: 'Valide jusqu\'au 15/12/2026',
        marque: 'Toyota',
        modele: 'Corolla',
        annee: '2022',
      })
    }, 2000)
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col pb-6 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Vérification véhicule</h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-4 space-y-4">
        <div className={`${cardBg} rounded-2xl p-5 shadow-sm space-y-4 transition-colors`}>
          <div className="flex items-center gap-3 mb-2">
            <Car className="w-6 h-6 text-[#1E5EFF]" />
            <h3 className={`text-sm font-bold ${textPrimary}`}>Informations du véhicule</h3>
          </div>

          <div>
            <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Numéro de plaque</label>
            <input type="text" value={plaque} onChange={(e) => setPlaque(e.target.value)}
              placeholder="Ex: KIN 1234 A" className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] ${darkMode ? '' : 'focus:bg-white'} outline-none transition-all font-mono uppercase`} />
          </div>

          <div>
            <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Numéro de châssis (optionnel)</label>
            <input type="text" value={chassis} onChange={(e) => setChassis(e.target.value)}
              placeholder="Ex: WVWZZZ3CZWE" className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] ${darkMode ? '' : 'focus:bg-white'} outline-none transition-all font-mono uppercase`} />
          </div>

          <button onClick={handleCheck} disabled={!plaque || checking}
            className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-40">
            {checking ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Lancer la vérification'
            )}
          </button>
        </div>

        {result && (
          <div className={`${cardBg} rounded-2xl p-5 shadow-sm space-y-3 transition-colors`}>
            <div className="flex items-center gap-3 mb-2">
              {result.status === 'valid' ? (
                <ShieldCheck className="w-6 h-6 text-green-500" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-red-500" />
              )}
              <h3 className={`text-sm font-bold ${textPrimary}`}>Résultats</h3>
            </div>

            <div className="space-y-2">
              <div className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                <span className={`text-xs ${textMuted}`}>Statut</span>
                <span className="text-xs font-semibold text-green-600">Véhicule en règle</span>
              </div>
              <div className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                <span className={`text-xs ${textMuted}`}>Marque / Modèle</span>
                <span className={`text-xs font-medium ${textPrimary}`}>{result.marque} {result.modele} ({result.annee})</span>
              </div>
              <div className={`flex justify-between items-center py-2 border-b ${darkMode ? 'border-gray-700' : 'border-gray-50'}`}>
                <span className={`text-xs ${textMuted}`}>Signalement de vol</span>
                <span className="text-xs font-semibold text-green-600">Aucun signalement</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className={`text-xs ${textMuted}`}>Assurance</span>
                <span className={`text-xs font-medium ${textPrimary}`}>{result.assurance}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
