// Services natifs pour l'application PNC Alerte
// Utilise les plugins Capacitor pour accéder aux fonctionnalités Android
// Imports dynamiques pour éviter les erreurs SSR (les plugins ne fonctionnent que côté client)

import { isNative } from './capacitor'

// =====================
// CAMÉRA - Pour scanner la carte d'électeur et photos de profil
// =====================
export const nativeCamera = {
  async takePhoto(quality: 'low' | 'medium' | 'high' = 'medium') {
    if (!isNative()) {
      return new Promise<string>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.capture = 'environment'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          }
        }
        input.click()
      })
    }

    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      quality: quality === 'high' ? 100 : quality === 'medium' ? 60 : 30,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    })

    return `data:image/${photo.format};base64,${photo.base64String}`
  },

  async pickImage() {
    if (!isNative()) {
      return new Promise<string>((resolve) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.accept = 'image/*'
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0]
          if (file) {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.readAsDataURL(file)
          }
        }
        input.click()
      })
    }

    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    })

    return `data:image/${photo.format};base64,${photo.base64String}`
  },

  async scanDocument() {
    if (!isNative()) {
      return this.takePhoto('high')
    }

    const { Camera, CameraResultType, CameraSource } = await import('@capacitor/camera')
    const photo = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    })

    return {
      base64: photo.base64String!,
      format: photo.format,
      dataUrl: `data:image/${photo.format};base64,${photo.base64String}`,
    }
  },
}

// =====================
// GÉOLOCALISATION - Crucial pour PNC Alerte
// =====================
export const nativeGeolocation = {
  async getCurrentPosition() {
    if (!isNative()) {
      return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Géolocalisation non disponible'))
          return
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        })
      })
    }

    const { Geolocation } = await import('@capacitor/geolocation')
    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    })

    return {
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        altitude: position.coords.altitude,
        speed: position.coords.speed,
        heading: position.coords.heading,
      },
      timestamp: position.timestamp,
    } as GeolocationPosition
  },

  async watchPosition(callback: (position: GeolocationPosition) => void) {
    if (!isNative()) {
      const id = navigator.geolocation.watchPosition(callback, undefined, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      })
      return () => navigator.geolocation.clearWatch(id)
    }

    const { Geolocation } = await import('@capacitor/geolocation')
    const watchId = await Geolocation.watchPosition(
      { enableHighAccuracy: true, timeout: 10000 },
      (position) => {
        if (position) {
          callback({
            coords: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
              accuracy: position.coords.accuracy,
              altitude: position.coords.altitude,
              speed: position.coords.speed,
              heading: position.coords.heading,
            },
            timestamp: position.timestamp,
          } as GeolocationPosition)
        }
      }
    )

    return () => {
      Geolocation.clearWatch({ id: watchId })
    }
  },

  async requestPermissions() {
    if (!isNative()) {
      return { state: 'granted' as PermissionState }
    }

    try {
      const { Geolocation } = await import('@capacitor/geolocation')
      return await Geolocation.requestPermissions()
    } catch {
      return { state: 'denied' as PermissionState }
    }
  },
}

// =====================
// NOTIFICATIONS LOCALES
// =====================
export const nativeNotifications = {
  async requestPermission() {
    if (!isNative()) return { display: 'granted' }

    try {
      const { LocalNotifications } = await import('@capacitor/local-notifications')
      return await LocalNotifications.requestPermissions()
    } catch {
      return { display: 'denied' }
    }
  },

  async schedule(notification: {
    title: string
    body: string
    id?: number
    schedule?: Date
    extra?: Record<string, any>
  }) {
    if (!isNative()) {
      if ('Notification' in window) {
        const perm = await Notification.requestPermission()
        if (perm === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/logo.jpeg',
          })
        }
      }
      return
    }

    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const notif: any = {
      title: notification.title,
      body: notification.body,
      id: notification.id || Date.now(),
      extra: notification.extra,
    }

    if (notification.schedule) {
      notif.schedule = { at: notification.schedule }
    }

    await LocalNotifications.schedule({ notifications: [notif] })
  },

  async cancelAll() {
    if (!isNative()) return
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancelAll()
  },
}

// =====================
// PARTAGE - Partager vers d'autres apps Android
// =====================
export const nativeShare = {
  async share(options: {
    title?: string
    text?: string
    url?: string
    dialogTitle?: string
  }) {
    if (!isNative()) {
      if (navigator.share) {
        await navigator.share(options)
        return
      }
      const text = options.url || options.text || ''
      await navigator.clipboard.writeText(text)
      return
    }

    const { Share } = await import('@capacitor/share')
    await Share.share({
      title: options.title || 'PNC Alerte',
      text: options.text,
      url: options.url,
      dialogTitle: options.dialogTitle || 'Partager via',
    })
  },
}

// =====================
// FICHIERS - Stockage local
// =====================
export const nativeFilesystem = {
  async writeFile(path: string, data: string) {
    if (!isNative()) {
      localStorage.setItem(`pnc_file_${path}`, data)
      return { uri: path }
    }

    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
    return Filesystem.writeFile({
      path,
      data,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    })
  },

  async readFile(path: string) {
    if (!isNative()) {
      const data = localStorage.getItem(`pnc_file_${path}`)
      return { data: data || '' }
    }

    const { Filesystem, Directory, Encoding } = await import('@capacitor/filesystem')
    return Filesystem.readFile({
      path,
      directory: Directory.Data,
      encoding: Encoding.UTF8,
    })
  },

  async deleteFile(path: string) {
    if (!isNative()) {
      localStorage.removeItem(`pnc_file_${path}`)
      return
    }

    const { Filesystem, Directory } = await import('@capacitor/filesystem')
    await Filesystem.deleteFile({
      path,
      directory: Directory.Data,
    })
  },
}

// =====================
// PRÉFÉRENCES - Stockage clé/valeur persistant
// =====================
export const nativePreferences = {
  async set(key: string, value: string) {
    if (!isNative()) {
      localStorage.setItem(key, value)
      return
    }
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.set({ key, value })
  },

  async get(key: string) {
    if (!isNative()) {
      return localStorage.getItem(key)
    }
    const { Preferences } = await import('@capacitor/preferences')
    const { value } = await Preferences.get({ key })
    return value
  },

  async remove(key: string) {
    if (!isNative()) {
      localStorage.removeItem(key)
      return
    }
    const { Preferences } = await import('@capacitor/preferences')
    await Preferences.remove({ key })
  },
}

// =====================
// RÉSEAU
// =====================
export const nativeNetwork = {
  async getStatus() {
    if (!isNative()) {
      return {
        connected: navigator.onLine,
        connectionType: navigator.onLine ? 'wifi' : 'none',
      }
    }
    const { Network } = await import('@capacitor/network')
    return Network.getStatus()
  },

  async addListener(callback: (status: { connected: boolean; connectionType: string }) => void) {
    if (!isNative()) {
      const online = () => callback({ connected: true, connectionType: 'wifi' })
      const offline = () => callback({ connected: false, connectionType: 'none' })
      window.addEventListener('online', online)
      window.addEventListener('offline', offline)
      return () => {
        window.removeEventListener('online', online)
        window.removeEventListener('offline', offline)
      }
    }

    const { Network } = await import('@capacitor/network')
    Network.addListener('networkStatusChange', callback)
    return () => { Network.removeAllListeners() }
  },
}

// =====================
// HAPTIC FEEDBACK
// =====================
export const nativeHaptics = {
  async light() {
    if (!isNative()) return
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Light })
  },
  async medium() {
    if (!isNative()) return
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Medium })
  },
  async heavy() {
    if (!isNative()) return
    const { Haptics, ImpactStyle } = await import('@capacitor/haptics')
    await Haptics.impact({ style: ImpactStyle.Heavy })
  },
  async notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!isNative()) return
    const { Haptics, NotificationType } = await import('@capacitor/haptics')
    const notificationType = type === 'success' ? NotificationType.Success : type === 'warning' ? NotificationType.Warning : NotificationType.Error
    await Haptics.notification({ type: notificationType })
  },
}

// =====================
// STATUS BAR
// =====================
export const nativeStatusBar = {
  async setDark() {
    if (!isNative()) return
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Dark })
    await StatusBar.setBackgroundColor({ color: '#0B2D6B' })
  },
  async setLight() {
    if (!isNative()) return
    const { StatusBar, Style } = await import('@capacitor/status-bar')
    await StatusBar.setStyle({ style: Style.Light })
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' })
  },
}

// =====================
// SPLASH SCREEN
// =====================
export const nativeSplash = {
  async hide() {
    if (!isNative()) return
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.hide({ fadeOutDuration: 500 })
  },
  async show() {
    if (!isNative()) return
    const { SplashScreen } = await import('@capacitor/splash-screen')
    await SplashScreen.show({ autoHide: false })
  },
}

// =====================
// APP LIFECYCLE
// =====================
export const nativeApp = {
  async addResumeListener(callback: () => void) {
    if (!isNative()) return () => {}
    const { App } = await import('@capacitor/app')
    App.addListener('appStateChange', (state) => {
      if (state.isActive) callback()
    })
    return () => { App.removeAllListeners() }
  },
  async addBackButtonListener(callback: () => void) {
    if (!isNative()) return () => {}
    const { App } = await import('@capacitor/app')
    App.addListener('backButton', callback)
    return () => { App.removeAllListeners() }
  },
  async getLaunchUrl() {
    if (!isNative()) return null
    const { App } = await import('@capacitor/app')
    return App.getLaunchUrl()
  },
  async exitApp() {
    if (!isNative()) return
    const { App } = await import('@capacitor/app')
    App.exitApp()
  },
}

// =====================
// CLIPBOARD
// =====================
export const nativeClipboard = {
  async write(text: string) {
    if (!isNative()) {
      await navigator.clipboard.writeText(text)
      return
    }
    const { Clipboard } = await import('@capacitor/clipboard')
    await Clipboard.write({ string: text })
  },
  async read() {
    if (!isNative()) {
      return await navigator.clipboard.readText()
    }
    const { Clipboard } = await import('@capacitor/clipboard')
    const { value } = await Clipboard.read()
    return value
  },
}
