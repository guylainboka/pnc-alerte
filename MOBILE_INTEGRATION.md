# Guide d'Intégration — Application Mobile PNC ↔ Centre de Commandement

Ce document explique comment connecter l'application mobile citoyenne au Centre de Commandement PNC via un backend **Supabase** partagé.

---

## Architecture

```
┌──────────────────────┐         ┌─────────────────────┐         ┌──────────────────────────┐
│  Application Mobile  │ ◄────►  │   Supabase Backend  │ ◄────►  │  Centre de Commandement  │
│  (React Native /     │         │                     │         │  (Web Next.js)           │
│   Flutter)           │         │  • PostgreSQL       │         │                          │
│                      │         │  • Auth             │         │  • Réception alertes     │
│  Citoyens:           │         │  • Realtime         │         │  • Traitement plaintes   │
│  • SOS alertes       │         │  • Storage          │         │  • Base criminelle       │
│  • Plaintes          │         │                     │         │  • Gestion dossiers      │
│  • Géolocalisation   │         │  Même base pour     │         │                          │
│  • Avis de recherche │         │  les 2 applications  │         │                          │
└──────────────────────┘         └─────────────────────┘         └──────────────────────────┘
        │                                                                │
        └────────── Synchronisation Temps Réel ──────────────────────────┘
```

**Principe clé :** les deux applications pointent vers le **même** projet Supabase. Une alerte envoyée depuis le mobile apparaît instantanément dans le Centre de Commandement grâce à Supabase Realtime.

---

## 1. Configuration de Supabase

### Étape 1 — Créer le projet

1. Allez sur [supabase.com](https://supabase.com) et créez un compte.
2. Cliquez sur **New Project**, nommez-le `pnc-backend`.
3. Choisissez la région **Frankfurt (eu-central-1)** (la plus proche de la RDC).
4. Attendez 2 minutes que le projet soit provisionné.

### Étape 2 — Exécuter le schéma SQL

Dans Supabase Dashboard → **SQL Editor** → **New query**, collez puis exécutez successivement :

1. `supabase/migrations/0001_init_pnc_schema.sql` — crée toutes les tables + politiques RLS + active Realtime
2. `supabase/migrations/0002_seed_data.sql` — insère les données de démonstration (provinces, commissariats, citoyens, etc.)

### Étape 3 — Créer le bucket de stockage

Dans Supabase Dashboard → **Storage** → **New bucket** :
- Nom : `pnc-evidence`
- Public : ✅ (pour que les images soient accessibles via URL)

### Étape 4 — Récupérer les clés API

Dans Supabase Dashboard → **Project Settings** → **API**, copiez :

| Variable | Description | Utilisation |
|----------|-------------|-------------|
| `Project URL` | URL du projet (`https://xyz.supabase.co`) | Web + Mobile |
| `anon public` | Clé publique (protégée par RLS) | Web + Mobile |
| `service_role` | Clé secrète (bypass RLS) | **Web serveur uniquement** |

---

## 2. Configuration du Centre de Commandement (Web)

Créez un fichier `.env` à la racine du projet web :

```bash
# .env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...      # Clé anon publique
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...           # Clé service_role (SECRÈTE)
SUPABASE_EVIDENCE_BUCKET=pnc-evidence
PNC_BACKEND_MODE=auto                              # auto | supabase | local
```

Redémarrez le serveur :
```bash
bun run dev
```

Le statut du backend (visible dans la section **Backend & Mobile** du Centre de Commandement) doit passer à **Supabase Configuré**.

---

## 3. Configuration de l'Application Mobile

### Variables d'environnement

L'application mobile utilise uniquement les variables **publiques** :

```bash
# .env (React Native / Expo)
EXPO_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> ⚠️ **JAMAIS** de `service_role` dans le mobile. La clé `anon` est sécurisée par les politiques RLS définies dans le schéma SQL.

### Installation du client Supabase

```bash
# React Native / Expo
npx expo install @supabase/supabase-js

# Flutter
flutter pub add supabase_flutter
```

### Initialisation du client (React Native)

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

---

## 4. API REST pour l'Application Mobile

L'application mobile peut communiquer de **deux façons** :

1. **Via les endpoints REST** du Centre de Commandement (`/api/mobile/*`) — recommandé pour la logique métier
2. **Directement via Supabase** — recommandé pour l'auth et le Realtime

### Endpoints disponibles

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| `GET` | `/api/mobile/status` | Statut du backend | ❌ |
| `POST` | `/api/mobile/auth/register` | Inscription citoyen | ❌ |
| `POST` | `/api/mobile/auth/login` | Connexion citoyen | ❌ |
| `GET` | `/api/mobile/auth/me` | Profil du citoyen | ✅ |
| `POST` | `/api/mobile/alerts` | Envoie une alerte SOS | optionnel |
| `GET` | `/api/mobile/alerts` | Alertes du citoyen | ✅ |
| `POST` | `/api/mobile/complaints` | Dépose une plainte | optionnel |
| `GET` | `/api/mobile/complaints` | Plaintes du citoyen | ✅ |
| `GET` | `/api/mobile/commissariats` | Liste des commissariats | ❌ |
| `GET` | `/api/mobile/criminals/wanted` | Criminels recherchés | ❌ |
| `POST` | `/api/mobile/upload` | Téléverse un fichier | ✅ |

### Base URL

- **Production** : `https://votre-app.vercel.app`
- **Développement** : `http://VOTRE_IP_LOCALE:3000` (le mobile et le serveur doivent être sur le même réseau WiFi) ou via [ngrok](https://ngrok.com) : `https://xxx.ngrok-free.app`

---

## 5. Exemples de code complets

### 5.1 — Inscription d'un citoyen

```javascript
async function registerCitizen({ firstName, lastName, phone, email, password, gender, city, commune, address }) {
  const res = await fetch(`${BASE_URL}/api/mobile/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firstName, lastName, phone, email, password, gender, city, commune, address }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  // Stocker le jeton pour les requêtes futures
  await AsyncStorage.setItem('citizen_token', data.accessToken);
  return data;
}
```

**Réponse :**
```json
{
  "message": "Inscription réussie",
  "accessToken": "eyJhbGciOi...",
  "citizen": { "id": "...", "reference": "CIT-2024-007", "firstName": "Aimé", ... }
}
```

### 5.2 — Connexion

```javascript
async function loginCitizen(identifier, password) {
  // identifier = téléphone OU email
  const res = await fetch(`${BASE_URL}/api/mobile/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  await AsyncStorage.setItem('citizen_token', data.accessToken);
  return data;
}
```

### 5.3 — Envoyer une alerte SOS ⚡

C'est la fonctionnalité principale du mobile : le citoyen appuie sur un bouton SOS.

```javascript
async function sendSOSAlert(type, description, location, coords) {
  const token = await AsyncStorage.getItem('citizen_token');
  const res = await fetch(`${BASE_URL}/api/mobile/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      type,            // 'vol' | 'agression' | 'accident' | 'incendie' | 'autre'
      description,     // "On me vole mon téléphone"
      location,        // "Marché Central, Gombe"
      latitude: coords.latitude,
      longitude: coords.longitude,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.alert; // contient la référence ALT-2024-XXX
}
```

**Effet :** l'alerte apparaît **immédiatement** dans le tableau de bord du Centre de Commandement (via Realtime).

### 5.4 — Déposer une plainte

```javascript
async function submitComplaint(type, description, location) {
  const token = await AsyncStorage.getItem('citizen_token');
  const res = await fetch(`${BASE_URL}/api/mobile/complaints`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ type, description, location }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  return data.complaint;
}
```

### 5.5 — Suivre ses alertes/plaintes

```javascript
async function getMyAlerts() {
  const token = await AsyncStorage.getItem('citizen_token');
  const res = await fetch(`${BASE_URL}/api/mobile/alerts`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  return res.json(); // { alerts: [...] }
}
```

### 5.6 — Voir les avis de recherche

```javascript
// Endpoint public, pas d'auth nécessaire
async function getWantedCriminals() {
  const res = await fetch(`${BASE_URL}/api/mobile/criminals/wanted`);
  const data = await res.json();
  return data.wanted; // tableau de criminels recherchés
}
```

### 5.7 — Téléverser une preuve (photo/vidéo)

```javascript
async function uploadEvidence(uri, type = 'photo') {
  const token = await AsyncStorage.getItem('citizen_token');
  const formData = new FormData();
  formData.append('file', { uri, type: 'image/jpeg', name: 'evidence.jpg' });
  formData.append('type', type);

  const res = await fetch(`${BASE_URL}/api/mobile/upload`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData,
  });
  const data = await res.json();
  return data.fileUrl; // URL publique du fichier
}
```

---

## 6. Realtime — Notifications push directes

L'application mobile peut écouter Supabase Realtime directement pour recevoir des notifications en temps réel (ex: nouveau criminel recherché dans la zone).

```javascript
import { supabase } from './supabase-client';

// Écouter les nouveaux criminels recherchés
supabase
  .channel('wanted-criminals')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'criminals', filter: 'status=eq.recherche' },
    (payload) => {
      const criminal = payload.new;
      // Afficher une notification push
      Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Avis de recherche',
          body: `${criminal.first_name} ${criminal.last_name} - ${criminal.last_known_addr}`,
        },
        trigger: null,
      });
    }
  )
  .subscribe();

// Écouter le changement de statut d'une de ses plaintes
supabase
  .channel('my-complaints')
  .on('postgres_changes',
    { event: 'UPDATE', schema: 'public', table: 'complaints', filter: `citizen_id=eq.${citizenId}` },
    (payload) => {
      const complaint = payload.new;
      if (complaint.status === 'approuvee') {
        alert('Votre plainte a été approuvée par la PNC !');
      }
    }
  )
  .subscribe();
```

---

## 7. Authentification Supabase directe (alternative)

Pour une authentification native sans passer par les endpoints REST, l'application mobile peut utiliser Supabase Auth directement :

```javascript
import { supabase } from './supabase-client';

// Inscription
const { data, error } = await supabase.auth.signUp({
  email: 'citoyen@example.com',
  password: 'motdepasse123',
  phone: '+243820000000',
  options: {
    data: { firstName: 'Aimé', lastName: 'Kalala' },
  },
});

// Connexion
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'citoyen@example.com',
  password: 'motdepasse123',
});

// Récupérer la session
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session.access_token;
```

Le profil étendu du citoyen (téléphone, commune, localisation GPS) est stocké dans la table `public.citizens`, liée à `auth.users` via la colonne `auth_uid`.

---

## 8. Sécurité — Row Level Security (RLS)

Le schéma SQL définit des politiques RLS qui contrôlent l'accès aux données :

| Table | Lecture (anon) | Écriture (anon) |
|-------|----------------|-----------------|
| `provinces`, `districts`, `sous_districts`, `commissariats` | ✅ Publique | ❌ |
| `citizens` | ✅ Son propre profil uniquement | ✅ Son propre profil |
| `alerts` | ✅ Ses propres alertes | ✅ Créer une alerte |
| `complaints` | ✅ Ses propres plaintes | ✅ Créer une plainte |
| `criminals` | ✅ Uniquement `status='recherche'` | ❌ |
| `officers`, `users_pnc`, `cases`, `evidence`, `services` | ❌ | ❌ |

**Le Centre de Commandement** utilise la clé `service_role` qui **bypass** toutes les politiques RLS → accès complet à toutes les données.

**L'application mobile** utilise la clé `anon` → soumise aux politiques RLS → ne voit que ce qu'elle a le droit de voir.

---

## 9. Mode local (sans Supabase)

Si Supabase n'est pas configuré, le Centre de Commandement fonctionne avec une base SQLite locale (mode démo). Les endpoints `/api/mobile/*` restent fonctionnels mais :

- Les données sont stockées localement (non partagées avec le mobile)
- Pas de Realtime (polling toutes les 15 secondes à la place)
- Les fichiers téléversés ne sont pas persistés
- L'authentification utilise un jeton simplifié (base64)

Pour tester le flux complet mobile → web en local :
1. Démarrez le serveur : `bun run dev`
2. Notez votre IP locale : `ip addr show wlan0 | grep inet`
3. Configurez `BASE_URL = http://VOTRE_IP:3000` dans le mobile
4. Connectez le mobile au même réseau WiFi que le serveur

---

## 10. Flux de données complets

### Alerte SOS (mobile → web)

```
1. Citoyen appuie sur SOS dans le mobile
2. Mobile appelle POST /api/mobile/alerts
3. Serveur web crée l'alerte dans Supabase (table alerts)
4. Supabase Realtime diffuse l'événement INSERT
5. Le Centre de Commandement (abonné au canal) reçoit l'alerte
6. Toast notification + liste mise à jour automatiquement
7. L'agent PNC assigne l'alerte à un officier
8. Le statut passe à "en_cours" puis "traitee"
9. (Optionnel) Le mobile est notifié du changement de statut
```

### Plainte (mobile → web → mobile)

```
1. Citoyen remplit le formulaire de plainte dans le mobile
2. Mobile appelle POST /api/mobile/complaints
3. Plainte créée avec statut "soumise"
4. La PNC examine la plainte dans le Centre de Commandement
5. La PNC approuve/rejette (statut → "approuvee" ou "rejetee")
6. Supabase Realtime notifie le mobile
7. Le citoyen voit le statut mis à jour dans son app
```

---

## 11. Déploiement en production

### Web (Centre de Commandement)

1. Déployez sur [Vercel](https://vercel.com) : `vercel --prod`
2. Configurez les variables d'environnement dans Vercel Dashboard
3. L'URL publique (`https://pnc-command-center.vercel.app`) devient le `BASE_URL` du mobile

### Mobile

1. Construisez l'APK/IPA :
   ```bash
   # Expo EAS Build
   eas build --platform android --profile production
   eas build --platform ios --profile production
   ```
2. Configurez `EXPO_PUBLIC_SUPABASE_URL` et `EXPO_PUBLIC_SUPABASE_ANON_KEY` dans `eas.json`
3. Publiez sur le Play Store / App Store

---

## 12. Dépannage

| Problème | Solution |
|----------|----------|
| `fetch failed` depuis le mobile | Vérifiez que le mobile et le serveur sont sur le même réseau, ou utilisez ngrok |
| `Jeton invalide` | Le token a expiré, reconnectez-vous |
| Les alertes n'apparaissent pas en temps réel | Vérifiez que Realtime est activé (SQL exécuté) et que le bucket existe |
| `Row Level Security` bloque l'accès | Le mobile doit utiliser la clé `anon` (pas `service_role`) |
| Les images ne s'affichent pas | Vérifiez que le bucket `pnc-evidence` est public |

---

## 13. Fichiers de référence

| Fichier | Rôle |
|---------|------|
| `src/lib/supabase.ts` | Clients Supabase (server, browser, user) |
| `src/lib/repositories.ts` | Couche d'accès aux données (dual Supabase/Prisma) |
| `src/lib/use-realtime.ts` | Hook Realtime pour le web |
| `src/app/api/mobile/*` | 11 endpoints API pour le mobile |
| `supabase/migrations/0001_init_pnc_schema.sql` | Schéma PostgreSQL complet |
| `supabase/migrations/0002_seed_data.sql` | Données de démonstration |
| `.env.example` | Template de configuration |

---

**Contact technique** : Pour toute question sur l'intégration, consultez la section **Backend & Mobile** dans le Centre de Commandement (icône smartphone dans la barre latérale).
