// ============================================================================
// PGlite — client PostgreSQL embarqué (WASM), sans serveur
// ============================================================================
// PGlite persiste les données dans un dossier sur le disque. Aucun serveur
// PostgreSQL n'est nécessaire en développement. En production, on peut
// remplacer ce fichier par un vrai client PostgreSQL — le SQL reste identique.
// ============================================================================

import { PGlite } from '@electric-sql/pglite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

// Chemin absolu vers le dossier de données — résolu depuis ce fichier
// (`src/common/database/pg.client.ts`). Le dossier `data/` est donc toujours
// créé sous `<backend>/data`, peu importe le process.cwd().
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const BACKEND_ROOT = path.resolve(__dirname, '..', '..', '..');
const DATA_DIR = path.join(BACKEND_ROOT, 'data');

// S'assurer que le dossier existe avant d'instancier PGlite
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
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
  _pg = new PGlite({
    dataDir: path.join(DATA_DIR, 'pnc.db'),
    debug: 0,
  });

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
