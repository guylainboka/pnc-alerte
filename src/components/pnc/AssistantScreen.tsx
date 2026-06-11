'use client'

import { useAppStore } from '@/lib/store'
import { ChevronLeft, Send, Bot, User, Sparkles } from 'lucide-react'
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

export default function AssistantScreen() {
  const { navigate } = useAppStore()
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg }),
      })
      const data = await res.json()
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply || 'Désolé, je n\'ai pas pu traiter votre demande. Veuillez réessayer.',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, assistantMessage])
    } catch {
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Je suis l\'assistant IA de la PNC Alerte. Pour déposer une plainte, rendez-vous dans la section "Dépôt de plainte" de l\'application. Vous pouvez également vous rendre au commissariat le plus proche muni de votre pièce d\'identité et des documents justificatifs. En cas d\'urgence, utilisez le bouton SOS.',
        time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex flex-col pb-20">
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
                : 'bg-white text-gray-700 shadow-sm rounded-bl-md'
            }`}>
              <p className="text-sm leading-relaxed">{msg.content}</p>
              <p className={`text-[9px] mt-1 ${msg.role === 'user' ? 'text-white/50' : 'text-gray-300'}`}>
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
            <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
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
                className="px-3 py-1.5 bg-white rounded-full text-xs text-[#1E5EFF] font-medium shadow-sm active:scale-95 transition-transform"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-2 pt-2 bg-white border-t border-gray-100">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Posez votre question..."
            className="flex-1 px-4 py-3 bg-[#F5F6FA] rounded-xl text-sm outline-none"
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
