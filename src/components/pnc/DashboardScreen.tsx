'use client'

import { useAppStore, type Screen } from '@/lib/store'
import {
  AlertTriangle, FileText, Bell, Shield, MapPin,
  MessageCircle, CreditCard, Search, Users, Phone,
  BookOpen, Safe, ChevronRight, TrendingUp, Clock
} from 'lucide-react'

const quickActions: { icon: typeof FileText; label: string; screen: Screen; color: string; bg: string }[] = [
  { icon: AlertTriangle, label: 'Signaler', screen: 'signalement', color: '#FF3B30', bg: '#FFF0EF' },
  { icon: Bell, label: 'Mes Alertes', screen: 'alertes', color: '#1E5EFF', bg: '#EBF0FF' },
  { icon: BookOpen, label: 'Conseils', screen: 'conseils', color: '#0B9D5A', bg: '#EDFFF5' },
  { icon: MapPin, label: 'Commissariat', screen: 'commissariats', color: '#F59E0B', bg: '#FFF8EB' },
  { icon: MessageCircle, label: 'Assistant IA', screen: 'assistant', color: '#8B5CF6', bg: '#F3F0FF' },
  { icon: FileText, label: 'Plainte', screen: 'plainte', color: '#EC4899', bg: '#FDF2F8' },
  { icon: Search, label: 'Vérification', screen: 'verification-identite', color: '#06B6D4', bg: '#ECFEFF' },
  { icon: Users, label: 'Disparus', screen: 'personnes-disparues', color: '#F97316', bg: '#FFF7ED' },
]

const recentAlerts = [
  { id: '1', title: 'Avis de recherche — Cambrioleur présumé', type: 'Recherche', time: 'Il y a 2h', severity: 'high' },
  { id: '2', title: 'Alerte sécurité — Quartier Matonge', type: 'Sécurité', time: 'Il y a 4h', severity: 'medium' },
  { id: '3', title: 'Personne disparue — Kintambo', type: 'Disparition', time: 'Il y a 6h', severity: 'high' },
  { id: '4', title: 'Travaux routiers — Boulevard du 30 Juin', type: 'Info', time: 'Il y a 8h', severity: 'low' },
]

const stats = [
  { label: 'Incidents signalés', value: '1,247', trend: '+12%' },
  { label: 'Zones surveillées', value: '89', trend: '+3' },
  { label: 'Commissariats', value: '42', trend: '' },
]

export default function DashboardScreen() {
  const { navigate, userName, setSelectedAlertId } = useAppStore()

  const firstName = userName ? userName.split(' ')[0] : 'Citoyen'

  return (
    <div className="min-h-screen bg-[#F5F6FA] pb-20">
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-[-40px] right-[-40px] w-40 h-40 rounded-full bg-[#1E5EFF]/20" />
        <div className="absolute bottom-[-20px] left-[30%] w-20 h-20 rounded-full bg-white/5" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-blue-200 text-xs">Bienvenue,</p>
              <h1 className="text-white text-xl font-bold">{firstName} 👋</h1>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('notifications')}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center relative"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF3B30] rounded-full text-[9px] text-white flex items-center justify-center font-bold">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SOS Button */}
      <div className="px-6 -mt-14 mb-4 relative z-20">
        <button
          onClick={() => navigate('sos')}
          className="w-full bg-white rounded-2xl shadow-xl p-4 flex items-center gap-4 active:scale-[0.98] transition-transform"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FF3B30]/10 flex items-center justify-center flex-shrink-0">
            <div className="w-12 h-12 rounded-full bg-[#FF3B30] flex items-center justify-center shadow-lg shadow-red-500/30">
              <Phone className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-[#0B2D6B] font-bold text-base">SOS Urgence</h3>
            <p className="text-gray-400 text-xs">Appuyez en cas d&apos;urgence pour alerter la PNC</p>
          </div>
          <ChevronRight className="w-5 h-5 text-gray-300" />
        </button>
      </div>

      {/* Stats */}
      <div className="px-6 mb-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl p-3 shadow-sm">
              <p className="text-lg font-bold text-[#0B2D6B]">{s.value}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{s.label}</p>
              {s.trend && (
                <div className="flex items-center gap-0.5 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] text-green-500 font-medium">{s.trend}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-4">
        <h3 className="text-sm font-bold text-[#0B2D6B] mb-3">Accès rapide</h3>
        <div className="grid grid-cols-4 gap-3">
          {quickActions.map(({ icon: Icon, label, screen, color, bg }) => (
            <button
              key={screen}
              onClick={() => navigate(screen)}
              className="flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
            >
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: bg }}
              >
                <Icon className="w-5 h-5" style={{ color }} />
              </div>
              <span className="text-[10px] text-gray-500 font-medium text-center leading-tight">
                {label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-[#0B2D6B]">Alertes récentes</h3>
          <button onClick={() => navigate('alertes')} className="text-xs text-[#1E5EFF] font-medium">
            Voir tout
          </button>
        </div>
        <div className="space-y-2">
          {recentAlerts.map((alert) => (
            <button
              key={alert.id}
              onClick={() => { setSelectedAlertId(alert.id); navigate('alerte-detail') }}
              className="w-full bg-white rounded-xl p-3 flex items-start gap-3 shadow-sm active:scale-[0.99] transition-transform text-left"
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                  alert.severity === 'high'
                    ? 'bg-[#FF3B30]/10'
                    : alert.severity === 'medium'
                    ? 'bg-[#F59E0B]/10'
                    : 'bg-[#1E5EFF]/10'
                }`}
              >
                <Shield
                  className={`w-5 h-5 ${
                    alert.severity === 'high'
                      ? 'text-[#FF3B30]'
                      : alert.severity === 'medium'
                      ? 'text-[#F59E0B]'
                      : 'text-[#1E5EFF]'
                  }`}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#0B2D6B] truncate">{alert.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      alert.severity === 'high'
                        ? 'bg-[#FF3B30]/10 text-[#FF3B30]'
                        : alert.severity === 'medium'
                        ? 'bg-[#F59E0B]/10 text-[#F59E0B]'
                        : 'bg-[#1E5EFF]/10 text-[#1E5EFF]'
                    }`}
                  >
                    {alert.type}
                  </span>
                  <span className="text-[10px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {alert.time}
                  </span>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 mt-1 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
