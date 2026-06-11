'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, MapPin, Calendar, Eye, Phone } from 'lucide-react'

const missingPersons = [
  { id: '1', name: 'Mbeki Kalonga Joseph', age: 8, genre: 'M', dateDisparition: '09/06/2026', lieu: 'Kinshasa, Kintambo', description: 'Enfant de 8 ans, vu pour la dernière fois près de l\'église Saint-Joseph. Portait un t-shirt bleu et un short noir.' },
  { id: '2', name: 'Nsimba Ngongo Marie', age: 34, genre: 'F', dateDisparition: '05/06/2026', lieu: 'Kinshasa, Masina', description: 'Femme de 34 ans, vue pour la dernière fois au marché de Masina. Taille moyenne, cheveux tressés.' },
  { id: '3', name: 'Tshimanga Patrick', age: 22, genre: 'M', dateDisparition: '01/06/2026', lieu: 'Kinshasa, Ndjili', description: 'Jeune homme de 22 ans, étudiant. Vu pour la dernière fois à l\'arrêt de bus Ndjili.' },
]

export default function PersonnesDisparuesScreen() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Personnes disparues</h1>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-3">
        {missingPersons.map((person) => (
          <div key={person.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="w-14 h-14 rounded-xl bg-orange-100 flex items-center justify-center flex-shrink-0">
                <span className="text-2xl">{person.genre === 'M' ? '👦' : '👩'}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-semibold text-[#0B2D6B]">{person.name}</h4>
                <p className="text-xs text-gray-400 mt-0.5">{person.age} ans — {person.genre === 'M' ? 'Homme' : 'Femme'}</p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {person.dateDisparition}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {person.lieu.split(',')[1]?.trim()}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-2 line-clamp-2">{person.description}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
              <button className="flex-1 py-2 bg-[#FF3B30]/10 text-[#FF3B30] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Signaler une observation
              </button>
              <button className="py-2 px-4 bg-[#0B9D5A]/10 text-[#0B9D5A] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                <Phone className="w-3.5 h-3.5" /> Appeler
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
