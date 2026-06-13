'use client'

import { useAppStore } from '@/lib/store'
import { useState } from 'react'
import { Eye, EyeOff, ChevronLeft, Check, ShieldCheck } from 'lucide-react'

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
  const { navigate, login } = useAppStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', phone: '', email: '', province: 'Kinshasa', commune: 'Gombe', password: '', confirmPassword: '', acceptTerms: false })
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const updateForm = (field: string, value: string | boolean) => setForm((prev) => ({ ...prev, [field]: value }))

  const handleRegister = () => {
    setLoading(true)
    setTimeout(() => {
      login(form.name || 'Jean Mukendi', form.email || 'jean@email.com', form.phone || '+243 812 000 000')
      setLoading(false)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-[#0B2D6B] pt-12 pb-6 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('login')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div>
            <h1 className="text-white text-lg font-bold">Créer un compte</h1>
            <p className="text-blue-200 text-xs">Étape {step} sur 3</p>
          </div>
        </div>
        <div className="flex gap-1.5 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className={`h-1 rounded-full flex-1 transition-colors ${s <= step ? 'bg-white' : 'bg-white/20'}`} />
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 py-6 overflow-y-auto">
        {step === 1 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0B2D6B] mb-2">Informations personnelles</h3>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Nom complet</label>
              <input type="text" value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Ex: Jean Mukendi"
                className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] focus:bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Numéro de téléphone</label>
              <input type="tel" value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="+243 812 000 000"
                className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] focus:bg-white outline-none" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Email</label>
              <input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="email@exemple.com"
                className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] focus:bg-white outline-none" />
            </div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0B2D6B] mb-2">Localisation</h3>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Province</label>
              <select value={form.province} onChange={(e) => updateForm('province', e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] outline-none">
                {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Commune</label>
              <select value={form.commune} onChange={(e) => updateForm('commune', e.target.value)}
                className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] outline-none">
                {(communes[form.province] || ['Centre-Ville']).map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-base font-bold text-[#0B2D6B] mb-2">Sécurité</h3>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Mot de passe</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => updateForm('password', e.target.value)}
                  placeholder="Minimum 8 caractères" className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] outline-none pr-12" />
                <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1.5 block">Confirmer le mot de passe</label>
              <input type="password" value={form.confirmPassword} onChange={(e) => updateForm('confirmPassword', e.target.value)}
                placeholder="Confirmez votre mot de passe" className="w-full px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm border border-transparent focus:border-[#1E5EFF] outline-none" />
            </div>
            <div className="flex items-start gap-3 mt-2">
              <button onClick={() => updateForm('acceptTerms', !form.acceptTerms)}
                className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 transition-colors ${form.acceptTerms ? 'bg-[#1E5EFF] border-[#1E5EFF]' : 'border-gray-300'}`}>
                {form.acceptTerms && <Check className="w-3 h-3 text-white" />}
              </button>
              <p className="text-xs text-gray-500 leading-relaxed">
                J&apos;accepte les <span className="text-[#1E5EFF] font-medium">conditions d&apos;utilisation</span> et la{' '}
                <span className="text-[#1E5EFF] font-medium">politique de confidentialité</span>
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-8 pt-4">
        <button onClick={() => { if (step < 3) setStep(step + 1); else handleRegister() }} disabled={loading}
          className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-60">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" /> : step < 3 ? 'Continuer' : 'Créer mon compte'}
        </button>
        <p className="text-center mt-4 text-sm text-gray-400">
          Déjà inscrit ? <button onClick={() => navigate('login')} className="text-[#1E5EFF] font-semibold">Se connecter</button>
        </p>
      </div>
    </div>
  )
}
