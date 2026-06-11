'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, FileText, Download, Calendar, Clock } from 'lucide-react'

const convocations = [
  { id: '1', title: 'Convocation — Témoignage affaire #PNCP-2026-A1B2C', date: '15/06/2026', heure: '09:00', lieu: 'Commissariat Central de la Gombe', status: 'active', type: 'Témoignage' },
  { id: '2', title: 'Convocation — Suivi plainte #PNCP-2026-D4E5F', date: '20/06/2026', heure: '14:00', lieu: 'Commissariat de Kintambo', status: 'active', type: 'Suivi' },
  { id: '3', title: 'Convocation — Remise de document', date: '01/06/2026', heure: '10:00', lieu: 'Commissariat de Matonge', status: 'expired', type: 'Administratif' },
]

export default function ConvocationsScreen() {
  const { navigate } = useAppStore()

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Convocations</h1>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-3">
        {convocations.map((conv) => (
          <div key={conv.id} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                conv.status === 'active' ? 'bg-[#1E5EFF]/10' : 'bg-gray-100'
              }`}>
                <FileText className={`w-5 h-5 ${conv.status === 'active' ? 'text-[#1E5EFF]' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-[#0B2D6B]">{conv.title}</h4>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {conv.date}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {conv.heure}
                  </span>
                </div>
                <p className="text-[10px] text-gray-400 mt-1">{conv.lieu}</p>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                conv.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
              }`}>
                {conv.status === 'active' ? 'Active' : 'Expirée'}
              </span>
            </div>
            {conv.status === 'active' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
                <button className="flex-1 py-2 bg-[#1E5EFF]/10 text-[#1E5EFF] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <FileText className="w-3.5 h-3.5" /> Détails
                </button>
                <button className="py-2 px-4 bg-[#0B9D5A]/10 text-[#0B9D5A] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                  <Download className="w-3.5 h-3.5" /> PDF
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
