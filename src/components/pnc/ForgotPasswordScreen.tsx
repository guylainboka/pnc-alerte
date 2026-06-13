'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'

export default function ForgotPasswordScreen() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <ScreenHeader title="Mot de passe oublié" />
      <div className="flex-1 px-6 py-6">
        <p className="text-sm text-gray-500 mb-6">Entrez votre email ou numéro de téléphone pour recevoir un code de vérification.</p>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email ou Téléphone</label>
            <input type="text" placeholder="email@exemple.com ou +243..."
              className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] outline-none" />
          </div>
          <button className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25">
            Envoyer le code
          </button>
        </div>
      </div>
    </div>
  )
}
