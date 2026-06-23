/**
 * Auth Service — PNC Alerte
 * =========================
 * Couche d'abstraction pour l'authentification Supabase.
 * Toutes les fonctions retournent une Promise et gèrent le mode démo (fallback).
 */

import { getSupabase, isSupabaseConfigured } from './supabase-client'
import { useAppStore } from './store'

export interface AuthUser {
  id: string
  email: string
  fullName?: string
  phone?: string
  carteElecteurNumero?: string
  role?: 'citoyen' | 'agent' | 'admin'
}

export interface SignUpData {
  email: string
  password: string
  fullName: string
  phone: string
  carteElecteurNumero?: string
  province?: string
  commune?: string
}

/**
 * Inscription d'un nouveau citoyen
 */
export async function signUp(data: SignUpData): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = getSupabase()

  // MODE LOCAL (sans Supabase)
  if (!supabase) {
    const localUser: AuthUser = {
      id: 'local-' + Date.now(),
      email: data.email,
      fullName: data.fullName,
      phone: data.phone,
      carteElecteurNumero: data.carteElecteurNumero,
      role: 'citoyen',
    }
    useAppStore.getState().login(data.fullName, data.email, data.phone)
    return { user: localUser, error: null }
  }

  // MODE SUPABASE
  const { data: authData, error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        full_name: data.fullName,
        phone: data.phone,
        carte_electeur_numero: data.carteElecteurNumero,
        province: data.province || 'Kinshasa',
        commune: data.commune || 'Gombe',
      },
    },
  })

  if (error) {
    return { user: null, error: translateAuthError(error.message) }
  }

  if (!authData.user) {
    return { user: null, error: "Une erreur est survenue lors de l'inscription" }
  }

  // Le trigger `handle_new_user` crée automatiquement le profil côté BDD
  const user: AuthUser = {
    id: authData.user.id,
    email: authData.user.email || data.email,
    fullName: data.fullName,
    phone: data.phone,
    carteElecteurNumero: data.carteElecteurNumero,
    role: 'citoyen',
  }

  useAppStore.getState().login(data.fullName, data.email, data.phone)
  return { user, error: null }
}

/**
 * Connexion
 */
export async function signIn(
  email: string,
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> {
  const supabase = getSupabase()

  if (!supabase) {
    // Mode local : accepter n'importe quel email/mot de passe
    const localUser: AuthUser = {
      id: 'local-' + email,
      email,
      fullName: email.split('@')[0],
      role: 'citoyen',
    }
    useAppStore.getState().login(email.split('@')[0], email, '')
    return { user: localUser, error: null }
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { user: null, error: translateAuthError(error.message) }
  }

  if (!data.user) {
    return { user: null, error: 'Connexion échouée' }
  }

  // Charger le profil depuis la table profiles
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single()

  const fullName = profile?.full_name || email.split('@')[0]
  const phone = profile?.phone || ''

  const user: AuthUser = {
    id: data.user.id,
    email: data.user.email || email,
    fullName,
    phone,
    carteElecteurNumero: profile?.carte_electeur_numero,
    role: profile?.role || 'citoyen',
  }

  useAppStore.getState().login(fullName, user.email, phone)
  return { user, error: null }
}

/**
 * Déconnexion
 */
export async function signOut(): Promise<void> {
  const supabase = getSupabase()
  if (supabase) {
    await supabase.auth.signOut()
  }
  useAppStore.getState().logout()
}

/**
 * Demander un email de réinitialisation de mot de passe
 */
export async function resetPassword(email: string): Promise<{ error: string | null; demoCode?: string }> {
  const supabase = getSupabase()

  if (!supabase) {
    // Mode démo : générer un code à 6 chiffres
    const demoCode = '123456'
    return { error: null, demoCode }
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/recover-account`,
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  return { error: null }
}

/**
 * Mettre à jour le mot de passe (après reset)
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
  const supabase = getSupabase()

  if (!supabase) {
    return { error: null }
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  return { error: null }
}

/**
 * Mettre à jour le profil
 */
export async function updateProfile(updates: Partial<AuthUser>): Promise<{ error: string | null }> {
  const supabase = getSupabase()

  if (!supabase) {
    // Mode local
    useAppStore.getState().updateProfile({
      userName: updates.fullName,
      userEmail: updates.email,
      userPhone: updates.phone,
    })
    return { error: null }
  }

  // Récupérer l'utilisateur Supabase courant
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return { error: 'Non connecté' }
  }

  const dbUpdates: Record<string, unknown> = {}
  if (updates.fullName) dbUpdates.full_name = updates.fullName
  if (updates.phone) dbUpdates.phone = updates.phone
  if (updates.carteElecteurNumero) dbUpdates.carte_electeur_numero = updates.carteElecteurNumero

  const { error } = await supabase
    .from('profiles')
    .update(dbUpdates)
    .eq('id', session.user.id)

  if (error) {
    return { error: translateAuthError(error.message) }
  }

  useAppStore.getState().updateProfile({
    userName: updates.fullName,
    userPhone: updates.phone,
  })
  return { error: null }
}

/**
 * Récupère l'utilisateur courant (depuis Supabase session)
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = getSupabase()

  if (!supabase) {
    const state = useAppStore.getState()
    if (!state.isAuthenticated) return null
    return {
      id: 'local-' + state.userEmail,
      email: state.userEmail,
      fullName: state.userName,
      phone: state.userPhone,
      role: 'citoyen',
    }
  }

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) {
    return null
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', session.user.id)
    .single()

  if (!profile) return null

  return {
    id: session.user.id,
    email: session.user.email || '',
    fullName: profile.full_name,
    phone: profile.phone,
    carteElecteurNumero: profile.carte_electeur_numero,
    role: profile.role,
  }
}

/**
 * Récupère la session en cours
 */
export async function getSession() {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

/**
 * Récupère l'ID utilisateur courant (utilitaire pour les autres services)
 */
export async function getCurrentUserId(): Promise<string | null> {
  const supabase = getSupabase()

  if (!supabase) {
    const state = useAppStore.getState()
    return state.isAuthenticated ? `local-${state.userEmail}` : null
  }

  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || null
}

/**
 * Traduit les erreurs Supabase en français
 */
function translateAuthError(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('invalid login credentials')) {
    return 'Email ou mot de passe incorrect'
  }
  if (lower.includes('user already registered')) {
    return 'Un compte existe déjà avec cet email'
  }
  if (lower.includes('password should be at least')) {
    return 'Le mot de passe doit contenir au moins 6 caractères'
  }
  if (lower.includes('unable to validate email address')) {
    return 'Adresse email invalide'
  }
  if (lower.includes('email rate limit exceeded')) {
    return 'Trop de tentatives. Réessayez plus tard.'
  }
  if (lower.includes('for security purposes, you can only request')) {
    return 'Trop de demandes de réinitialisation. Réessayez plus tard.'
  }
  return message
}

export const authService = {
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  updateProfile,
  getCurrentUser,
  getCurrentUserId,
  getSession,
}

export const isAuthConfigured = isSupabaseConfigured
