'use client'

import { useAppStore } from '@/lib/store'
import { createSignalement, uploadPhoto } from '@/lib/signalements-service'
import { ChevronLeft, Camera, Mic, MicOff, MapPin, EyeOff, Image, X, Share2, AlertCircle, Loader2 } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'

// Catégories alignées avec la contrainte SQL : type in ('vol', 'agression', 'violence', 'trafic', 'corruption', 'nuisance', 'autre')
const categories = [
  { id: 'vol', label: 'Vol', emoji: '💰' },
  { id: 'agression', label: 'Agression', emoji: '🔫' },
  { id: 'violence', label: 'Violence', emoji: '⚠️' },
  { id: 'trafic', label: 'Trafic', emoji: '🚗' },
  { id: 'corruption', label: 'Corruption', emoji: '🤝' },
  { id: 'nuisance', label: 'Nuisance publique', emoji: '📢' },
  { id: 'autre', label: 'Autre', emoji: '📝' },
]

export default function SignalementScreen() {
  const { navigate, darkMode, userLatitude, userLongitude, setLocation } = useAppStore()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [locating, setLocating] = useState(false)
  const [submittedRef, setSubmittedRef] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const cameraInputRef = useRef<HTMLInputElement>(null)
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

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

  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setAttachments((prev) => [...prev, ev.target?.result as string])
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setAttachments((prev) => [...prev, ev.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const handleVoiceRecord = async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
        const reader = new FileReader()
        reader.onload = (ev) => {
          setAttachments((prev) => [...prev, ev.target?.result as string])
        }
        reader.readAsDataURL(audioBlob)
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch {
      // Microphone access denied
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Signalement PNC Alerte',
          text: `Signalement: ${category}\n${description}`,
        })
      } catch {}
    }
  }

  const handleSubmit = async () => {
    if (!category || !description.trim()) {
      setError('Veuillez sélectionner une catégorie et décrire l\'incident')
      return
    }
    setError('')
    setSubmitting(true)

    try {
      // 1) Upload de la première photo si présente
      let photoUrl: string | undefined
      const firstPhoto = attachments.find(a => a.startsWith('data:image'))
      if (firstPhoto) {
        // Convertir le base64 en Blob
        const response = await fetch(firstPhoto)
        const blob = await response.blob()
        const { url, error: upErr } = await uploadPhoto(blob)
        if (!upErr && url) photoUrl = url
      }

      // 2) Créer le signalement
      const { signalement, error: createErr } = await createSignalement({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        type: category as any,
        description: description.trim(),
        location: userLatitude && userLongitude
          ? `Lat: ${userLatitude.toFixed(5)}, Lng: ${userLongitude.toFixed(5)}`
          : undefined,
        latitude: userLatitude || undefined,
        longitude: userLongitude || undefined,
        photoUrl,
        anonymous,
      })

      if (createErr || !signalement) {
        setError(createErr || 'Erreur lors de la création du signalement')
        setSubmitting(false)
        return
      }

      setSubmittedRef(signalement.reference)
      setSubmitted(true)
    } catch (e) {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  if (submitted) {
    return (
      <div className={`min-h-screen ${bg} flex flex-col items-center justify-center px-6 transition-colors`}>
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <span className="text-3xl text-green-600">✓</span>
        </div>
        <h2 className={`text-lg font-bold ${textPrimary} mb-2`}>Signalement envoyé !</h2>
        <p className={`text-sm ${textMuted} text-center mb-2`}>
          Référence : <span className="font-mono font-bold text-[#1E5EFF]">{submittedRef}</span>
        </p>
        <p className={`text-xs ${textMuted} text-center mb-6`}>
          Votre signalement a été transmis au centre opérationnel de la PNC.
        </p>
        <div className="flex gap-3 w-full">
          <button onClick={() => navigate('mes-alertes')} className="flex-1 py-3 bg-[#0B9D5A] text-white rounded-xl font-semibold text-sm">
            Voir le suivi
          </button>
          <button onClick={() => navigate('dashboard')} className="flex-1 py-3 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm">
            Accueil
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col pb-6 transition-colors`}>
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
        <div className={`${cardBg} rounded-xl p-4 flex items-center justify-between shadow-sm transition-colors`}>
          <div className="flex items-center gap-3">
            <EyeOff className="w-5 h-5 text-[#8B5CF6]" />
            <div>
              <p className={`text-sm font-medium ${textPrimary}`}>Signalement anonyme</p>
              <p className={`text-[10px] ${textMuted}`}>Masquer votre identité</p>
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
          <h3 className={`text-sm font-bold ${textPrimary} mb-3`}>Catégorie d&apos;incident</h3>
          <div className="grid grid-cols-2 gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl text-left flex items-center gap-2 transition-all ${
                  category === cat.id
                    ? 'bg-[#1E5EFF] text-white shadow-md shadow-blue-500/20'
                    : `${cardBg} ${textPrimary} shadow-sm`
                }`}
              >
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description with voice dictation */}
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Description</h3>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'incident en détail..."
            rows={4}
            className={`w-full px-4 py-3 ${cardBg} rounded-xl text-sm border border-gray-100 dark:border-gray-700 focus:border-[#1E5EFF] outline-none transition-all resize-none shadow-sm ${darkMode ? 'text-white' : ''}`}
          />
          <button
            onClick={handleVoiceRecord}
            className={`flex items-center gap-1.5 text-xs font-medium mt-2 px-3 py-1.5 rounded-lg transition-all ${
              isRecording ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'text-[#1E5EFF] bg-[#1E5EFF]/5'
            }`}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'Arrêter l\'enregistrement...' : 'Dicter avec la voix'}
          </button>
        </div>

        {/* Location */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-[#1E5EFF]" />
            <div className="flex-1">
              <p className={`text-sm font-medium ${textPrimary}`}>Position GPS</p>
              <p className={`text-xs ${textMuted}`}>
                {userLatitude
                  ? `${userLatitude.toFixed(4)}° S, ${userLongitude?.toFixed(4)}° E — Capturée`
                  : 'Acquisition de la position...'}
              </p>
            </div>
            <button onClick={getUserLocation} disabled={locating} className="text-[10px] text-[#1E5EFF] font-medium">
              {locating ? '...' : 'Rafraîchir'}
            </button>
          </div>
        </div>

        {/* Attachments */}
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Pièces jointes</h3>

          {/* Preview attachments */}
          {attachments.length > 0 && (
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              {attachments.map((att, idx) => (
                <div key={idx} className="relative flex-shrink-0">
                  <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                    {att.startsWith('data:audio') ? (
                      <div className="w-full h-full bg-[#8B5CF6]/10 flex items-center justify-center">
                        <Mic className="w-8 h-8 text-[#8B5CF6]" />
                      </div>
                    ) : (
                      <img src={att} alt="" className="w-full h-full object-cover" />
                    )}
                  </div>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3">
            <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleCameraCapture} className="hidden" />
            <input ref={galleryInputRef} type="file" accept="image/*,video/*" multiple onChange={handleGallerySelect} className="hidden" />
            <button
              onClick={() => cameraInputRef.current?.click()}
              className={`w-20 h-20 ${cardBg} rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform`}
            >
              <Camera className="w-6 h-6 text-[#1E5EFF]" />
              <span className={`text-[9px] ${textMuted}`}>Caméra</span>
            </button>
            <button
              onClick={() => galleryInputRef.current?.click()}
              className={`w-20 h-20 ${cardBg} rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform`}
            >
              <Image className="w-6 h-6 text-[#0B9D5A]" />
              <span className={`text-[9px] ${textMuted}`}>Galerie</span>
            </button>
            <button
              onClick={handleVoiceRecord}
              className={`w-20 h-20 ${cardBg} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform ${
                isRecording ? 'border-[#FF3B30]' : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {isRecording ? <MicOff className="w-6 h-6 text-[#FF3B30]" /> : <Mic className="w-6 h-6 text-[#8B5CF6]" />}
              <span className={`text-[9px] ${textMuted}`}>{isRecording ? 'Stop' : 'Audio'}</span>
            </button>
          </div>
          <p className={`text-[10px] ${textMuted} mt-1`}>Maximum 50 MB par signalement</p>
        </div>

        {/* Share button */}
        {category && description && (
          <button
            onClick={handleShare}
            className={`w-full ${cardBg} rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform`}
          >
            <Share2 className="w-4 h-4 text-[#1E5EFF]" />
            <span className={`text-sm font-medium ${textPrimary}`}>Partager le signalement</span>
          </button>
        )}

        {/* Submit */}
        {error && (
          <div className="bg-[#FF3B30]/10 rounded-xl p-3 border border-[#FF3B30]/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF3B30] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#FF3B30]">{error}</p>
          </div>
        )}
        <button
          onClick={handleSubmit}
          disabled={!category || !description.trim() || submitting}
          className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:shadow-none flex items-center justify-center gap-2"
        >
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {submitting ? 'Envoi en cours…' : 'Soumettre le signalement'}
        </button>
      </div>
    </div>
  )
}
