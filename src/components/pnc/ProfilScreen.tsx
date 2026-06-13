'use client'

import { useAppStore } from '@/lib/store'
import {
  ChevronLeft, Camera, User, Phone, Mail, MapPin,
  Edit3, Settings, Bell, Lock, Globe, MapPin as GeoIcon,
  Award, Moon, Sun, LogOut, ChevronRight, ShieldCheck,
  Wifi, WifiOff, Volume2, FileText, Vault, Wallet, HelpCircle, Info
} from 'lucide-react'
import { useRef, useState } from 'react'

export default function ProfilScreen() {
  const { navigate, logout, userName, userEmail, userPhone, darkMode, toggleDarkMode, profileImage, setProfileImage, userProvince, userCommune } = useAppStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showImageModal, setShowImageModal] = useState(false)

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setProfileImage(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const menuSections = [
    {
      title: 'Paramètres',
      items: [
        { icon: Bell, label: 'Notifications', screen: 'settings-notifications' as const, color: '#1E5EFF', desc: 'Gérer les alertes push' },
        { icon: Lock, label: 'Sécurité & Biométrie', screen: 'settings-security' as const, color: '#8B5CF6', desc: 'Mot de passe, empreinte digitale' },
        { icon: Globe, label: 'Langue', screen: 'settings-language' as const, color: '#0B9D5A', desc: 'Français, Lingala, Swahili...' },
        { icon: GeoIcon, label: 'Géolocalisation', screen: 'settings-geolocation' as const, color: '#F59E0B', desc: 'Rayon d\'alerte GPS' },
        { icon: WifiOff, label: 'Mode hors ligne', screen: 'settings-offline' as const, color: '#EC4899', desc: 'Données en cache' },
      ],
    },
    {
      title: 'Services',
      items: [
        { icon: FileText, label: 'Mes plaintes', screen: 'plainte' as const, color: '#EC4899', desc: 'Historique des dossiers' },
        { icon: Vault, label: 'Coffre-Fort', screen: 'coffre-fort' as const, color: '#F59E0B', desc: 'Documents chiffrés' },
        { icon: Wallet, label: 'Mes amendes', screen: 'amendes' as const, color: '#0B9D5A', desc: 'Paiements et reçus' },
        { icon: Award, label: 'Badges & Récompenses', screen: 'profil' as const, color: '#8B5CF6', desc: 'Citoyen Vigilant' },
      ],
    },
    {
      title: 'Aide',
      items: [
        { icon: HelpCircle, label: 'Centre d\'aide', screen: 'conseils' as const, color: '#06B6D4', desc: 'FAQ et assistance' },
        { icon: Info, label: 'À propos de PNC Alerte', screen: 'profil' as const, color: '#64748B', desc: 'Version 1.0.0' },
      ],
    },
  ]

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const textDesc = darkMode ? 'text-gray-500' : 'text-gray-400'

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      {/* Header with profile image */}
      <div className="bg-[#0B2D6B] pt-12 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-[#1E5EFF]/20" />
        <div className="absolute bottom-[-20px] left-[20%] w-16 h-16 rounded-full bg-white/5" />

        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-white text-lg font-bold">Mon Profil</h1>
            <button onClick={() => navigate('settings')}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Profile image & info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-white/20">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="w-20 h-20 object-cover" />
                ) : (
                  <div className="w-20 h-20 bg-white/10 flex items-center justify-center">
                    <User className="w-10 h-10 text-white/60" />
                  </div>
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute -bottom-1 -right-1 w-7 h-7 bg-[#1E5EFF] rounded-lg flex items-center justify-center shadow-lg border-2 border-[#0B2D6B]">
                <Camera className="w-3.5 h-3.5 text-white" />
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
            </div>
            <div className="flex-1">
              <h2 className="text-white text-lg font-bold">{userName || 'Citoyen'}</h2>
              <p className="text-blue-200 text-xs">{userEmail || 'email@exemple.com'}</p>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0B9D5A]/20 text-green-300 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Vérifié
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E5EFF]/20 text-blue-300 font-medium">
                  {userProvince}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="px-6 -mt-8 mb-4 relative z-20">
        <div className={`${cardBg} rounded-xl shadow-lg p-4 transition-colors`}>
          <div className="flex items-center justify-between mb-3">
            <span className={`text-xs font-semibold ${textPrimary}`}>Informations personnelles</span>
            <button onClick={() => navigate('profil-edit')}
              className="text-xs text-[#1E5EFF] font-medium flex items-center gap-1">
              <Edit3 className="w-3 h-3" /> Modifier
            </button>
          </div>
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-sm ${textMuted}`}>{userPhone || '+243 812 000 000'}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-sm ${textMuted}`}>{userEmail || 'email@exemple.com'}</span>
            </div>
            <div className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-sm ${textMuted}`}>{userProvince}, {userCommune}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Dark mode toggle */}
      <div className="px-6 mb-4">
        <div className={`${cardBg} rounded-xl p-4 shadow-sm flex items-center justify-between transition-colors`}>
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-[#8B5CF6]" /> : <Sun className="w-5 h-5 text-[#F59E0B]" />}
            <div>
              <span className={`text-sm font-medium ${textPrimary}`}>Mode sombre</span>
              <p className={`text-[10px] ${textDesc}`}>Réduire la luminosité de l'écran</p>
            </div>
          </div>
          <button onClick={toggleDarkMode}
            className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}>
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>
      </div>

      {/* Menu sections */}
      {menuSections.map((section) => (
        <div key={section.title} className="px-6 mb-4">
          <h3 className={`text-xs font-semibold ${textMuted} uppercase tracking-wider mb-2`}>{section.title}</h3>
          <div className={`${cardBg} rounded-xl shadow-sm overflow-hidden transition-colors`}>
            {section.items.map(({ icon: Icon, label, screen, color, desc }, idx) => (
              <button key={label} onClick={() => navigate(screen)}
                className={`w-full flex items-center gap-3 p-4 text-left active:bg-gray-50 dark:active:bg-gray-800 transition-colors ${idx < section.items.length - 1 ? 'border-b border-gray-50 dark:border-gray-800' : ''}`}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className={`text-sm font-medium ${textPrimary}`}>{label}</span>
                  <p className={`text-[10px] ${textDesc}`}>{desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* Logout */}
      <div className="px-6 mt-2">
        <button onClick={logout}
          className="w-full bg-white dark:bg-[#0f2555] rounded-xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-[0.99] transition-transform">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-[#FF3B30]/10">
            <LogOut className="w-4 h-4 text-[#FF3B30]" />
          </div>
          <span className="text-sm font-medium text-[#FF3B30]">Se déconnecter</span>
        </button>
      </div>
    </div>
  )
}
