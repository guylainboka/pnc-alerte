'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, ScanLine, QrCode, ShieldCheck, ShieldAlert, ShieldX } from 'lucide-react'
import { useState } from 'react'

export default function VerificationIdentiteScreen() {
  const { navigate, darkMode } = useAppStore()
  const [activeTab, setActiveTab] = useState<'scan' | 'qr'>('scan')
  const [scanning, setScanning] = useState(false)
  const [result, setResult] = useState<'valid' | 'expired' | 'suspect' | null>(null)

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const handleScan = () => {
    setScanning(true)
    setTimeout(() => {
      setScanning(false)
      setResult('valid')
    }, 2000)
  }

  const resultConfig = {
    valid: { icon: ShieldCheck, label: 'Document Valide', color: '#0B9D5A', bg: '#EDFFF5' },
    expired: { icon: ShieldAlert, label: 'Document Expiré', color: '#F59E0B', bg: '#FFF8EB' },
    suspect: { icon: ShieldX, label: 'Document Suspect', color: '#FF3B30', bg: '#FFF0EF' },
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col pb-6 transition-colors`}>
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Vérification d&apos;identité</h1>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setActiveTab('scan')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'scan' ? 'bg-white text-[#0B2D6B]' : 'bg-white/10 text-white/70'}`}>
            Scanner un document
          </button>
          <button onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'qr' ? 'bg-white text-[#0B2D6B]' : 'bg-white/10 text-white/70'}`}>
            Mon QR Code
          </button>
        </div>
      </div>

      <div className="flex-1 px-6 pt-4 space-y-4">
        {activeTab === 'scan' ? (
          <>
            {/* Document types */}
            <h3 className={`text-sm font-bold ${textPrimary}`}>Type de document</h3>
            <div className="grid grid-cols-3 gap-3">
              {['Carte d\'identité', 'Passeport', 'Permis de conduire'].map((doc) => (
                <div key={doc} className={`${cardBg} rounded-xl p-3 text-center shadow-sm transition-colors`}>
                  <ScanLine className="w-6 h-6 text-[#1E5EFF] mx-auto mb-2" />
                  <p className={`text-[10px] ${darkMode ? 'text-gray-300' : 'text-gray-600'} font-medium`}>{doc}</p>
                </div>
              ))}
            </div>

            {/* Scan area */}
            <div className={`${cardBg} rounded-2xl p-6 shadow-sm transition-colors`}>
              <div className={`aspect-square max-h-64 ${bg} rounded-xl flex items-center justify-center relative overflow-hidden`}>
                {scanning ? (
                  <div className="text-center">
                    <div className="w-16 h-16 border-4 border-[#1E5EFF]/30 border-t-[#1E5EFF] rounded-full animate-spin mx-auto mb-3" />
                    <p className={`text-sm ${textPrimary} font-medium`}>Analyse en cours...</p>
                  </div>
                ) : result ? (
                  <div className="text-center">
                    {(() => {
                      const config = resultConfig[result]
                      const Icon = config.icon
                      return (
                        <>
                          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: config.bg }}>
                            <Icon className="w-8 h-8" style={{ color: config.color }} />
                          </div>
                          <p className="text-lg font-bold" style={{ color: config.color }}>{config.label}</p>
                          <p className={`text-xs ${textMuted} mt-1`}>Carte d&apos;identité n° 01-2026-12345</p>
                        </>
                      )
                    })()}
                  </div>
                ) : (
                  <div className="text-center">
                    <ScanLine className={`w-12 h-12 ${textMuted} mx-auto mb-3`} />
                    <p className={`text-sm ${textMuted}`}>Placez le document ici</p>
                  </div>
                )}
              </div>

              <button onClick={handleScan}
                className="w-full mt-4 py-3 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform">
                {result ? 'Nouveau scan' : 'Scanner le document'}
              </button>
            </div>
          </>
        ) : (
          /* QR Code tab */
          <div className={`${cardBg} rounded-2xl p-6 shadow-sm text-center transition-colors`}>
            <div className={`w-48 h-48 ${cardBg} border-2 ${darkMode ? 'border-gray-600' : 'border-gray-100'} rounded-xl mx-auto flex items-center justify-center mb-4`}>
              <QrCode className={`w-32 h-32 ${textPrimary}`} />
            </div>
            <h3 className={`text-base font-bold ${textPrimary} mb-1`}>Votre QR Code d&apos;identité</h3>
            <p className={`text-xs ${textMuted} mb-4`}>Présentez ce code lors d&apos;un contrôle d&apos;identité</p>
            <button className="px-6 py-2.5 bg-[#1E5EFF]/10 text-[#1E5EFF] rounded-xl font-medium text-sm">
              Télécharger le QR Code
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
