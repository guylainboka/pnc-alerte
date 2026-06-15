// Services natifs pour l'application PNC Alerte
// Utilise les plugins Capacitor pour accéder aux fonctionnalités Android

import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { Share } from '@capacitor/share';
import { LocalNotifications, type LocalNotificationSchema } from '@capacitor/local-notifications';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Preferences } from '@capacitor/preferences';
import { Network } from '@capacitor/network';
import { Clipboard } from '@capacitor/clipboard';
import { Haptics, HapticsImpactStyle } from '@capacitor/haptics';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App } from '@capacitor/app';
import { isNative } from './capacitor';

// =====================
// CAMÉRA - Pour scanner la carte d'électeur et photos de profil
// =====================
export const nativeCamera = {
  async takePhoto(quality: 'low' | 'medium' | 'high' = 'medium') {
    if (!isNative()) {
      // Fallback web : ouvrir le sélecteur de fichiers
      return new Promise<string>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.capture = 'environment';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }
        };
        input.click();
      });
    }

    const photo = await Camera.getPhoto({
      quality: quality === 'high' ? 100 : quality === 'medium' ? 60 : 30,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    return `data:image/${photo.format};base64,${photo.base64String}`;
  },

  async pickImage() {
    if (!isNative()) {
      return new Promise<string>((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
          }
        };
        input.click();
      });
    }

    const photo = await Camera.getPhoto({
      quality: 80,
      allowEditing: true,
      resultType: CameraResultType.Base64,
      source: CameraSource.Photos,
    });

    return `data:image/${photo.format};base64,${photo.base64String}`;
  },

  async scanDocument() {
    // Pour la carte d'électeur - haute résolution
    if (!isNative()) {
      return this.takePhoto('high');
    }

    const photo = await Camera.getPhoto({
      quality: 100,
      allowEditing: false,
      resultType: CameraResultType.Base64,
      source: CameraSource.Camera,
    });

    return {
      base64: photo.base64String!,
      format: photo.format,
      dataUrl: `data:image/${photo.format};base64,${photo.base64String}`,
    };
  },
};

// =====================
// GÉOLOCALISATION - Crucial pour PNC Alerte
// =====================
export const nativeGeolocation = {
  async getCurrentPosition() {
    if (!isNative()) {
      // Fallback web API
      return new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Géolocalisation non disponible'));
          return;
        }
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        });
      });
    }

    const position = await Geolocation.getCurrentPosition({
      enableHighAccuracy: true,
      timeout: 10000,
    });

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
    } as GeolocationPosition;
  },

  async watchPosition(callback: (position: GeolocationPosition) => void) {
    if (!isNative()) {
      const id = navigator.geolocation.watchPosition(callback, undefined, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      });
      return () => navigator.geolocation.clearWatch(id);
    }

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
          } as GeolocationPosition);
        }
      }
    );

    return () => {
      Geolocation.clearWatch({ id: watchId });
    };
  },

  async requestPermissions() {
    if (!isNative()) {
      return { state: 'granted' as PermissionState };
    }

    try {
      const permission = await Geolocation.requestPermissions();
      return permission;
    } catch {
      return { state: 'denied' as PermissionState };
    }
  },
};

// =====================
// NOTIFICATIONS LOCALES
// =====================
export const nativeNotifications = {
  async requestPermission() {
    if (!isNative()) return { display: 'granted' };

    try {
      return await LocalNotifications.requestPermissions();
    } catch {
      return { display: 'denied' };
    }
  },

  async schedule(notification: {
    title: string;
    body: string;
    id?: number;
    schedule?: Date;
    extra?: Record<string, any>;
  }) {
    if (!isNative()) {
      // Fallback web notification
      if ('Notification' in window) {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
          new Notification(notification.title, {
            body: notification.body,
            icon: '/logo.jpeg',
          });
        }
      }
      return;
    }

    const notif: LocalNotificationSchema = {
      title: notification.title,
      body: notification.body,
      id: notification.id || Date.now(),
      extra: notification.extra,
    };

    if (notification.schedule) {
      notif.schedule = { at: notification.schedule };
    }

    await LocalNotifications.schedule({ notifications: [notif] });
  },

  async cancelAll() {
    if (!isNative()) return;
    await LocalNotifications.cancelAll();
  },
};

// =====================
// PARTAGE - Partager vers d'autres apps Android
// =====================
export const nativeShare = {
  async share(options: {
    title?: string;
    text?: string;
    url?: string;
    dialogTitle?: string;
  }) {
    if (!isNative()) {
      // Fallback Web Share API
      if (navigator.share) {
        await navigator.share(options);
        return;
      }
      // Dernier recours : copier dans le presse-papier
      const text = options.url || options.text || '';
      await navigator.clipboard.writeText(text);
      return;
    }

    await Share.share({
      title: options.title || 'PNC Alerte',
      text: options.text,
      url: options.url,
      dialogTitle: options.dialogTitle || 'Partager via',
    });
  },
};

// =====================
// FICHIERS - Stockage local
// =====================
export const nativeFilesystem = {
  async writeFile(path: string, data: string, directory?: Directory) {
    if (!isNative()) {
      localStorage.setItem(`pnc_file_${path}`, data);
      return { uri: path };
    }

    return Filesystem.writeFile({
      path,
      data,
      directory: directory || Directory.Data,
      encoding: Encoding.UTF8,
    });
  },

  async readFile(path: string, directory?: Directory) {
    if (!isNative()) {
      const data = localStorage.getItem(`pnc_file_${path}`);
      return { data: data || '' };
    }

    return Filesystem.readFile({
      path,
      directory: directory || Directory.Data,
      encoding: Encoding.UTF8,
    });
  },

  async deleteFile(path: string, directory?: Directory) {
    if (!isNative()) {
      localStorage.removeItem(`pnc_file_${path}`);
      return;
    }

    await Filesystem.deleteFile({
      path,
      directory: directory || Directory.Data,
    });
  },
};

// =====================
// PRÉFÉRENCES - Stockage clé/valeur persistant
// =====================
export const nativePreferences = {
  async set(key: string, value: string) {
    if (!isNative()) {
      localStorage.setItem(key, value);
      return;
    }
    await Preferences.set({ key, value });
  },

  async get(key: string) {
    if (!isNative()) {
      return localStorage.getItem(key);
    }
    const { value } = await Preferences.get({ key });
    return value;
  },

  async remove(key: string) {
    if (!isNative()) {
      localStorage.removeItem(key);
      return;
    }
    await Preferences.remove({ key });
  },
};

// =====================
// RÉSEAU
// =====================
export const nativeNetwork = {
  getStatus() {
    if (!isNative()) {
      return Promise.resolve({
        connected: navigator.onLine,
        connectionType: navigator.onLine ? 'wifi' : 'none',
      });
    }
    return Network.getStatus();
  },

  addListener(callback: (status: { connected: boolean; connectionType: string }) => void) {
    if (!isNative()) {
      const online = () => callback({ connected: true, connectionType: 'wifi' });
      const offline = () => callback({ connected: false, connectionType: 'none' });
      window.addEventListener('online', online);
      window.addEventListener('offline', offline);
      return () => {
        window.removeEventListener('online', online);
        window.removeEventListener('offline', offline);
      };
    }

    Network.addListener('networkStatusChange', callback);
    return () => { Network.removeAllListeners(); };
  },
};

// =====================
// HAPTIC FEEDBACK
// =====================
export const nativeHaptics = {
  light() {
    if (!isNative()) return;
    Haptics.impact({ style: HapticsImpactStyle.Light });
  },
  medium() {
    if (!isNative()) return;
    Haptics.impact({ style: HapticsImpactStyle.Medium });
  },
  heavy() {
    if (!isNative()) return;
    Haptics.impact({ style: HapticsImpactStyle.Heavy });
  },
  notification(type: 'success' | 'warning' | 'error' = 'success') {
    if (!isNative()) return;
    const notificationType = type === 'success' ? 'SUCCESS' : type === 'warning' ? 'WARNING' : 'ERROR';
    Haptics.notification({ type: notificationType as any });
  },
};

// =====================
// STATUS BAR
// =====================
export const nativeStatusBar = {
  async setDark() {
    if (!isNative()) return;
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0B2D6B' });
  },
  async setLight() {
    if (!isNative()) return;
    await StatusBar.setStyle({ style: Style.Light });
    await StatusBar.setBackgroundColor({ color: '#FFFFFF' });
  },
};

// =====================
// SPLASH SCREEN
// =====================
export const nativeSplash = {
  async hide() {
    if (!isNative()) return;
    await SplashScreen.hide({ fadeOutDuration: 500 });
  },
  async show() {
    if (!isNative()) return;
    await SplashScreen.show({ autoHide: false });
  },
};

// =====================
// APP LIFECYCLE
// =====================
export const nativeApp = {
  addResumeListener(callback: () => void) {
    if (!isNative()) return () => {};
    App.addListener('appStateChange', (state) => {
      if (state.isActive) callback();
    });
    return () => { App.removeAllListeners(); };
  },
  addBackButtonListener(callback: () => void) {
    if (!isNative()) return () => {};
    App.addListener('backButton', callback);
    return () => { App.removeAllListeners(); };
  },
  getLaunchUrl() {
    if (!isNative()) return Promise.resolve(null);
    return App.getLaunchUrl();
  },
};

// =====================
// CLIPBOARD
// =====================
export const nativeClipboard = {
  async write(text: string) {
    if (!isNative()) {
      await navigator.clipboard.writeText(text);
      return;
    }
    await Clipboard.write({ string: text });
  },
  async read() {
    if (!isNative()) {
      return await navigator.clipboard.readText();
    }
    const { value } = await Clipboard.read();
    return value;
  },
};
