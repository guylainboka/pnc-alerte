'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Camera, Mic, MicOff, MapPin, EyeOff, Image as ImageIcon, X, Share2 } from 'lucide-react'
import { useState, useEffect, useCallback, useRef } from 'react'
import { nativeCamera, nativeGeolocation, nativeShare } from '@/lib/native-services'
import { requestPermission } from '@/lib/permissions'

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
  const { navigate, darkMode, userLatitude, userLongitude, setLocation, addUserAlert, goBack } = useAppStore()
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [anonymous, setAnonymous] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [attachments, setAttachments] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState(false)
  const [locating, setLocating] = useState(false)
  const [submittedRef, setSubmittedRef] = useState('')

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  // === GÉOLOCALISATION RÉELLE ANDROID ===
  const getUserLocation = useCallback(async () => {
    setLocating(true)
    try {
      await requestPermission('location')
      const pos = await nativeGeolocation.getCurrentPosition()
      setLocation(pos.coords.latitude, pos.coords.longitude)
    } catch (err) {
      console.error('Erreur géolocalisation:', err)
    }
    setLocating(false)
  }, [setLocation])

  useEffect(() => {
    if (!userLatitude) getUserLocation()
  }, [userLatitude, getUserLocation])

  // === CAMÉRA NATIVE ANDROID ===
  const takePhoto = async () => {
    try {
      const perm = await requestPermission('camera')
      if (!perm.granted) {
        alert('Permission caméra refusée. Activez-la dans les paramètres Android.')
        return
      }
      const photo = await nativeCamera.takePhoto('medium')
      setAttachments((prev) => [...prev, photo])
    } catch (err) {
      console.error('Erreur caméra:', err)
    }
  }

  // === GALERIE NATIVE ANDROID ===
  const pickFromGallery = async () => {
    try {
      const image = await nativeCamera.pickImage()
      setAttachments((prev) => [...prev, image])
    } catch (err) {
      console.error('Erreur galerie:', err)
    }
  }

  // === ENREGISTREMENT VOCAL ===
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

  // === PARTAGE NATIF ANDROID ===
  const handleShare = async () => {
    try {
      await nativeShare.share({
        title: 'Signalement PNC Alerte',
        text: `Signalement: ${categories.find(c => c.id === category)?.label}\n${description}\n\nEnvoyé via PNC Alerte`,
        dialogTitle: 'Partager le signalement',
      })
    } catch {
      // Partage annulé
    }
  }

  const handleSubmit = () => {
    const ref = `SIG-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setSubmittedRef(ref)
    addUserAlert({
      id: `UA-${Date.now()}`,
      type: 'signalement',
      title: `${categories.find((c) => c.id === category)?.label || 'Signalement'} — ${userLatitude ? 'Position GPS capturée' : 'Kinshasa'}`,
      status: 'en-attente',
      reference: ref,
      date: new Date().toISOString().split('T')[0],
      description,
      updates: [
        {
          date: new Date().toISOString(),
          status: 'Reçu',
          message: 'Signalement enregistré par le centre opérationnel',
        },
      ],
    })
    setSubmitted(true)
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
          <button onClick={() => navigate('mes-alertes')} className="flex-1 py-3 bg-[#0B9D5A] text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform">
            Voir le suivi
          </button>
          <button onClick={() => navigate('dashboard')} className="flex-1 py-3 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-95 transition-transform">
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
          <button onClick={goBack} className="text-white active:scale-90 transition-transform">
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
          <button onClick={() => setAnonymous(!anonymous)}
            className={`w-11 h-6 rounded-full transition-colors ${anonymous ? 'bg-[#8B5CF6]' : 'bg-gray-200'} relative`}>
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
              <button key={cat.id} onClick={() => setCategory(cat.id)}
                className={`p-3 rounded-xl text-left flex items-center gap-2 transition-all active:scale-95 ${
                  category === cat.id
                    ? 'bg-[#1E5EFF] text-white shadow-md shadow-blue-500/20'
                    : `${cardBg} ${textPrimary} shadow-sm`
                }`}>
                <span className="text-lg">{cat.emoji}</span>
                <span className="text-xs font-medium">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Description with voice dictation */}
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Description</h3>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Décrivez l'incident en détail..." rows={4}
            className={`w-full px-4 py-3 ${cardBg} rounded-xl text-sm border border-gray-100 dark:border-gray-700 focus:border-[#1E5EFF] outline-none transition-all resize-none shadow-sm ${darkMode ? 'text-white' : ''}`} />
          <button onClick={handleVoiceRecord}
            className={`flex items-center gap-1.5 text-xs font-medium mt-2 px-3 py-1.5 rounded-lg transition-all active:scale-95 ${
              isRecording ? 'bg-[#FF3B30]/10 text-[#FF3B30]' : 'text-[#1E5EFF] bg-[#1E5EFF]/5'}`}>
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            {isRecording ? 'Arrêter l\'enregistrement...' : 'Dicter avec la voix'}
          </button>
        </div>

        {/* Location - GPS ANDROID RÉEL */}
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
            <button onClick={getUserLocation} disabled={locating} className="text-[10px] text-[#1E5EFF] font-medium active:scale-95 transition-transform">
              {locating ? '...' : 'Rafraîchir'}
            </button>
          </div>
        </div>

        {/* Pièces jointes - UPLOADS NATIFS ANDROID */}
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Pièces jointes</h3>

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
                  <button onClick={() => removeAttachment(idx)}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center active:scale-90 transition-transform">
                    <X className="w-3 h-3 text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Boutons natifs Android */}
          <div className="flex gap-3">
            <button onClick={takePhoto}
              className={`w-20 h-20 ${cardBg} rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform`}>
              <Camera className="w-6 h-6 text-[#1E5EFF]" />
              <span className={`text-[9px] ${textMuted}`}>Caméra</span>
            </button>
            <button onClick={pickFromGallery}
              className={`w-20 h-20 ${cardBg} rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform`}>
              <ImageIcon className="w-6 h-6 text-[#0B9D5A]" />
              <span className={`text-[9px] ${textMuted}`}>Galerie</span>
            </button>
            <button onClick={handleVoiceRecord}
              className={`w-20 h-20 ${cardBg} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 shadow-sm active:scale-95 transition-transform ${
                isRecording ? 'border-[#FF3B30]' : 'border-gray-200 dark:border-gray-700'}`}>
              {isRecording ? <MicOff className="w-6 h-6 text-[#FF3B30]" /> : <Mic className="w-6 h-6 text-[#8B5CF6]" />}
              <span className={`text-[9px] ${textMuted}`}>{isRecording ? 'Stop' : 'Audio'}</span>
            </button>
          </div>
          <p className={`text-[10px] ${textMuted} mt-1`}>Maximum 50 MB par signalement</p>
        </div>

        {/* Partage natif Android */}
        {category && description && (
          <button onClick={handleShare}
            className={`w-full ${cardBg} rounded-xl p-3 flex items-center justify-center gap-2 shadow-sm active:scale-[0.98] transition-transform`}>
            <Share2 className="w-4 h-4 text-[#1E5EFF]" />
            <span className={`text-sm font-medium ${textPrimary}`}>Partager le signalement</span>
          </button>
        )}

        {/* Submit */}
        <button onClick={handleSubmit} disabled={!category || !description}
          className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-40 disabled:shadow-none">
          Soumettre le signalement
        </button>
      </div>
    </div>
  )
}
