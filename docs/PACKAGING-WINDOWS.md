# 🖥️ Packaging Windows Executable — PNC Command Center

Ce document explique comment packager le Centre de Commandement PNC comme **logiciel installable sur Windows** (fichier `.exe` ou `.msi`).

## ✅ Méthode 4 : Build croisé depuis Linux (DÉJÀ EFFECTUÉ — artifacts fournis)

Le dépôt contient désormais un **pipeline de build croisé** qui produit les exécutables Windows directement depuis Linux (aucune machine Windows requise). Deux outils sont utilisés :

| Outil | Rôle | Commande |
|---|---|---|
| `bun build --compile --target=bun-windows-x64` | Backend NestJS → `PNC-Backend.exe` (runtime Bun embarqué, PGlite WASM) | Voir § Backend |
| `@yao-pkg/pkg --target node22-win-x64` | Frontend Next.js → `PNC-Command-Center.exe` (runtime Node 22 embarqué) | Voir § Frontend |

### Artifacts produits (`dist/`)

```
dist/
├── PNC-Backend.exe                # 98 Mo — backend NestJS autonome (port 3001)
├── PNC-Command-Center.exe         # 55 Mo — lanceur Node 22 + app Next.js (port 3000)
├── PNC-Alerte-Windows/            # package portable complet
│   ├── PNC-Command-Center.exe
│   ├── PNC-Backend.exe
│   ├── app/                       # build standalone Next.js (fichiers réels)
│   ├── db/custom.db               # base SQLite du centre de commandement
│   ├── pglite-assets/             # pglite.wasm, pglite.data, initdb.wasm
│   ├── Demarrer-PNC.bat           # démarrage complet + navigateur
│   ├── Arreter-PNC.bat            # arrêt propre
│   └── LISEZMOI-WINDOWS.txt       # guide utilisateur (installation, comptes démo)
└── PNC-Alerte-Windows-1.0.0.zip   # archive de distribution (~150 Mo)
```

### Fonctionnement du package

1. `Demarrer-PNC.bat` lance `PNC-Backend.exe` (NestJS + PGlite, données dans `pnc-data/`) puis `PNC-Command-Center.exe`
2. Le lanceur embarque un runtime Node.js : il définit les variables par défaut (`DATABASE_URL`, `JWT_SECRET`, `PORT`) et charge `app/server.js`
3. Le frontend Next.js proxifie les appels `?XTransformPort=3001` vers `127.0.0.1:3001` via les **rewrites** de `next.config.ts` (aucune gateway Caddy requise sur Windows)
4. Le navigateur s'ouvre sur `http://localhost:3000` — compte démo : `admin / admin123`

### Points techniques importants (leçons du build)

- **PGlite en binaire compilé** : `pglite.data` (image filesystem EMSCRIPTEN) ne peut pas être intégré au bundle Bun. Le backend charge donc `pglite.wasm`, `pglite.data` et `initdb.wasm` depuis le dossier `pglite-assets/` à côté de l'EXE (voir `pg.client.ts`, mode `isCompiledBinary()` via `Bun.embeddedFiles`).
- **pkg + Next.js standalone** : le tracer statique de pkg ne gère pas les `require()` à chemin calculé de Next 16. L'EXE est donc un **lanceur léger** (runtime Node + `scripts/pkg-launcher.js`) qui charge l'application depuis le dossier réel `app/` — fiable à 100 %.
- **`process.chdir()`** vers `/snapshot/...` est impossible sous pkg : le lanceur exécute `chdir` sur un dossier réel.
- **`node:inspector`** est absent du runtime pkg : `scripts/pkg-launcher.js` injecte un stub (Next l'utilise uniquement pour afficher le port du debugger).
- **Prisma** : `binaryTargets = ["native", "windows"]` dans `schema.prisma` génère `query_engine-windows.dll.node` ; le chemin SQLite est résolu depuis `process.execPath` (slashs normalisés pour Prisma).
- **Images** : `images.unoptimized = true` supprime la dépendance au module natif `sharp` dans l'EXE.

### Reconstruire les EXE

```bash
# 0. Build du frontend standalone
bun run db:generate && bun run build

# 1. Backend Windows (cross-compile)
cd mini-services/backend
bun build --compile --target=bun-windows-x64 --external @nestjs/microservices \
  index.ts --outfile ../../dist/PNC-Backend.exe
cd ../..

# 2. Lanceur frontend Windows
bunx pkg scripts/pkg-launcher.js --config pkg.config.json \
  --target node22-win-x64 --output dist/PNC-Command-Center.exe

# 3. Assembler dist/PNC-Alerte-Windows/ (voir structure ci-dessus) puis zipper
```

---

## 🎯 Objectif

L'utilisateur final (le commissaire de police, l'opérateur du centre de contrôle) doit pouvoir :
1. Télécharger UN fichier d'installation (`PNC-Command-Center-Setup-1.0.0.exe`)
2. Double-cliquer → installation standard Windows (Next → Next → Finish)
3. Démarrer le logiciel depuis le menu Démarrer
4. L'icône "PNC Command Center" apparaît sur le bureau
5. Au lancement : le frontend s'ouvre dans une fenêtre native, le backend NestJS démarre en arrière-plan

---

## 🛠️ Méthode 1 : Tauri (RECOMMANDÉ pour un installateur signé — binaire léger ~10 Mo)

Tauri embarque le frontend web dans une fenêtre native Windows en utilisant le WebView2 (déjà installé sur Windows 10/11). Le backend NestJS tourne comme sidecar (processus enfant).

### Prérequis (machine de build)
- Windows 10/11 (ou cross-compile depuis Linux avec les targets appropriés)
- [Rust](https://rustup.rs) installé
- [Node.js](https://nodejs.org) >= 20
- [Bun](https://bun.sh) >= 1.0
- Microsoft Visual C++ Build Tools (pour compiler les binaires Rust)

### Structure à créer

```
src-tauri/
├── Cargo.toml              # Config Rust
├── tauri.conf.json         # Config Tauri (window, app, bundle)
├── build.rs
├── icons/
│   ├── icon.ico            # Icône Windows (convertir depuis /public/icons/icon-256.png)
│   └── icon.png            # = /public/icons/icon-512.png (logo officiel redimensionné)
└── src/
    └── main.rs             # Point d'entrée Rust (lance le sidecar NestJS + charge la fenêtre)
```

### `tauri.conf.json` (extrait)

```json
{
  "productName": "PNC Command Center",
  "version": "1.0.0",
  "identifier": "cd.pnc.commandcenter",
  "build": {
    "beforeDevCommand": "bun run dev",
    "beforeBuildCommand": "bun run build && cd mini-services/backend && bun run build:prod",
    "devPath": "http://localhost:3000",
    "distDir": "../dist"
  },
  "tauri": {
    "bundle": {
      "active": true,
      "targets": ["msi", "nsis"],
      "icon": ["icons/icon.ico"],
      "resources": ["../mini-services/backend/dist/*"],
      "externalBin": ["../mini-services/backend/dist/pnc-backend"]
    }
  }
}
```

### `main.rs` (lance le backend + frontend)

```rust
#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn main() {
    tauri::Builder::default()
        .setup(|app| {
            // Démarrer le backend NestJS en sidecar
            let backend = std::process::Command::new(app.path()
                .resolve("pnc-backend", tauri::path::BaseDirectory::Resources)?)
                .spawn()?;
            app.manage(backend);
            Ok(())
        })
        .on_window_event(|event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Tuer le backend quand on ferme la fenêtre
                std::process::exit(0);
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### Build

```bash
# Installer Tauri CLI
cargo install tauri-cli --version "^1.5"

# Builder l'installateur Windows
bun run build:tauri
# → src-tauri/target/release/bundle/msi/PNC-Command-Center_1.0.0_x64_en-US.msi
# → src-tauri/target/release/bundle/nsis/PNC-Command-Center_1.0.0_x64-setup.exe
```

### Avantages Tauri
- ✅ Binaire léger (~10 Mo vs 150 Mo pour Electron)
- ✅ Démarrage rapide (< 1s)
- ✅ Utilise WebView2 natif (pas de Chromium embarqué)
- ✅ Installateur MSI et NSIS générés automatiquement
- ✅ Permissions Windows natives (fichiers, registre)

---

## 🛠️ Méthode 2 : Electron (alternative, plus simple mais binaire lourd ~150 Mo)

### Structure

```
electron/
├── main.js          # Process principal (lance backend NestJS + charge frontend)
├── preload.js
└── package.json
```

### `electron/main.js`

```javascript
const { app, BrowserWindow } = require('electron');
const { spawn } = require('child_process');
const path = require('path');

let backendProcess = null;
let mainWindow = null;

function startBackend() {
  const backendPath = process.env.NODE_ENV === 'production'
    ? path.join(process.resourcesPath, 'backend', 'index.js')
    : path.join(__dirname, '..', 'mini-services', 'backend', 'index.js');

  backendProcess = spawn('node', [backendPath], { stdio: 'pipe' });
  backendProcess.stdout.on('data', (data) => console.log(`[backend] ${data}`));
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'PNC Command Center',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
    },
  });

  // En dev : charger le serveur Next.js ; en prod : charger le build statique
  if (process.env.NODE_ENV === 'production') {
    mainWindow.loadFile(path.join(__dirname, '..', 'out', 'index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }
}

app.whenReady().then(() => {
  startBackend();
  setTimeout(createWindow, 2000); // attendre que le backend démarre
});

app.on('window-all-closed', () => {
  if (backendProcess) backendProcess.kill();
  app.quit();
});
```

### Build avec electron-builder

```bash
# Installer
bun add -D electron electron-builder

# Configurer dans package.json
# "build": {
#   "appId": "cd.pnc.commandcenter",
#   "productName": "PNC Command Center",
#   "files": ["out/**/*", "electron/**/*", "mini-services/backend/**/*"],
#   "win": {
#     "target": ["nsis"],
#     "icon": "public/pnc-icon.ico"
#   },
#   "nsis": {
#     "oneClick": false,
#     "allowToChangeInstallationDirectory": true,
#     "createDesktopShortcut": true,
#     "createStartMenuShortcut": true
#   }
# }

# Build
bun run build:electron
# → dist/PNC-Command-Center-Setup-1.0.0.exe
```

---

## 🛠️ Méthode 3 : Script PowerShell (le plus simple, sans compilation)

Pour un déploiement interne rapide sans compiler Rust/Electron :

1. Builder le frontend statique : `bun run build && bun run export` → `out/`
2. Compiler le backend en bundle : `cd mini-services/backend && bun build index.ts --outdir dist --target bun`
3. Créer un script `install.bat` qui :
   - Copie les fichiers dans `C:\Program Files\PNC-Command-Center\`
   - Crée un raccourci sur le bureau
   - Crée une entrée dans le menu Démarrer
4. Créer un script `start.bat` qui :
   - Démarre le backend NestJS en arrière-plan
   - Ouvre le navigateur par défaut sur `http://localhost:3001`
5. Tout zipper et distribuer

### `start.bat` exemple

```batch
@echo off
cd /d "C:\Program Files\PNC-Command-Center"
start /B "" "backend\pnc-backend.exe"
timeout /t 3 /nobreak >nul
start "" "http://localhost:3001"
```

---

## ✅ Checklist pré-déploiement

- [ ] Le frontend build statique fonctionne (`bun run build && bun run export`)
- [ ] Le backend NestJS tourne en production (`bun run start` sans erreurs)
- [ ] La base de données PostgreSQL+PostGIS est configurée sur la machine cible
- [ ] Le fichier `.env.local` de production a le bon `DATABASE_URL`
- [ ] Le `JWT_SECRET` est une chaîne aléatoire de 64 caractères (pas la valeur par défaut)
- [ ] Les icônes ont été (re)générées via `bun run scripts/generate-icons.mjs` (redimensionnement du logo officiel `public/pnc-logo.png`)
- [ ] L'icône `public/icons/icon-256.png` a été convertie en `icon.ico` pour Windows
- [ ] L'installateur a été testé sur une machine Windows propre
- [ ] Le logiciel démarre automatiquement avec Windows (optionnel : task scheduler)

## 🚨 Notes importantes Windows

1. **Antivirus** : certains antivirus flaggent les binaires Node.js packagés. Signez numériquement l'exécutable avec un certificat valide pour éviter les faux positifs (coût ~200€/an).

2. **WebView2** (Tauri) : préinstallé sur Windows 11. Sur Windows 10, l'installateur peut le télécharger automatiquement (Microsoft fournit un bootstrapper officiel).

3. **PostgreSQL en production** : pour un poste isolé sans serveur PostgreSQL, vous pouvez :
   - Utiliser PGlite (embarqué, pas d'installation) — recommandé pour les petits commissariats
   - Installer PostgreSQL Server sur la machine (port 5432)
   - Se connecter à un serveur PostgreSQL distant (cloud ou serveur central)

4. **Firewall Windows** : ouvrir le port 3001 (backend) et 3000 (frontend) si d'autres postes doivent y accéder, OU configurer l'application comme "privée" uniquement.

5. **Mises à jour** : pour les mises à jour automatiques, utiliser Tauri Updater (signe les deltas avec une clé privée) ou electron-updater.
