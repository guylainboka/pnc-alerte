# 🏛️ Architecture — PNC Command Center

## Vue d'ensemble

Le PNC Command Center est une plateforme logicielle professionnelle pour la Police Nationale Congolaise, composée de 3 briques connectées :

1. **Frontend web** (Next.js 16) — interface du centre de commande
2. **Backend API** (NestJS) — logique métier + temps réel
3. **Application mobile** (React Native) — PNC Alerte, pour les citoyens

## Diagramme d'architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                    POSTE OPERATEUR (Windows)                       │
│  ┌──────────────────────────────┐  ┌────────────────────────────┐ │
│  │  Frontend Next.js (port 3000) │  │  Backend NestJS (port 3001) │ │
│  │  - Maplibre GL (cartes)      │◄─┤  - API REST /api/*          │ │
│  │  - Socket.io Client          │  │  - Socket.io Server         │ │
│  │  - shadcn/ui + Tailwind 4    │  │  - PGlite/PostgreSQL        │ │
│  │  - Zustand state             │  │  - Turf.js spatial          │ │
│  └──────────────────────────────┘  └─────────────┬──────────────┘ │
└──────────────────────────────────────────────────┼─────────────────┘
                                                   │
                                                   ▼
                                        ┌────────────────────┐
                                        │ PostgreSQL 15      │
                                        │ + PostGIS 3.4      │
                                        │ (ou PGlite dev)    │
                                        └────────────────────┘
                                                   ▲
                                                   │
              ┌────────────────────────────────────┴─────────────────┐
              │             SMARTPHONES DES CITOYENS                  │
              │  ┌──────────────────────────────────────────────────┐ │
              │  │  App Mobile "PNC Alerte" (React Native + Expo)   │ │
              │  │  - Bouton SOS (envoie GPS + identité)            │ │
              │  │  - Signalements (vol, agression, corruption)     │ │
              │  │  - Plaintes formelles                            │ │
              │  │  - Réception alertes officielles PNC             │ │
              │  │  - Convocations                                  │ │
              │  │  - Geolocation continue                          │ │
              │  └──────────────────────────────────────────────────┘ │
              └────────────────────────────────────────────────────────┘
```

## Flux de données principaux

### 1. SOS Citoyen → Centre de Contrôle (temps réel)

```
[App Mobile] Bouton SOS appuyé
      │
      ▼
POST /api/sos { latitude, longitude, userId, ... }
      │
      ▼
[NestJS Backend] INSERT INTO sos_calls
      │
      ├──► [Socket.io] emit('sos:new', { reference, coords, ... })
      │         │
      │         ▼
      │    [Next.js Frontend] LiveMap reçoit l'événement
      │         │
      │         ├──► Ajoute un marqueur rouge pulsant sur la carte
      │         ├──► Centrage automatique de la carte sur le SOS
      │         ├──► Calcule le commissariat le plus proche (Turf.js)
      │         ├──► Affiche le popup avec nom, téléphone, GPS, heure
      │         └──► (Optionnel) Notification native Windows + bip sonore
      │
      └──► Réponse HTTP 201 Created au mobile
```

### 2. Statut SOS mis à jour → Mobile

```
[Centre] Clic "Patrouille en route" sur un SOS
      │
      ▼
PATCH /api/sos/:id { status: 'en-route' }
      │
      ▼
[NestJS] UPDATE sos_calls SET status='en-route'
      │
      ├──► [Socket.io] emit('sos:update', { id, status, ... })
      │         │
      │         ▼
      │    [Next.js] Met à jour le marqueur (orange) + popup
      │
      └──► 200 OK
```

### 3. Carte opérationnelle

```
Au chargement du dashboard :
  1. fetch /api/map/active-sos      → GeoJSON des SOS actifs
  2. fetch /api/map/commissariats   → GeoJSON des commissariats
  3. Render Maplibre GL avec :
     - Tuiles OpenStreetMap (raster)
     - Marqueurs verts (commissariats) + popups info
     - Marqueurs rouges pulsants (SOS actifs) + popups détaillés
  4. Connexion Socket.io pour mises à jour temps réel

À chaque nouveau SOS (event 'sos:new') :
  - Ajouter le marqueur sur la carte
  - Animer flyTo vers le SOS (zoom 15)
  - Calculer + afficher le commissariat le plus proche
```

## Modules du code

### Frontend (`src/`)
- `app/page.tsx` — Layout principal + routing des sections
- `lib/store.ts` — État Zustand (section active, auth, sidebar)
- `lib/supabase.ts` — Client Supabase (legacy, plus utilisé en mode NestJS)
- `components/pnc/` — 12 sections :
  - `dashboard.tsx` — Carte live + KPIs + graphiques
  - `live-map.tsx` — **NOUVEAU** Composant Maplibre GL + Socket.io
  - `live-sos-widget.tsx` — Liste SOS temps réel
  - `alerts-section.tsx`, `cases-section.tsx`, etc.
- `components/ui/` — shadcn/ui components

### Backend (`mini-services/backend/`)
- `index.ts` — Entry point (bun --hot)
- `src/main.ts` — NestJS bootstrap + CORS + Socket.io
- `src/app.module.ts` — Module racine
- `src/common/database/pg.client.ts` — PGlite singleton
- `src/common/database/schema.ts` — 14 tables (idempotent CREATE TABLE)
- `src/common/database/seed.ts` — Données démo Kinshasa
- `src/common/realtime/realtime.module.ts` — Gateways Socket.io
- `src/common/spatial/turf.helper.ts` — distance, bearing, nearestPoint
- `src/modules/sos/` — Controller + Service + Gateway (Socket.io)
- `src/modules/alerts/`, `citizens/`, `complaints/`, `disparus/`, `map/`, `auth/`

## Sécurité

### Authentification
- Le web admin utilise `POST /api/auth/login` → reçoit un JWT signé
- Le token est envoyé comme `Authorization: Bearer <token>` sur chaque requête
- Les routes NestJS utilisent un `AuthGuard` (à implémenter) pour vérifier le token
- Les citoyens mobiles utilisent un JWT séparé (signé côté mobile avec leur user_id)

### RLS PostgreSQL (production)
- Politique : `profiles` select/update own row only (user_id = auth.uid())
- Politique : `signalements` insert own row, select all (anonymisé)
- Politique : `sos_calls` insert own row, select own only (privacy)
- Politique : `commissariats` select public
- Le web admin utilise `service_role` pour bypass RLS (lecture/écriture totale)

### CORS
- NestJS : `origin: '*'` en dev, `origin: ['https://pnc.cd']` en prod
- Pas de credentials cross-origin (sauf authentification explicite)

## Choix techniques justifiés

### Pourquoi NestJS plutôt qu'Express simple ?
- Architecture modulaire (DI, modules, controllers, services)
- Décorateurs TypeScript (DTO validation automatique avec class-validator)
- Support natif des WebSockets via `@nestjs/platform-socket.io`
- Écosystème enterprise (Swagger/OpenAPI auto, interceptors, pipes, guards)
- Testabilité (mocking facile grâce à DI)

### Pourquoi PGlite en dev et PostgreSQL en prod ?
- **PGlite** : PostgreSQL complet en WASM, dans un fichier. Pas d'installation serveur. Idéal pour dev et pour le packaging Windows single-binary.
- **PostgreSQL + PostGIS** : en production, on veut des performances réelles, du PostGIS pour les requêtes spatiales (ST_Distance, ST_DWithin), et la possibilité de faire des sauvegardes avec pg_dump.
- Le code SQL est **identique** entre les deux — seule la connection string change.

### Pourquoi Maplibre GL plutôt que Leaflet ?
- Rendu vectoriel (zoom fluide, rotation 3D possible)
- Performance GPU (Leaflet est canvas-based, plus lent avec beaucoup de marqueurs)
- API moderne compatible WebGL
- Open source, fork de Mapbox GL JS libre (Mapbox est devenu propriétaire)

### Pourquoi Socket.io plutôt que WebSocket brut ?
- Reconnexion automatique (network flaky en RDC)
- Fallback HTTP polling si WS bloqué par proxy/pare-feu
- Rooms (diffuser à un groupe d'opérateurs seulement)
- API simple (côté client ET serveur)

### Pourquoi Turf.js en plus de PostGIS ?
- En dev (PGlite sans PostGIS), on peut quand même faire des calculs géospatiaux
- Certains calculs sont plus rapides en JS qu'en SQL (nearest neighbor sur peu de points)
- En prod, les requêtes lourdes utilisent PostGIS ; le JS fait les calculs légers

## Évolutivité

### Scale horizontal
- Le backend NestJS est stateless (sauf Socket.io qui peut utiliser l'adaptateur Redis)
- Pour scale : ajouter `@nestjs/cache-manager` + `cache-manager-redis-store`
- Adapter Socket.io : `@socket.io/redis-adapter` pour synchroniser entre instances

### Multi-tenant (plusieurs commissariats)
- Ajouter un champ `commissariat_id` sur `users_pnc`
- Le token JWT contient le commissariat_id
- Toutes les requêtes filtrent par commissariat_id automatiquement (interceptor NestJS)

## Limitations actuelles (à adresser en prod)

1. **JWT secret** : actuellement en clair dans le code. En prod, charger depuis env var et utiliser une clé de 64+ caractères aléatoires.
2. **HTTPS** : le backend écoute en HTTP. En prod, utiliser un reverse proxy (Nginx/Caddy) avec TLS.
3. **Uploads** : les photos de preuves vont dans `./uploads/` (filesystem local). En prod, utiliser Supabase Storage, S3, ou un serveur MinIO.
4. **Backup** : PGlite écrit dans un fichier. En prod, pg_dump programmé chaque nuit.
5. **Logs** : console.log. En prod, utiliser Pino (logger structuré) + rotation de fichiers.
