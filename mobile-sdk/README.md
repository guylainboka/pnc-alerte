# @pnc/mobile-sdk

SDK client JavaScript/TypeScript pour connecter l'application mobile citoyenne au **Centre de Commandement PNC** et au backend **Supabase** partagé.

---

## Installation

### Option 1 — Copie locale (recommandé pour démarrer)

Copiez le dossier `mobile-sdk/` dans le projet de votre application mobile :

```bash
cp -r mobile-sdk/ /chemin/vers/app-mobile/pnc-sdk/
```

Puis installez les dépendances :

```bash
cd /chemin/vers/app-mobile
npm install @supabase/supabase-js
# Pour React Native :
npx expo install @react-native-async-storage/async-storage
```

### Option 2 — Package npm (si publié)

```bash
npm install @pnc/mobile-sdk
```

---

## Configuration

Créez un fichier `pnc-config.ts` dans votre application mobile :

```typescript
import { PNCClientConfig } from './pnc-sdk/src/index';

export const pncConfig: PNCClientConfig = {
  apiUrl: process.env.EXPO_PUBLIC_PNC_API_URL,        // https://pnc-command.vercel.app
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,  // https://xyz.supabase.co
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  evidenceBucket: 'pnc-evidence',
};
```

Variables d'environnement (`.env`) :

```bash
EXPO_PUBLIC_PNC_API_URL=https://pnc-command.vercel.app
EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

---

## Utilisation

### 1. Initialisation au démarrage de l'app

```typescript
// App.tsx
import { PNCProvider } from './pnc-sdk/src/react';
import { pncConfig } from './pnc-config';

export default function App() {
  return (
    <PNCProvider config={pncConfig}>
      <RootNavigator />
    </PNCProvider>
  );
}
```

### 2. Inscription d'un citoyen

```typescript
import { usePNC } from './pnc-sdk/src/react';

function RegisterScreen() {
  const { register, loading, error } = usePNC();

  const handleRegister = async () => {
    await register({
      firstName: 'Aimé',
      lastName: 'Kalala',
      phone: '+243820000001',
      email: 'aime@example.com',
      password: 'monpassword123',
      gender: 'M',
      city: 'Kinshasa',
      commune: 'Gombe',
    });
  };
  // ...
}
```

### 3. Connexion

```typescript
const { login } = usePNC();
await login('+243820000001', 'monpassword123');
// ou par email : await login('aime@example.com', 'monpassword123')
```

### 4. Envoi d'une alerte SOS ⚡

```typescript
const { sendSOS } = usePNC();

const alert = await sendSOS({
  type: 'agression',                    // 'vol' | 'agression' | 'accident' | 'incendie' | 'autre'
  description: 'Agression en cours au marché',
  location: 'Marché Central, Gombe',
  latitude: -4.3217,
  longitude: 15.3130,
});

console.log('Alerte reçue par la PNC:', alert.reference);
// → "ALT-2024-009"
```

### 5. Déposer une plainte

```typescript
const { submitComplaint } = usePNC();

const complaint = await submitComplaint({
  type: 'vol',                          // 'vol' | 'agression' | 'harassment' | 'corruption' | 'autre'
  description: 'On a volé mon téléphone dans le bus',
  location: 'Gombe, Kinshasa',
});
```

### 6. Notifications temps réel (push)

```typescript
import { usePNC } from './pnc-sdk/src/react';
import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';

function useNotifications() {
  const { client, citizen } = usePNC();

  useEffect(() => {
    if (!client || !citizen) return;

    // Nouveaux criminels recherchés
    const unsubWanted = client.realtime.subscribeToWantedCriminals((criminal) => {
      Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Avis de recherche',
          body: `${criminal.firstName} ${criminal.lastName} — ${criminal.lastKnownAddr || 'Localisation inconnue'}`,
        },
        trigger: null,
      });
    });

    // Changement de statut de mes plaintes
    const unsubComplaints = client.realtime.subscribeToMyComplaints(citizen.id, (complaint) => {
      if (complaint.status === 'approuvee') {
        Notifications.scheduleNotificationAsync({
          content: {
            title: '✅ Plainte approuvée',
            body: `Votre plainte ${complaint.reference} a été approuvée par la PNC.`,
          },
          trigger: null,
        });
      }
    });

    // Prise en charge de mes alertes
    const unsubAlerts = client.realtime.subscribeToMyAlerts(citizen.id, (alert) => {
      if (alert.status === 'en_cours') {
        Notifications.scheduleNotificationAsync({
          content: {
            title: '🚓 Alerte prise en charge',
            body: `Un officier a été assigné à votre alerte ${alert.reference}.`,
          },
          trigger: null,
        });
      }
    });

    return () => {
      unsubWanted();
      unsubComplaints();
      unsubAlerts();
    };
  }, [client, citizen]);
}
```

### 7. Partage de position GPS (en arrière-plan)

Pour que le Centre de Commandement puisse localiser le citoyen en cas d'alerte :

```typescript
import * as Location from 'expo-location';
import { usePNC } from './pnc-sdk/src/react';

function useBackgroundLocation() {
  const { client } = usePNC();

  useEffect(() => {
    Location.startLocationUpdatesAsync('location-task', {
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 60000,  // chaque minute
      foregroundService: { notificationTitle: 'PNC', notificationBody: 'Partage de position actif' },
    });

    TaskManager.defineTask('location-task', async ({ data, error }) => {
      if (data) {
        const { locations } = data as any;
        const loc = locations[0];
        await client?.auth.updateLocation(loc.coords.latitude, loc.coords.longitude);
      }
    });
  }, [client]);
}
```

### 8. Téléverser une preuve (photo)

```typescript
const { client } = usePNC();

const result = await client.upload.evidence(photo.uri, 'photo');
console.log('URL publique:', result.fileUrl);
```

### 9. Voir les avis de recherche

```typescript
const { client } = usePNC();

const wanted = await client.public.listWantedCriminals();
// → tableau de criminels recherchés avec photo, signes distinctifs, etc.
```

---

## API complète

| Module | Méthode | Description |
|--------|---------|-------------|
| `auth` | `register(input)` | Inscrit un citoyen |
| `auth` | `login(identifier, password)` | Connecte (phone ou email) |
| `auth` | `logout()` | Déconnecte |
| `auth` | `me()` | Profil courant |
| `auth` | `updateLocation(lat, lng, label?)` | Met à jour la position GPS |
| `alerts` | `sendSOS(input)` | Envoie une alerte SOS |
| `alerts` | `listMine()` | Liste les alertes du citoyen |
| `complaints` | `submit(input)` | Dépose une plainte |
| `complaints` | `listMine()` | Liste les plaintes du citoyen |
| `public` | `listCommissariats()` | Liste les commissariats |
| `public` | `listWantedCriminals()` | Liste les criminels recherchés |
| `public` | `getBackendStatus()` | Statut du backend |
| `upload` | `evidence(uri, type)` | Téléverse un fichier |
| `realtime` | `subscribeToWantedCriminals(cb)` | Nouveaux avis de recherche |
| `realtime` | `subscribeToMyComplaints(citizenId, cb)` | Changement statut plaintes |
| `realtime` | `subscribeToMyAlerts(citizenId, cb)` | Prise en charge alertes |
| `realtime` | `subscribe(table, event, filter, cb)` | Écoute générique |

---

## Sécurité

- ✅ Le SDK utilise uniquement la clé **ANON** Supabase (publique, protégée par RLS)
- ✅ Un citoyen ne peut voir/modifier que **ses propres** données
- ✅ Les données PNC (officiers, dossiers, etc.) sont **inaccessibles** depuis le mobile
- ❌ Ne jamais inclure la clé `service_role` dans l'application mobile

---

## Gestion des erreurs

```typescript
import { PNCError } from './pnc-sdk/src/index';

try {
  await pnc.alerts.sendSOS(input);
} catch (e) {
  if (e instanceof PNCError) {
    console.error('Erreur PNC:', e.message, 'Code:', e.statusCode);
    // e.statusCode: 400 (validation), 401 (auth), 403 (bloqué), 500 (serveur)
  }
}
```

---

## Voir aussi

- `MOBILE_INTEGRATION.md` — Guide complet d'intégration (architecture, Supabase, sécurité)
- `supabase/migrations/` — Schéma SQL à exécuter dans Supabase
- `.env.example` — Variables d'environnement

---

**Contact** : Centre de Commandement PNC — Police Nationale Congolaise
