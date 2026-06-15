'use client'

import { useAppStore } from '@/lib/store'
import ScreenHeader from './ScreenHeader'
import { Camera, User, Phone, Mail, MapPin, Check } from 'lucide-react'
import { useRef, useState } from 'react'

const provinces = ['Kinshasa', 'Kongo-Central', 'Kwango', 'Kwilu', 'Mai-Ndombe', 'Kasai', 'Kasai-Central', 'Kasai-Oriental', 'Sud-Kivu', 'Nord-Kivu', 'Ituri', 'Haut-Katanga', 'Equateur']
const communes: Record<string, string[]> = {
  Kinshasa: ['Gombe', 'Barumbu', 'Bandalungwa', 'Kintambo', 'Lingwala', 'Makala', 'Masina', 'Matete', 'Mont-Ngafula', 'Ndjili', 'Ngaliema', 'Nsele', 'Selembao'],
}

export default function ProfilEditScreen() {
  const { navigate, userName, userEmail, userPhone, userProvince, userCommune, profileImage, setProfileImage, updateProfile, darkMode } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(userName)
  const [email, setEmail] = useState(userEmail)
  const [phone, setPhone] = useState(userPhone)
  const [province, setProvince] = useState(userProvince)
  const [commune, setCommune] = useState(userCommune)
  const [saved, setSaved] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => setProfileImage(ev.target?.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSave = () => {
    updateProfile({ userName: name, userEmail: email, userPhone: phone, userProvince: province, userCommune: commune })
    setSaved(true)
    setTimeout(() => navigate('profil'), 1200)
  }

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a] text-white' : 'bg-[#F5F6FA] border-transparent'

  return (
    <div className={`min-h-screen ${bg} flex flex-col transition-colors`}>
      <ScreenHeader title="Modifier le profil" backScreen="profil" />

      {saved ? (
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="w-10 h-10 text-green-600" />
          </div>
          <h2 className={`text-lg font-bold ${textPrimary} mb-2`}>Profil mis à jour !</h2>
          <p className={`text-sm ${textMuted}`}>Vos informations ont été enregistrées.</p>
        </div>
      ) : (
        <div className="flex-1 px-6 py-4 space-y-4 overflow-y-auto">
          {/* Profile image */}
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#1E5EFF]/20">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-24 h-24 object-cover" />
                ) : (
                  <div className="w-24 h-24 bg-[#1E5EFF]/10 flex items-center justify-center">
                    <User className="w-12 h-12 text-[#1E5EFF]/40" />
                  </div>
                )}
              </div>
              <button onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-8 h-8 bg-[#1E5EFF] rounded-lg flex items-center justify-center shadow-lg border-2 border-white dark:border-[#0f2555]">
                <Camera className="w-4 h-4 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <button onClick={() => fileInputRef.current?.click()} className={`text-xs text-[#1E5EFF] font-medium mt-2`}>
              Changer la photo
            </button>
          </div>

          {/* Form */}
          <div className={`${cardBg} rounded-xl p-5 shadow-sm space-y-4 transition-colors`}>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Nom complet</label>
              <div className="relative">
                <User className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none transition-all`} />
              </div>
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Téléphone</label>
              <div className="relative">
                <Phone className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none transition-all`} />
              </div>
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Email</label>
              <div className="relative">
                <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none transition-all`} />
              </div>
            </div>
          </div>

          <div className={`${cardBg} rounded-xl p-5 shadow-sm space-y-4 transition-colors`}>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Province</label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <select value={province} onChange={(e) => setProvince(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none appearance-none`}>
                  {provinces.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1.5 block`}>Commune</label>
              <div className="relative">
                <MapPin className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${textMuted}`} />
                <select value={commune} onChange={(e) => setCommune(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 ${inputBg} rounded-xl text-sm border focus:border-[#1E5EFF] outline-none appearance-none`}>
                  {(communes[province] || ['Centre-Ville']).map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
          </div>

          <button onClick={handleSave}
            className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25">
            Enregistrer les modifications
          </button>
        </div>
      )}
    </div>
  )
}
