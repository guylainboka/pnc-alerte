/**
 * Data Service — PNC Alerte
 * =========================
 * Service unifié pour les données du citoyen connecté :
 *  - SOS, Convocations, Notifications, Personnes disparues, Alertes officielles
 *  - Souscriptions Realtime (Supabase) pour mise à jour live
 *
 * Toutes les fonctions retournent des données typées.
 * Si Supabase n'est pas configuré, retournent des tableaux vides (mode démo).
 */

import { getSupabase } from './supabase-client'
import { getCurrentUserId } from './auth-service'

// ============================================================
// TYPES
// ============================================================

export interface SOSCall {
  id: string
  reference: string
  status: 'actif' | 'en-route' | 'sur-place' | 'cloture' | 'annule'
  latitude?: number
  longitude?: number
  locationText?: string
  notes?: string
  createdAt: string
  closedAt?: string
  responseTimeSeconds?: number
}

export interface Convocation {
  id: string
  reference?: string
  titre: string
  dateConvocation: string // YYYY-MM-DD
  heure: string // HH:MM:SS
  lieu: string
  officier?: string
  motif?: string
  status: 'pending' | 'confirmed' | 'missed' | 'completed'
  createdAt: string
}

export type NotificationType = 'alerte' | 'info' | 'urgence' | 'succes' | 'rappel'

export interface NotificationItem {
  id: string
  type: NotificationType
  titre: string
  message: string
  read: boolean
  screenTarget?: string
  relatedId?: string
  createdAt: string
}

export interface PersonneDisparue {
  id: string
  reference?: string
  nomComplet: string
  age?: number
  sexe?: 'M' | 'F'
  description?: string
  derniereVueLieu?: string
  derniereVueDate?: string
  photoUrl?: string
  contactTelephone: string
  status: 'recherche' | 'retrouve' | 'alerte'
  createdAt: string
}

export interface OfficialAlert {
  id: string
  titre: string
  type: string
  severity: 'high' | 'medium' | 'low'
  description?: string
  location?: string
  source?: string
  reference?: string
  active: boolean
  createdAt: string
}

// ============================================================
// SOS
// ============================================================

export async function getMySOSCalls(): Promise<SOSCall[]> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()
  if (!userId || !supabase) return []

  const { data, error } = await supabase
    .from('sos_calls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    reference: row.reference,
    status: row.status,
    latitude: row.latitude,
    longitude: row.longitude,
    locationText: row.location_text,
    notes: row.notes,
    createdAt: row.created_at,
    closedAt: row.closed_at,
    responseTimeSeconds: row.response_time_seconds,
  }))
}

// ============================================================
// CONVOCATIONS
// ============================================================

export async function getMyConvocations(): Promise<Convocation[]> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()
  if (!userId || !supabase) return []

  const { data, error } = await supabase
    .from('convocations')
    .select('*')
    .eq('user_id', userId)
    .order('date_convocation', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    reference: row.reference,
    titre: row.titre,
    dateConvocation: row.date_convocation,
    heure: row.heure,
    lieu: row.lieu,
    officier: row.officier,
    motif: row.motif,
    status: row.status,
    createdAt: row.created_at,
  }))
}

// ============================================================
// NOTIFICATIONS
// ============================================================

export async function getMyNotifications(unreadOnly = false): Promise<NotificationItem[]> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()
  if (!userId || !supabase) return []

  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(100)

  if (unreadOnly) query = query.eq('read', false)

  const { data, error } = await query
  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    type: row.type as NotificationType,
    titre: row.titre,
    message: row.message,
    read: row.read,
    screenTarget: row.screen_target,
    relatedId: row.related_id,
    createdAt: row.created_at,
  }))
}

export async function markNotificationAsRead(id: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return
  await supabase.from('notifications').update({ read: true }).eq('id', id)
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()
  if (!supabase || !userId) return
  await supabase.from('notifications').update({ read: true }).eq('user_id', userId).eq('read', false)
}

// ============================================================
// PERSONNES DISPARUES
// ============================================================

export async function getPersonnesDisparues(activeOnly = true): Promise<PersonneDisparue[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  let query = supabase
    .from('personnes_disparues')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (activeOnly) query = query.in('status', ['recherche', 'alerte'])

  const { data, error } = await query
  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    reference: row.reference,
    nomComplet: row.nom_complet,
    age: row.age,
    sexe: row.sexe,
    description: row.description,
    derniereVueLieu: row.derniere_vue_lieu,
    derniereVueDate: row.derniere_vue_date,
    photoUrl: row.photo_url,
    contactTelephone: row.contact_telephone,
    status: row.status,
    createdAt: row.created_at,
  }))
}

// ============================================================
// ALERTES OFFICIELLES
// ============================================================

export async function getOfficialAlerts(activeOnly = true): Promise<OfficialAlert[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  let query = supabase
    .from('alertes_officielles')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (activeOnly) query = query.eq('active', true)

  const { data, error } = await query
  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    titre: row.titre,
    type: row.type,
    severity: row.severity,
    description: row.description,
    location: row.location,
    source: row.source,
    reference: row.reference,
    active: row.active,
    createdAt: row.created_at,
  }))
}

// ============================================================
// REALTIME HOOKS
// ============================================================

/**
 * Souscrit aux changements Realtime sur une table pour l'utilisateur courant.
 * Retourne une fonction de désabonnement.
 *
 * @example
 * const unsubscribe = subscribeToTable('notifications', (payload) => {
 *   console.log('Nouveau changement:', payload)
 *   refreshNotifications()
 * })
 * // Plus tard : unsubscribe()
 */
export function subscribeToTable(
  table: 'notifications' | 'convocations' | 'sos_calls' | 'alertes_officielles' | 'personnes_disparues' | 'signalements' | 'plaintes',
  callback: (payload: { eventType: string; new: Record<string, unknown>; old: Record<string, unknown> }) => void
): () => void {
  const supabase = getSupabase()
  if (!supabase) return () => {}

  const channel = supabase
    .channel(`pnc-${table}-${Date.now()}`)
    .on('postgres_changes',
      { event: '*', schema: 'public', table },
      (payload) => {
        callback({
          eventType: payload.eventType,
          new: (payload.new as Record<string, unknown>) || {},
          old: (payload.old as Record<string, unknown>) || {},
        })
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Helper pour formatter une date ISO en format lisible fr.
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffH = Math.floor(diffMin / 60)
  const diffD = Math.floor(diffH / 24)

  if (diffMin < 1) return "À l'instant"
  if (diffMin < 60) return `Il y a ${diffMin} min`
  if (diffH < 24) return `Il y a ${diffH}h`
  if (diffD === 1) return 'Hier'
  if (diffD < 7) return `Il y a ${diffD}j`
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Helper pour formatter une date ISO en format court.
 */
export function formatDate(isoDate: string): string {
  if (!isoDate) return ''
  const date = new Date(isoDate)
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

/**
 * Helper pour formatter une heure HH:MM:SS en HH:MM.
 */
export function formatHeure(heure: string): string {
  if (!heure) return ''
  return heure.substring(0, 5)
}

// ============================================================
// EXPORT GROUPÉ
// ============================================================

export const dataService = {
  // SOS
  getMySOSCalls,
  // Convocations
  getMyConvocations,
  // Notifications
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  // Personnes disparues
  getPersonnesDisparues,
  // Alertes officielles
  getOfficialAlerts,
  // Realtime
  subscribeToTable,
  // Utils
  formatRelativeTime,
  formatDate,
  formatHeure,
}
