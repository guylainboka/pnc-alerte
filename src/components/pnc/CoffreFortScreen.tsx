'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Lock, FileText, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

const documentTypes = [
  { id: 'cin', label: 'Carte d\'identité nationale', icon: '🪪', count: 1 },
  { id: 'passport', label: 'Passeport', icon: '📘', count: 1 },
  { id: 'permis', label: 'Permis de conduire', icon: '🚗', count: 1 },
  { id: 'autre', label: 'Autres documents', icon: '📄', count: 2 },
]

export default function CoffreFortScreen() {
  const { navigate, darkMode } = useAppStore()
  const [authenticated, setAuthenticated] = useState(false)
  const [verifying, setVerifying] = useState(false)

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  if (!authenticated) {
    return (
      <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
        <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('dashboard')} className="text-white">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <h1 className="text-white text-lg font-bold">Coffre-Fort Numérique</h1>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-3xl bg-[#1E5EFF]/10 flex items-center justify-center mb-4">
            <Lock className="w-10 h-10 text-[#1E5EFF]" />
          </div>
          <h2 className={`text-lg font-bold ${textPrimary} mb-2`}>Accès sécurisé</h2>
          <p className={`text-sm ${textMuted} text-center mb-6`}>
            Authentifiez-vous pour accéder à vos documents chiffrés (AES-256).
          </p>
          <button
            onClick={() => { setVerifying(true); setTimeout(() => setAuthenticated(true), 1500) }}
            disabled={verifying}
            className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-60"
          >
            {verifying ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'S\'authentifier'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Coffre-Fort Numérique</h1>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-3">
        {/* Security badge */}
        <div className="bg-green-50 rounded-xl p-3 border border-green-200 flex items-center gap-2">
          <Lock className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-700 font-medium">Chiffrement AES-256 actif</span>
        </div>

        {/* Document types */}
        {documentTypes.map((doc) => (
          <div key={doc.id} className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{doc.icon}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${textPrimary}`}>{doc.label}</p>
                <p className={`text-[10px] ${textMuted}`}>{doc.count} document(s) stocké(s)</p>
              </div>
              <button className="w-8 h-8 rounded-lg bg-[#FF3B30]/10 flex items-center justify-center">
                <Trash2 className="w-4 h-4 text-[#FF3B30]" />
              </button>
            </div>
          </div>
        ))}

        {/* Add button */}
        <button className={`w-full py-3 border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-200'} rounded-xl flex items-center justify-center gap-2 text-sm ${textMuted} font-medium mt-2 transition-colors`}>
          <Plus className="w-4 h-4" /> Ajouter un document
        </button>
      </div>
    </div>
  )
}
