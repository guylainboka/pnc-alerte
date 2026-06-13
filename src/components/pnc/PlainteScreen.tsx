'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, ChevronRight, Upload, FileText, AlertTriangle, Camera, X, Share2 } from 'lucide-react'
import { useState, useRef } from 'react'

const complaintTypes = [
  'Vol simple', 'Escroquerie ou Abus de confiance', 'Vandalisme',
  'Menaces, Harcèlement ou Cybercriminalité', 'Violence ou Agression', 'Perte de documents officiels',
]

export default function PlainteScreen() {
  const { navigate, darkMode, addUserAlert } = useAppStore()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    type: '', dateFaits: '', heureFaits: '', lieuFaits: '', description: '',
    suspectStatus: 'inconnu', suspectNom: '', suspectDescription: '',
    engagement: false,
  })
  const [submitted, setSubmitted] = useState(false)
  const [submittedRef, setSubmittedRef] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const updateForm = (field: string, value: string | boolean) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setAttachments((prev) => [...prev, ev.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = () => {
    const ref = `PLT-2026-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
    setSubmittedRef(ref)
    addUserAlert({
      id: `UA-${Date.now()}`,
      type: 'plainte',
      title: `Plainte: ${form.type || 'Non défini'}`,
      status: 'en-attente',
      reference: ref,
      date: new Date().toISOString().split('T')[0],
      description: form.description || form.type,
      updates: [
        { date: new Date().toISOString(), status: 'Reçu', message: 'Plainte enregistrée au commissariat' },
        { date: new Date().toISOString(), status: 'En attente', message: 'En attente de validation par un officier de police judiciaire' },
      ],
    })
    setSubmitted(true)
  }

  const stepLabels = ['Type', 'Faits', 'Suspect', 'Preuves', 'Validation']

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const inputBg = darkMode ? 'bg-[#0a1a3a] border-[#1a3f8a] text-white' : 'bg-white border-gray-100'

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Plainte PNC — ${submittedRef}`,
          text: `Référence: ${submittedRef}\nType: ${form.type}\nStatut: En attente`,
        })
      } catch {}
    }
  }

  if (submitted) {
    return (
      <div className={`min-h-screen ${bg} flex flex-col items-center justify-center px-6 transition-colors`}>
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mb-4">
          <FileText className="w-10 h-10 text-green-600" />
        </div>
        <h2 className={`text-lg font-bold ${textPrimary} mb-2`}>Plainte déposée !</h2>
        <p className={`text-sm ${textMuted} text-center mb-2`}>
          N° de dossier : <span className="font-mono font-bold text-[#1E5EFF]">{submittedRef}</span>
        </p>
        <p className={`text-xs ${textMuted} text-center mb-1`}>Statut : <span className="text-yellow-600 font-medium">En attente</span></p>
        <p className={`text-xs ${textMuted} text-center mb-6`}>Votre plainte a été routée vers le commissariat de la commune des faits.</p>
        <div className={`${cardBg} rounded-xl p-4 w-full max-w-sm shadow-sm mb-4 transition-colors`}>
          <div className={`flex items-center gap-2 text-xs ${textMuted}`}>
            <FileText className="w-4 h-4 text-[#1E5EFF]" />
            <span>Récépissé PDF sera disponible après validation</span>
          </div>
        </div>
        <div className="flex gap-3 w-full max-w-sm">
          <button onClick={() => navigate('mes-alertes')} className="flex-1 py-3 bg-[#0B9D5A] text-white rounded-xl font-semibold text-sm">
            Voir le suivi
          </button>
          <button onClick={() => navigate('dashboard')} className="flex-1 py-3 bg-[#1E5EFF] text-white rounded-xl font-semibold text-sm">
            Accueil
          </button>
        </div>
        <button onClick={handleShare} className="mt-4 flex items-center gap-2 text-[#1E5EFF] text-sm font-medium">
          <Share2 className="w-4 h-4" /> Partager la référence
        </button>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col pb-6 transition-colors`}>
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
            <h3 className={`text-sm font-bold ${textPrimary} mb-3`}>Type de plainte</h3>
            <div className="space-y-2">
              {complaintTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => updateForm('type', type)}
                  className={`w-full p-3 rounded-xl text-left text-sm transition-all ${
                    form.type === type ? 'bg-[#1E5EFF] text-white shadow-md' : `${cardBg} ${darkMode ? 'text-gray-300' : 'text-gray-600'} shadow-sm`
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
            {form.type === 'Violence ou Agression' && (
              <button
                onClick={() => navigate('sos')}
                className="mt-3 w-full bg-[#FF3B30]/10 rounded-xl p-3 border border-[#FF3B30]/20 flex items-center gap-2 active:scale-[0.98] transition-transform"
              >
                <AlertTriangle className="w-4 h-4 text-[#FF3B30] flex-shrink-0" />
                <p className="text-xs text-[#FF3B30]">Agression en cours ? Activez le SOS Urgence immédiatement.</p>
              </button>
            )}
          </div>
        )}

        {/* Step 2: Faits */}
        {step === 2 && (
          <div className="space-y-4">
            <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Détails des faits</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={`text-xs font-medium ${textMuted} mb-1 block`}>Date des faits</label>
                <input type="date" value={form.dateFaits} onChange={(e) => updateForm('dateFaits', e.target.value)}
                  className={`w-full px-3 py-2.5 ${inputBg} rounded-xl text-sm border outline-none focus:border-[#1E5EFF]`} />
              </div>
              <div>
                <label className={`text-xs font-medium ${textMuted} mb-1 block`}>Heure</label>
                <input type="time" value={form.heureFaits} onChange={(e) => updateForm('heureFaits', e.target.value)}
                  className={`w-full px-3 py-2.5 ${inputBg} rounded-xl text-sm border outline-none focus:border-[#1E5EFF]`} />
              </div>
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1 block`}>Lieu des faits</label>
              <input type="text" value={form.lieuFaits} onChange={(e) => updateForm('lieuFaits', e.target.value)}
                placeholder="Province, Commune, Quartier, Avenue" className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border outline-none focus:border-[#1E5EFF]`} />
            </div>
            <div>
              <label className={`text-xs font-medium ${textMuted} mb-1 block`}>Description des faits (min. 50 caractères)</label>
              <textarea value={form.description} onChange={(e) => updateForm('description', e.target.value)}
                placeholder="Décrivez les faits en détail..." rows={5}
                className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border outline-none focus:border-[#1E5EFF] resize-none`} />
              <p className={`text-[10px] ${textMuted} mt-1`}>{form.description.length} / 50 caractères minimum</p>
            </div>
          </div>
        )}

        {/* Step 3: Suspect */}
        {step === 3 && (
          <div className="space-y-4">
            <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Identification du suspect</h3>
            <div className="flex gap-3">
              <button onClick={() => updateForm('suspectStatus', 'inconnu')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${form.suspectStatus === 'inconnu' ? 'bg-[#1E5EFF] text-white' : `${cardBg} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}`}>
                Inconnu (Plainte contre X)
              </button>
              <button onClick={() => updateForm('suspectStatus', 'identifie')}
                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${form.suspectStatus === 'identifie' ? 'bg-[#1E5EFF] text-white' : `${cardBg} ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}`}>
                Identifié
              </button>
            </div>
            {form.suspectStatus === 'identifie' && (
              <div className="space-y-3">
                <div>
                  <label className={`text-xs font-medium ${textMuted} mb-1 block`}>Nom du suspect</label>
                  <input type="text" value={form.suspectNom} onChange={(e) => updateForm('suspectNom', e.target.value)}
                    placeholder="Nom du suspect" className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border outline-none focus:border-[#1E5EFF]`} />
                </div>
                <div>
                  <label className={`text-xs font-medium ${textMuted} mb-1 block`}>Description physique</label>
                  <textarea value={form.suspectDescription} onChange={(e) => updateForm('suspectDescription', e.target.value)}
                    placeholder="Description physique du suspect..." rows={3}
                    className={`w-full px-4 py-3 ${inputBg} rounded-xl text-sm border outline-none focus:border-[#1E5EFF] resize-none`} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 4: Preuves - Now functional */}
        {step === 4 && (
          <div className="space-y-4">
            <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Pièces justificatives</h3>

            {/* Preview attachments */}
            {attachments.length > 0 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {attachments.map((att, idx) => (
                  <div key={idx} className="relative flex-shrink-0">
                    <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      {att.startsWith('data:image') ? (
                        <img src={att} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className={`w-full h-full ${cardBg} flex items-center justify-center`}>
                          <FileText className="w-8 h-8 text-[#1E5EFF]" />
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#FF3B30] rounded-full flex items-center justify-center"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/*,.pdf,.doc,.docx,audio/*,video/*" multiple onChange={handleFileChange} className="hidden" />
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={() => fileInputRef.current?.click()}
                className={`h-24 ${cardBg} rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex flex-col items-center justify-center gap-1 shadow-sm transition-colors active:scale-95`}
              >
                <Upload className={`w-6 h-6 ${textMuted}`} />
                <span className={`text-[9px] ${textMuted}`}>Fichier</span>
              </button>
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.capture = 'environment'
                  input.onchange = (e: any) => {
                    const file = e.target?.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = (ev) => setAttachments((prev) => [...prev, ev.target?.result as string])
                      reader.readAsDataURL(file)
                    }
                  }
                  input.click()
                }}
                className={`h-24 ${cardBg} rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex flex-col items-center justify-center gap-1 shadow-sm transition-colors active:scale-95`}
              >
                <Camera className={`w-6 h-6 text-[#1E5EFF]`} />
                <span className={`text-[9px] ${textMuted}`}>Caméra</span>
              </button>
              <div className={`h-24 ${cardBg} rounded-xl border-2 border-dashed ${darkMode ? 'border-gray-600' : 'border-gray-200'} flex flex-col items-center justify-center gap-1 shadow-sm transition-colors`}>
                <span className={`text-2xl`}>📎</span>
                <span className={`text-[9px] ${textMuted}`}>{attachments.length} fichier(s)</span>
              </div>
            </div>
            <p className={`text-[10px] ${textMuted}`}>Jusqu&apos;à 5 fichiers — Photos, PDF, Vidéos, Audios — Maximum 50 MB total</p>
          </div>
        )}

        {/* Step 5: Validation */}
        {step === 5 && (
          <div className="space-y-4">
            <h3 className={`text-sm font-bold ${textPrimary} mb-2`}>Récapitulatif</h3>
            <div className={`${cardBg} rounded-xl p-4 space-y-3 shadow-sm transition-colors`}>
              <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Type</span><span className={`text-xs font-medium ${textPrimary}`}>{form.type || 'Non défini'}</span></div>
              <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Date</span><span className={`text-xs font-medium ${textPrimary}`}>{form.dateFaits || 'Non définie'}</span></div>
              <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Lieu</span><span className={`text-xs font-medium ${textPrimary}`}>{form.lieuFaits || 'Non défini'}</span></div>
              <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Suspect</span><span className={`text-xs font-medium ${textPrimary}`}>{form.suspectStatus === 'inconnu' ? 'Plainte contre X' : form.suspectNom}</span></div>
              <div className="flex justify-between"><span className={`text-xs ${textMuted}`}>Preuves</span><span className={`text-xs font-medium ${textPrimary}`}>{attachments.length} fichier(s)</span></div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 border border-yellow-200 dark:border-yellow-700/30">
              <p className="text-xs text-yellow-800 dark:text-yellow-300">
                <strong>Mention légale :</strong> Toute fausse déclaration est punie par la loi. En cochant la case ci-dessous, vous certifiez sur l&apos;honneur l&apos;exactitude des informations fournies.
              </p>
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" checked={form.engagement} onChange={(e) => updateForm('engagement', e.target.checked)}
                className="mt-1 w-4 h-4 rounded accent-[#1E5EFF]" />
              <span className={`text-xs ${textMuted}`}>Je certifie sur l&apos;honneur que les informations ci-dessus sont exactes et complètes.</span>
            </label>
          </div>
        )}
      </div>

      {/* Bottom button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => {
            if (step < 5) setStep(step + 1)
            else handleSubmit()
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
