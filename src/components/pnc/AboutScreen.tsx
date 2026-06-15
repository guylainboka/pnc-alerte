'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, ShieldCheck, Smartphone, Mail, Globe, Phone, Share2, Star } from 'lucide-react'

export default function AboutScreen() {
  const { goBack, darkMode } = useAppStore()

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const handleShareApp = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'PNC Alerte',
          text: 'Téléchargez PNC Alerte — L\'application de la Police Nationale Congolaise pour la sécurité citoyenne.',
          url: window.location.href,
        })
      } catch {}
    }
  }

  return (
    <div className={`min-h-screen ${bg} pb-8 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-16 px-6 relative overflow-hidden">
        <div className="absolute top-[-30px] right-[-30px] w-24 h-24 rounded-full bg-[#1E5EFF]/20" />
        <div className="flex items-center gap-3">
          <button onClick={goBack} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">À propos</h1>
        </div>
      </div>

      <div className="px-6 -mt-8 space-y-4">
        {/* Logo & version */}
        <div className={`${cardBg} rounded-xl p-6 shadow-lg text-center transition-colors`}>
          <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-[#1E5EFF]/20 mx-auto mb-3">
            <img src="/logo.jpeg" alt="PNC" className="w-20 h-20 object-cover" />
          </div>
          <h2 className={`text-lg font-bold ${textPrimary}`}>PNC Alerte</h2>
          <p className={`text-xs ${textMuted}`}>Version 1.0.0</p>
          <p className={`text-xs ${textMuted} mt-1`}>Police Nationale Congolaise</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            ))}
            <span className={`text-xs ${textMuted} ml-1`}>4.8</span>
          </div>
        </div>

        {/* Description */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
          <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Description</h3>
          <p className={`text-xs ${textMuted} leading-relaxed`}>
            PNC Alerte est la plateforme officielle de la Police Nationale Congolaise dédiée à la sécurité citoyenne. Elle permet aux citoyens de signaler des incidents, déposer des plaintes, recevoir des alertes de sécurité en temps réel, accéder à un assistant IA, et contacter les services d&apos;urgence. L&apos;application vise à renforcer la collaboration entre la population et les forces de l&apos;ordre pour un environnement plus sûr en République Démocratique du Congo.
          </p>
        </div>

        {/* Features */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
          <h3 className={`text-sm font-bold ${textPrimary} mb-3`}>Fonctionnalités principales</h3>
          {[
            { icon: ShieldCheck, label: 'Signalement d\'incidents en temps réel', color: '#FF3B30' },
            { icon: Smartphone, label: 'Alerte SOS avec géolocalisation GPS', color: '#1E5EFF' },
            { icon: Globe, label: 'Carte sécuritaire interactive', color: '#0B9D5A' },
            { icon: Mail, label: 'Dépôt de plainte en ligne', color: '#EC4899' },
            { icon: Phone, label: 'Numéros d\'urgence intégrés', color: '#8B5CF6' },
          ].map(({ icon: Icon, label, color }) => (
            <div key={label} className="flex items-center gap-3 py-2">
              <Icon className="w-4 h-4 flex-shrink-0" style={{ color }} />
              <span className={`text-xs ${textMuted}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* Contact */}
        <div className={`${cardBg} rounded-xl p-4 shadow-sm transition-colors`}>
          <h3 className={`text-sm font-bold ${textPrimary} mb-3`}>Contact</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-xs ${textMuted}`}>contact@pnc-alerte.cd</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-xs ${textMuted}`}>+243 810 000 000</span>
            </div>
            <div className="flex items-center gap-3">
              <Globe className="w-4 h-4 text-[#1E5EFF]" />
              <span className={`text-xs ${textMuted}`}>www.pnc-alerte.cd</span>
            </div>
          </div>
        </div>

        {/* Share */}
        <button
          onClick={handleShareApp}
          className="w-full bg-[#1E5EFF] text-white rounded-xl p-4 shadow-sm flex items-center justify-center gap-2 active:scale-[0.98] transition-transform"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-sm font-semibold">Partager l&apos;application</span>
        </button>

        <p className={`text-center text-[10px] ${textMuted} mt-2`}>
          © 2026 Police Nationale Congolaise. Tous droits réservés.
        </p>
      </div>
    </div>
  )
}
