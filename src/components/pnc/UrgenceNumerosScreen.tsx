'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Phone, Shield, Heart, Users, AlertTriangle } from 'lucide-react'

const emergencyNumbers = [
  {
    icon: Shield,
    name: 'Police',
    number: '117',
    description: 'Appelez immédiatement en cas de danger ou d\'infraction.',
    color: '#1E5EFF',
    bg: '#EBF0FF',
  },
  {
    icon: Heart,
    name: 'Ambulance / SAMU',
    number: '118',
    description: 'Appelez pour toute urgence médicale.',
    color: '#0B9D5A',
    bg: '#EDFFF5',
  },
  {
    icon: AlertTriangle,
    name: 'Pompiers',
    number: '119',
    description: 'Appelez en cas d\'incendie ou de catastrophe.',
    color: '#FF3B30',
    bg: '#FFF0EF',
  },
  {
    icon: Users,
    name: 'Assistance aux victimes',
    number: '+243 810 000 000',
    description: 'Contactez les services sociaux ou associations locales pour un accompagnement adapté.',
    color: '#8B5CF6',
    bg: '#F3F0FF',
  },
]

export default function UrgenceNumerosScreen() {
  const { goBack, darkMode } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const handleCall = (number: string) => {
    window.open(`tel:${number.replace(/\s/g, '')}`, '_self')
  }

  return (
    <div className={`min-h-screen ${bg} pb-8 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-6 px-6">
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Numéros d&apos;urgence</h1>
        </div>
        <p className="text-blue-200 text-xs mt-2">
          En cas d&apos;urgence, appelez immédiatement le service approprié.
        </p>
      </div>

      <div className="px-6 pt-4 space-y-3">
        {emergencyNumbers.map(({ icon: Icon, name, number, description, color, bg: numBg }) => (
          <div key={name} className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: numBg }}>
                <Icon className="w-6 h-6" style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`text-base font-bold ${textPrimary}`}>{name}</h3>
                <p className={`text-xs ${textMuted} mt-0.5`}>{description}</p>
                <button
                  onClick={() => handleCall(number)}
                  className="mt-3 flex items-center gap-2 px-4 py-2.5 rounded-xl text-white text-sm font-semibold active:scale-[0.98] transition-transform shadow-md"
                  style={{ backgroundColor: color }}
                >
                  <Phone className="w-4 h-4" />
                  {number}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 mt-6">
        <div className={`${cardBg} rounded-xl p-4 border-l-4 border-[#F59E0B] shadow-sm transition-colors`}>
          <p className={`text-sm font-semibold ${textPrimary}`}>Conseil important</p>
          <p className={`text-xs ${textMuted} mt-1 leading-relaxed`}>
            Gardez ces numéros accessibles en tout temps. En cas de danger immédiat, appelez le <strong className={textPrimary}>117</strong> (Police) en priorité. Restez calme et décrivez clairement la situation à l&apos;opérateur.
          </p>
        </div>
      </div>
    </div>
  )
}
