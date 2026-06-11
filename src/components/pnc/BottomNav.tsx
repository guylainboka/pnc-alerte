'use client'

import { useAppStore, type Screen } from '@/lib/store'
import {
  Home,
  Bell,
  AlertTriangle,
  MessageSquare,
  User,
} from 'lucide-react'

const navItems: { screen: Screen; icon: typeof Home; label: string }[] = [
  { screen: 'dashboard', icon: Home, label: 'Accueil' },
  { screen: 'alertes', icon: Bell, label: 'Alertes' },
  { screen: 'sos', icon: AlertTriangle, label: 'SOS' },
  { screen: 'assistant', icon: MessageSquare, label: 'Assistant' },
  { screen: 'profil', icon: User, label: 'Profil' },
]

export default function BottomNav() {
  const { currentScreen, navigate } = useAppStore()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 dark:bg-[#0B2D6B] dark:border-[#1a3f8a] safe-area-bottom">
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
                  <Icon className="w-7 h-7 text-white" />
                </div>
                <span className="text-[10px] mt-1 font-semibold text-[#FF3B30]">
                  {label}
                </span>
              </button>
            )
          }
          return (
            <button
              key={screen}
              onClick={() => navigate(screen)}
              className="flex flex-col items-center justify-center gap-0.5 py-1 px-3 active:scale-95 transition-transform"
            >
              <Icon
                className={`w-5 h-5 ${
                  isActive
                    ? 'text-[#1E5EFF] dark:text-[#5b8cff]'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              />
              <span
                className={`text-[10px] ${
                  isActive
                    ? 'text-[#1E5EFF] dark:text-[#5b8cff] font-semibold'
                    : 'text-gray-400 dark:text-gray-500'
                }`}
              >
                {label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
