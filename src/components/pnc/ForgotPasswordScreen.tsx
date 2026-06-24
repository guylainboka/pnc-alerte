'use client'

import { useAppStore } from '@/lib/store'
import { resetPassword } from '@/lib/auth-service'
import { useState } from 'react'
import { ChevronLeft, AlertCircle, CheckCircle, Mail } from 'lucide-react'

export default function ForgotPasswordScreen() {
  const { navigate, darkMode } = useAppStore()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a] text-white' : 'bg-[#F5F6FA] border-transparent'

  const handleSubmit = async () => {
    setError('')
    if (!email.trim()) {
      setError('Veuillez saisir votre email')
      return
    }
    setLoading(true)
    const { error: err } = await resetPassword(email.trim())
    setLoading(false)
    if (err) {
      setError(err)
      return
    }
    setSuccess(true)
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('login')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Mot de passe oublié</h1>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        {success ? (
          <div className={`${cardBg} rounded-xl p-6 shadow-sm text-center`}>
            <div className="w-14 h-14 rounded-full bg-[#0B9D5A]/10 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-7 h-7 text-[#0B9D5A]" />
            </div>
            <h2 className={`text-base font-bold ${textPrimary} mb-2`}>Email envoyé !</h2>
            <p className={`text-sm ${textMuted} mb-6`}>
              Un lien de réinitialisation a été envoyé à <strong>{email}</strong>.
              Vérifiez votre boîte de réception et vos spams.
            </p>
            <button
              onClick={() => navigate('login')}
              className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform"
            >
              Retour à la connexion
            </button>
          </div>
        ) : (
          <>
            <p className={`text-sm ${textMuted} mb-6`}>
              Entrez votre email pour recevoir un lien de réinitialisation de mot de passe.
            </p>

            {error && (
              <div className="mb-4 bg-[#FF3B30]/10 rounded-xl p-3 border border-[#FF3B30]/20 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#FF3B30] mt-0.5 flex-shrink-0" />
                <p className="text-xs text-[#FF3B30]">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Email</label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@exemple.com"
                    className={`w-full pl-10 pr-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none`}
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-60"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                ) : (
                  'Envoyer le lien'
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
