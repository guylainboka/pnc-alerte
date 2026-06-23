/**
 * Signalements Service — PNC Alerte
 * =================================
 * Gestion des signalements, plaintes, alertes officielles et upload de photos.
 */

import { getSupabase } from './supabase-client'
import { useAppStore } from './store'
import { getCurrentUserId } from './auth-service'

export interface Signalement {
  id: string
  type: 'vol' | 'agression' | 'violence' | 'trafic' | 'corruption' | 'nuisance' | 'autre'
  description: string
  location?: string
  latitude?: number
  longitude?: number
  photoUrl?: string
  anonymous: boolean
  status: 'en-attente' | 'en-cours' | 'traite' | 'rejete' | 'cloture'
  reference: string
  priority: 'basse' | 'moyenne' | 'haute' | 'critique'
  createdAt: string
  updates?: SignalementUpdate[]
}

export interface SignalementUpdate {
  id: string
  status: string
  message?: string
  createdAt: string
}

export interface Plainte {
  id: string
  typePlainte: 'vol' | 'escroquerie' | 'agression' | 'harcèlement' | 'violence' | 'autre'
  description: string
  suspectInfo?: string
  lieuIncident?: string
  dateIncident?: string
  piecesJointes?: string[]
  status: 'en-attente' | 'en-cours' | 'traite' | 'rejete' | 'cloture'
  reference: string
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
  reference: string
  createdAt: string
}

function generateReferenceLocal(prefix: string): string {
  const year = new Date().getFullYear()
  const rand = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${rand}`
}

/**
 * Créer un nouveau signalement
 */
export async function createSignalement(data: {
  type: Signalement['type']
  description: string
  location?: string
  latitude?: number
  longitude?: number
  photoUrl?: string
  anonymous?: boolean
}): Promise<{ signalement: Signalement | null; error: string | null }> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()
  const anonymous = data.anonymous ?? false

  if (!userId) {
    return { signalement: null, error: 'Vous devez être connecté' }
  }

  const reference = generateReferenceLocal('SIG')

  // MODE LOCAL
  if (!supabase) {
    const signalement: Signalement = {
      id: 'local-' + Date.now(),
      type: data.type,
      description: data.description,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      photoUrl: data.photoUrl,
      anonymous,
      status: 'en-attente',
      reference,
      priority: 'moyenne',
      createdAt: new Date().toISOString(),
    }
    useAppStore.getState().addUserAlert({
      id: signalement.id,
      type: 'signalement',
      title: `Signalement — ${data.type}`,
      status: 'en-attente',
      reference: signalement.reference,
      date: signalement.createdAt,
      description: data.description,
      updates: [{ date: signalement.createdAt, status: 'Reçu', message: 'Signalement enregistré' }],
    })
    return { signalement, error: null }
  }

  // MODE SUPABASE
  const { data: row, error } = await supabase
    .from('signalements')
    .insert({
      user_id: userId,
      type: data.type,
      description: data.description,
      location: data.location,
      latitude: data.latitude,
      longitude: data.longitude,
      photo_url: data.photoUrl,
      anonymous,
      reference,
    })
    .select()
    .single()

  if (error) {
    return { signalement: null, error: error.message }
  }

  const signalement: Signalement = {
    id: row.id,
    type: row.type,
    description: row.description,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    photoUrl: row.photo_url,
    anonymous: row.anonymous,
    status: row.status,
    reference: row.reference,
    priority: row.priority,
    createdAt: row.created_at,
  }

  return { signalement, error: null }
}

/**
 * Récupère les signalements de l'utilisateur connecté
 */
export async function getMySignalements(): Promise<Signalement[]> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()

  if (!userId || !supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('signalements')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    type: row.type,
    description: row.description,
    location: row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    photoUrl: row.photo_url,
    anonymous: row.anonymous,
    status: row.status,
    reference: row.reference,
    priority: row.priority,
    createdAt: row.created_at,
  }))
}

/**
 * Récupère l'historique des mises à jour d'un signalement
 */
export async function getSignalementUpdates(signalementId: string): Promise<SignalementUpdate[]> {
  const supabase = getSupabase()
  if (!supabase) return []

  const { data, error } = await supabase
    .from('signalement_updates')
    .select('*')
    .eq('signalement_id', signalementId)
    .order('created_at', { ascending: true })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    status: row.status,
    message: row.message,
    createdAt: row.created_at,
  }))
}

/**
 * Créer une nouvelle plainte
 */
export async function createPlainte(data: {
  typePlainte: Plainte['typePlainte']
  description: string
  suspectInfo?: string
  lieuIncident?: string
  dateIncident?: string
  piecesJointes?: string[]
}): Promise<{ plainte: Plainte | null; error: string | null }> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()

  if (!userId) {
    return { plainte: null, error: 'Vous devez être connecté' }
  }

  const reference = generateReferenceLocal('PLT')

  if (!supabase) {
    const plainte: Plainte = {
      id: 'local-' + Date.now(),
      typePlainte: data.typePlainte,
      description: data.description,
      suspectInfo: data.suspectInfo,
      lieuIncident: data.lieuIncident,
      dateIncident: data.dateIncident,
      piecesJointes: data.piecesJointes,
      status: 'en-attente',
      reference,
      createdAt: new Date().toISOString(),
    }
    return { plainte, error: null }
  }

  const { data: row, error } = await supabase
    .from('plaintes')
    .insert({
      user_id: userId,
      type_plainte: data.typePlainte,
      description: data.description,
      suspect_info: data.suspectInfo,
      lieu_incident: data.lieuIncident,
      date_incident: data.dateIncident,
      pieces_jointes: data.piecesJointes,
      reference,
    })
    .select()
    .single()

  if (error) {
    return { plainte: null, error: error.message }
  }

  const plainte: Plainte = {
    id: row.id,
    typePlainte: row.type_plainte,
    description: row.description,
    suspectInfo: row.suspect_info,
    lieuIncident: row.lieu_incident,
    dateIncident: row.date_incident,
    piecesJointes: row.pieces_jointes,
    status: row.status,
    reference: row.reference,
    createdAt: row.created_at,
  }

  return { plainte, error: null }
}

/**
 * Récupère les plaintes de l'utilisateur connecté
 */
export async function getMyPlaintes(): Promise<Plainte[]> {
  const supabase = getSupabase()
  const userId = await getCurrentUserId()

  if (!userId || !supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('plaintes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error || !data) return []

  return data.map(row => ({
    id: row.id,
    typePlainte: row.type_plainte,
    description: row.description,
    suspectInfo: row.suspect_info,
    lieuIncident: row.lieu_incident,
    dateIncident: row.date_incident,
    piecesJointes: row.pieces_jointes,
    status: row.status,
    reference: row.reference,
    createdAt: row.created_at,
  }))
}

/**
 * Récupère les alertes officielles publiées par la PNC
 */
export async function getOfficialAlerts(): Promise<OfficialAlert[]> {
  const supabase = getSupabase()

  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('alertes_officielles')
    .select('*')
    .eq('active', true)
    .order('created_at', { ascending: false })
    .limit(20)

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
    createdAt: row.created_at,
  }))
}

/**
 * Upload une photo vers Supabase Storage
 */
export async function uploadPhoto(file: File | Blob, fileName?: string): Promise<{ url: string | null; error: string | null }> {
  const supabase = getSupabase()

  if (!supabase) {
    // Mode local : convertir en base64
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve({ url: reader.result as string, error: null })
      reader.onerror = () => resolve({ url: null, error: 'Erreur de lecture du fichier' })
      reader.readAsDataURL(file)
    })
  }

  const name = fileName || `photo-${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`
  const { data, error } = await supabase.storage
    .from('photos')
    .upload(name, file, { contentType: 'image/jpeg' })

  if (error) {
    return { url: null, error: error.message }
  }

  const { data: urlData } = supabase.storage.from('photos').getPublicUrl(data.path)
  return { url: urlData.publicUrl, error: null }
}

export const signalementsService = {
  createSignalement,
  getMySignalements,
  getSignalementUpdates,
  createPlainte,
  getMyPlaintes,
  getOfficialAlerts,
  uploadPhoto,
}
