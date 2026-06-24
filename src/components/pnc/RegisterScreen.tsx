'use client'

import { useAppStore } from '@/lib/store'
import { signUp } from '@/lib/auth-service'
import { useState, useRef } from 'react'
import { Eye, EyeOff, ChevronLeft, Check, ShieldCheck, Camera, CreditCard, AlertCircle } from 'lucide-react'

const provinces = [
  'Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu', 'Mai-Ndombe',
  'Kasai', 'Kasai-Central', 'Kasai-Oriental', 'Lomami', 'Sankuru',
  'Maniema', 'Sud-Kivu', 'Nord-Kivu', 'Ituri', 'Haut-Uele',
  'Tshopo', 'Equateur', 'Mongala', 'Nord-Ubangi', 'Sud-Ubangi',
  'Tanganyika', 'Haut-Lomami', 'Lualaba', 'Haut-Katanga',
]
const communes: Record<string, string[]> = {
  Kinshasa: ['Gombe', 'Barumbu', 'Bandundu', 'Bandalungwa', 'Kintambo', 'Lingwala', 'Makala', 'Masina', 'Matete', 'Mont-Ngafula', 'Ndjili', 'Ngaliema', 'Nsele', 'Selembao'],
}

export default function RegisterScreen() {
  const { navigate, darkMode } = useAppStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    name: '', phone: '', email: '', province: 'Kinshasa', commune: 'Gombe',
    password: '', confirmPassword: '', acceptTerms: false,
    carteElecteurNumero: '', carteElecteurImage: null as string | null,
  })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [carteError, setCarteError] = useState('')
  const [globalError, setGlobalError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateForm = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleCarteImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setCarteError('')
      const reader = new FileReader()
      reader.onload = (ev) => {
        setForm((prev) => ({ ...prev, carteElecteurImage: ev.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRegister = async () => {
    setGlobalError('')
    // Validations finales
    if (!form.acceptTerms) {
      setGlobalError("Vous devez accepter les conditions d'utilisation pour continuer")
      return
    }
    if (form.password.length < 6) {
      setGlobalError('Le mot de passe doit contenir au moins 6 caractères')
      return
    }
    if (form.password !== form.confirmPassword) {
      setGlobalError('Les mots de passe ne correspondent pas')
      return
    }
    if (!form.email.trim() || !form.name.trim() || !form.phone.trim()) {
      setGlobalError('Tous les champs personnels sont obligatoires')
      return
    }
    if (!form.carteElecteurNumero.trim()) {
      setCarteError("Le numéro de carte d'électeur est obligatoire")
      setStep(3)
      return
    }

    setLoading(true)
    const { user, error } = await signUp({
      email: form.email.trim(),
      password: form.password,
      fullName: form.name.trim(),
      phone: form.phone.trim(),
      carteElecteurNumero: form.carteElecteurNumero.trim(),
      province: form.province,
      commune: form.commune,
    })
    setLoading(false)

    if (error) {
      setGlobalError(error)
      return
    }
    if (user) {
      navigate('dashboard')
    }
  }

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a]' : 'bg-[#F5F6FA] border-transparent'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-6 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('login')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold">Créer un compte</h1>
            <p className="text-blue-200 text-xs">Étape {step} sur 4</p>
          </div>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className={`h-1 rounded-full flex-1 transition-colors ${s <= step ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {globalError && (
          <div className="mb-4 bg-[#FF3B30]/10 rounded-xl p-3 border border-[#FF3B30]/20 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-[#FF3B30] mt-0.5 flex-shrink-0" />
            <p className="text-xs text-[#FF3B30]">{globalError}</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h3 className={`text-base font-bold ${textPrimary} mb-2`}>Informations personnelles</h3>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Nom complet</label>
              <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Ex: Jean Mukendi"
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] focus:bg-white outline-none ${darkMode ? 'text-white' : ''}`} />
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Numéro de téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+243 812 000 000"
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] focus:bg-white outline-none ${darkMode ? 'text-white' : ''}`} />
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Email</label>
              <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="email@exemple.com"
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] focus:bg-white outline-none ${darkMode ? 'text-white' : ''}`} />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className={`text-base font-bold ${textPrimary} mb-2`}>Localisation</h3>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Province</label>
              <select value={form.province} onChange={(e) => updateForm('province', e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none ${darkMode ? 'text-white' : ''}`}>
                {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Commune</label>
              <select value={form.commune} onChange={(e) => updateForm('commune', e.target.value)}
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none ${darkMode ? 'text-white' : ''}`}>
                {(communes[form.province] || ['Centre-Ville']).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className={`text-base font-bold ${textPrimary} mb-2`}>Carte d&apos;électeur congolais</h3>
            <p className={`text-xs ${textMuted}`}>
              Votre carte d&apos;électeur est obligatoire pour valider votre inscription. Elle doit être claire et lisible.
            </p>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-2 block`}>Photographiez votre carte</label>
              <input ref={fileInputRef} type="file" accept="image/*" capture="environment" onChange={handleCarteImageChange} className="hidden" />
              {form.carteElecteurImage ? (
                <div className="relative">
                  <img src={form.carteElecteurImage} alt="Carte électeur" className="w-full h-40 object-cover rounded-xl border-2 border-[#0B9D5A]" />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute bottom-2 right-2 w-8 h-8 bg-[#0B9D5A] rounded-lg flex items-center justify-center shadow-lg"
                  >
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-2 active:scale-[0.98] transition-transform"
                >
                  <CreditCard className="w-8 h-8 text-gray-400" />
                  <span className={`text-sm ${textMuted}`}>Prendre une photo</span>
                  <span className={`text-[10px] ${textMuted}`}>La carte doit être claire et lisible</span>
                </button>
              )}
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Numéro de la carte d&apos;électeur</label>
              <input
                type="text"
                value={form.carteElecteurNumero}
                onChange={(e) => { updateForm('carteElecteurNumero', e.target.value); setCarteError('') }}
                placeholder="Ex: CD-2023-KIN-XXXXXX"
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none font-mono tracking-wider ${darkMode ? 'text-white' : ''}`}
              />
            </div>
            <div className="bg-[#0B9D5A]/5 dark:bg-[#0B9D5A]/10 rounded-xl p-3 border border-[#0B9D5A]/10">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-[#0B9D5A] mt-0.5 flex-shrink-0" />
                <p className={`text-[11px] ${textMuted} leading-relaxed`}>
                  Seules les <strong className={textPrimary}>cartes d&apos;électeur congolaises en cours de validité</strong> sont acceptées. Les cartes floues ou illisibles seront rejetées.
                </p>
              </div>
            </div>
            {carteError && (
              <div className="bg-[#FF3B30]/10 rounded-xl p-3 border border-[#FF3B30]/20">
                <p className="text-xs text-[#FF3B30]">{carteError}</p>
              </div>
            )}
          </div>
        )}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className={`text-base font-bold ${textPrimary} mb-2`}>Sécurité</h3>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateForm('password', e.target.value)}
                  placeholder="Minimum 6 caractères" className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none pr-12 ${darkMode ? 'text-white' : ''}`} />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Confirmer le mot de passe</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)}
                placeholder="Confirmez votre mot de passe" className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none ${darkMode ? 'text-white' : ''}`} />
            </div>
            <div className="flex items-start gap-3 mt-2">
              <button onClick={() => updateForm('acceptTerms', !form.acceptTerms)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${form.acceptTerms ? 'bg-[#1E5EFF] border-[#1E5EFF]' : 'border-gray-300'}`}>
                {form.acceptTerms && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className={`text-xs ${textMuted} leading-relaxed`}>
                J&apos;accepte les <span className="text-[#1E5EFF] font-medium">conditions d&apos;utilisation</span> et la{' '}
                <span className="text-[#1E5EFF] font-medium">politique de confidentialité</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 pt-4">
        <button onClick={() => {
          setGlobalError('')
          if (step === 3 && (!form.carteElecteurNumero.trim())) {
            setCarteError("Veuillez fournir le numéro de votre carte d'électeur")
            return
          }
          if (step < 4) setStep(step + 1)
          else handleRegister()
        }} disabled={loading || (step === 4 && !form.acceptTerms)}
          className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-60 disabled:cursor-not-allowed">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : step < 4 ? 'Continuer' : 'Créer mon compte'}
        </button>
        {step === 4 && !form.acceptTerms && (
          <p className="text-center mt-3 text-[10px] text-[#F59E0B]">
            Veuillez accepter les conditions pour activer le bouton
          </p>
        )}
        <p className={`text-center mt-4 text-sm ${textMuted}`}>
          Déjà inscrit ? <button onClick={() => navigate('login')} className="text-[#1E5EFF] font-semibold">Se connecter</button>
        </p>
      </div>
    </div>
  )
}
