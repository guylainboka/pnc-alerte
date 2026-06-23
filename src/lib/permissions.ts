// Gestionnaire de permissions Android pour PNC Alerte
// Utilise des imports dynamiques pour éviter les erreurs SSR

import { isNative } from './capacitor'

export type PermissionType = 'camera' | 'location' | 'notifications' | 'storage' | 'microphone'

interface PermissionStatus {
  granted: boolean
  denied: boolean
  prompt: boolean
}

// Demander une permission spécifique
export async function requestPermission(type: PermissionType): Promise<PermissionStatus> {
  if (!isNative()) {
    return { granted: true, denied: false, prompt: false }
  }

  try {
    switch (type) {
      case 'camera': {
        const { Camera } = await import('@capacitor/camera')
        const result = await Camera.requestPermissions()
        const state = result.camera || result.photos || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt' || state === 'limited',
        }
      }

      case 'location': {
        const { Geolocation } = await import('@capacitor/geolocation')
        const result = await Geolocation.requestPermissions()
        const state = result.location || result.coarseLocation || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt',
        }
      }

      case 'notifications': {
        const { LocalNotifications } = await import('@capacitor/local-notifications')
        const result = await LocalNotifications.requestPermissions()
        const state = result.display || 'granted'
        return {
          granted: state === 'granted' || state === 'yes',
          denied: state === 'denied' || state === 'no',
          prompt: state === 'prompt',
        }
      }

      case 'storage': {
        return { granted: true, denied: false, prompt: false }
      }

      case 'microphone': {
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
        const { Camera } = await import('@capacitor/camera')
        const result = await Camera.checkPermissions()
        const state = result.camera || result.photos || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt' || state === 'limited',
        }
      }

      case 'location': {
        const { Geolocation } = await import('@capacitor/geolocation')
        const result = await Geolocation.checkPermissions()
        const state = result.location || result.coarseLocation || 'granted'
        return {
          granted: state === 'granted',
          denied: state === 'denied',
          prompt: state === 'prompt',
        }
      }

      case 'notifications': {
        const { LocalNotifications } = await import('@capacitor/local-notifications')
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
