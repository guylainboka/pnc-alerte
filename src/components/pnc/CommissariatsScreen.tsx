'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, MapPin, Phone, Clock, Star, Navigation } from 'lucide-react'

const commissariats = [
  { id: '1', name: 'Commissariat Central de la Gombe', address: '48 Ave des Aviateurs, Gombe', phone: '+243 812 000 111', distance: '1.2 km', rating: 4.2, reviews: 38, hours: '24h/24', open: true },
  { id: '2', name: 'Commissariat de Matonge', address: '15 Ave Kasa-Vubu, Barumbu', phone: '+243 812 000 222', distance: '2.8 km', rating: 3.8, reviews: 25, hours: '06:00 - 22:00', open: true },
  { id: '3', name: 'Commissariat de Kintambo', address: '8 Rue Kintambo, Kintambo', phone: '+243 812 000 333', distance: '3.5 km', rating: 4.5, reviews: 42, hours: '06:00 - 22:00', open: false },
  { id: '4', name: 'Commissariat de Ndjili', address: '22 Blvd Ndjili, Ndjili', phone: '+243 812 000 444', distance: '7.1 km', rating: 3.5, reviews: 18, hours: '06:00 - 20:00', open: true },
]

export default function CommissariatsScreen() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Commissariats</h1>
        </div>
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un commissariat..."
            className="w-full px-4 py-3 pl-10 bg-white/10 rounded-xl text-sm text-white placeholder-white/50 outline-none focus:bg-white/20"
          />
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
        </div>
      </div>

      {/* Map placeholder */}
      <div className="mx-6 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm">
        <div className="h-48 bg-[#EBF0FF] flex items-center justify-center relative">
          <div className="text-center">
            <MapPin className="w-10 h-10 text-[#1E5EFF] mx-auto mb-2" />
            <p className="text-sm text-[#0B2D6B] font-medium">Carte interactive</p>
            <p className="text-xs text-gray-400">Commissariats à proximité</p>
          </div>
          {/* Mock markers */}
          <div className="absolute top-8 left-12 w-4 h-4 rounded-full bg-[#1E5EFF] shadow-md animate-pulse" />
          <div className="absolute top-16 right-16 w-4 h-4 rounded-full bg-[#1E5EFF] shadow-md" />
          <div className="absolute bottom-12 left-1/3 w-4 h-4 rounded-full bg-[#FF3B30] shadow-md" />
        </div>
      </div>

      {/* List */}
      <div className="px-6 mt-4 space-y-3">
        <h3 className="text-sm font-bold text-[#0B2D6B]">Commissariats proches</h3>
        {commissariats.map((c) => (
          <div key={c.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#0B2D6B]">{c.name}</h4>
                <p className="text-xs text-gray-400 mt-1">{c.address}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.open ? 'Ouvert' : 'Fermé'}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {c.hours}
                  </span>
                </div>
              </div>
              <span className="text-xs text-[#1E5EFF] font-semibold">{c.distance}</span>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className="text-xs font-medium text-[#0B2D6B]">{c.rating}</span>
                <span className="text-[10px] text-gray-400">({c.reviews})</span>
              </div>
              <div className="flex-1" />
              <button className="w-8 h-8 rounded-lg bg-[#0B9D5A]/10 flex items-center justify-center">
                <Phone className="w-4 h-4 text-[#0B9D5A]" />
              </button>
              <button className="w-8 h-8 rounded-lg bg-[#1E5EFF]/10 flex items-center justify-center">
                <Navigation className="w-4 h-4 text-[#1E5EFF]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
