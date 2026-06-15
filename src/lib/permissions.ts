// Gestionnaire de permissions Android pour PNC Alerte
// Demande les permissions natives AVANT d'utiliser les fonctionnalités

import { isNative } from './capacitor'
import { Geolocation } from '@capacitor/geolocation'
import { Camera } from '@capacitor/camera'
import { LocalNotifications } from '@capacitor/local-notifications'
import { Filesystem } from '@capacitor/filesystem'

export type PermissionType = 'camera' | 'location' | 'notifications' | 'storage' | 'microphone'

interface PermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
}

// Demander une permission spécifique
export async function requestPermission(type: PermissionType): Promise<PermissionStatus> {
  if (!isNative()) {
    // Sur web, les permissions sont gérées par le navigateur
    return { granted: true, denied: false, prompt: false }
  }

  try {
    switch (type) {
      case 'camera': {
        const result = await Camera.requestPermissions()
        const state = result.camera || result.photos || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt' || state === 'limited',
        }
      }

      case 'location': {
        const result = await Geolocation.requestPermissions()
        const state = result.location || result.coarseLocation || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt',
        }
      }

      case 'notifications': {
        const result = await LocalNotifications.requestPermissions()
        const state = result.display || 'granted'
        return {
          granted: state === 'granted' || state === 'yes',
          denied: state === 'denied' || state === 'no',
          prompt: state === 'prompt',
        }
      }

      case 'storage': {
        // Sur Android 13+, pas besoin de permission explicite pour le stockage
        return { granted: true, denied: false, prompt: false }
      }

      case 'microphone': {
        // Le microphone est demandé via l'API Web Speech
        return { granted: true, denied: false, prompt: false }
      }

      default:
        return { granted: false, denied: true, prompt: false }
    }
  } catch (error) {
    console.error(`Erreur permission ${type}:`, error)
    return { granted: false, denied: true, prompt: false }
  }
}

// Vérifier le statut d'une permission sans la demander
export async function checkPermission(type: PermissionType): Promise<PermissionStatus> {
  if (!isNative()) {
    return { granted: true, denied: false, prompt: false }
  }

  try {
    switch (type) {
      case 'camera': {
        const result = await Camera.checkPermissions()
        const state = result.camera || result.photos || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt' || state === 'limited',
        }
      }

      case 'location': {
        const result = await Geolocation.checkPermissions()
        const state = result.location || result.coarseLocation || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt',
        }
      }

      case 'notifications': {
        const result = await LocalNotifications.checkPermissions()
        const state = result.display || 'granted'
        return {
          granted: state === 'granted' || state === 'yes',
          denied: state === 'denied' || state === 'no',
          prompt: state === 'prompt',
        }
      }

      default:
        return { granted: true, denied: false, prompt: false }
    }
  } catch {
    return { granted: false, denied: true, prompt: false }
  }
}

// Demander toutes les permissions au premier lancement
export async function requestAllPermissions(): Promise<Record<PermissionType, boolean>> {
  const results: Record<string, boolean> = {}

  // Demander les permissions une par une pour une meilleure UX
  const locationPerm = await requestPermission('location')
  results.location = locationPerm.granted

  const cameraPerm = await requestPermission('camera')
  results.camera = cameraPerm.granted

  const notifPerm = await requestPermission('notifications')
  results.notifications = notifPerm.granted

  const storagePerm = await requestPermission('storage')
  results.storage = storagePerm.granted

  const micPerm = await requestPermission('microphone')
  results.microphone = micPerm.granted

  return results as Record<PermissionType, boolean>
}
