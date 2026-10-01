# 📱 API Mobile — PNC Alerte

Documentation complète de l'API REST + Socket.io à utiliser par l'application mobile **PNC Alerte** pour communiquer avec le Centre de Commandement PNC.

## 🔌 Configuration

```typescript
// Dans l'app mobile (React Native / Expo)
const API_BASE_URL = 'https://votre-domaine-pnc.cd';  // ou http://localhost:81 en dev
const API_PORT = 3001;  // backend NestJS
const SOCKET_IO_PATH = '/socket.io/';

// Toutes les requêtes passent par la gateway Caddy :
// GET  https://votre-domaine-pnc.cd/api/sos?XTransformPort=3001
// POST https://votre-domaine-pnc.cd/api/sos?XTransformPort=3001
// Socket.io : io('/?XTransformPort=3001')
```

## 🔐 Authentification

### Inscription citoyen
```http
POST /api/auth/register?XTransformPort=3001
Content-Type: application/json

{
  "username": "jean.mbumba",
  "password": "MonMotDePasse123",
  "phone": "+243810000001",
  "firstName": "Jean",
  "lastName": "Mbumba",
  "commune": "Gombe"
}

# Réponse 201 Created
{
  "user": {
    "id": "uuid",
    "username": "jean.mbumba",
    "role": "citoyen"
  },
  "accessToken": "eyJhbGci..."  // JWT signé valable 24h
}
```

### Connexion
```http
POST /api/auth/login?XTransformPort=3001
Content-Type: application/json

{
  "username": "jean.mbumba",
  "password": "MonMotDePasse123"
}

# Réponse 200 OK
{
  "user": {
    "id": "uuid",
    "username": "jean.mbumba",
    "role": "citoyen",
    "firstName": "Jean",
    "lastName": "Mbumba"
  },
  "accessToken": "eyJhbGci..."
}
```

### Utilisation du token
Toutes les requêtes suivantes doivent inclure le header :
```
Authorization: Bearer eyJhbGci...
```

## 🚨 SOS — Appels d'urgence

### Déclencher un SOS
```http
POST /api/sos?XTransformPort=3001
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "latitude": -4.325,
  "longitude": 15.307,
  "locationText": "Av. du Commerce, Gombe — proche du bâtiment administratif",
  "notes": "Agression en cours, besoin d'aide immédiate"
}

# Réponse 201 Created
{
  "id": "uuid",
  "reference": "SOS-2026-001",
  "status": "actif",
  "createdAt": "2026-01-15T01:53:16.862Z"
}
```

⚠️ Le SOS est immédiatement diffusé à tous les opérateurs authentifiés du Centre de Commandement via Socket.io événement `sos:new`. Un marqueur rouge pulsant apparaît sur leur carte.

### Lister ses propres SOS
```http
GET /api/sos?XTransformPort=3001
Authorization: Bearer eyJhbGci...

# Réponse 200 OK
[
  {
    "id": "uuid",
    "reference": "SOS-2026-001",
    "status": "en-route",  // actif | en-route | sur-place | cloture | annule
    "latitude": -4.325,
    "longitude": 15.307,
    "locationText": "...",
    "createdAt": "2026-01-15T01:53:16.862Z",
    "closedAt": null
  }
]
```

### Voir le statut d'un SOS
```http
GET /api/sos/{id}?XTransformPort=3001
Authorization: Bearer eyJhbGci...
```

## 📝 Signalements (non urgents)

### Créer un signalement
```http
POST /api/alerts?XTransformPort=3001
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "type": "vol",          // vol | agression | violence | trafic | corruption | nuisance | autre
  "description": "Vol à main armée au marché central",
  "location": "Marché Central, Gombe",
  "latitude": -4.3225,
  "longitude": 15.3089,
  "priority": "haute"     // basse | moyenne | haute | critique
}

# Réponse 201 Created
{
  "id": "uuid",
  "reference": "SIG-2026-001",
  "status": "en-attente"
}
```

### Lister ses signalements
```http
GET /api/alerts?XTransformPort=3001
Authorization: Bearer eyJhbGci...
```

## 📋 Plaintes formelles

### Déposer une plainte
```http
POST /api/complaints?XTransformPort=3001
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "type": "vol",          // vol | escroquerie | agression | harcèlement | violence | autre
  "description": "J'ai été victime d'une escroquerie de 5000$",
  "location": "Kinshasa, Gombe"
}

# Réponse 201 Created
{
  "id": "uuid",
  "reference": "PLT-2026-001",
  "status": "en-attente"
}
```

### Suivre ses plaintes
```http
GET /api/complaints?XTransformPort=3001
Authorization: Bearer eyJhbGci...
```

## 👤 Personnes disparues

### Signaler une disparition
```http
POST /api/disparus?XTransformPort=3001
Authorization: Bearer eyJhbGci...
Content-Type: application/json

{
  "nomComplet": "Junior Mbumba",
  "age": 12,
  "sexe": "M",
  "description": "Enfant, 1m40, tee-shirt jaune, short bleu, sac à dos rouge",
  "derniereVueLieu": "Marché Central, Gombe",
  "derniereVueDate": "2026-01-12",
  "contactTelephone": "+243810000001"
}

# Réponse 201 Created
{
  "id": "uuid",
  "reference": "DIS-2026-001",
  "status": "recherche"
}
```

## 🗺️ Carte — Données publiques

### Commissariats
```http
GET /api/map/commissariats?XTransformPort=3001
Authorization: Bearer eyJhbGci...

# Réponse 200 OK (GeoJSON FeatureCollection)
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [15.307, -4.325] },
      "properties": {
        "id": "uuid",
        "name": "Commissariat Central de Gombe",
        "code": "COM-GOM"
      }
    }
  ]
}
```

### Commissariat le plus proche
```http
GET /api/map/nearest-commissariat?lat=-4.325&lon=15.307&XTransformPort=3001
Authorization: Bearer eyJhbGci...

# Réponse 200 OK
{
  "id": "uuid",
  "name": "Commissariat Central de Gombe",
  "code": "COM-GOM",
  "distance": 0.45,
  "bearing": 90
}
```

## 🔄 Temps réel — Socket.io

L'app mobile peut s'abonner aux mises à jour en temps réel pour :
- Voir le statut de son SOS changer (patrouille en route, clôturé)
- Recevoir les alertes officielles PNC
- Être notifié des convocations

### Connexion
```typescript
import { io } from 'socket.io-client';

const socket = io('/?XTransformPort=3001', {
  transports: ['websocket'],
  auth: {
    token: 'eyJhbGci...'  // JWT obtenu au login
  }
});

socket.on('connect', () => {
  console.log('Connecté au Centre de Commandement');
});

socket.on('connect_error', (err) => {
  console.error('Connexion échouée:', err.message);
});
```

### Événements à écouter

#### `sos:update` — Statut d'un SOS mis à jour
```typescript
socket.on('sos:update', (sos) => {
  // { id, reference, status: 'en-route', agentAssigned, ... }
  showNotification('SOS ' + sos.reference, 'Patrouille en route vers vous');
});
```

#### `alert:new` — Nouveau signalement reçu (à ignorer côté mobile)
Diffusé aux opérateurs du centre, pas aux citoyens.

#### `alerte_officielle:new` — Alerte officielle PNC
```typescript
socket.on('alerte_officielle:new', (alerte) => {
  // { titre, type, severity: 'high'|'medium'|'low', description, location }
  if (alerte.severity === 'high') {
    showPushNotification(alerte.titre, alerte.description);
  }
});
```

#### `convocation:new` — Convocation reçue
```typescript
socket.on('convocation:new', (convocation) => {
  // { reference, date, lieu, motif }
  saveConvocationInInbox(convocation);
});
```

## 📋 Codes de statut HTTP

| Code | Signification |
|------|---------------|
| 200 | OK — requête réussie |
| 201 | Created — ressource créée |
| 400 | Bad Request — validation échouée (voir `message` dans la réponse) |
| 401 | Unauthorized — token JWT manquant ou invalide |
| 403 | Forbidden — vous n'avez pas les droits (ex: citoyen essayant d'accéder aux données PNC) |
| 404 | Not Found — ressource introuvable |
| 429 | Too Many Requests — rate limiting (100 req / 15 min sur login) |
| 500 | Internal Server Error — erreur backend |

## 🛡️ Sécurité

- **JWT signé** avec HMAC-SHA256, expire après 24h
- **Bcrypt** pour le hash des mots de passe (10 rounds de sel)
- **Rate limiting** : 100 tentatives de login / 15 min par IP
- **Helmet** : headers de sécurité (HSTS, X-Frame-Options, CSP, etc.)
- **CORS** : origines autorisées configurables via `CORS_ORIGIN`
- **Validation** : tous les DTOs validés avec class-validator
- **Socket.io authentifié** : seuls les opérateurs authentifiés reçoivent les SOS
- **Logs** : aucune donnée sensible loggée

## 🧪 Exemples complets (curl)

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:81/api/auth/login?XTransformPort=3001 \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}' \
  | python3 -c "import json,sys; print(json.load(sys.stdin)['accessToken'])")

# 2. Déclencher un SOS
curl -X POST "http://localhost:81/api/sos?XTransformPort=3001" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": -4.325,
    "longitude": 15.307,
    "locationText": "Av. du Commerce, Gombe",
    "notes": "Test SOS"
  }'

# 3. Lister les SOS
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:81/api/sos?XTransformPort=3001"

# 4. Carte GeoJSON
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:81/api/map/active-sos?XTransformPort=3001"
```

## 📦 Intégration React Native (PNC Alerte)

```typescript
// services/pnc-api.ts
import { io, Socket } from 'socket.io-client';

const API_BASE = 'https://votre-domaine-pnc.cd';
const PORT_QUERY = 'XTransformPort=3001';

class PNCClient {
  private token: string | null = null;
  private socket: Socket | null = null;

  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/api/auth/login?${PORT_QUERY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    if (!res.ok) throw new Error('Identifiants invalides');
    const data = await res.json();
    this.token = data.accessToken;
    this.connectSocket();
    return data.user;
  }

  private connectSocket() {
    if (!this.token) return;
    this.socket = io(`${API_BASE}/?${PORT_QUERY}`, {
      transports: ['websocket'],
      auth: { token: this.token }
    });
    this.socket.on('sos:update', (sos) => {
      // Notifier l'utilisateur du changement de statut
    });
    this.socket.on('alerte_officielle:new', (alerte) => {
      // Push notification
    });
  }

  async sendSOS(lat: number, lon: number, locationText: string, notes: string) {
    const res = await fetch(`${API_BASE}/api/sos?${PORT_QUERY}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ latitude: lat, longitude: lon, locationText, notes })
    });
    if (!res.ok) throw new Error('Échec envoi SOS');
    return res.json();
  }

  async sendSignalement(type: string, description: string, location: string, lat: number, lon: number) {
    const res = await fetch(`${API_BASE}/api/alerts?${PORT_QUERY}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ type, description, location, latitude: lat, longitude: lon })
    });
    if (!res.ok) throw new Error('Échenvoi signalement');
    return res.json();
  }

  async getNearestCommissariat(lat: number, lon: number) {
    const res = await fetch(
      `${API_BASE}/api/map/nearest-commissariat?lat=${lat}&lon=${lon}&${PORT_QUERY}`,
      { headers: { 'Authorization': `Bearer ${this.token}` } }
    );
    if (!res.ok) throw new Error('Échec géolocalisation');
    return res.json();
  }
}

export const pncClient = new PNCClient();
```

## 🔄 Workflow complet d'un SOS

```
1. Citoyen appuie sur le bouton SOS dans l'app PNC Alerte
   ↓
2. App mobile obtient la position GPS (expo-location)
   ↓
3. App mobile POST /api/sos?XTransformPort=3001 (avec Bearer JWT)
   ↓
4. NestJS backend :
   - INSERT INTO sos_calls (PostgreSQL)
   - Calcul du commissariat le plus proche (Turf.js / PostGIS)
   - emit('sos:new', sos) via Socket.io aux opérateurs authentifiés
   ↓
5. Centre de Commandement (Next.js frontend) :
   - Socket.io reçoit 'sos:new'
   - Marqueur rouge pulsant ajouté sur la carte Maplibre GL
   - Centrage automatique + zoom 15 sur le SOS
   - Affichage du commissariat le plus proche
   - (Optionnel) Notification native + bip sonore
   ↓
6. Opérateur clique "Patrouille en route"
   ↓
7. NestJS : PATCH /api/sos/:id { status: 'en-route' }
   - UPDATE sos_calls SET status='en-route'
   - emit('sos:update', sos) via Socket.io
   ↓
8. App mobile (citoyen) : reçoit 'sos:update'
   - Affiche "Patrouille en route vers vous"
   - Notifie le citoyen que l'aide arrive
```

---

**Contact technique** : Guylain Boka — github.com/guylainboka
**Repository** : github.com/guylainboka/pnc-alerte
