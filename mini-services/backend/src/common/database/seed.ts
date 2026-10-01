// ============================================================================
// Seed — Données de production pour le backend PNC
// ============================================================================
// Insère 6 commissariats, 6 officiers, 6 utilisateurs PNC (admin, etc.),
// 8 profils citoyens, 8 signalements, 5 plaintes, 4 appels SOS (2 actifs),
// 2 personnes disparues, 3 alertes officielles.
// ============================================================================

import { query, exec } from './pg.client';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcryptjs';

/**
 * Hash un mot de passe avec bcrypt (10 tours de salage).
 * Sécurisé en production — non réversible, résistant au timing attack.
 */
function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10);
}

export async function seedData(): Promise<void> {
  console.log('[seed] Insertion des données de production ...');

  // ==========================================================================
  // 1. COMMISSARIATS (Kinshasa + Lubumbashi)
  // ==========================================================================
  const commissariats = [
    { name: 'Commissariat Central de Gombe',  code: 'COM-GOM',  address: 'Av. du Commerce 12, Gombe',     phone: '+243810000100', latitude: -4.3250, longitude: 15.3070, city: 'Kinshasa',   province: 'Kinshasa' },
    { name: 'Commissariat de Lemba',          code: 'COM-LEM',  address: 'Av. de la Justice 5, Lemba',    phone: '+243810000101', latitude: -4.3620, longitude: 15.2950, city: 'Kinshasa',   province: 'Kinshasa' },
    { name: 'Commissariat de Matete',         code: 'COM-MAT',  address: 'Av. Kasa-Vubu 8, Matete',       phone: '+243810000102', latitude: -4.3380, longitude: 15.3170, city: 'Kinshasa',   province: 'Kinshasa' },
    { name: 'Commissariat de Ngaliema',       code: 'COM-NGA',  address: 'Résidence Haut-Katanga, Ngaliema', phone: '+243810000103', latitude: -4.3540, longitude: 15.2860, city: 'Kinshasa',   province: 'Kinshasa' },
    { name: 'Commissariat de Bandalungwa',    code: 'COM-BAN',  address: 'Av. Kasa-Vubu 25, Bandalungwa', phone: '+243810000104', latitude: -4.3320, longitude: 15.3000, city: 'Kinshasa',   province: 'Kinshasa' },
    { name: 'Commissariat de Lubumbashi',     code: 'COM-LUB',  address: 'Quartier Gécamines, Lubumbashi',phone: '+243810000105', latitude: -11.6870, longitude: 27.5020, city: 'Lubumbashi', province: 'Haut-Katanga' },
  ];

  for (const c of commissariats) {
    const id = randomUUID();
    await exec(
      `INSERT INTO commissariats (id, name, code, address, phone, latitude, longitude, city, province)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (code) DO NOTHING`,
      [id, c.name, c.code, c.address, c.phone, c.latitude, c.longitude, c.city, c.province]
    );
  }

  // Récupérer les IDs générés pour les jointures
  const comRows = await query<{ id: string; code: string }>(
    `SELECT id, code FROM commissariats ORDER BY code`
  );
  const comById = (code: string): string | null =>
    comRows.find((c) => c.code === code)?.id ?? null;

  // ==========================================================================
  // 2. OFFICERS (6)
  // ==========================================================================
  const officers = [
    { matricule: 'PNC-001', first: 'Augustin', last: 'Mpayi',     rank: 'Commissaire Divisionnaire', com: 'COM-GOM',  phone: '+243810000200', email: 'a.mpayi@pnc.cd' },
    { matricule: 'PNC-002', first: 'Sylvie',  last: 'Kasongo',   rank: 'Commissaire',               com: 'COM-LEM',  phone: '+243810000201', email: 's.kasongo@pnc.cd' },
    { matricule: 'PNC-003', first: 'Joseph',  last: 'Kabasele',  rank: 'Inspecteur Principal',      com: 'COM-MAT',  phone: '+243810000202', email: 'j.kabasele@pnc.cd' },
    { matricule: 'PNC-004', first: 'Nadine',  last: 'Tshisekedi',rank: 'Inspecteur',                com: 'COM-NGA',  phone: '+243810000203', email: 'n.tshisekedi@pnc.cd' },
    { matricule: 'PNC-005', first: 'Eric',     last: 'Mukendi',   rank: 'Sous-Lieutenant',           com: 'COM-BAN',  phone: '+243810000204', email: 'e.mukendi@pnc.cd' },
    { matricule: 'PNC-006', first: 'Brigitte', last: 'Mwamba',   rank: 'Inspecteur',                com: 'COM-LUB',  phone: '+243810000205', email: 'b.mwamba@pnc.cd' },
  ];

  const officerIds: string[] = [];
  for (const o of officers) {
    const id = randomUUID();
    officerIds.push(id);
    const comId = comById(o.com);
    await exec(
      `INSERT INTO officers (id, matricule, first_name, last_name, rank, phone, email, commissariat_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (matricule) DO NOTHING`,
      [id, o.matricule, o.first, o.last, o.rank, o.phone, o.email, comId]
    );
  }

  // ==========================================================================
  // 3. USERS_PNC (6 comptes). Les mots de passe sont hachés avec bcrypt.
  // ==========================================================================
  const users = [
    { username: 'admin',       password: 'admin123',  first: 'Admin',     last: 'Système',    email: 'admin@pnc.cd',       role: 'admin',     officerIdx: 0, com: 'COM-GOM' },
    { username: 'mtshisekedi',  password: 'police123',  first: 'Nadine',    last: 'Tshisekedi', email: 'n.tshisekedi@pnc.cd',role: 'officier',  officerIdx: 3, com: 'COM-NGA' },
    { username: 'akabasele',    password: 'police123',  first: 'Joseph',    last: 'Kabasele',   email: 'j.kabasele@pnc.cd', role: 'officier',  officerIdx: 2, com: 'COM-MAT' },
    { username: 'empayi',       password: 'police123',  first: 'Augustin',  last: 'Mpayi',      email: 'a.mpayi@pnc.cd',    role: 'commandant',officerIdx: 0, com: 'COM-GOM' },
    { username: 'skasongo',     password: 'police123',  first: 'Sylvie',    last: 'Kasongo',    email: 's.kasongo@pnc.cd', role: 'officier',  officerIdx: 1, com: 'COM-LEM' },
    { username: 'bmwamba',      password: 'police123',  first: 'Brigitte',  last: 'Mwamba',     email: 'b.mwamba@pnc.cd',   role: 'officier',  officerIdx: 5, com: 'COM-LUB' },
  ];

  for (const u of users) {
    const id = randomUUID();
    const officerId = officerIds[u.officerIdx];
    const comId = comById(u.com);
    // ON CONFLICT DO UPDATE : si l'utilisateur existe déjà (par username), on
    // rafraîchit le password_hash avec un bcrypt frais — cela garantit que
    // tout mot de passe hérité d'un ancien format (par ex. base64 réversible)
    // est écrasé par un vrai bcrypt à chaque ré-exécution du seed.
    await exec(
      `INSERT INTO users_pnc (id, username, email, password_hash, first_name, last_name, role, phone, officer_id, commissariat_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true)
       ON CONFLICT (username) DO UPDATE SET
         password_hash    = EXCLUDED.password_hash,
         email            = EXCLUDED.email,
         first_name       = EXCLUDED.first_name,
         last_name        = EXCLUDED.last_name,
         role             = EXCLUDED.role,
         officer_id       = EXCLUDED.officer_id,
         commissariat_id  = EXCLUDED.commissariat_id,
         is_active        = true,
         updated_at       = CURRENT_TIMESTAMP`,
      [id, u.username, u.email, hashPassword(u.password), u.first, u.last, u.role, '+243810000100', officerId, comId]
    );
  }

  // Récupérer le user admin pour la suite
  const adminUser = await query<{ id: string }>(
    `SELECT id FROM users_pnc WHERE username = 'admin' LIMIT 1`
  );
  const adminId: string | null = adminUser[0]?.id ?? null;

  // ==========================================================================
  // 4. PROFILES (8 citoyens)
  // ==========================================================================
  const profiles = [
    { full: 'Jean-Paul Mbumba',  email: 'jeanpaul.mbumba@gmail.com', phone: '+243810000001', province: 'Kinshasa',       commune: 'Gombe',        lat: -4.3217, lon: 15.3122 },
    { full: 'Aminata Kabore',   email: 'aminata.kabore@yahoo.fr',   phone: '+243810000002', province: 'Kinshasa',       commune: 'Lemba',        lat: -4.3614, lon: 15.2956 },
    { full: 'Patrick Ilunga',   email: 'patrick.ilunga@outlook.com',phone: '+243810000003', province: 'Haut-Katanga',   commune: 'Lubumbashi',   lat: -11.6647,lon: 27.4794 },
    { full: 'Sandrine Mwila',   email: 'sandrine.mwila@gmail.com', phone: '+243810000004', province: 'Kinshasa',       commune: 'Matete',       lat: -4.3486, lon: 15.3178 },
    { full: 'Eric Kasongo',     email: 'eric.kasongo@gmail.com',    phone: '+243810000005', province: 'Haut-Lomami',    commune: 'Kamina',       lat: -8.7293, lon: 25.0208 },
    { full: 'Brigitte Ntumba',  email: 'brigitte.ntumba@yahoo.fr', phone: '+243810000006', province: 'Kongo Central',  commune: 'Matadi',       lat: -5.8240, lon: 13.4636 },
    { full: 'Joseph Mukendi',   email: 'joseph.mukendi@gmail.com', phone: '+243810000007', province: 'Kinshasa',       commune: 'Bandalungwa',  lat: -4.3320, lon: 15.3001 },
    { full: 'Esther Tshibangu', email: 'esther.tshibangu@gmail.com',phone: '+243810000008', province: 'Kinshasa',       commune: 'Ngaliema',     lat: -4.3540, lon: 15.2860 },
  ];

  const profileIds: string[] = [];
  for (const p of profiles) {
    const id = randomUUID();
    profileIds.push(id);
    await exec(
      `INSERT INTO profiles (id, full_name, email, phone, province, commune, role, latitude, longitude, last_location, status, verified, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'citoyen', $7, $8, $9, 'actif', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (id) DO NOTHING`,
      [id, p.full, p.email, p.phone, p.province, p.commune, p.lat, p.lon, p.commune]
    );
  }

  // ==========================================================================
  // 5. SIGNALEMENTS (8)
  // ==========================================================================
  const signalements = [
    { user: profileIds[0], type: 'vol',         desc: 'Vol à la tire par deux individus à moto près du marché. Le sac à main a été arraché.',           loc: 'Marché Central, Gombe',        lat: -4.3217, lon: 15.3122, status: 'traite',     priority: 'haute',   ref: 'SIG-2026-001' },
    { user: profileIds[1], type: 'agression',   desc: 'Agression physique par un groupe de jeunes devant une boîte de nuit. Blessure au bras.',         loc: 'Av. de la Justice, Lemba',      lat: -4.3614, lon: 15.2956, status: 'en-cours',   priority: 'critique', ref: 'SIG-2026-002' },
    { user: profileIds[2], type: 'corruption',  desc: 'Escroquerie par un faux agent de recouvrement demandant de l\'argent pour une prétendue amende.',loc: 'Quartier Gécamines, Lubumbashi',lat: -11.6647,lon: 27.4794, status: 'en-attente', priority: 'moyenne', ref: 'SIG-2026-003' },
    { user: profileIds[3], type: 'nuisance',    desc: 'Nuisance sonore nocturne récurrente par un bar du quartier après minuit.',                       loc: 'Av. Kasa-Vubu, Matete',         lat: -4.3486, lon: 15.3178, status: 'en-attente', priority: 'basse',   ref: 'SIG-2026-004' },
    { user: profileIds[4], type: 'vol',         desc: 'Cambriolage de mon domicile pendant mon absence. Effets électroménagers dérobés.',               loc: 'Quartier Kamina Est',          lat: -8.7293, lon: 25.0208, status: 'en-cours',   priority: 'haute',   ref: 'SIG-2026-005' },
    { user: profileIds[5], type: 'corruption',  desc: 'Un agent en uniforme a exigé un bakchich au checkpoint de Matadi. J\'ai refusé.',                 loc: 'Port de Matadi',               lat: -5.8240, lon: 13.4636, status: 'en-attente', priority: 'critique', ref: 'SIG-2026-006' },
    { user: profileIds[6], type: 'trafic',      desc: 'Vente de drogue en plein jour devant l\'école primaire. Enfants exposés.',                       loc: 'Av. Kasa-Vubu, Bandalungwa',   lat: -4.3320, lon: 15.3001, status: 'en-attente', priority: 'haute',   ref: 'SIG-2026-007' },
    { user: profileIds[7], type: 'violence',   desc: 'Violences conjugales chez le voisin, cris et coups entendus depuis hier soir.',                   loc: 'Résidence Haut-Katanga, Ngaliema', lat: -4.3540, lon: 15.2860, status: 'en-attente', priority: 'critique', ref: 'SIG-2026-008' },
  ];

  for (const s of signalements) {
    const id = randomUUID();
    await exec(
      `INSERT INTO signalements (id, user_id, type, description, location, latitude, longitude, anonymous, status, reference, priority, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, false, $8, $9, $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (reference) DO NOTHING`,
      [id, s.user, s.type, s.desc, s.loc, s.lat, s.lon, s.status, s.ref, s.priority]
    );
  }

  // ==========================================================================
  // 6. PLANTES (5)
  // ==========================================================================
  const plaintes = [
    { user: profileIds[0], type: 'vol',         desc: 'Je dépose plainte pour le vol de mon sac à main au marché central. Le présumé voleur portait un tee-shirt noir.', suspect: 'Homme, 25-30 ans, tee-shirt noir, pantalon jean', lieu: 'Marché Central, Gombe', date: '2026-01-10', status: 'en-cours',  ref: 'PLT-2026-001' },
    { user: profileIds[1], type: 'agression',   desc: 'Agression verbale et physique devant la boîte de nuit. Témoins présents.', suspect: 'Groupe de 4 jeunes, 18-25 ans', lieu: 'Av. de la Justice, Lemba', date: '2026-01-13', status: 'en-attente',ref: 'PLT-2026-002' },
    { user: profileIds[3], type: 'harcèlement',desc: 'Harcèlement répété d\'un voisin depuis 2 semaines, messages et menaces.', suspect: 'Voisin du 3e étage, nommé Joseph', lieu: 'Immeuble Kasa-Vubu, Matete', date: '2026-01-14', status: 'en-attente',ref: 'PLT-2026-003' },
    { user: profileIds[4], type: 'vol',         desc: 'Cambriolage de mon domicile, effets dérobés : téléviseur, chaîne hi-fi, argent liquide.', suspect: 'Inconnu, effraction par la fenêtre arrière', lieu: 'Quartier Kamina Est', date: '2026-01-15', status: 'traite',    ref: 'PLT-2026-004' },
    { user: profileIds[5], type: 'autre',       desc: 'Extorsion par un agent au checkpoint de Matadi, plaque 1234.', suspect: 'Agent en uniforme, corpulent, lunettes noires', lieu: 'Port de Matadi', date: '2026-01-16', status: 'en-attente',ref: 'PLT-2026-005' },
  ];

  for (const p of plaintes) {
    const id = randomUUID();
    await exec(
      `INSERT INTO plaintes (id, user_id, type_plainte, description, suspect_info, lieu_incident, date_incident, status, reference, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (reference) DO NOTHING`,
      [id, p.user, p.type, p.desc, p.suspect, p.lieu, p.date, p.status, p.ref]
    );
  }

  // ==========================================================================
  // 7. SOS_CALLS (4) — 2 actifs, 2 clôturés
  // ==========================================================================
  const sosCalls = [
    { user: profileIds[6], lat: -4.3250, lon: 15.3070, loc: 'Av. du Commerce, Gombe — proche du bâtiment Sonas',    status: 'actif',   notes: 'SOS déclenché: agression en cours. Victime cachée.', ref: 'SOS-2026-001', responseTime: null, closedAt: null },
    { user: profileIds[7], lat: -4.3540, lon: 15.2860, loc: 'Résidence Haut-Katanga, Ngaliema — bâtiment B, 2e étage', status: 'actif',  notes: 'SOS déclenché: violences conjugales voisins.',       ref: 'SOS-2026-002', responseTime: null, closedAt: null },
    { user: profileIds[1], lat: -4.3614, lon: 15.2956, loc: 'Av. de la Justice, Lemba',                                status: 'cloture', notes: 'Patrouille intervenue, situation maîtrisée.',       ref: 'SOS-2026-003', responseTime: 420, closedAt: '2026-01-13 12:00:00' },
    { user: profileIds[0], lat: -4.3217, lon: 15.3122, loc: 'Marché Central, Gombe',                                   status: 'cloture', notes: 'Vol à la tire, suspect interpellé par patrouille.', ref: 'SOS-2026-004', responseTime: 300, closedAt: '2026-01-10 18:00:00' },
  ];

  for (const s of sosCalls) {
    const id = randomUUID();
    await exec(
      `INSERT INTO sos_calls (id, user_id, reference, latitude, longitude, location_text, status, agent_assigned, response_time_seconds, notes, created_at, closed_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NULL, $8, $9, CURRENT_TIMESTAMP, $10)
       ON CONFLICT (reference) DO NOTHING`,
      [id, s.user, s.ref, s.lat, s.lon, s.loc, s.status, s.responseTime, s.notes, s.closedAt]
    );
  }

  // ==========================================================================
  // 8. PERSONNES_DISPARUES (2)
  // ==========================================================================
  const disparus = [
    { user: profileIds[0], nom: 'Junior Mbumba',  age: 12, sexe: 'M', desc: 'Enfant, 1m40, tee-shirt jaune, short bleu, sac à dos rouge.', lieu: 'Marché Central, Gombe', date: '2026-01-12', phone: '+243810000001', ref: 'DIS-2026-001' },
    { user: profileIds[3], nom: 'Nadine Mwila',    age: 24, sexe: 'F', desc: 'Jeune femme, 1m65, robe verte, cheveux tressés. Démence précoce.', lieu: 'Gare de Matete', date: '2026-01-15', phone: '+243810000004', ref: 'DIS-2026-002' },
  ];

  for (const d of disparus) {
    const id = randomUUID();
    await exec(
      `INSERT INTO personnes_disparues (id, user_id, nom_complet, age, sexe, description, derniere_vue_lieu, derniere_vue_date, contact_telephone, status, reference, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'recherche', $10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
       ON CONFLICT (reference) DO NOTHING`,
      [id, d.user, d.nom, d.age, d.sexe, d.desc, d.lieu, d.date, d.phone, d.ref]
    );
  }

  // ==========================================================================
  // 9. ALERTES_OFFICIELLES (3)
  // ==========================================================================
  const alertesOff = [
    { titre: 'Renforcement des patrouilles nocturnes à Gombe', type: 'securite',  severity: 'low',    desc: 'La PNC renforce ses patrouilles nocturnes dans la commune de Gombe. Restez vigilants et signalez tout comportement suspect.', loc: 'Gombe',   source: 'PNC Kinshasa',     ref: 'AO-2026-001' },
    { titre: 'Avis de recherche — Junior Mbumba, 12 ans',      type: 'recherche', severity: 'medium', desc: 'Avis de recherche : Junior Mbumba, 12 ans, vu pour la dernière fois au Marché Central de Gombe. Contacter le commissariat le plus proche.', loc: 'Gombe',  source: 'PNC Kinshasa',     ref: 'AO-2026-002' },
    { titre: 'Opération anti-cambriolage en cours à Kamina',  type: 'operation', severity: 'medium', desc: 'Opération de police en cours dans le quartier Kamina Est. Circulation perturbée. Évitez le secteur.', loc: 'Kamina', source: 'PNC Haut-Lomami', ref: 'AO-2026-003' },
  ];

  for (const a of alertesOff) {
    const id = randomUUID();
    await exec(
      `INSERT INTO alertes_officielles (id, titre, type, severity, description, location, source, reference, publiee_par, active, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, CURRENT_TIMESTAMP)
       ON CONFLICT (reference) DO NOTHING`,
      [id, a.titre, a.type, a.severity, a.desc, a.loc, a.source, a.ref, adminId]
    );
  }

  console.log('[seed] ✅ Données insérées');
  console.log(`[seed]    - 6 commissariats`);
  console.log(`[seed]    - 6 officiers`);
  console.log(`[seed]    - 6 utilisateurs PNC (mots de passe hachés avec bcrypt)`);
  console.log(`[seed]    - 8 profils citoyens`);
  console.log(`[seed]    - 8 signalements`);
  console.log(`[seed]    - 5 plaintes`);
  console.log(`[seed]    - 4 appels SOS (2 actifs, 2 clôturés)`);
  console.log(`[seed]    - 2 personnes disparues`);
  console.log(`[seed]    - 3 alertes officielles`);
}
