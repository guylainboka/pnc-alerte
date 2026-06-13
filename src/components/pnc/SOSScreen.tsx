'use client'

import { useAppStore } from '@/lib/store'
import { Phone, MapPin, Clock, User, ChevronLeft, Share2, Navigation } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

export default function SOSScreen() {
  const { navigate, userName, setLocation, userLatitude, userLongitude } = useAppStore()
  const [activated, setActivated] = useState(false)
  const [sending, setSending] = useState(false)

  const getUserLocation = useCallback(() => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation(pos.coords.latitude, pos.coords.longitude)
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [setLocation])

  useEffect(() => {
    getUserLocation()
  }, [getUserLocation])

  const handleSOS = () => {
    if (activated) return
    getUserLocation()
    setSending(true)
    setTimeout(() => {
      setSending(false)
      setActivated(true)
    }, 2000)
  }

  const handleCall = (number: string) => {
    window.open(`tel:${number}`, '_self')
  }

  const handleShareLocation = async () => {
    const lat = userLatitude || -4.4419
    const lng = userLongitude || 15.2663
    const text = `🚨 URGENCE — ${userName} a déclenché une alerte SOS.\nPosition GPS: https://www.google.com/maps?q=${lat},${lng}\nHeure: ${new Date().toLocaleTimeString('fr-FR')}`
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Alerte SOS PNC', text })
      } catch {}
    } else {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
      }
    }
  }

  const emergencyNumbers = [
    { name: 'Police', number: '117', color: '#1E5EFF' },
    { name: 'SAMU', number: '118', color: '#0B9D5A' },
    { name: 'Pompiers', number: '119', color: '#FF3B30' },
  ]

  return (
    <div className="min-h-screen bg-[#0B2D6B] flex flex-col relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#FF3B30]/10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[350px] h-[350px] rounded-full bg-[#FF3B30]/10" />
      </div>

      {/* Header */}
      <div className="relative z-10 px-6 pt-12 pb-4 flex items-center gap-3">
        <button onClick={() => navigate('dashboard')} className="text-white">
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h1 className="text-white text-lg font-bold">SOS Urgence</h1>
      </div>

      <div className="flex-1 relative z-10 flex flex-col items-center justify-center px-6">
        {!activated ? (
          <>
            {/* SOS Button */}
            <button onClick={handleSOS} disabled={sending} className="relative group">
              <div className={`w-48 h-48 rounded-full flex items-center justify-center transition-all ${
                sending ? 'bg-[#FF3B30]/60' : 'bg-[#FF3B30] shadow-2xl shadow-red-500/50 active:scale-95'
              }`}>
                {sending ? (
                  <div className="w-10 h-10 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span className="text-white text-4xl font-black tracking-wider">SOS</span>
                )}
              </div>
              {/* Pulse rings */}
              {!sending && (
                <>
                  <div className="absolute inset-0 w-48 h-48 rounded-full bg-[#FF3B30]/20 animate-ping" style={{ animationDuration: '2s' }} />
                  <div className="absolute -inset-4 w-56 h-56 rounded-full bg-[#FF3B30]/10 animate-ping" style={{ animationDuration: '3s' }} />
                </>
              )}
            </button>

            <p className="text-white/80 text-sm mt-8 text-center">
              Appuyez sur le bouton pour envoyer une alerte d&apos;urgence
            </p>

            <div className="mt-6 flex items-center gap-4 text-white/60 text-xs">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4" />
                <span>{userLatitude ? `GPS: ${userLatitude.toFixed(4)}, ${userLongitude?.toFixed(4)}` : 'GPS activation...'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                <span>{userName || 'Identifié'}</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Activated state */}
            <div className="w-32 h-32 rounded-full bg-green-500/20 flex items-center justify-center mb-6">
              <div className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center">
                <span className="text-white text-2xl font-bold">✓</span>
              </div>
            </div>

            <h2 className="text-white text-xl font-bold mb-2">Alerte envoyée !</h2>
            <p className="text-white/70 text-sm text-center max-w-[280px] mb-6">
              Votre position et vos informations ont été transmises au centre opérationnel de la PNC. L&apos;aide est en route.
            </p>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 w-full mb-4">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-4 h-4 text-[#5b8cff]" />
                <span className="text-white/80 text-xs">
                  Position GPS: {userLatitude?.toFixed(4) || '-4.4419'}, {userLongitude?.toFixed(4) || '15.2663'}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <Clock className="w-4 h-4 text-[#5b8cff]" />
                <span className="text-white/80 text-xs">Heure : {new Date().toLocaleTimeString('fr-FR')}</span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <User className="w-4 h-4 text-[#5b8cff]" />
                <span className="text-white/80 text-xs">Identité : {userName}</span>
              </div>
              <div className="flex items-center gap-3">
                <Navigation className="w-4 h-4 text-[#5b8cff]" />
                <span className="text-white/80 text-xs">
                  <a
                    href={`https://www.google.com/maps?q=${userLatitude || -4.4419},${userLongitude || 15.2663}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Voir sur Google Maps
                  </a>
                </span>
              </div>
            </div>

            {/* Share location button */}
            <button
              onClick={handleShareLocation}
              className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center gap-3 mb-4 active:scale-[0.98] transition-transform"
            >
              <Share2 className="w-5 h-5 text-white" />
              <span className="text-white font-medium text-sm">Partager ma position</span>
            </button>

            {/* Emergency numbers with real calls */}
            <div className="w-full space-y-3">
              <p className="text-white/60 text-xs font-medium">Appeler directement :</p>
              {emergencyNumbers.map((num) => (
                <button
                  key={num.name}
                  onClick={() => handleCall(num.number)}
                  className="w-full bg-white/10 backdrop-blur-sm rounded-xl p-4 flex items-center justify-between active:scale-[0.98] transition-transform"
                >
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5" style={{ color: num.color }} />
                    <span className="text-white font-medium text-sm">{num.name}</span>
                  </div>
                  <span className="text-white font-bold text-lg">{num.number}</span>
                </button>
              ))}
            </div>

            <button
              onClick={() => setActivated(false)}
              className="mt-6 text-white/50 text-xs underline"
            >
              Annuler l&apos;alerte
            </button>
          </>
        )}
      </div>
    </div>
  )
}
