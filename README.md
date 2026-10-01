# 🚨 Police Nationale Congolaise — Centre de Commandement

Plateforme logicielle professionnelle pour la PNC (Police Nationale Congolaise, RDC), destinée à être déployée comme **logiciel installable sur Windows**. Connectée à l'application mobile citoyenne **PNC Alerte** via un backend NestJS partagé.

## 🏗️ Architecture

```
┌─────────────────────────────┐     ┌─────────────────────────────┐     ┌─────────────────────────────┐
│  Frontend Web (Next.js 16)   │     │  Backend NestJS (port 3001) │     │  PostgreSQL + PostGIS       │
│  + Maplibre GL (cartes)      │◄───►│  + Socket.io (temps réel)   │◄───►│  (ou PGlite en dev)         │
│  + shadcn/ui                 │     │  + Turf.js (géospatial)      │     │                              │
└─────────────────────────────┘     └─────────────────────────────┘     └─────────────────────────────┘
                ▲                                 ▲
                │                                 │
                └──────────────┬──────────────────┘
                               │
                  ┌────────────┴────────────┐
                  │  Application Mobile      │
                  │  "PNC Alerte"            │
                  │  (React Native + Expo)   │
                  │  github.com/guylainboka/ │
                  │  pnc-alerte              │
                  └─────────────────────────┘
```

## 📋 Pile Technique

| Couche | Technologie | Rôle |
|--------|-------------|------|
| **Frontend** | Next.js 16 / TypeScript | Interface utilisateur, rendu rapide, gestion de l'application |
| **Cartographie** | Maplibre GL | Cartes vectorielles, marqueurs SOS temps réel, itinéraires secours |
| **Backend** | NestJS (Node.js) / TypeScript | Architecture d'entreprise, API REST, WebSockets |
| **Temps réel** | Socket.io | Poussée instantanée des alertes SOS vers le centre de contrôle |
| **Base de données** | PostgreSQL + PostGIS | Stockage GPS, calcul de distances, requêtes géographiques |
| **UI Components** | shadcn/ui (New York) + Tailwind 4 | Design system cohérent |
| **State** | Zustand | État client React |
| **Auth** | JWT signé (NestJS) | Authentification admin/agent/citoyen |
| **Dev Database** | PGlite (PostgreSQL WASM) | Aucune installation serveur requise en développement |
| **Spatial (dev)** | Turf.js | Calculs géospatiaux sans PostGIS |

## 🚀 Installation Développement

### Prérequis
- [Bun](https://bun.sh) >= 1.0 (runtime JavaScript)
- Node.js >= 20 (pour Next.js)
- Git

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/guylainboka/pnc-alerte.git
cd pnc-alerte

# 2. Installer les dépendances frontend
bun install

# 3. Installer les dépendances backend NestJS
cd mini-services/backend
bun install
cd ../..

# 4. Copier et configurer les variables d'environnement
cp .env.example .env.local
# Éditez .env.local si nécessaire (en dev, les valeurs par défaut fonctionnent)

# 5. Démarrer le backend NestJS (port 3001)
cd mini-services/backend
bun run dev
# → Backend tourne sur http://localhost:3001 avec PGlite embarquée

# 6. Dans un autre terminal, démarrer le frontend Next.js (port 3000)
cd /chemin/vers/pnc-alerte
bun run dev
# → Interface sur http://localhost:3000

# 7. Connexion (identifiants par défaut)
# Utilisateur : admin
# Mot de passe : admin123
```

## 🖥️ Packaging Windows Executable

Le projet peut être packagé comme **logiciel installable sur Windows** (`PNC-Command-Center.exe`).

### Méthode 1 : Tauri (recommandé, binaire léger ~10 Mo)

```bash
# Installer Rust + Tauri CLI
curl https://sh.rustup.rs -sSf | sh
cargo install tauri-cli --version "^1.5"

# Builder l'exécutable Windows
bun run build:tauri
# → dist/pnc-command-center_1.0.0_x64-setup.exe
```

Voir `docs/PACKAGING-WINDOWS.md` pour les instructions complètes.

### Méthode 2 : Electron (alternative, binaire ~150 Mo)

```bash
bun add -D electron electron-builder
bun run build:electron
# → dist/PNC-Command-Center-Setup-1.0.0.exe
```

## 📚 Documentation

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — Architecture détaillée
- [`docs/PACKAGING-WINDOWS.md`](docs/PACKAGING-WINDOWS.md) — Packaging Windows
- [`docs/API.md`](docs/API.md) — Référence API REST + Socket.io
- [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) — Déploiement production (PostgreSQL + PostGIS)

## 📊 Modules du Centre de Commandement

1. **Tableau de Bord** — KPIs, graphiques, carte live des SOS, notifications temps réel
2. **Alertes** — Signalements citoyens reçus via l'app mobile (Realtime Socket.io)
3. **Dossiers** — Gestion des affaires judiciaires
4. **Base Criminelle** — Fiches de criminels recherchés
5. **Plaintes** — Traitement des plaintes citoyennes
6. **Citoyens Inscrits** — Registre des utilisateurs de l'app mobile
7. **Personnes Disparues** — Signalements de disparitions
8. **Utilisateurs PNC** — Gestion des comptes agents/admin
9. **Intégrations** — Services externes (ANR, MCPI, etc.)
10. **Commissariats** — Hiérarchie territoriale

## 🛰️ Flux Temps Réel (Socket.io)

| Événement | Direction | Description |
|-----------|-----------|-------------|
| `sos:new` | Backend → Frontend | Nouvel appel SOS reçu depuis l'app mobile |
| `sos:update` | Backend → Frontend | Statut d'un SOS mis à jour (patrouille en route, clôturé) |
| `alert:new` | Backend → Frontend | Nouveau signalement citoyen |

## 🗃️ Schéma Base de Données (PostgreSQL)

### Tables principales (avec PostGIS geometry)
- `profiles` — Citoyens inscrits via l'app mobile
- `signalements` — Signalements citoyens (vol, agression, etc.)
- `plaintes` — Plaintes formelles
- `sos_calls` — Appels SOS en direct (avec POINT(latitude, longitude))
- `personnes_disparues` — Personnes disparues signalées
- `alertes_officielles` — Alertes diffusées aux citoyens
- `convocations`, `notifications`, `signalement_updates`, `plainte_updates`
- `commissariats`, `officers`, `users_pnc`, `evidence`

### Requêtes spatiales (PostGIS)
```sql
-- Trouver le commissariat le plus proche d'un SOS
SELECT name, ST_Distance(geom, ST_MakePoint(15.307, -4.325)::geography) as distance_m
FROM commissariats
ORDER BY distance_m
LIMIT 1;

-- Tous les SOS dans un rayon de 2 km d'un point
SELECT * FROM sos_calls
WHERE ST_DWithin(geom, ST_MakePoint(15.307, -4.325)::geography, 2000);
```

## 🔐 Sécurité

- **Auth JWT** signée côté NestJS
- **CORS** configuré pour le frontend uniquement
- **Validation** des entrées via class-validator (NestJS DTOs)
- **RLS** (Row Level Security) sur PostgreSQL en production
- **Service role** key jamais exposée côté client

## 🇨🇩 Contexte PNC RDC

- Interface 100% en français
- Coordonnées de Kinshasa par défaut (-4.325, 15.307)
- Couverture provinciale : Kinshasa, Haut-Katanga, etc.
- Noms congolais réalistes dans les données de démo

## 📄 Licence

Projet gouvernemental — Police Nationale Congolaise, République Démocratique du Congo.

## 👨‍💻 Auteur

**Guylain Boka** — [github.com/guylainboka](https://github.com/guylainboka)

Repository : [github.com/guylainboka/pnc-alerte](https://github.com/guylainboka/pnc-alerte)
