/**
 * PNC Command Center — lanceur pour exécutable Windows (pkg / @yao-pkg/pkg).
 *
 * L'EXE produit (PNC-Command-Center.exe) embarque un runtime Node.js complet.
 * L'application Next.js (build standalone) est distribuée en fichiers réels
 * dans le dossier `app/` à côté de l'exécutable :
 *
 *   PNC-Alerte-Windows/
 *   ├── PNC-Command-Center.exe   ← ce lanceur (Node embarqué)
 *   ├── PNC-Backend.exe          ← backend NestJS (Bun embarqué)
 *   ├── app/                     ← build standalone Next.js
 *   ├── db/custom.db             ← base SQLite (données de démonstration)
 *   ├── pglite-assets/           ← assets PGlite du backend
 *   └── Demarrer-PNC.bat         ← point d'entrée utilisateur
 *
 * Tout est résolu depuis process.execPath : aucun chemin figé, l'archive
 * peut être extraite n'importe où (poste de travail, serveur Windows...).
 */
const path = require('path');
const fs = require('fs');

const exeDir = path.dirname(process.execPath);
const appDir = path.join(exeDir, 'app');

if (!fs.existsSync(path.join(appDir, 'server.js'))) {
  console.error(
    '[PNC] ERREUR : le dossier "app" (build Next.js) est introuvable à côté de\n' +
      '        ' + process.execPath + '\n' +
      'Réinstallez le package complet PNC-Alerte-Windows.'
  );
  process.exit(1);
}

// Environnement par défaut — chaque variable reste surchargeable par l'env existante
if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
if (!process.env.PORT) process.env.PORT = '3000';
if (!process.env.HOSTNAME) process.env.HOSTNAME = '0.0.0.0';
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET =
    'pnc-alerte-cle-par-defaut-a-remplacer-en-production-32c';
}
// SQLite à côté de l'EXE — chemins normalisés en slashes (compat Prisma)
if (!process.env.DATABASE_URL) {
  const dbPath = path.join(exeDir, 'db', 'custom.db').split(path.sep).join('/');
  process.env.DATABASE_URL = 'file:' + dbPath;
}

process.chdir(appDir);

// ---------------------------------------------------------------------------
// Stub du module `inspector` — le runtime pkg est compilé sans inspector et
// Next.js l'importe au démarrage uniquement pour afficher le port du debugger
// (app-info-log.js : `_inspector.url()`). On renvoie un stub inerté.
// ---------------------------------------------------------------------------
const Module = require('module');
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (request === 'inspector' || request === 'node:inspector') {
    const stub = {
      url: () => undefined,
      Session: function Session() {
        throw new Error('[PNC] Inspector indisponible dans la version packagée');
      },
      open: () => undefined,
      console: { log: () => {}, error: () => {} },
    };
    stub.default = stub;
    return stub;
  }
  return origLoad.apply(this, arguments);
};

require(path.join(appDir, 'server.js'));
