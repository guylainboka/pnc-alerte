'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Camera, Mic, MapPin, EyeOff } from 'lucide-react'
import { useState } from 'react'

const categories = [
  { id: 'vol', label: 'Vol', emoji: '💰' },
  { id: 'braquage', label: 'Braquage', emoji: '🔫' },
  { id: 'accident', label: 'Accident', emoji: '🚗' },
  { id: 'violence', label: 'Violence', emoji: '⚠️' },
  { id: 'corruption', label: 'Corruption', emoji: '🤝' },
  { id: 'trouble', label: 'Trouble public', emoji: '📢' },
  { id: 'suspect', label: 'Personne suspecte', emoji: '🕵️' },
  { id: 'autre', label: 'Autre', emoji: '📝' },
]

export default function SignalementScreen() {
  const { navigate } = useAppStore()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="text-3xl">✓</span>
        </div>
        <h2 className="text-lg font-bold text-[#0B2D6B] mb-2">Signalement envoyé !</h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          Référence : <span className="font-mono font-bold text-[#1E5EFF]">SIG-2026-A3K9F</span>
        </p>
        <p className="text-xs text-gray-400 text-center mb-6">
          Votre signalement a été transmis au centre opérationnel de la PNC.
        </p>
        <button
          onClick={() => navigate('dashboard')}
          className="px-8 py-3 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm"
        >
          Retour à l&apos;accueil
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col pb-6">
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Signalement d&apos;incident</h1>
        </div>
      </div>

      <div className="flex-1 px-6 pt-4 space-y-5 overflow-y-auto">
        {/* Anonymous toggle */}
        <div className="bg-white rounded-xl p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-[#8B5CF6]" />
            <div>
              <p className="text-sm font-medium text-[#0B2D6B]">Signalement anonyme</p>
              <p className="text-[10px] text-gray-400">Masquer votre identité</p>
            </div>
          </div>
          <button
            onClick={() => setAnonymous(!anonymous)}
            className={`w-11 h-6 rounded-full transition-colors ${anonymous ? 'bg-[#8B5CF6]' : 'bg-gray-200'} relative`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${anonymous ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {anonymous && (
          <div className="bg-[#8B5CF6]/10 rounded-xl p-3 border border-[#8B5CF6]/20">
            <p className="text-xs text-[#8B5CF6]">Votre nom, numéro et localisation précise seront masqués. Seule la commune sera affichée.</p>
          </div>
        )}

        {/* Category */}
        <div>
          <h3 className="text-sm font-bold text-[#0B2D6B] mb-3">Catégorie d&apos;incident</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl text-left flex items-center gap-2 transition-all ${
                  category === cat.id
                    ? 'bg-[#1E5EFF] text-white shadow-md shadow-blue-500/20'
                    : 'bg-white text-gray-600 shadow-sm'
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <h3 className="text-sm font-bold text-[#0B2D6B] mb-2">Description</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'incident en détail..."
            rows={4}
            className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-100 focus:border-[#1E5EFF] outline-none transition-all resize-none shadow-sm"
          />
          <button className="flex items-center gap-1.5 text-xs text-[#1E5EFF] font-medium mt-2">
            <Mic className="w-4 h-4" /> Dicter avec la voix
          </button>
        </div>

        {/* Location */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#1E5EFF]" />
            <div className="flex-1">
              <p className="text-sm font-medium text-[#0B2D6B]">Position GPS</p>
              <p className="text-xs text-gray-400">-4.4419° S, 15.2663° E — Kinshasa, Gombe</p>
            </div>
            <span className="text-[10px] text-green-500 font-medium">Capturée</span>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <h3 className="text-sm font-bold text-[#0B2D6B] mb-2">Pièces jointes</h3>
          <div className="flex gap-3">
            <button className="w-20 h-20 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 shadow-sm">
              <Camera className="w-6 h-6 text-gray-400" />
              <span className="text-[9px] text-gray-400">Photo</span>
            </button>
            <button className="w-20 h-20 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 shadow-sm">
              <Mic className="w-6 h-6 text-gray-400" />
              <span className="text-[9px] text-gray-400">Audio</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-1">Maximum 50 MB par signalement</p>
        </div>

        {/* Submit */}
        <button
          onClick={() => setSubmitted(true)}
          disabled={!category || !description}
          className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:shadow-none"
        >
          Soumettre le signalement
        </button>
      </div>
    </div>
  )
}
