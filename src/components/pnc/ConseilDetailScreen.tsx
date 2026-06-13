'use client'

import { useAppStore } from '@/lib/store'
import { conseilCategories, type ConseilArticle } from './ConseilsScreen'
import { ChevronLeft, Clock, Share2, Bookmark, CheckCircle } from 'lucide-react'
import { useState } from 'react'

function findArticle(id: string): (ConseilArticle & { categoryLabel: string; categoryColor: string }) | null {
  for (const cat of conseilCategories) {
    const article = cat.articles.find((a) => a.id === id)
    if (article) return { ...article, categoryLabel: cat.label, categoryColor: cat.color }
  }
  return null
}

export default function ConseilDetailScreen() {
  const { goBack, selectedConseilId, darkMode } = useAppStore()
  const [readItems, setReadItems] = useState<Set<string>>(new Set())

  const article = selectedConseilId ? findArticle(selectedConseilId) : null

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-[#F5F6FA]'

  const toggleRead = (item: string) => {
    setReadItems((prev) => {
      const next = new Set(prev)
      if (next.has(item)) next.delete(item)
      else next.add(item)
      return next
    })
  }

  const handleShare = async () => {
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: `${article.title} — ${article.categoryLabel}`,
          url: window.location.href,
        })
      } catch {
        // User cancelled or not supported
      }
    }
  }

  if (!article) {
    return (
      <div className={`min-h-screen ${bg} flex flex-col items-center justify-center px-6 transition-colors`}>
        <p className={textMuted}>Article introuvable</p>
        <button onClick={goBack} className="mt-4 text-[#1E5EFF] text-sm font-medium">
          Retour
        </button>
      </div>
    )
  }

  const totalItems = article.sections.reduce((sum, s) => sum + s.items.length, 0)
  const readCount = article.sections.reduce(
    (sum, s) => sum + s.items.filter((i) => readItems.has(`${article.id}-${i}`)).length,
    0
  )
  const progress = totalItems > 0 ? (readCount / totalItems) * 100 : 0

  return (
    <div className={`min-h-screen ${bg} pb-8 transition-colors`}>
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-6 px-6">
        <div className="flex items-center justify-between mb-3">
          <button onClick={goBack} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <div className="flex gap-2">
            <button onClick={handleShare} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
        <span
          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
          style={{ backgroundColor: `${article.categoryColor}25`, color: '#fff' }}
        >
          {article.categoryLabel}
        </span>
        <h1 className="text-white text-xl font-bold mt-2 leading-tight">{article.title}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-blue-200 text-xs flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" /> {article.readTime}
          </span>
          <span className="text-blue-200 text-xs">{totalItems} recommandations</span>
        </div>
        {/* Progress bar */}
        <div className="mt-4 bg-white/10 rounded-full h-1.5 overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-blue-200 text-[10px] mt-1">
          {readCount}/{totalItems} lus
        </p>
      </div>

      {/* Content */}
      <div className="px-6 pt-4 space-y-5">
        {article.sections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <p className={`text-sm ${textMuted} mb-3 leading-relaxed`}>{section.title}</p>
            )}
            <div className="space-y-2">
              {section.items.map((item, iIdx) => {
                const key = `${article.id}-${item}`
                const isRead = readItems.has(key)
                return (
                  <button
                    key={iIdx}
                    onClick={() => toggleRead(key)}
                    className={`w-full ${cardBg} rounded-xl p-3.5 text-left flex items-start gap-3 active:scale-[0.99] transition-all ${
                      isRead ? 'opacity-70' : ''
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {isRead ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <div
                          className="w-5 h-5 rounded-full border-2"
                          style={{ borderColor: article.categoryColor }}
                        />
                      )}
                    </div>
                    <p className={`text-sm ${isRead ? 'line-through ' + textMuted : textPrimary}`}>
                      {item}
                    </p>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
