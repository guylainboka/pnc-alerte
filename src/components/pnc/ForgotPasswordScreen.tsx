'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'

export default function ForgotPasswordScreen() {
  const { navigate, darkMode } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a] text-white' : 'bg-[#F5F6FA] border-transparent'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Mot de passe oublié" />
      <div className="flex-1 px-6 py-6">
        <p className={`text-sm ${textMuted} mb-6`}>Entrez votre email ou numéro de téléphone pour recevoir un code de vérification.</p>
        <div className="space-y-4">
          <div>
            <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Email ou Téléphone</label>
            <input type="text" placeholder="email@exemple.com ou +243..."
              className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none`} />
          </div>
          <button className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25">
            Envoyer le code
          </button>
        </div>
      </div>
    </div>
  )
}
