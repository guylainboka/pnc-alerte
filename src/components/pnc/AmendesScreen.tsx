'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, CreditCard, Smartphone, Building, Download, Check } from 'lucide-react'
import { useState } from 'react'

const fines = [
  { id: '1', reference: 'AMN-2026-001', type: 'Excès de vitesse', amount: '25,000 CDF', date: '28/05/2026', status: 'unpaid' },
  { id: '2', reference: 'AMN-2026-002', type: 'Stationnement interdit', amount: '10,000 CDF', date: '15/05/2026', status: 'paid' },
  { id: '3', reference: 'AMN-2026-003', type: 'Non-présentation de documents', amount: '15,000 CDF', date: '02/05/2026', status: 'paid' },
]

const paymentMethods = [
  { id: 'mobile', label: 'Mobile Money', icon: Smartphone, color: '#0B9D5A' },
  { id: 'card', label: 'Carte bancaire', icon: CreditCard, color: '#1E5EFF' },
  { id: 'transfer', label: 'Virement bancaire', icon: Building, color: '#8B5CF6' },
]

export default function AmendesScreen() {
  const { navigate, darkMode } = useAppStore()
  const [selectedFine, setSelectedFine] = useState<string | null>(null)
  const [paymentStep, setPaymentStep] = useState(0) // 0: list, 1: method, 2: processing, 3: success
  const [selectedMethod, setSelectedMethod] = useState('')

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  if (paymentStep === 3) {
    return (
      <div className={`min-h-screen ${bg} flex flex-col items-center justify-center px-6 transition-colors`}>
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <Check className="w-10 h-10 text-green-600" />
        </div>
        <h2 className={`text-lg font-bold ${textPrimary} mb-2`}>Paiement réussi !</h2>
        <p className={`text-sm ${textMuted} text-center mb-6`}>Votre reçu PDF est disponible dans l&apos;historique des paiements.</p>
        <button onClick={() => { setPaymentStep(0); setSelectedFine(null) }} className="px-8 py-3 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm">
          Retour
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Paiement des amendes</h1>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-3">
        {paymentStep === 0 && (
          <>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Vos amendes</h3>
            {fines.map((fine) => (
              <div key={fine.id} className={`${cardBg} rounded-xl p-4 shadow-sm ${selectedFine === fine.id ? 'ring-2 ring-[#1E5EFF]' : ''} transition-colors`}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className={`text-sm font-medium ${textPrimary}`}>{fine.type}</p>
                    <p className={`text-xs ${textMuted} mt-0.5`}>Réf : {fine.reference} — {fine.date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${textPrimary}`}>{fine.amount}</p>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      fine.status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-[#FF3B30]/10 text-[#FF3B30]'
                    }`}>
                      {fine.status === 'paid' ? 'Payée' : 'Impayée'}
                    </span>
                  </div>
                </div>
                {fine.status === 'unpaid' && (
                  <button onClick={() => { setSelectedFine(fine.id); setPaymentStep(1) }}
                    className="w-full mt-3 py-2 bg-[#1E5EFF] text-white rounded-lg text-xs font-semibold active:scale-[0.98] transition-transform">
                    Payer cette amende
                  </button>
                )}
                {fine.status === 'paid' && (
                  <button className="w-full mt-3 py-2 bg-[#0B9D5A]/10 text-[#0B9D5A] rounded-lg text-xs font-medium flex items-center justify-center gap-1">
                    <Download className="w-3.5 h-3.5" /> Télécharger le reçu
                  </button>
                )}
              </div>
            ))}
          </>
        )}

        {paymentStep === 1 && (
          <>
            <h3 className={`text-sm font-bold ${textPrimary}`}>Mode de paiement</h3>
            {paymentMethods.map(({ id, label, icon: Icon, color }) => (
              <button
                key={id}
                onClick={() => setSelectedMethod(id)}
                className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 text-left transition-all ${selectedMethod === id ? 'ring-2 ring-[#1E5EFF]' : ''}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <span className={`text-sm font-medium ${textPrimary}`}>{label}</span>
              </button>
            ))}
            <button
              onClick={() => { setPaymentStep(2); setTimeout(() => setPaymentStep(3), 2000) }}
              disabled={!selectedMethod}
              className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-40"
            >
              Confirmer le paiement
            </button>
          </>
        )}

        {paymentStep === 2 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-12 h-12 border-4 border-[#1E5EFF]/30 border-t-[#1E5EFF] rounded-full animate-spin mb-4" />
            <p className={`text-sm ${textPrimary} font-medium`}>Traitement en cours...</p>
          </div>
        )}
      </div>
    </div>
  )
}
