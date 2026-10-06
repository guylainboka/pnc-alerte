// ============================================================================
// PGlite — client PostgreSQL embarqué (WASM), sans serveur
// ============================================================================
// PGlite persiste les données dans un dossier sur le disque. Aucun serveur
// PostgreSQL n'est requis. Le SQL utilisé par les services reste 100%
// compatible avec un vrai PostgreSQL — il suffit de remplacer la
// librairie par `pg` (node-postgres) en production.
// ============================================================================

import { PGlite } from '@electric-sql/pglite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * Détecte si le backend tourne comme binaire compilé (`bun build --compile`,
 * ex. PNC-Backend.exe sur Windows). Dans ce cas `import.meta.url` pointe vers
 * un chemin virtuel interne au bundle : on résout donc le dossier de données
 * depuis l'emplacement réel de l'exécutable (process.execPath).
 */
function isCompiledBinary(): boolean {
  // `Bun.embeddedFiles` n'existe que dans les binaires produits par --compile
  return Array.isArray((globalThis as any).Bun?.embeddedFiles);
}

// Chemin absolu vers le dossier de données :
//  - binaire compilé : `<dossier de l'EXE>/pnc-data` (données à côté du .exe)
//  - dev / source    : résolu depuis ce fichier (`src/common/database/pg.client.ts`),
//                      le dossier `data/` est donc toujours créé sous `<backend>/data`.
const DATA_DIR = isCompiledBinary()
  ? path.join(path.dirname(process.execPath), 'pnc-data')
  : path.join(
      path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        '..',
        '..',
        '..'
      ),
      'data'
    );

// S'assurer que le dossier existe avant d'instancier PGlite
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ============================================================================
// Assets PGlite en mode binaire compilé (PNC-Backend.exe)
// ============================================================================
// Dans un binaire `bun build --compile`, PGlite ne peut plus résoudre ses
// fichiers embarqués (`pglite.wasm`, `pglite.data`, `initdb.wasm`) référencés
// via `new URL(..., import.meta.url)` : l'image filesystem EMSCRIPTEN n'est
// pas intégrée au bundle. On les charge donc depuis le dossier `pglite-assets/`
// placé à côté de l'exécutable et on les passe explicitement au constructeur.
// En mode dev/source, PGlite charge ses assets normalement depuis node_modules.
// ============================================================================
const ASSETS_DIR = path.join(path.dirname(process.execPath), 'pglite-assets');

function loadPgliteAsset(name: string): Buffer {
  const file = path.join(ASSETS_DIR, name);
  if (!fs.existsSync(file)) {
    throw new Error(
      `[db] Asset PGlite manquant : ${file}. ` +
        `Copiez le dossier "pglite-assets" (pglite.wasm, pglite.data, initdb.wasm) ` +
        `à côté de l'exécutable PNC-Backend.`
    );
  }
  return fs.readFileSync(file);
}

// Singleton global — on évite de créer plusieurs instances PGlite
let _pg: PGlite | null = null;

/**
 * Retourne l'instance singleton PGlite.
 * La base est stockée dans `data/pnc.db` (fichier persistant).
 */
export async function getPgClient(): Promise<PGlite> {
  if (_pg) {
    return _pg;
  }

  console.log(`[db] Initialisation de PGlite dans ${DATA_DIR} ...`);

  if (isCompiledBinary()) {
    // Mode binaire compilé : assets PGlite chargés explicitement depuis le disque
    const fsData = loadPgliteAsset('pglite.data');
    const wasm = loadPgliteAsset('pglite.wasm');
    const initdb = loadPgliteAsset('initdb.wasm');
    const WebAssemblyRef = (globalThis as any).WebAssembly;
    _pg = new PGlite({
      dataDir: path.join(DATA_DIR, 'pnc.db'),
      debug: 0,
      fsBundle: new Blob([fsData]),
      pgliteWasmModule: await WebAssemblyRef.compile(wasm),
      initdbWasmModule: await WebAssemblyRef.compile(initdb),
    } as any);
  } else {
    // Mode dev / source : PGlite résout ses assets depuis node_modules
    _pg = new PGlite({
      dataDir: path.join(DATA_DIR, 'pnc.db'),
      debug: 0,
    });
  }

  // Attendre que PGlite soit prêt (la première requête force l'init)
  await _pg.query('SELECT 1 as ok');

  console.log('[db] ✅ PGlite prêt');
  return _pg;
}

/**
 * Exécute une requête SQL et retourne les lignes (tableau d'objets).
 */
export async function query<T = any>(
  sql: string,
  params: any[] = []
): Promise<T[]> {
  const pg = await getPgClient();
  const result = await pg.query(sql, params);
  return (result.rows || []) as T[];
}

/**
 * Exécute une requête SQL et retourne la première ligne (ou null).
 */
export async function queryOne<T = any>(
  sql: string,
  params: any[] = []
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Exécute une requête SQL sans récupérer les lignes (DDL, INSERT, UPDATE).
 * Retourne le nombre de lignes affectées.
 */
export async function exec(sql: string, params: any[] = []): Promise<number> {
  const pg = await getPgClient();
  const result = await pg.query(sql, params);
  // PGlite renvoie les affected rows dans `affectedRows` (ou rowCount)
  return (result as any).affectedRows ?? (result as any).rowCount ?? 0;
}
