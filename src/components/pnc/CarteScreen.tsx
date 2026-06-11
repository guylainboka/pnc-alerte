'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, MapPin, Shield, AlertTriangle, Car, Navigation } from 'lucide-react'

export default function CarteScreen() {
  const { navigate } = useAppStore()

  const mapItems = [
    { icon: Shield, label: 'Commissariats', color: '#1E5EFF', count: 5 },
    { icon: AlertTriangle, label: 'Incidents', color: '#FF3B30', count: 12 },
    { icon: Car, label: 'Accidents', color: '#F59E0B', count: 3 },
    { icon: MapPin, label: 'Zones rouges', color: '#FF3B30', count: 4 },
    { icon: Navigation, label: 'Patrouilles', color: '#0B9D5A', count: 2 },
  ]

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col pb-20">
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Carte sécuritaire</h1>
        </div>
      </div>

      {/* Map area */}
      <div className="px-6 pt-4">
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
          <div className="h-80 bg-[#EBF0FF] relative">
            {/* Mock map grid */}
            <svg className="w-full h-full" viewBox="0 0 400 300">
              {/* Grid lines */}
              {Array.from({ length: 9 }, (_, i) => (
                <line key={`h${i}`} x1="0" y1={i * 37.5} x2="400" y2={i * 37.5} stroke="#C7D2E8" strokeWidth="0.5" />
              ))}
              {Array.from({ length: 11 }, (_, i) => (
                <line key={`v${i}`} x1={i * 40} y1="0" x2={i * 40} y2="300" stroke="#C7D2E8" strokeWidth="0.5" />
              ))}
              {/* Roads */}
              <line x1="50" y1="150" x2="350" y2="150" stroke="#A0B4D8" strokeWidth="3" />
              <line x1="200" y1="30" x2="200" y2="270" stroke="#A0B4D8" strokeWidth="3" />
              <line x1="80" y1="60" x2="320" y2="240" stroke="#A0B4D8" strokeWidth="2" />
              {/* Commissariat markers */}
              <circle cx="200" cy="100" r="8" fill="#1E5EFF" />
              <text x="200" y="104" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">P</text>
              <circle cx="120" cy="180" r="8" fill="#1E5EFF" />
              <text x="120" y="184" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">P</text>
              <circle cx="300" cy="200" r="8" fill="#1E5EFF" />
              <text x="300" y="204" fill="white" fontSize="8" textAnchor="middle" fontWeight="bold">P</text>
              {/* Incident markers */}
              <circle cx="160" cy="130" r="6" fill="#FF3B30" opacity="0.7" />
              <circle cx="250" cy="170" r="6" fill="#FF3B30" opacity="0.7" />
              <circle cx="100" cy="220" r="6" fill="#FF3B30" opacity="0.7" />
              {/* Zone rouge */}
              <circle cx="160" cy="130" r="35" fill="#FF3B30" opacity="0.08" stroke="#FF3B30" strokeWidth="1" strokeDasharray="4 2" />
              {/* Patrouille */}
              <circle cx="280" cy="140" r="6" fill="#0B9D5A" />
              <text x="280" y="144" fill="white" fontSize="6" textAnchor="middle" fontWeight="bold">T</text>
            </svg>

            {/* Legend */}
            <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-[9px]">
              <div className="flex items-center gap-1 mb-1"><span className="w-2 h-2 rounded-full bg-[#1E5EFF]" /> Commissariat</div>
              <div className="flex items-center gap-1 mb-1"><span className="w-2 h-2 rounded-full bg-[#FF3B30]" /> Incident</div>
              <div className="flex items-center gap-1 mb-1"><span className="w-2 h-2 rounded-full bg-[#0B9D5A]" /> Patrouille</div>
              <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border border-[#FF3B30] bg-[#FF3B30]/10" /> Zone rouge</div>
            </div>
          </div>
        </div>
      </div>

      {/* Map items */}
      <div className="px-6 pt-4 space-y-2">
        <h3 className="text-sm font-bold text-[#0B2D6B]">Points d&apos;intérêt</h3>
        {mapItems.map(({ icon: Icon, label, color, count }) => (
          <div key={label} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <span className="text-sm text-[#0B2D6B] font-medium flex-1">{label}</span>
            <span className="text-xs text-gray-400">{count} points</span>
          </div>
        ))}
      </div>
    </div>
  )
}
