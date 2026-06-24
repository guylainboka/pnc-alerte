'use client'

import { useAppStore } from '@/lib/store'
import { getCurrentUser } from '@/lib/auth-service'
import { useEffect, useState } from 'react'

export default function SplashScreen() {
  const { navigate, isAuthenticated } = useAppStore()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let cancelled = false
    const timer = setTimeout(async () => {
      // 1) Vérifier d'abord Zustand (état déjà connu)
      if (isAuthenticated) {
        if (!cancelled) navigate('dashboard')
        return
      }
      // 2) Vérifier la session Supabase (si l'utilisateur a déjà connecté son compte)
      try {
        const user = await getCurrentUser()
        if (!cancelled && user) {
          // Restaurer l'état Zustand depuis le profil Supabase
          useAppStore.getState().login(
            user.fullName || 'Citoyen',
            user.email,
            user.phone || ''
          )
          navigate('dashboard')
          return
        }
      } catch (e) {
        // Silencieux — fallback vers onboarding
      }
      if (!cancelled) {
        setChecking(false)
        navigate('onboarding')
      }
    }, 2000)
    return () => { cancelled = true; clearTimeout(timer) }
  }, [navigate, isAuthenticated])

  return (
    <div className="min-h-screen bg-[#0B2D6B] flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-80px] left-[-80px] w-64 h-64 rounded-full bg-[#1E5EFF]/20" />
      <div className="absolute bottom-[-60px] right-[-60px] w-48 h-48 rounded-full bg-[#1E5EFF]/15" />
      <div className="absolute top-1/3 right-[-30px] w-24 h-24 rounded-full bg-white/5" />

      <div className="flex flex-col items-center gap-6 z-10">
        <div className="w-28 h-28 rounded-3xl bg-white/10 backdrop-blur-sm flex items-center justify-center p-2 shadow-2xl">
          <img src="/logo.jpeg" alt="PNC Alerte Logo" className="w-24 h-24 rounded-2xl object-cover" />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white tracking-tight">PNC Alerte</h1>
          <p className="text-sm text-blue-200 mt-2 max-w-[250px]">
            Police Nationale Congolaise — Sécurité au bout des doigts
          </p>
          {checking && (
            <p className="text-[10px] text-blue-300/70 mt-2">Vérification de la session…</p>
          )}
        </div>
        <div className="mt-8">
          <div className="w-10 h-10 border-[3px] border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </div>
    </div>
  )
}
