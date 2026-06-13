'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Send, Bot, User, Sparkles, Mic } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  time: string
}

const suggestedQuestions = [
  'Comment déposer une plainte ?',
  'Quels documents sont requis pour une déclaration de perte ?',
  'Comment contacter le commissariat le plus proche ?',
  'Quelles sont les procédures en cas de vol ?',
]

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'assistant',
    content: 'Bonjour ! Je suis l\'assistant virtuel de la PNC. Comment puis-je vous aider aujourd\'hui ? Je peux répondre à vos questions sur les procédures administratives, le dépôt de plainte, les documents requis et les conseils de sécurité.',
    time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
  },
]

// Fallback responses quand l'API n'est pas disponible
const fallbackResponses: Record<string, string> = {
  plainte: 'Pour déposer une plainte en ligne, utilisez la section "Dépôt de plainte" dans l\'application. Vous serez guidé en 5 étapes : Type de plainte > Détails des faits > Identification du suspect > Pièces justificatives > Validation. Vous recevrez un numéro de dossier unique au format PNCP-2026-XXXXX.',
  vol: 'En cas de vol, signalez immédiatement l\'incident via la section "Signalement" ou activez le SOS si vous êtes en danger. Déposez ensuite une plainte en ligne ou au commissariat le plus proche. Conservez tous les preuves et témoignages.',
  document: 'Les documents requis varient selon la démarche. Pour une déclaration de perte : pièce d\'identité. Pour une plainte : pièce d\'identité + preuves éventuelles. Pour une vérification de véhicule : numéro de plaque ou de châssis.',
  commissariat: 'Utilisez la section "Commissariats" pour trouver le commissariat le plus proche. Vous pouvez les rechercher par nom ou localisation, obtenir l\'itinéraire GPS et consulter les horaires d\'ouverture.',
  urgence: 'En cas d\'urgence, appuyez immédiatement sur le bouton SOS de l\'application. Vous pouvez aussi appeler directement : Police (117), SAMU (118), Pompiers (119).',
  contact: 'Vous pouvez contacter la PNC via : Police (117), ou en vous rendant au commissariat le plus proche. L\'application PNC Alerte vous permet aussi de déposer des plaintes et de signaler des incidents en ligne.',
  sos: 'Le bouton SOS est accessible depuis l\'écran d\'accueil ou le menu de navigation. En cas d\'urgence, appuyez dessus pour envoyer votre position et alerter les services de secours. Vous pouvez aussi appeler le 117 (Police), 118 (SAMU) ou 119 (Pompiers).',
  alerte: 'Pour créer une alerte, utilisez la section "Signalement" de l\'application. Vous pouvez signaler un incident avec ou sans compte, de manière anonyme si vous le souhaitez. Décrivez l\'incident, ajoutez des photos et envoyez.',
  disparition: 'Pour signaler une disparition, rendez-vous dans la section "Personnes disparues". Vous pourrez fournir les informations de la personne (nom, âge, signes distinctifs) et une photo. Signalez toujours une disparition suspecte le plus rapidement possible.',
  verification: 'La vérification de véhicule est accessible depuis l\'accueil. Entrez le numéro de plaque d\'immatriculation ou le numéro de châssis pour vérifier si le véhicule est signalé volé ou soupçonneux.',
  amende: 'Consultez vos amendes dans la section "Amendes" de l\'application. Vous pouvez les payer en ligne via MPesa, carte bancaire ou en espèces au guichet. Vérifiez régulièrement votre dossier.',
}

function getFallbackReply(message: string): string {
  const lower = message.toLowerCase()
  for (const [key, value] of Object.entries(fallbackResponses)) {
    if (lower.includes(key)) return value
  }
  return 'Je suis l\'assistant IA de la PNC Alerte. Je suis là pour vous aider avec les procédures administratives, le dépôt de plainte, les vérifications de documents et les conseils de sécurité. Comment puis-je vous aider ?'
}

export default function AssistantScreen() {
  const { navigate, darkMode } = useAppStore()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Saisie vocale via Web Speech API
  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('La saisie vocale n\'est pas disponible sur cet appareil')
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'fr-FR'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => setIsListening(true)
    recognition.onend = () => setIsListening(false)

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
    }

    recognition.onerror = () => setIsListening(false)
    recognition.start()
  }

  const sendMessage = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      // Essayer l'API route d'abord (mode web)
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.reply || 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.',
          time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        }
        setMessages((prev) => [...prev, assistantMessage])
      } else {
        throw new Error('API non disponible')
      }
    } catch {
      // Fallback : réponses locales (mode Capacitor / hors ligne)
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1200))
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getFallbackReply(msg),
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${bg} flex flex-col pb-20 transition-colors`}>
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-4 px-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="w-9 h-9 rounded-full bg-[#1E5EFF] flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white text-base font-bold">Assistant IA PNC</h1>
            <p className="text-blue-200 text-[10px]">En ligne — Réponses instantanées</p>
          </div>
          <div className="ml-auto">
            <Sparkles className="w-5 h-5 text-yellow-400" />
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 px-4 py-4 overflow-y-auto space-y-3">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-[#1E5EFF] flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-4 h-4 text-white" />
              </div>
            )}
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
              msg.role === 'user'
                ? 'bg-[#1E5EFF] text-white rounded-br-md'
                : `${cardBg} ${darkMode ? 'text-gray-200' : 'text-gray-700'} shadow-sm rounded-bl-md`
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-white/50' : textMuted}`}>
                {msg.time}
              </p>
            </div>
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-[#0B2D6B] flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-2 justify-start">
            <div className="w-7 h-7 rounded-full bg-[#1E5EFF] flex items-center justify-center flex-shrink-0 mt-1">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div className={`${cardBg} rounded-2xl rounded-bl-md px-4 py-3 shadow-sm`}>
              <div className="flex gap-1">
                <div className={`w-2 h-2 ${darkMode ? 'bg-gray-500' : 'bg-gray-300'} rounded-full animate-bounce`} style={{ animationDelay: '0ms' }} />
                <div className={`w-2 h-2 ${darkMode ? 'bg-gray-500' : 'bg-gray-300'} rounded-full animate-bounce`} style={{ animationDelay: '150ms' }} />
                <div className={`w-2 h-2 ${darkMode ? 'bg-gray-500' : 'bg-gray-300'} rounded-full animate-bounce`} style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q) => (
              <button
                key={q}
                onClick={() => sendMessage(q)}
                className={`px-3 py-1.5 ${cardBg} rounded-full text-xs text-[#1E5EFF] font-medium shadow-sm active:scale-95 transition-transform`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className={`px-4 pb-2 pt-2 ${cardBg} border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'} transition-colors`}>
        <div className="flex items-center gap-2">
          {/* Microphone */}
          <button
            onClick={startVoiceInput}
            className={`w-11 h-11 rounded-xl flex items-center justify-center active:scale-95 transition-transform ${
              isListening ? 'bg-red-500 animate-pulse' : `${darkMode ? 'bg-[#1a2d5a]' : 'bg-gray-100'}`
            }`}
          >
            <Mic className={`w-5 h-5 ${isListening ? 'text-white' : darkMode ? 'text-white' : 'text-gray-500'}`} />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Posez votre question..."
            className={`flex-1 px-4 py-3 ${bg} rounded-xl text-sm outline-none ${darkMode ? 'text-white' : ''}`}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
            className="w-11 h-11 bg-[#1E5EFF] rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 transition-transform"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  )
}
