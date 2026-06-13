import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'cd.gouv.pnc.alerte',
  appName: 'PNC Alerte',
  webDir: 'out',
  server: {
    // En production, l'app servira les fichiers locaux
    // En développement, on peut pointer vers le serveur Next.js
    // url: 'http://localhost:3000',
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: '#0B2D6B',
      showSpinner: true,
      spinnerColor: '#FFFFFF',
      androidSplashResourceName: 'splash',
      androidScaleType: 'CENTER_CROP',
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#0B2D6B'
    },
    LocalNotifications: {
      smallIcon: 'ic_stat_pnc_logo',
      iconColor: '#0B2D6B',
      sound: 'default'
    },
    Camera: {
      presentationStyle: 'fullscreen'
    },
    Geolocation: {
      // Pas de configuration spéciale nécessaire
    }
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      keystoreAlias: undefined
    },
    allowMixedContent: false
  }
};

export default config;
