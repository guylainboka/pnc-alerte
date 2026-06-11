'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { Eye, EyeOff, Fingerprint } from 'lucide-react'

export default function LoginScreen() {
  const { navigate, login } = useAppStore()
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-14 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-32 h-32 rounded-full bg-[#1E5EFF]/30" />
        <div className="absolute bottom-[-20px] left-[-20px] w-20 h-20 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <img src="/logo.jpeg" alt="PNC" className="w-12 h-12 object-cover" />
            </div>
            <div>
              <h1 className="text-white text-xl font-bold">PNC Alerte</h1>
              <p className="text-blue-200 text-xs">Police Nationale Congolaise</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form Card */}
      <div className="flex-1 px-6 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-[#0B2D6B] mb-1">Connexion</h2>
          <p className="text-sm text-gray-400 mb-6">Accédez à votre compte PNC Alerte</p>

          {/* Email */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Email ou Téléphone
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@exemple.com"
              className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] focus:bg-white outline-none transition-all"
            />
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] focus:bg-white outline-none transition-all pr-12"
              />
              <button
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Forgot password */}
          <div className="flex justify-end mb-6">
            <button
              onClick={() => navigate('forgot-password')}
              className="text-xs text-[#1E5EFF] font-medium"
            >
              Mot de passe oublié ?
            </button>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-60"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
            ) : (
              'Se connecter'
            )}
          </button>

          {/* Biometric */}
          <button className="w-full mt-4 py-3 border border-gray-200 rounded-xl flex items-center justify-center gap-2 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
            <Fingerprint className="w-5 h-5 text-[#0B2D6B]" />
            Connexion biométrique
          </button>
        </div>

        {/* Register link */}
        <div className="text-center mt-6 mb-8">
          <p className="text-sm text-gray-400">
            Pas de compte ?{' '}
            <button
              onClick={() => navigate('register')}
              className="text-[#1E5EFF] font-semibold"
            >
              Créer un compte
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
