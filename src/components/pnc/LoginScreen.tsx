'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { Eye, EyeOff, Fingerprint, ShieldCheck } from 'lucide-react'

export default function LoginScreen() {
  const { navigate, login, darkMode } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    setLoading(true)
    setTimeout(() => {
      login('Jean Mukendi', email || 'jean.mukendi@email.com', '+243 812 345 678')
      setLoading(false)
    }, 1200)
  }

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-white'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-400'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a]' : 'bg-[#F5F6FA] border-transparent'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <div className="bg-[#0B2D6B] pt-14 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-[#1E5EFF]/30" />
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 rounded-full bg-white/5" />
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden">
            <img src="/logo.jpeg" alt="PNC" className="w-12 h-12 object-cover" />
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">PNC Alerte</h1>
            <p className="text-blue-200 text-xs">Police Nationale Congolaise</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-6 -mt-8">
        <div className={`${cardBg} rounded-2xl shadow-xl p-6 transition-colors`}>
          <h2 className={`text-lg font-bold ${textPrimary} mb-1`}>Connexion</h2>
          <p className={`text-sm ${textMuted} mb-6`}>Accédez à votre compte PNC Alerte</p>

          <div className="mb-4">
            <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Email ou Téléphone</label>
            <input type="text" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm focus:border-[#1E5EFF] outline-none transition-all ${darkMode ? 'text-white placeholder-gray-500' : ''}`}
            />
          </div>

          <div className="mb-4">
            <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Mot de passe</label>
            <div className="relative">
              <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm focus:border-[#1E5EFF] outline-none transition-all pr-12 ${darkMode ? 'text-white placeholder-gray-500' : ''}`}
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end mb-6">
            <button onClick={() => navigate('forgot-password')} className="text-xs text-[#1E5EFF] font-medium">Mot de passe oublié ?</button>
          </div>

          <button onClick={handleLogin} disabled={loading}
            className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-60">
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : 'Se connecter'}
          </button>

          <button className="w-full mt-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <Fingerprint className="w-5 h-5 text-[#1E5EFF]" /> Connexion biométrique
          </button>
        </div>

        <div className="text-center mt-6 mb-8">
          <p className={`text-sm ${textMuted}`}>
            Pas de compte ?{' '}
            <button onClick={() => navigate('register')} className="text-[#1E5EFF] font-semibold">Créer un compte</button>
          </p>
        </div>
      </div>
    </div>
  )
}
