'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft } from 'lucide-react'

interface ScreenHeaderProps {
  title: string
  showBack?: boolean
  backScreen?: string
  rightAction?: React.ReactNode
}

export default function ScreenHeader({ title, showBack = true, backScreen, rightAction }: ScreenHeaderProps) {
  const { goBack, navigate, darkMode } = useAppStore()

  return (
    <div className={`pt-12 pb-5 px-6 transition-colors ${
      darkMode ? 'bg-[#071d4f]' : 'bg-[#0B2D6B]'
    }`}>
      <div className="flex items-center gap-3">
        {showBack && (
          <button
            onClick={() => backScreen ? navigate(backScreen) : goBack()}
            className="text-white active:scale-90 transition-transform"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}
        <h1 className="text-white text-lg font-bold flex-1">{title}</h1>
        {rightAction}
      </div>
    </div>
  )
}
