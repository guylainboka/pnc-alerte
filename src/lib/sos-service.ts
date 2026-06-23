/**
 * SOS Service — PNC Alerte
 * ========================
 * Gestion des appels SOS, notifications, personnes disparues et Realtime.
 */

import { getSupabase } from './supabase-client'
import { getCurrentUserId } from './auth-service'

export interface SOSCall {
  id: string
  latitude?: number
  longitude?: number
  locationText?: string
  status: 'actif' | 'en-route' | 'sur-place' | 'cloture' | 'annule'
  reference: string
  notes?: string
  createdAt: string
  closedAt?: string
}

export interface Notification {
  id: string
  type: 'alerte' | 'info' | 'urgence' | 'succes' | 'rappel'
  titre: string
  message: string
  read: boolean
  screenTarget?: string
  relatedId?: string
  createdAt: string
}

export interface MissingPerson {
  id: string
  nomComplet: string
  age?: number
  sexe?: 'M' | 'F'
  description?: string
  derniereVueLieu?: string
  derniereVueDate?: string
  photoUrl?: string
  contactTelephone: string
  status: 'recherche' | 'retrouve' | 'alerte'
  reference: string
  createdAt: string
}

function generateReferenceLocal(prefix: string): string {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${rand}`
}

/**
 * Créer un appel SOS
 */
export async function createSOSCall(data: {
  latitude?: number
  longitude?: number
  locationText?: string
}): Promise<{ sosCall: SOSCall | null; error: string | null }> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()

  if (!userId) {
    return { sosCall: null, error: 'Vous devez être connecté' }
  }

  const reference = generateReferenceLocal('SOS')

  if (!supabase) {
    // Mode local : simuler une réponse
    const sosCall: SOSCall = {
      id: 'local-' + Date.now(),
      latitude: data.latitude,
      longitude: data.longitude,
      locationText: data.locationText,
      status: 'actif',
      reference,
      createdAt: new Date().toISOString(),
    }
    return { sosCall, error: null }
  }

  const { data: row, error } = await supabase
    .from('sos_calls')
    .insert({
      user_id: userId,
      latitude: data.latitude,
      longitude: data.longitude,
      location_text: data.locationText,
      reference,
    })
    .select()
    .single()

  if (error) {
    return { sosCall: null, error: error.message }
  }

  const sosCall: SOSCall = {
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    locationText: row.location_text,
    status: row.status,
    reference: row.reference,
    notes: row.notes,
    createdAt: row.created_at,
    closedAt: row.closed_at,
  }

  return { sosCall, error: null }
}

/**
 * S'abonner aux mises à jour d'un SOS (Realtime Supabase ou fallback timer)
 */
export function subscribeToSOSUpdates(
  sosId: string,
  onUpdate: (status: SOSCall['status']) => void
): () => void {
  const supabase = getSupabase()

  // Mode local : simuler des transitions d'état
  if (!supabase) {
    const statuses: SOSCall['status'][] = ['actif', 'en-route', 'sur-place', 'cloture']
    let index = 0
    const timer = setInterval(() => {
      if (index < statuses.length) {
        onUpdate(statuses[index])
        index++
      } else {
        clearInterval(timer)
      }
    }, 8000) // toutes les 8s
    return () => clearInterval(timer)
  }

  // Mode Supabase Realtime
  const channel = supabase
    .channel(`sos-${sosId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'sos_calls',
        filter: `id=eq.${sosId}`,
      },
      (payload: { new: { status: SOSCall['status'] } }) => {
        onUpdate(payload.new.status)
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}

/**
 * Récupère l'historique des SOS de l'utilisateur
 */
export async function getMySOSCalls(): Promise<SOSCall[]> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()

  if (!userId || !supabase) return []

  const { data, error } = await supabase
    .from('sos_calls')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    latitude: row.latitude,
    longitude: row.longitude,
    locationText: row.location_text,
    status: row.status,
    reference: row.reference,
    notes: row.notes,
    createdAt: row.created_at,
    closedAt: row.closed_at,
  }))
}

/**
 * Récupère les notifications de l'utilisateur
 */
export async function getMyNotifications(): Promise<Notification[]> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()

  if (!userId || !supabase) return []

  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    type: row.type,
    titre: row.titre,
    message: row.message,
    read: row.read,
    screenTarget: row.screen_target,
    relatedId: row.related_id,
    createdAt: row.created_at,
  }))
}

/**
 * Marque une notification comme lue
 */
export async function markNotificationRead(notificationId: string): Promise<void> {
  const supabase = getSupabase()
  if (!supabase) return

  await supabase
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId)
}

/**
 * Signaler une personne disparue
 */
export async function createMissingPerson(data: {
  nomComplet: string
  age?: number
  sexe?: 'M' | 'F'
  description?: string
  derniereVueLieu?: string
  derniereVueDate?: string
  photoUrl?: string
  contactTelephone: string
}): Promise<{ missingPerson: MissingPerson | null; error: string | null }> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()

  if (!userId) {
    return { missingPerson: null, error: 'Vous devez être connecté' }
  }

  const reference = generateReferenceLocal('DIS')

  if (!supabase) {
    const missingPerson: MissingPerson = {
      id: 'local-' + Date.now(),
      nomComplet: data.nomComplet,
      age: data.age,
      sexe: data.sexe,
      description: data.description,
      derniereVueLieu: data.derniereVueLieu,
      derniereVueDate: data.derniereVueDate,
      photoUrl: data.photoUrl,
      contactTelephone: data.contactTelephone,
      status: 'recherche',
      reference,
      createdAt: new Date().toISOString(),
    }
    return { missingPerson, error: null }
  }

  const { data: row, error } = await supabase
    .from('personnes_disparues')
    .insert({
      user_id: userId,
      nom_complet: data.nomComplet,
      age: data.age,
      sexe: data.sexe,
      description: data.description,
      derniere_vue_lieu: data.derniereVueLieu,
      derniere_vue_date: data.derniereVueDate,
      photo_url: data.photoUrl,
      contact_telephone: data.contactTelephone,
      reference,
    })
    .select()
    .single()

  if (error) {
    return { missingPerson: null, error: error.message }
  }

  const missingPerson: MissingPerson = {
    id: row.id,
    nomComplet: row.nom_complet,
    age: row.age,
    sexe: row.sexe,
    description: row.description,
    derniereVueLieu: row.derniere_vue_lieu,
    derniereVueDate: row.derniere_vue_date,
    photoUrl: row.photo_url,
    contactTelephone: row.contact_telephone,
    status: row.status,
    reference: row.reference,
    createdAt: row.created_at,
  }

  return { missingPerson, error: null }
}

/**
 * Récupère les personnes disparues (publique pour les utilisateurs connectés)
 */
export async function getMissingPersons(): Promise<MissingPerson[]> {
  const supabase = getSupabase()

  if (!supabase) return []

  const { data, error } = await supabase
    .from('personnes_disparues')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    nomComplet: row.nom_complet,
    age: row.age,
    sexe: row.sexe,
    description: row.description,
    derniereVueLieu: row.derniere_vue_lieu,
    derniereVueDate: row.derniere_vue_date,
    photoUrl: row.photo_url,
    contactTelephone: row.contact_telephone,
    status: row.status,
    reference: row.reference,
    createdAt: row.created_at,
  }))
}

export const sosService = {
  createSOSCall,
  subscribeToSOSUpdates,
  getMySOSCalls,
  getMyNotifications,
  markNotificationRead,
  createMissingPerson,
  getMissingPersons,
}
