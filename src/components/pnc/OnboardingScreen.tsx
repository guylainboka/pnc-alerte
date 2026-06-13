'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { ShieldCheck, Bell, MapPin, MessageCircle } from 'lucide-react'

const slides = [
  { icon: ShieldCheck, title: 'Signalez les Incidents', description: 'Signalez rapidement tout incident ou urgence en temps réel. Votre signalement est transmis directement au centre opérationnel de la PNC.', color: '#1E5EFF', bg: '#EBF0FF' },
  { icon: Bell, title: 'Recevez les Alertes', description: 'Recevez les alertes de sécurité officielles de la Police Nationale Congolaise : avis de recherche, alertes sécuritaires, et plus encore.', color: '#FF3B30', bg: '#FFF0EF' },
  { icon: MapPin, title: 'Localisez les Commissariats', description: 'Trouvez le commissariat le plus proche de votre position et obtenez l\'itinéraire GPS. Consultez les horaires et les coordonnées.', color: '#0B9D5A', bg: '#EDFFF5' },
  { icon: MessageCircle, title: 'Assistant IA PNC', description: 'Posez vos questions à l\'assistant virtuel. Obtenez des réponses sur les procédures administratives, le dépôt de plainte et les conseils de sécurité.', color: '#8B5CF6', bg: '#F3F0FF' },
]

export default function OnboardingScreen() {
  const { navigate } = useAppStore()
  const [current, setCurrent] = useState(0)
  const isLast = current === slides.length - 1
  const slide = slides[current]
  const Icon = slide.icon

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex justify-end p-4">
        <button onClick={() => navigate('login')} className="text-sm text-gray-400 hover:text-gray-600 px-3 py-1">Passer</button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-8">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center mb-8" style={{ backgroundColor: slide.bg }}>
          <Icon className="w-12 h-12" style={{ color: slide.color }} />
        </div>
        <h2 className="text-2xl font-bold text-[#0B2D6B] text-center mb-4">{slide.title}</h2>
        <p className="text-gray-500 text-center text-sm leading-relaxed max-w-[300px]">{slide.description}</p>
      </div>

      <div className="px-8 pb-10">
        <div className="flex justify-center gap-2 mb-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === current ? 'w-8 bg-[#1E5EFF]' : 'w-2 bg-gray-300'}`} />
          ))}
        </div>
        <button
          onClick={() => isLast ? navigate('login') : setCurrent(current + 1)}
          className="w-full py-4 bg-[#1E5EFF] text-white rounded-2xl font-semibold text-base active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25"
        >
          {isLast ? 'Commencer' : 'Suivant'}
        </button>
      </div>
    </div>
  )
}
