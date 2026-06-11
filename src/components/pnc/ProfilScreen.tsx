'use client'

import { useAppStore } from '@/lib/store'
import {
  ChevronLeft, User, Phone, Mail, MapPin, Shield,
  Bell, Lock, Globe, LogOut, ChevronRight, Award, Moon, Sun,
} from 'lucide-react'

export default function ProfilScreen() {
  const { navigate, logout, userName, userEmail, userPhone, darkMode, toggleDarkMode } = useAppStore()

  const menuItems = [
    { icon: Bell, label: 'Préférences de notifications', screen: 'notifications' as const, color: '#1E5EFF' },
    { icon: Lock, label: 'Sécurité & Biométrie', color: '#8B5CF6' },
    { icon: Globe, label: 'Langue de l\'application', color: '#0B9D5A' },
    { icon: MapPin, label: 'Rayon de géolocalisation', color: '#F59E0B' },
    { icon: Award, label: 'Badges & Récompenses', color: '#EC4899' },
  ]

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-[#1E5EFF]/20" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-white text-lg font-bold">{userName || 'Citoyen'}</h1>
            <p className="text-blue-200 text-xs">{userEmail || 'email@exemple.com'}</p>
          </div>
        </div>
      </div>

      {/* Info card */}
      <div className="px-6 -mt-8 mb-4">
        <div className="bg-white rounded-xl shadow-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Phone className="w-4 h-4 text-[#1E5EFF]" />
            <span className="text-sm text-gray-600">{userPhone || '+243 812 000 000'}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="w-4 h-4 text-[#1E5EFF]" />
            <span className="text-sm text-gray-600">{userEmail || 'email@exemple.com'}</span>
          </div>
          <div className="flex items-center gap-3">
            <MapPin className="w-4 h-4 text-[#1E5EFF]" />
            <span className="text-sm text-gray-600">Kinshasa, Gombe</span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="px-6 space-y-2">
        {/* Dark mode toggle */}
        <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
            {darkMode ? <Moon className="w-5 h-5 text-[#8B5CF6]" /> : <Sun className="w-5 h-5 text-[#F59E0B]" />}
            <span className="text-sm font-medium text-[#0B2D6B]">Mode sombre</span>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`w-11 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-[#8B5CF6]' : 'bg-gray-200'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {menuItems.map(({ icon: Icon, label, screen, color }) => (
          <button
            key={label}
            onClick={() => screen && navigate(screen)}
            className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-[0.99] transition-transform"
          >
            <Icon className="w-5 h-5" style={{ color }} />
            <span className="text-sm font-medium text-[#0B2D6B] flex-1">{label}</span>
            <ChevronRight className="w-4 h-4 text-gray-300" />
          </button>
        ))}

        {/* Logout */}
        <button
          onClick={logout}
          className="w-full bg-white rounded-xl p-4 shadow-sm flex items-center gap-3 text-left active:scale-[0.99] transition-transform mt-4"
        >
          <LogOut className="w-5 h-5 text-[#FF3B30]" />
          <span className="text-sm font-medium text-[#FF3B30]">Se déconnecter</span>
        </button>
      </div>
    </div>
  )
}
