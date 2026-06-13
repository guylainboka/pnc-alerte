'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, MapPin, Shield, AlertTriangle, Car, Navigation, Crosshair } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

export default function CarteScreen() {
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
      () => {
        setLocating(false)
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [setLocation])

  useEffect(() => {
    if (!userLatitude) getUserLocation()
  }, [userLatitude, getUserLocation])

  const lat = userLatitude || -4.4419
  const lng = userLongitude || 15.2663
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m14!1m12!1m3!1d30000!2d${lng}!3d${lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sfr!2scd!4v1`

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const mapItems = [
    { icon: Shield, label: 'Commissariats', color: '#1E5EFF', count: 5 },
    { icon: AlertTriangle, label: 'Incidents', color: '#FF3B30', count: 12 },
    { icon: Car, label: 'Accidents', color: '#F59E0B', count: 3 },
    { icon: MapPin, label: 'Zones rouges', color: '#FF3B30', count: 4 },
    { icon: Navigation, label: 'Patrouilles', color: '#0B9D5A', count: 2 },
  ]

  return (
    <div className={`min-h-screen ${bg} flex flex-col pb-20 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Carte sécuritaire</h1>
        </div>
      </div>

      {/* Map area */}
      <div className="px-4 pt-4">
        <div className={`${cardBg} rounded-2xl overflow-hidden shadow-sm transition-colors`}>
          <div className="relative">
            <iframe
              src={mapUrl}
              width="100%"
              height="350"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            />
            {/* Locate me button */}
            <button
              onClick={getUserLocation}
              disabled={locating}
              className="absolute bottom-3 right-3 w-10 h-10 bg-[#1E5EFF] rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform z-10"
            >
              <Crosshair className={`w-5 h-5 text-white ${locating ? 'animate-spin' : ''}`} />
            </button>
          </div>
          {userLatitude && (
            <div className="p-3 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-xs ${textMuted}`}>
                Position: {userLatitude.toFixed(4)}, {userLongitude?.toFixed(4)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Map items */}
      <div className="px-6 pt-4 space-y-2">
        <h3 className={`text-sm font-bold ${textPrimary}`}>Points d&apos;intérêt</h3>
        {mapItems.map(({ icon: Icon, label, color, count }) => (
          <button key={label} onClick={() => label === 'Commissariats' ? navigate('commissariats') : undefined}
            className={`w-full ${cardBg} rounded-xl p-3 shadow-sm flex items-center gap-3 text-left active:scale-[0.99] transition-transform`}>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <span className={`text-sm ${textPrimary} font-medium flex-1`}>{label}</span>
            <span className={`text-xs ${textMuted}`}>{count} points</span>
          </button>
        ))}
      </div>
    </div>
  )
}
