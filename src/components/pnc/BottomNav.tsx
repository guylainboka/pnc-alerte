'use client'

import { useAppStore, type Screen } from '@/lib/store'
import {
  Home, Bell, AlertTriangle, MessageCircle, User,
} from 'lucide-react'

const navItems: { screen: Screen; icon: typeof Home; label: string }[] = [
  { screen: 'dashboard', icon: Home, label: 'Accueil' },
  { screen: 'alertes', icon: Bell, label: 'Alertes' },
  { screen: 'sos', icon: AlertTriangle, label: 'SOS' },
  { screen: 'assistant', icon: MessageCircle, label: 'Assistant' },
  { screen: 'profil', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const { currentScreen, navigate, darkMode } = useAppStore()

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 border-t safe-area-bottom transition-colors ${
      darkMode
        ? 'bg-[#0a1e4a] border-[#1a3f8a]'
        : 'bg-white border-gray-200'
    }`}>
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ screen, icon: Icon, label }) => {
          const isActive = currentScreen === screen
          const isSOS = screen === 'sos'

          if (isSOS) {
            return (
              <button
                key={screen}
                onClick={() => navigate('sos')}
                className="flex flex-col items-center justify-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg shadow-red-500/40 active:scale-95 transition-transform">
                  <AlertTriangle className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-[#FF3B30]">SOS</span>
              </button>
            )
          }

          return (
            <button
              key={screen}
              onClick={() => navigate(screen)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 active:scale-95 transition-transform"
            >
              <Icon className={`w-5 h-5 transition-colors ${
                isActive
                  ? darkMode ? 'text-[#5b8cff]' : 'text-[#1E5EFF]'
                  : darkMode ? 'text-gray-500' : 'text-gray-400'
              }`} />
              <span className={`text-[10px] transition-colors ${
                isActive
                  ? darkMode ? 'text-[#5b8cff] font-semibold' : 'text-[#1E5EFF] font-semibold'
                  : darkMode ? 'text-gray-500' : 'text-gray-400'
              }`}>
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
