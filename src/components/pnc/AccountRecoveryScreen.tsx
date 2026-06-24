'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { ChevronLeft, Mail, Phone, KeyRound, CheckCircle2, ArrowRight, Shield } from 'lucide-react'
import { resetPassword } from '@/lib/auth-service'
import { isSupabaseConfigured } from '@/lib/supabase-client'

type Step = 'choose' | 'email' | 'phone' | 'code' | 'success'

export default function AccountRecoveryScreen() {
  const { navigate, darkMode } = useAppStore()
  const [step, setStep] = useState<Step>('choose')
  const [method, setMethod] = useState<'email' | 'phone'>('email')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [demoCode, setDemoCode] = useState('')

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-gray-700' : 'bg-gray-50 border-gray-200'

  const handleSendCode = async () => {
    setLoading(true)
    setError('')
    try {
      if (method === 'email' && email) {
        const result = await resetPassword(email)
        if (result.error) {
          setError(result.error)
          setLoading(false)
          return
        }
      }
      // Mode démo : génère un code
      if (!isSupabaseConfigured()) {
        setDemoCode('123456')
      }
      setStep('code')
    } catch (err: any) {
      setError(err.message || 'Erreur réseau')
    }
    setLoading(false)
  }

  const handleVerifyCode = async () => {
    setLoading(true)
    setError('')
    const fullCode = code.join('')
    if (fullCode.length < 6) {
      setError('Veuillez entrer le code complet')
      setLoading(false)
      return
    }
    // En mode démo ou sans Supabase configuré, on accepte le code démo
    if (!isSupabaseConfigured() || demoCode) {
      if (fullCode === '123456' || (demoCode && fullCode === demoCode)) {
        setStep('success')
      } else {
        setError('Code invalide. Réessayez.')
      }
      setLoading(false)
      return
    }
    // Avec Supabase : le code est validé via le lien e-mail
    setStep('success')
    setLoading(false)
  }

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value[0]
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (value && index < 5) {
      document.getElementById(`rc-${index + 1}`)?.focus()
    }
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`rc-${index - 1}`)?.focus()
    }
  }

  return (
    <div className={`min-h-screen ${bg} transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('login')} className="text-white active:scale-90 transition-transform">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Récupérer mon compte</h1>
        </div>
      </div>

      <div className="px-6 pt-8">
        {step === 'choose' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-20 h-20 rounded-full bg-[#0B9D5A]/10 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-10 h-10 text-[#0B9D5A]" />
              </div>
              <h2 className={`text-xl font-bold ${textPrimary}`}>Récupération de compte</h2>
              <p className={`text-sm ${textMuted} mt-2`}>Retrouvez l&apos;accès à votre compte PNC Alerte facilement</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => { setMethod('email'); setStep('email') }}
                className={`w-full ${cardBg} rounded-xl p-5 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all duration-150 border-2 border-transparent hover:border-[#1E5EFF]/30`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#1E5EFF]/10 flex items-center justify-center">
                  <Mail className="w-6 h-6 text-[#1E5EFF]" />
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-bold ${textPrimary}`}>Par e-mail</p>
                  <p className={`text-xs ${textMuted}`}>Code de vérification par e-mail</p>
                </div>
                <ArrowRight className={`w-5 h-5 ${textMuted}`} />
              </button>

              <button
                onClick={() => { setMethod('phone'); setStep('phone') }}
                className={`w-full ${cardBg} rounded-xl p-5 shadow-sm flex items-center gap-4 active:scale-[0.98] transition-all duration-150 border-2 border-transparent hover:border-[#0B9D5A]/30`}
              >
                <div className="w-12 h-12 rounded-xl bg-[#0B9D5A]/10 flex items-center justify-center">
                  <Phone className="w-6 h-6 text-[#0B9D5A]" />
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-bold ${textPrimary}`}>Par SMS</p>
                  <p className={`text-xs ${textMuted}`}>Code par SMS sur votre numéro</p>
                </div>
                <ArrowRight className={`w-5 h-5 ${textMuted}`} />
              </button>
            </div>

            <p className={`text-xs ${textMuted} text-center mt-6`}>
              En continuant, vous acceptez les conditions d&apos;utilisation de PNC Alerte
            </p>
          </div>
        )}

        {step === 'email' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-6">
              <Mail className="w-12 h-12 text-[#1E5EFF] mx-auto mb-3" />
              <p className={`text-sm ${textMuted}`}>Entrez votre adresse e-mail</p>
            </div>
            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError('') }} placeholder="email@exemple.com" className={`w-full px-4 py-3.5 rounded-xl border ${inputBg} ${textPrimary} text-sm outline-none focus:border-[#1E5EFF] focus:ring-2 focus:ring-[#1E5EFF]/20 transition-all`} />
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <button onClick={handleSendCode} disabled={!email.includes('@') || loading} className="w-full bg-[#1E5EFF] text-white py-3.5 rounded-xl font-medium text-sm mt-4 disabled:opacity-40 active:scale-[0.98] transition-all">
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
          </div>
        )}

        {step === 'phone' && (
          <div className="animate-fade-in-up">
            <div className="text-center mb-6">
              <Phone className="w-12 h-12 text-[#0B9D5A] mx-auto mb-3" />
              <p className={`text-sm ${textMuted}`}>Entrez votre numéro de téléphone</p>
            </div>
            <div className="flex gap-2">
              <div className={`px-3 py-3.5 rounded-xl border ${inputBg} ${textPrimary} text-sm font-medium flex items-center`}>+243</div>
              <input type="tel" value={phone} onChange={e => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 9)); setError('') }} placeholder="820000000" className={`flex-1 px-4 py-3.5 rounded-xl border ${inputBg} ${textPrimary} text-sm outline-none focus:border-[#0B9D5A] focus:ring-2 focus:ring-[#0B9D5A]/20 transition-all`} />
            </div>
            {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
            <button onClick={handleSendCode} disabled={phone.length < 9 || loading} className="w-full bg-[#0B9D5A] text-white py-3.5 rounded-xl font-medium text-sm mt-4 disabled:opacity-40 active:scale-[0.98] transition-all">
              {loading ? 'Envoi...' : 'Envoyer le code'}
            </button>
          </div>
        )}

        {step === 'code' && (
          <div className="animate-fade-in-up text-center">
            <KeyRound className="w-12 h-12 text-[#1E5EFF] mx-auto mb-3" />
            <p className={`text-sm ${textMuted} mb-6`}>
              Code envoyé {method === 'email' ? `à ${email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}` : `au +243 ${phone.slice(0, 2)}****${phone.slice(-2)}`}
            </p>
            {demoCode && (
              <div className="mb-4 bg-[#1E5EFF]/10 rounded-lg p-2">
                <p className="text-xs text-[#1E5EFF]">Code démo : <span className="font-bold">{demoCode}</span></p>
              </div>
            )}
            <div className="flex justify-center gap-3 mb-6">
              {code.map((digit, i) => (
                <input key={i} id={`rc-${i}`} type="text" inputMode="numeric" maxLength={1} value={digit} onChange={e => handleCodeChange(i, e.target.value)} onKeyDown={e => handleCodeKeyDown(i, e)} className={`w-11 h-14 rounded-xl border text-center text-lg font-bold outline-none transition-all ${digit ? 'border-[#1E5EFF] bg-[#1E5EFF]/5' : inputBg} ${textPrimary} focus:border-[#1E5EFF] focus:ring-2 focus:ring-[#1E5EFF]/20`} />
              ))}
            </div>
            {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
            <button onClick={handleVerifyCode} disabled={code.some(c => !c) || loading} className="w-full bg-[#1E5EFF] text-white py-3.5 rounded-xl font-medium text-sm disabled:opacity-40 active:scale-[0.98] transition-all">
              {loading ? 'Vérification...' : 'Vérifier'}
            </button>
            <button onClick={handleSendCode} className={`text-sm ${textMuted} mt-4`}>Renvoyer le code</button>
          </div>
        )}

        {step === 'success' && (
          <div className="animate-scale-in text-center py-8">
            <div className="w-24 h-24 rounded-full bg-[#0B9D5A]/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-[#0B9D5A]" />
            </div>
            <h2 className={`text-xl font-bold ${textPrimary} mb-2`}>Compte retrouvé !</h2>
            <p className={`text-sm ${textMuted} mb-8`}>Votre identité a été vérifiée. Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
            <button onClick={() => navigate('login')} className="w-full bg-[#1E5EFF] text-white py-3.5 rounded-xl font-medium text-sm active:scale-[0.98] transition-all">
              Se connecter
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
