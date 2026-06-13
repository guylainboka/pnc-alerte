'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, MapPin, Phone, Clock, Star, Navigation, Crosshair } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

const commissariats = [
  { id: '1', name: 'Commissariat Central de la Gombe', address: '48 Ave des Aviateurs, Gombe', phone: '+243812000111', distance: '1.2 km', rating: 4.2, reviews: 38, hours: '24h/24', open: true, lat: -4.3220, lng: 15.3136 },
  { id: '2', name: 'Commissariat de Matonge', address: '15 Ave Kasa-Vubu, Barumbu', phone: '+243812000222', distance: '2.8 km', rating: 3.8, reviews: 25, hours: '06:00 - 22:00', open: true, lat: -4.3310, lng: 15.3170 },
  { id: '3', name: 'Commissariat de Kintambo', address: '8 Rue Kintambo, Kintambo', phone: '+243812000333', distance: '3.5 km', rating: 4.5, reviews: 42, hours: '06:00 - 22:00', open: false, lat: -4.3380, lng: 15.2990 },
  { id: '4', name: 'Commissariat de Ndjili', address: '22 Blvd Ndjili, Ndjili', phone: '+243812000444', distance: '7.1 km', rating: 3.5, reviews: 18, hours: '06:00 - 20:00', open: true, lat: -4.3650, lng: 15.3530 },
]

export default function CommissariatsScreen() {
  const { navigate, darkMode, userLatitude, userLongitude, setLocation } = useAppStore()
  const [locating, setLocating] = useState(false)

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude)
        setLocating(false)
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [setLocation])

  useEffect(() => {
    if (!userLatitude) getUserLocation()
  }, [userLatitude, getUserLocation])

  const lat = userLatitude || -4.4419
  const lng = userLongitude || 15.2663
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d25000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2scd!4v1`

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleNavigate = (cLat: number, cLng: number, name: string) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${cLat},${cLng}&travelmode=driving`
    window.open(url, '_blank')
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
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

      {/* Real Google Map */}
      <div className="mx-4 mt-4 bg-white rounded-2xl overflow-hidden shadow-sm relative">
        <iframe
          src={mapUrl}
          width="100%"
          height="200"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
        <button
          onClick={getUserLocation}
          disabled={locating}
          className="absolute bottom-3 right-3 w-9 h-9 bg-[#1E5EFF] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-10"
        >
          <Crosshair className={`w-4 h-4 text-white ${locating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* List */}
      <div className="px-6 mt-4 space-y-3">
        <h3 className={`text-sm font-bold ${textPrimary}`}>Commissariats proches</h3>
        {commissariats.map((c) => (
          <div key={c.id} className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-semibold ${textPrimary}`}>{c.name}</h4>
                <p className={`text-xs ${textMuted} mt-1`}>{c.address}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${c.open ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.open ? 'Ouvert' : 'Fermé'}
                  </span>
                  <span className={`text-[10px] ${textMuted} flex items-center gap-1`}>
                    <Clock className="w-3 h-3" /> {c.hours}
                  </span>
                </div>
              </div>
              <span className="text-xs text-[#1E5EFF] font-semibold">{c.distance}</span>
            </div>

            <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                <span className={`text-xs font-medium ${textPrimary}`}>{c.rating}</span>
                <span className={`text-[10px] ${textMuted}`}>({c.reviews})</span>
              </div>
              <div className="flex-1" />
              <button onClick={() => handleCall(c.phone)} className="w-8 h-8 rounded-lg bg-[#0B9D5A]/10 flex items-center justify-center active:scale-95 transition-transform">
                <Phone className="w-4 h-4 text-[#0B9D5A]" />
              </button>
              <button onClick={() => handleNavigate(c.lat, c.lng, c.name)} className="w-8 h-8 rounded-lg bg-[#1E5EFF]/10 flex items-center justify-center active:scale-95 transition-transform">
                <Navigation className="w-4 h-4 text-[#1E5EFF]" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
