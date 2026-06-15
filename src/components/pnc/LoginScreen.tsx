'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { Eye, EyeOff, Fingerprint, ShieldCheck, Camera, CreditCard, ImagePlus } from 'lucide-react'
import { nativeCamera } from '@/lib/native-services'
import { requestPermission } from '@/lib/permissions'
import { isNative } from '@/lib/capacitor'

export default function LoginScreen() {
  const { navigate, login, darkMode, setCarteElecteur } = useAppStore()
  const [mode, setMode] = useState<'login' | 'electeur'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [carteNumero, setCarteNumero] = useState('')
  const [carteImage, setCarteImage] = useState<string | null>(null)
  const [carteValidating, setCarteValidating] = useState(false)
  const [carteError, setCarteError] = useState('')

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      login('Jean Mukendi', email || 'jean.mukendi@email.com', '+243 812 345 678')
      setLoading(false)
    }, 1200)
  }

  // === PRISE DE PHOTO NATIVE ANDROID ===
  const takeCartePhoto = async () => {
    try {
      setCarteError('')

      // Demander la permission caméra d'abord
      const perm = await requestPermission('camera')
      if (!perm.granted) {
        setCarteError('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra dans les paramètres.')
        return
      }

      // Utiliser la caméra native Android
      const photo = await nativeCamera.scanDocument()
      if (typeof photo === 'object' && 'dataUrl' in photo) {
        setCarteImage(photo.dataUrl)
      } else {
        setCarteImage(photo as string)
      }
    } catch (err) {
      console.error('Erreur caméra:', err)
      setCarteError('Impossible d\'accéder à la caméra. Vérifiez les permissions.')
    }
  }

  // === CHOIX DEPUIS LA GALERIE ANDROID ===
  const pickCarteImage = async () => {
    try {
      setCarteError('')
      const image = await nativeCamera.pickImage()
      setCarteImage(image)
    } catch (err) {
      console.error('Erreur galerie:', err)
      setCarteError('Impossible d\'accéder à la galerie.')
    }
  }

  // === VALIDATION CARTE ÉLECTEUR ===
  const handleElecteurLogin = () => {
    if (!carteNumero.trim()) {
      setCarteError('Veuillez entrer le numéro de votre carte d\'électeur')
      return
    }
    if (!carteImage) {
      setCarteError('Veuillez photographier votre carte d\'électeur')
      return
    }

    setCarteValidating(true)

    // Validation de la carte d'électeur
    // En production : envoi au serveur pour vérification OCR
    setTimeout(() => {
      const isValid = carteNumero.length >= 10
      if (isValid) {
        setCarteValidating(false)
        setCarteElecteur(true, carteNumero)
        login('Jean Mukendi', 'jean.mukendi@email.com', '+243 812 345 678')
      } else {
        setCarteValidating(false)
        setCarteError('Carte d\'électeur non reconnue. Vérifiez le numéro et la clarté de l\'image.')
      }
    }, 2000)
  }

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-white'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-400'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a]' : 'bg-[#F5F6FA] border-transparent'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      {/* Header with background image */}
      <div className="bg-[#0B2D6B] pt-14 pb-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: 'url(/maquette.png)' }} />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0B2D6B]/60 to-[#0B2D6B]" />
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-[#1E5EFF]/30" />
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-white/20 shadow-lg">
            <img src="/logo.jpeg" alt="PNC" className="w-14 h-14 object-cover" />
          </div>
          <div>
            <h1 className="text-white text-2xl font-bold">PNC Alerte</h1>
            <p className="text-blue-200 text-xs">Police Nationale Congolaise</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-10">
        <div className={`${cardBg} rounded-2xl shadow-xl p-6 transition-colors`}>
          {/* Mode tabs */}
          <div className="flex rounded-xl bg-[#F5F6FA] dark:bg-[#0a1a3a] p-1 mb-5">
            <button
              onClick={() => { setMode('login'); setCarteError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-white dark:bg-[#0f2555] shadow-sm text-[#0B2D6B] dark:text-white'
                  : 'text-gray-500'
              }`}
            >
              Connexion
            </button>
            <button
              onClick={() => { setMode('electeur'); setCarteError('') }}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${
                mode === 'electeur'
                  ? 'bg-white dark:bg-[#0f2555] shadow-sm text-[#0B2D6B] dark:text-white'
                  : 'text-gray-500'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Carte d&apos;électeur
            </button>
          </div>

          {mode === 'login' ? (
            <>
              <h2 className={`text-lg font-bold ${textPrimary} mb-1`}>Connexion</h2>
              <p className={`text-sm ${textMuted} mb-6`}>Accédez à votre compte PNC Alerte</p>

              <div className="mb-4">
                <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Email ou Téléphone</label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm focus:border-[#1E5EFF] outline-none transition-all border ${darkMode ? 'text-white placeholder-gray-500' : ''}`}
                />
              </div>

              <div className="mb-4">
                <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm focus:border-[#1E5EFF] outline-none transition-all pr-12 border ${darkMode ? 'text-white placeholder-gray-500' : ''}`}
                  />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end mb-6">
                <button onClick={() => navigate('forgot-password')} className="text-xs text-[#1E5EFF] font-medium">
                  Mot de passe oublié ?
                </button>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : 'Se connecter'}
              </button>

              <button className="w-full mt-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 active:scale-[0.98] transition-transform">
                <Fingerprint className="w-5 h-5 text-[#1E5EFF]" /> Connexion biométrique
              </button>
            </>
          ) : (
            <>
              <h2 className={`text-lg font-bold ${textPrimary} mb-1`}>Carte d&apos;électeur congolais</h2>
              <p className={`text-sm ${textMuted} mb-5`}>
                Validez votre identité avec votre carte d&apos;électeur pour accéder à tous les services PNC.
              </p>

              {/* === PHOTO NATIVE ANDROID === */}
              <div className="mb-4">
                <label className={`text-xs font-medium ${textMuted} mb-2 block`}>
                  Photographiez votre carte d&apos;électeur
                </label>

                {carteImage ? (
                  <div className="relative">
                    <img src={carteImage} alt="Carte électeur" className="w-full h-40 object-cover rounded-xl border-2 border-[#1E5EFF]" />
                    <div className="absolute bottom-2 right-2 flex gap-1.5">
                      <button
                        onClick={takeCartePhoto}
                        className="w-8 h-8 bg-[#1E5EFF] rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                      >
                        <Camera className="w-4 h-4 text-white" />
                      </button>
                      <button
                        onClick={pickCarteImage}
                        className="w-8 h-8 bg-[#0B2D6B] rounded-lg flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                      >
                        <ImagePlus className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={takeCartePhoto}
                      className="flex-1 h-36 rounded-xl border-2 border-dashed border-[#1E5EFF]/40 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform bg-[#1E5EFF]/5"
                    >
                      <Camera className="w-8 h-8 text-[#1E5EFF]" />
                      <span className={`text-sm font-medium text-[#1E5EFF]`}>Prendre une photo</span>
                      <span className={`text-[10px] ${textMuted}`}>Caméra Android</span>
                    </button>
                    <button
                      onClick={pickCarteImage}
                      className="flex-1 h-36 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                    >
                      <ImagePlus className="w-8 h-8 text-gray-400" />
                      <span className={`text-sm ${textMuted}`}>Galerie</span>
                      <span className={`text-[10px] ${textMuted}`}>Choisir une image</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Carte numéro */}
              <div className="mb-4">
                <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>
                  Numéro de la carte d&apos;électeur
                </label>
                <input
                  type="text"
                  value={carteNumero}
                  onChange={(e) => { setCarteNumero(e.target.value); setCarteError('') }}
                  placeholder="Ex: CD-2023-KIN-XXXXXX"
                  className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm focus:border-[#1E5EFF] outline-none transition-all border font-mono tracking-wider ${darkMode ? 'text-white placeholder-gray-500' : ''}`}
                />
              </div>

              {/* Info box */}
              <div className="mb-4 bg-[#1E5EFF]/5 dark:bg-[#1E5EFF]/10 rounded-xl p-3 border border-[#1E5EFF]/10">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#1E5EFF] mt-0.5 flex-shrink-0" />
                  <p className={`text-[11px] ${textMuted} leading-relaxed`}>
                    La carte doit être <strong className={textPrimary}>claire et lisible</strong>. Les cartes floues, illisibles ou non valides seront automatiquement rejetées. Seules les cartes d&apos;électeur congolaises en cours de validité sont acceptées.
                  </p>
                </div>
              </div>

              {carteError && (
                <div className="mb-4 bg-[#FF3B30]/10 rounded-xl p-3 border border-[#FF3B30]/20">
                  <p className="text-xs text-[#FF3B30]">{carteError}</p>
                </div>
              )}

              <button
                onClick={handleElecteurLogin}
                disabled={carteValidating}
                className="w-full py-3.5 bg-[#0B9D5A] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-green-500/25 disabled:opacity-60"
              >
                {carteValidating ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Vérification en cours...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>Valider et se connecter</span>
                  </div>
                )}
              </button>
            </>
          )}
        </div>

        <div className="text-center mt-6 mb-8">
          <p className={`text-sm ${textMuted}`}>
            Pas de compte ?{' '}
            <button onClick={() => navigate('register')} className="text-[#1E5EFF] font-semibold">
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
