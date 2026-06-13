'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Shield, MapPin, Clock, Share2, Eye } from 'lucide-react'

const alertDetail = {
  id: '1',
  title: 'Avis de recherche — Cambrioleur présumé',
  type: 'Recherche',
  severity: 'high',
  time: 'Il y a 2h',
  location: 'Kinshasa, Gombe',
  description: 'Un individu est activement recherché pour braquage à main armée commis le 10 juin 2026 dans la commune de la Gombe. L\'individu serait un homme d\'environ 30 ans, de taille moyenne, portant un veston noir. Toute information est à transmettre au commissariat le plus proche ou au 117.',
  reference: 'AR-2026-GOM-0042',
  source: 'Commissariat Central de la Gombe',
}

export default function AlerteDetailScreen() {
  const { navigate, darkMode } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const severityColors: Record<string, string> = {
    high: '#FF3B30',
    medium: '#F59E0B',
    low: '#1E5EFF',
  }

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
        {/* Main card */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm transition-colors`}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${severityColors[alertDetail.severity]}15` }}>
              <Shield className="w-5 h-5" style={{ color: severityColors[alertDetail.severity] }} />
            </div>
            <div className="flex-1">
              <h2 className={`text-base font-bold ${textPrimary}`}>{alertDetail.title}</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-yellow-100 text-yellow-700">{alertDetail.type}</span>
                <span className={`text-[10px] ${textMuted} flex items-center gap-1`}><Clock className="w-3 h-3" />{alertDetail.time}</span>
              </div>
            </div>
          </div>

          <div className={`border-t ${darkMode ? 'border-gray-700' : 'border-gray-50'} pt-3 mt-3 space-y-2`}>
            <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
              <MapPin className="w-3.5 h-3.5 text-[#1E5EFF]" />
              <span>{alertDetail.location}</span>
            </div>
            <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
              <Shield className="w-3.5 h-3.5 text-[#1E5EFF]" />
              <span>Source : {alertDetail.source}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={`${cardBg} rounded-xl p-5 shadow-sm transition-colors`}>
          <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Description</h3>
          <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>{alertDetail.description}</p>
          <p className={`text-[10px] ${textMuted} mt-3`}>Réf : {alertDetail.reference}</p>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <button onClick={() => navigate('signalement')} className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform`}>
            <Eye className="w-5 h-5 text-[#1E5EFF]" />
            <span className={`text-sm font-medium ${textPrimary}`}>Signaler une observation</span>
          </button>
          <button onClick={async () => {
            if (navigator.share) {
              try {
                await navigator.share({ title: `Alerte PNC: ${alertDetail.title}`, text: `${alertDetail.title}\n${alertDetail.description}\nRéf: ${alertDetail.reference}` })
              } catch {}
            }
          }} className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.99] transition-transform`}>
            <Share2 className="w-5 h-5 text-[#0B9D5A]" />
            <span className={`text-sm font-medium ${textPrimary}`}>Partager cette alerte</span>
          </button>
        </div>
      </div>
    </div>
  )
}
