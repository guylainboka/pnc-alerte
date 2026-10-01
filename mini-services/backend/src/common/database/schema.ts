// ============================================================================
// Schéma SQL — Tables partagées (compatible PostgreSQL + PostGIS production)
// ============================================================================
// Toutes les tables utilisent le snake_case pour les colonnes, ce qui
// correspond au schéma Supabase déjà utilisé par l'application mobile
// (PNC Alerte). Le SQL est portable tel quel vers un vrai PostgreSQL.
// ============================================================================

import { query, exec } from './pg.client';
import { seedData } from './seed';

/**
 * Crée toutes les tables si elles n'existent pas (idempotent), puis
 * insère les données de démonstration (idempotent également).
 * Appelé au démarrage du backend.
 */
export async function initSchema(): Promise<void> {
  console.log('[schema] Création des tables ...');

  // --------------------------------------------------------------------------
  // 1. PROFILES — citoyens inscrits via l'app mobile
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS profiles (
      id                        TEXT PRIMARY KEY,
      full_name                 TEXT NOT NULL,
      email                     TEXT,
      phone                     TEXT NOT NULL,
      province                 TEXT,
      commune                   TEXT,
      carte_electeur_numero     TEXT,
      carte_electeur_valide     BOOLEAN DEFAULT false,
      carte_electeur_image      TEXT,
      profile_image             TEXT,
      role                      TEXT DEFAULT 'citoyen',
      latitude                  DOUBLE PRECISION,
      longitude                 DOUBLE PRECISION,
      last_location             TEXT,
      last_location_at          TEXT,
      status                    TEXT DEFAULT 'actif',
      verified                  BOOLEAN DEFAULT false,
      created_at                TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at                TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 2. SIGNALEMENTS — alertes citoyennes (issues du mobile)
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS signalements (
      id          TEXT PRIMARY KEY,
      user_id     TEXT,
      type        TEXT NOT NULL,
      description TEXT NOT NULL,
      location    TEXT,
      latitude    DOUBLE PRECISION,
      longitude   DOUBLE PRECISION,
      photo_url   TEXT,
      anonymous   BOOLEAN DEFAULT false,
      status      TEXT DEFAULT 'en-attente',
      reference   TEXT UNIQUE,
      priority    TEXT DEFAULT 'moyenne',
      created_at  TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at  TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 3. PLANTES — plaintes formelles
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS plaintes (
      id              TEXT PRIMARY KEY,
      user_id         TEXT,
      type_plainte    TEXT NOT NULL,
      description     TEXT NOT NULL,
      suspect_info    TEXT,
      lieu_incident   TEXT,
      date_incident   TEXT,
      pieces_jointes  TEXT,
      status          TEXT DEFAULT 'soumise',
      reference       TEXT UNIQUE,
      reviewed_by     TEXT,
      review_notes    TEXT,
      case_id         TEXT,
      created_at      TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at      TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 4. SOS_CALLS — appels SOS en direct (le plus important pour le realtime)
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS sos_calls (
      id                     TEXT PRIMARY KEY,
      user_id                TEXT,
      reference              TEXT UNIQUE,
      latitude               DOUBLE PRECISION NOT NULL,
      longitude              DOUBLE PRECISION NOT NULL,
      location_text          TEXT,
      status                 TEXT DEFAULT 'actif',
      agent_assigned         TEXT,
      response_time_seconds  INTEGER,
      notes                  TEXT,
      created_at             TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at             TEXT DEFAULT (CURRENT_TIMESTAMP),
      closed_at              TEXT
    )
  `);

  // --------------------------------------------------------------------------
  // 5. PERSONNES_DISPARUES
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS personnes_disparues (
      id                    TEXT PRIMARY KEY,
      user_id               TEXT,
      nom_complet           TEXT NOT NULL,
      age                   INTEGER,
      sexe                  TEXT,
      description           TEXT,
      derniere_vue_lieu     TEXT,
      derniere_vue_date     TEXT,
      photo_url             TEXT,
      contact_telephone     TEXT,
      status                TEXT DEFAULT 'recherche',
      reference             TEXT UNIQUE,
      created_at            TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at            TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 6. ALERTES_OFFICIELLES
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS alertes_officielles (
      id            TEXT PRIMARY KEY,
      titre         TEXT NOT NULL,
      type          TEXT,
      severity      TEXT DEFAULT 'low',
      description   TEXT,
      location      TEXT,
      source        TEXT,
      reference     TEXT UNIQUE,
      publiee_par   TEXT,
      active        BOOLEAN DEFAULT true,
      created_at    TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 7. COMMISSARIATS
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS commissariats (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      code        TEXT UNIQUE,
      address     TEXT,
      phone       TEXT,
      latitude    DOUBLE PRECISION,
      longitude   DOUBLE PRECISION,
      city        TEXT,
      province    TEXT,
      created_at  TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at  TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 8. OFFICERS
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS officers (
      id               TEXT PRIMARY KEY,
      matricule        TEXT UNIQUE,
      first_name       TEXT NOT NULL,
      last_name        TEXT NOT NULL,
      rank             TEXT,
      phone            TEXT,
      email            TEXT,
      commissariat_id  TEXT,
      created_at       TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at       TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 9. USERS_PNC — comptes du personnel PNC (centre de commandement)
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS users_pnc (
      id              TEXT PRIMARY KEY,
      username        TEXT UNIQUE NOT NULL,
      email           TEXT UNIQUE NOT NULL,
      password_hash   TEXT NOT NULL,
      first_name      TEXT NOT NULL,
      last_name       TEXT NOT NULL,
      role            TEXT DEFAULT 'agent',
      phone           TEXT,
      officer_id      TEXT,
      commissariat_id TEXT,
      is_active       BOOLEAN DEFAULT true,
      last_login_at   TEXT,
      created_at      TEXT DEFAULT (CURRENT_TIMESTAMP),
      updated_at      TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 10. CONVOCATIONS
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS convocations (
      id           TEXT PRIMARY KEY,
      user_id      TEXT,
      reference    TEXT UNIQUE,
      titre        TEXT,
      message      TEXT,
      lieu         TEXT,
      date_convocation TEXT,
      status       TEXT DEFAULT 'envoyee',
      created_at   TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 11. NOTIFICATIONS — notifications push vers le mobile
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS notifications (
      id            TEXT PRIMARY KEY,
      user_id       TEXT,
      type          TEXT,
      titre         TEXT,
      message       TEXT,
      read          BOOLEAN DEFAULT false,
      screen_target TEXT,
      related_id    TEXT,
      created_at    TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 12. SIGNALEMENT_UPDATES
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS signalement_updates (
      id              TEXT PRIMARY KEY,
      signalement_id  TEXT,
      status          TEXT,
      message         TEXT,
      author_id       TEXT,
      author_role     TEXT,
      created_at      TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 13. PLAINTE_UPDATES
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS plainte_updates (
      id            TEXT PRIMARY KEY,
      plainte_id    TEXT,
      status        TEXT,
      message       TEXT,
      author_id     TEXT,
      author_role   TEXT,
      created_at    TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // --------------------------------------------------------------------------
  // 14. EVIDENCE
  // --------------------------------------------------------------------------
  await exec(`
    CREATE TABLE IF NOT EXISTS evidence (
      id            TEXT PRIMARY KEY,
      criminal_id   TEXT,
      case_id       TEXT,
      type          TEXT,
      title         TEXT,
      description  TEXT,
      file_url     TEXT,
      file_name    TEXT,
      file_size    INTEGER,
      collected_at TEXT,
      collected_by TEXT,
      created_at   TEXT DEFAULT (CURRENT_TIMESTAMP)
    )
  `);

  // Index pour accélérer les requêtes realtime
  await exec(`CREATE INDEX IF NOT EXISTS idx_sos_calls_status ON sos_calls(status)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_sos_calls_created ON sos_calls(created_at)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_signalements_status ON signalements(status)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_plaintes_status ON plaintes(status)`);
  await exec(`CREATE INDEX IF NOT EXISTS idx_disparus_status ON personnes_disparues(status)`);

  console.log('[schema] ✅ Tables créées');

  // Vérifier si les données de seed existent déjà
  const existing = await query<{ count: number }>(
    `SELECT COUNT(*)::int as count FROM commissariats`
  );
  const count = (existing[0]?.count as number) || 0;

  if (count === 0) {
    await seedData();
  } else {
    console.log(`[seed] Déjà peuplé (${count} commissariats) — skip`);
  }
}
