'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, ChevronRight, Upload, FileText, AlertTriangle } from 'lucide-react'
import { useState } from 'react'

const complaintTypes = [
  'Vol simple', 'Escroquerie ou Abus de confiance', 'Vandalisme',
  'Menaces, Harcèlement ou Cybercriminalité', 'Violence ou Agression', 'Perte de documents officiels',
]

export default function PlainteScreen() {
  const { navigate } = useAppStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    type: '', dateFaits: '', heureFaits: '', lieuFaits: '', description: '',
    suspectStatus: 'inconnu', suspectNom: '', suspectDescription: '',
    engagement: false,
  })
  const [submitted, setSubmitted] = useState(false)

  const updateForm = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const stepLabels = ['Type', 'Faits', 'Suspect', 'Preuves', 'Validation']

  if (submitted) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-lg font-bold text-[#0B2D6B] mb-2">Plainte déposée !</h2>
        <p className="text-sm text-gray-500 text-center mb-2">
          N° de dossier : <span className="font-mono font-bold text-[#1E5EFF]">PNCP-2026-X98B2</span>
        </p>
        <p className="text-xs text-gray-400 text-center mb-1">Statut : <span className="text-yellow-600 font-medium">En attente</span></p>
        <p className="text-xs text-gray-400 text-center mb-6">Votre plainte a été routée vers le commissariat de la commune des faits.</p>
        <div className="bg-white rounded-xl p-4 w-full max-w-sm shadow-sm mb-6">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <FileText className="w-4 h-4 text-[#1E5EFF]" />
            <span>Récépissé PDF sera disponible après validation</span>
          </div>
        </div>
        <button onClick={() => navigate('dashboard')} className="px-8 py-3 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm">
          Retour à l&apos;accueil
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col pb-6">
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-5 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => step > 1 ? setStep(step - 1) : navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Dépôt de plainte</h1>
        </div>
        {/* Stepper */}
        <div className="flex items-center gap-1">
          {stepLabels.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-1.5 rounded-full transition-colors ${i < step ? 'bg-white' : 'bg-white/20'}`} />
              <p className={`text-[8px] mt-1 text-center ${i < step ? 'text-white' : 'text-white/40'}`}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 px-6 pt-4 space-y-4 overflow-y-auto">
        {/* Step 1: Type */}
        {step === 1 && (
          <div>
            <h3 className="text-sm font-bold text-[#0B2D6B] mb-3">Type de plainte</h3>
            <div className="space-y-2">
              {complaintTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => updateForm('type', type)}
                  className={`w-full p-3 rounded-xl text-left text-sm transition-all ${
                    form.type === type ? 'bg-[#1E5EFF] text-white shadow-md' : 'bg-white text-gray-600 shadow-sm'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {form.type === 'Violence ou Agression' && (
              <div className="mt-3 bg-[#FF3B30]/10 rounded-xl p-3 border border-[#FF3B30]/20 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#FF3B30] flex-shrink-0" />
                <p className="text-xs text-[#FF3B30]">Agression en cours ? Activez le SOS Urgence immédiatement.</p>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Faits */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B2D6B] mb-2">Détails des faits</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Date des faits</label>
                <input type="date" value={form.dateFaits} onChange={(e) => updateForm('dateFaits', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white rounded-xl text-sm border border-gray-100 outline-none focus:border-[#1E5EFF]" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">Heure</label>
                <input type="time" value={form.heureFaits} onChange={(e) => updateForm('heureFaits', e.target.value)}
                  className="w-full px-3 py-2.5 bg-white rounded-xl text-sm border border-gray-100 outline-none focus:border-[#1E5EFF]" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Lieu des faits</label>
              <input type="text" value={form.lieuFaits} onChange={(e) => updateForm('lieuFaits', e.target.value)}
                placeholder="Province, Commune, Quartier, Avenue" className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-100 outline-none focus:border-[#1E5EFF]" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Description des faits (min. 50 caractères)</label>
              <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Décrivez les faits en détail..." rows={5}
                className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-100 outline-none focus:border-[#1E5EFF] resize-none" />
              <p className="text-[10px] text-gray-400 mt-1">{form.description.length} / 50 caractères minimum</p>
            </div>
          </div>
        )}

        {/* Step 3: Suspect */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B2D6B] mb-2">Identification du suspect</h3>
            <div className="flex gap-3">
              <button onClick={() => updateForm('suspectStatus', 'inconnu')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${form.suspectStatus === 'inconnu' ? 'bg-[#1E5EFF] text-white' : 'bg-white text-gray-600'}`}>
                Inconnu (Plainte contre X)
              </button>
              <button onClick={() => updateForm('suspectStatus', 'identifie')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${form.suspectStatus === 'identifie' ? 'bg-[#1E5EFF] text-white' : 'bg-white text-gray-600'}`}>
                Identifié
              </button>
            </div>
            {form.suspectStatus === 'identifie' && (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Nom du suspect</label>
                  <input type="text" value={form.suspectNom} onChange={(e) => updateForm('suspectNom', e.target.value)}
                    placeholder="Nom du suspect" className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-100 outline-none focus:border-[#1E5EFF]" />
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1 block">Description physique</label>
                  <textarea value={form.suspectDescription} onChange={(e) => updateForm('suspectDescription', e.target.value)}
                    placeholder="Description physique du suspect..." rows={3}
                    className="w-full px-4 py-3 bg-white rounded-xl text-sm border border-gray-100 outline-none focus:border-[#1E5EFF] resize-none" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preuves */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B2D6B] mb-2">Pièces justificatives</h3>
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <button key={i} className="h-24 bg-white rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 shadow-sm">
                  <Upload className="w-6 h-6 text-gray-300" />
                  <span className="text-[9px] text-gray-400">Fichier {i}</span>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400">Jusqu&apos;à 5 fichiers — Photos, PDF, Vidéos, Audios — Maximum 50 MB total</p>
          </div>
        )}

        {/* Step 5: Validation */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#0B2D6B] mb-2">Récapitulatif</h3>
            <div className="bg-white rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex justify-between"><span className="text-xs text-gray-400">Type</span><span className="text-xs font-medium text-[#0B2D6B]">{form.type || 'Non défini'}</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-400">Date</span><span className="text-xs font-medium text-[#0B2D6B]">{form.dateFaits || 'Non définie'}</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-400">Lieu</span><span className="text-xs font-medium text-[#0B2D6B]">{form.lieuFaits || 'Non défini'}</span></div>
              <div className="flex justify-between"><span className="text-xs text-gray-400">Suspect</span><span className="text-xs font-medium text-[#0B2D6B]">{form.suspectStatus === 'inconnu' ? 'Plainte contre X' : form.suspectNom}</span></div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-200">
              <p className="text-xs text-yellow-800">
                <strong>Mention légale :</strong> Toute fausse déclaration est punie par la loi. En cochant la case ci-dessous, vous certifiez sur l&apos;honneur l&apos;exactitude des informations fournies.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.engagement} onChange={(e) => updateForm('engagement', e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-[#1E5EFF]" />
              <span className="text-xs text-gray-500">Je certifie sur l&apos;honneur que les informations ci-dessus sont exactes et complètes.</span>
            </label>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => {
            if (step < 5) setStep(step + 1)
            else setSubmitted(true)
          }}
          disabled={step === 1 && !form.type}
          className="w-full py-3.5 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm active:scale-[0.98] transition-transform shadow-lg shadow-blue-500/25 disabled:opacity-40"
        >
          {step < 5 ? 'Continuer' : 'Soumettre la plainte'}
        </button>
      </div>
    </div>
  )
}
