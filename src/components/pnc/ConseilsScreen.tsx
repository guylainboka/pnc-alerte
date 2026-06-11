'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Car, Shield, Home, Heart } from 'lucide-react'

const categories = [
  { icon: Car, label: 'Sécurité routière', color: '#1E5EFF', bg: '#EBF0FF', articles: 8 },
  { icon: Shield, label: 'Cybercriminalité', color: '#8B5CF6', bg: '#F3F0FF', articles: 6 },
  { icon: Home, label: 'Cambriolage', color: '#F59E0B', bg: '#FFF8EB', articles: 5 },
  { icon: Heart, label: 'Violence domestique', color: '#EC4899', bg: '#FDF2F8', articles: 4 },
]

const tips = [
  { id: '1', title: 'Comment sécuriser votre domicile', category: 'Cambriolage', readTime: '3 min', preview: 'Adoptez ces mesures simples pour protéger votre maison contre les effractions...' },
  { id: '2', title: 'Les arnaques en ligne les plus courantes', category: 'Cybercriminalité', readTime: '5 min', preview: 'Apprenez à identifier et éviter les fraudes sur Internet et les réseaux sociaux...' },
  { id: '3', title: 'Conseils pour la conduite nocturne', category: 'Sécurité routière', readTime: '4 min', preview: 'La conduite de nuit présente des risques supplémentaires. Voici les précautions à prendre...' },
]

export default function ConseilsScreen() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Conseils de prévention</h1>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-5">
        {/* Categories */}
        <div>
          <h3 className="text-sm font-bold text-[#0B2D6B] mb-3">Catégories</h3>
          <div className="grid grid-cols-2 gap-3">
            {categories.map(({ icon: Icon, label, color, bg, articles }) => (
              <button key={label} className="bg-white rounded-xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ backgroundColor: bg }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className="text-xs font-semibold text-[#0B2D6B]">{label}</p>
                <p className="text-[10px] text-gray-400">{articles} articles</p>
              </button>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h3 className="text-sm font-bold text-[#0B2D6B] mb-3">Articles récents</h3>
          <div className="space-y-3">
            {tips.map((tip) => (
              <button key={tip.id} className="w-full bg-white rounded-xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1E5EFF]/10 text-[#1E5EFF] font-medium">{tip.category}</span>
                  <span className="text-[10px] text-gray-400">{tip.readTime}</span>
                </div>
                <h4 className="text-sm font-semibold text-[#0B2D6B]">{tip.title}</h4>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">{tip.preview}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
