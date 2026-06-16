-- ============================================================================
-- PNC - Données de démonstration pour Supabase
-- ============================================================================
-- À exécuter APRÈS 0001_init_pnc_schema.sql
-- Exécutable dans Supabase Dashboard > SQL Editor
-- ============================================================================

-- ---- Provinces ----
insert into public.provinces (id, name, code) values
  ('prov-kin', 'Kinshasa', 'KIN'),
  ('prov-hk',  'Haut-Katanga', 'HK'),
  ('prov-kc',  'Kongo-Central', 'KC'),
  ('prov-nk',  'Nord-Kivu', 'NK')
on conflict (code) do nothing;

-- ---- Districts ----
insert into public.districts (id, name, code, province_id) values
  ('dist-kin-1', 'Kinshasa-Urbain', 'KIN-1', 'prov-kin'),
  ('dist-kin-2', 'Tshangu',         'KIN-2', 'prov-kin'),
  ('dist-hk-1',  'Lubumbashi',      'HK-1',  'prov-hk'),
  ('dist-kc-1',  'Matadi',          'KC-1',  'prov-kc'),
  ('dist-nk-1',  'Goma',            'NK-1',  'prov-nk')
on conflict do nothing;

-- ---- Sous-districts ----
insert into public.sous_districts (id, name, code, district_id) values
  ('sd-kin-1', 'Gombe',      'KIN-1-1', 'dist-kin-1'),
  ('sd-kin-2', 'Lemba',      'KIN-1-2', 'dist-kin-1'),
  ('sd-kin-3', 'N'djili',    'KIN-2-1', 'dist-kin-2'),
  ('sd-hk-1',  'Lubumbashi-Centre', 'HK-1-1', 'dist-hk-1'),
  ('sd-kc-1',  'Matadi-Centre',     'KC-1-1', 'dist-kc-1'),
  ('sd-nk-1',  'Goma-Centre',       'NK-1-1', 'dist-nk-1')
on conflict do nothing;

-- ---- Commissariats ----
insert into public.commissariats (id, name, code, address, phone, sous_district_id) values
  ('com-1', 'Commissariat Central de Gombe',    'CCG',  'Avenue du Port, Gombe',     '+243890000001', 'sd-kin-1'),
  ('com-2', 'Commissariat de Lemba',            'CLM',  'Avenue Kasa-Vubu, Lemba',   '+243890000002', 'sd-kin-2'),
  ('com-3', 'Commissariat de Ndjili',           'CND',  'Boulevard Ndjili',          '+243890000003', 'sd-kin-3'),
  ('com-4', 'Commissariat Central Lubumbashi',  'CCL',  'Avenue Lumumba, Lubumbashi','+243890000004', 'sd-hk-1'),
  ('com-5', 'Commissariat de Matadi',           'CMT',  'Boulevard du 30 Juin',      '+243890000005', 'sd-kc-1'),
  ('com-6', 'Commissariat Central de Goma',     'CCGoma','Avenue des Acacias, Goma',  '+243890000006', 'sd-nk-1')
on conflict do nothing;

-- ---- Officiers ----
insert into public.officers (id, matricule, first_name, last_name, rank, phone, email, commissariat_id) values
  ('off-1', 'PNC-001', 'Jean',     'Mukendi',   'Commissaire Divisionnaire', '+243811000001', 'j.mukendi@pnc.cd',    'com-1'),
  ('off-2', 'PNC-002', 'Marie',    'Kabongo',   'Commissaire',               '+243811000002', 'm.kabongo@pnc.cd',    'com-1'),
  ('off-3', 'PNC-003', 'Pierre',   'Tshisekedi','Inspecteur Principal',       '+243811000003', 'p.tshisekedi@pnc.cd', 'com-2'),
  ('off-4', 'PNC-004', 'Anne',     'Mbuyi',     'Inspecteur',                 '+243811000004', 'a.mbuyi@pnc.cd',      'com-3'),
  ('off-5', 'PNC-005', 'Joseph',   'Mobuti',    'Agent',                      '+243811000005', 'j.mobuti@pnc.cd',     'com-4'),
  ('off-6', 'PNC-006', 'Grace',    'Ilunga',    'Inspecteur',                 '+243811000006', 'g.ilunga@pnc.cd',     'com-6')
on conflict do nothing;

-- ---- Utilisateurs PNC (Centre de Commandement) ----
-- Mots de passe hachés (bcrypt) - voir prisma/seed.ts pour les valeurs
-- En production, utilisez Supabase Auth pour les agents PNC aussi.
insert into public.users_pnc (id, username, email, password_hash, first_name, last_name, role, phone, officer_id, is_active) values
  ('usr-1', 'admin',       'admin@pnc.cd',       '$2b$10$placeholder_admin_hash_demo_only', 'Jean',    'Mukendi',    'admin',        '+243811000001', 'off-1', true),
  ('usr-2', 'm.kabongo',   'm.kabongo@pnc.cd',   '$2b$10$placeholder_commissaire_hash_demo', 'Marie',   'Kabongo',    'commissaire',  '+243811000002', 'off-2', true),
  ('usr-3', 'p.tshisekedi','p.tshisekedi@pnc.cd','$2b$10$placeholder_inspecteur_hash_demo',  'Pierre',  'Tshisekedi', 'inspecteur',   '+243811000003', 'off-3', true),
  ('usr-4', 'a.mbuyi',     'a.mbuyi@pnc.cd',     '$2b$10$placeholder_inspecteur_hash_demo2', 'Anne',    'Mbuyi',      'inspecteur',   '+243811000004', 'off-4', true),
  ('usr-5', 'j.mobuti',    'j.mobuti@pnc.cd',    '$2b$10$placeholder_agent_hash_demo',       'Joseph',  'Mobuti',     'agent',        '+243811000005', 'off-5', true),
  ('usr-6', 'g.ilunga',    'g.ilunga@pnc.cd',    '$2b$10$placeholder_inspecteur_hash_demo3', 'Grace',   'Ilunga',     'inspecteur',   '+243811000006', 'off-6', true)
on conflict do nothing;

-- ---- Citoyens (inscrits via mobile) ----
insert into public.citizens (id, reference, first_name, last_name, phone, email, gender, city, commune, address, latitude, longitude, last_location, last_location_at, status, verified, total_alerts, total_complaints, commissariat_id) values
  ('cit-1', 'CIT-2024-001', 'Aimé',     'Kalala',  '+243820000001', 'aime.kalala@gmail.com',   'M',  'Kinshasa',     'Gombe',   'Av. du Port 12',    -4.3217, 15.3130, 'Gombe, Kinshasa',     now() - interval '1 hour',  'actif', true, 3, 1, 'com-1'),
  ('cit-2', 'CIT-2024-002', 'Béatrice', 'Ngoyi',   '+243820000002', 'beatrice.ngoyi@gmail.com','F',  'Kinshasa',     'Lemba',   'Av. Kasa-Vubu 45',  -4.3890, 15.3140, 'Lemba, Kinshasa',     now() - interval '30 minutes','actif', true, 1, 2, 'com-2'),
  ('cit-3', 'CIT-2024-003', 'Christian','Mwamba',  '+243820000003', 'c.mwamba@gmail.com',      'M',  'Kinshasa',     'Ndjili',  'Bd Ndjili 78',      -4.3420, 15.3850, 'Ndjili, Kinshasa',    now() - interval '2 hours',  'actif', false,2, 0, 'com-3'),
  ('cit-4', 'CIT-2024-004', 'Dorothée', 'Kasongo', '+243820000004', 'd.kasongo@gmail.com',     'F',  'Lubumbashi',   'Centre',  'Av. Lumumba 23',    -11.6644, 27.4796,'Lubumbashi Centre',   now() - interval '3 hours',  'actif', true, 0, 1, 'com-4'),
  ('cit-5', 'CIT-2024-005', 'Emmanuel', 'Tshibangu','+243820000005','e.tshibangu@gmail.com',   'M',  'Matadi',       'Centre',  'Bd du 30 Juin 5',   -5.8167, 13.4500,'Matadi Centre',       now() - interval '5 hours',  'actif', true, 1, 0, 'com-5'),
  ('cit-6', 'CIT-2024-006', 'Fatuma',   'Mukendi', '+243820000006', 'fatuma.m@gmail.com',      'F',  'Goma',         'Centre',  'Av. des Acacias 9', -1.6788, 29.2228, 'Goma Centre',         now() - interval '15 minutes','actif', true, 4, 2, 'com-6'),
  ('cit-7', 'CIT-2024-007', 'Gloire',   'Bemba',   '+243820000007', 'gloire.bemba@gmail.com',  'M',  'Kinshasa',     'Gombe',   'Av. du Port 50',    -4.3250, 15.3150, 'Gombe, Kinshasa',     now() - interval '45 minutes','actif', true, 0, 0, 'com-1'),
  ('cit-8', 'CIT-2024-008', 'Hélène',   'Lukusa',  '+243820000008', 'h.lukusa@gmail.com',      'F',  'Kinshasa',     'Lemba',   'Av. Kasa-Vubu 100', -4.3905, 15.3145, 'Lemba, Kinshasa',     now() - interval '4 hours',  'suspendu', false,1, 1, 'com-2')
on conflict do nothing;

-- ---- Criminels ----
insert into public.criminals (id, reference, first_name, last_name, alias, gender, nationality, status, danger_level, last_known_addr, last_latitude, last_longitude, last_seen_at, last_seen_location, criminal_history, modus_operi, modus_operandi, warrant_status, physical_desc, height, weight, eye_color, hair_color, scars, tattoos) values
  ('crim-1', 'CR-2024-001', 'Inconnu',   'Homme 1',     'Le Fantôme',  'M', 'Congolaise', 'recherche', 'eleve',  'Kinshasa, Gombe',    -4.3217, 15.3130, now() - interval '2 days',  'Gombe, Kinshasa',   'Vol à main armée, agression',       'Cambriolage nocturne',      'Cambriolage nocturne dans les villas',     'actif',  'Cicatrice sur joue gauche', '1m75', '70kg', 'Marron', 'Noir', 'Cicatrice joue gauche', 'Aigle sur bras droit'),
  ('crim-2', 'CR-2024-002', 'Jean',      'Kabila',      'JK',           'M', 'Congolaise', 'incarcere', 'moyen',  'Lubumbashi',         -11.6644, 27.4796, now() - interval '30 days', 'Lubumbashi',        'Fraude financière, escroquerie',    'Faux documents',            'Escroquerie avec faux documents',          'expire', 'Aucune particularité',       '1m70', '75kg', 'Noir',  'Noir', 'Aucune', 'Aucun'),
  ('crim-3', 'CR-2024-003', 'Paul',      'Mbenza',      'Le Boss',      'M', 'Congolaise', 'recherche', 'eleve',  'Goma',               -1.6788, 29.2228, now() - interval '5 days',   'Goma',              'Trafic de stupéfiants, port d''arme','Trafic de drogue',          'Trafic de drogue dans les bars',           'actif',  'Tatouage serpent cou gauche','1m80', '85kg', 'Marron', 'Noir', 'Aucune', 'Serpent cou gauche'),
  ('crim-4', 'CR-2024-004', 'Marie',     'Tumba',       'La Reine',     'F', 'Congolaise', 'libre',     'faible', 'Kinshasa, Lemba',    -4.3890, 15.3140, now() - interval '10 days',  'Lemba, Kinshasa',   'Vol simple',                        'Pickpocket dans les marchés','Vol à la tire dans les marchés',            'aucun',  'Aucune',                     '1m65', '60kg', 'Noir',  'Noir', 'Aucune', 'Aucun'),
  ('crim-5', 'CR-2024-005', 'Albert',    'Mputu',       'Al',           'M', 'Congolaise', 'sous_surveillance','moyen','Kinshasa, Ndjili',-4.3420, 15.3850, now() - interval '1 day',   'Ndjili, Kinshasa',  'Violence conjugale, menace',        'Menaces verbales',          'Menaces et harcèlement',                   'aucun',  'Aucune',                     '1m72', '78kg', 'Marron', 'Noir', 'Aucune', 'Aucun'),
  ('crim-6', 'CR-2024-006', 'Serge',     'Mukendi',     'Sergio',       'M', 'Congolaise', 'recherche', 'eleve',  'Matadi',             -5.8167, 13.4500, now() - interval '3 days',   'Matadi',            'Homicide, vol qualifié',            'Attaque de véhicules',      'Attaque de véhicules sur les routes',      'actif',  'Balafre front',              '1m78', '82kg', 'Noir',  'Noir', 'Balafre front', 'Dragon dos')
on conflict do nothing;

-- ---- Dossiers ----
insert into public.cases (id, reference, title, type, status, priority, description, location, incident_date, commissariat_id, assigned_to_id) values
  ('case-1', 'DOS-2024-001', 'Vol à main armée - Gombe',          'vol',        'en_enquete',    'urgente', 'Vol à main armée dans une station-service', 'Gombe, Kinshasa',    now() - interval '3 days',  'com-1', 'off-1'),
  ('case-2', 'DOS-2024-002', 'Trafic de stupéfiants - Goma',      'stupefiants','en_instruction','urgente', 'Trafic de drogue dans un bar de Goma',      'Goma',               now() - interval '5 days',  'com-6', 'off-6'),
  ('case-3', 'DOS-2024-003', 'Escroquerie - Lubumbashi',          'fraude',     'jugement',      'haute',   'Escroquerie avec faux documents',          'Lubumbashi',         now() - interval '30 days', 'com-4', 'off-5'),
  ('case-4', 'DOS-2024-004', 'Agression - Lemba',                 'violence',   'ouvert',        'haute',   'Agression physique sur la voie publique',  'Lemba, Kinshasa',    now() - interval '1 day',   'com-2', 'off-3'),
  ('case-5', 'DOS-2024-005', 'Homicide - Matadi',                 'homicide',   'en_enquete',    'urgente', 'Homicide sur la route de Matadi',           'Matadi',             now() - interval '3 days',  'com-5', null)
on conflict do nothing;

-- ---- Liaisons Case-Criminal ----
insert into public.case_criminals (case_id, criminal_id, role) values
  ('case-1', 'crim-1', 'suspect'),
  ('case-2', 'crim-3', 'suspect'),
  ('case-3', 'crim-2', 'accuse'),
  ('case-4', 'crim-4', 'temoin'),
  ('case-5', 'crim-6', 'suspect')
on conflict do nothing;

-- ---- Alertes (envoyées par les citoyens via mobile) ----
insert into public.alerts (id, reference, type, priority, status, description, location, latitude, longitude, citizen_name, citizen_phone, citizen_id, commissariat_id, assigned_to_id, response_time, created_at) values
  ('alert-1', 'ALT-2024-001', 'vol',        'urgente', 'en_cours', 'Vol à main armée en cours',  'Gombe, Kinshasa',   -4.3217, 15.3130, 'Aimé Kalala',    '+243820000001', 'cit-1', 'com-1', 'off-1', 5,  now() - interval '20 minutes'),
  ('alert-2', 'ALT-2024-002', 'agression',  'urgente', 'recue',    'Agression dans le marché',   'Lemba, Kinshasa',   -4.3890, 15.3140, 'Béatrice Ngoyi', '+243820000002', 'cit-2', 'com-2', null,   null,now() - interval '5 minutes'),
  ('alert-3', 'ALT-2024-003', 'accident',   'haute',   'traitee',  'Accident de circulation',    'Ndjili, Kinshasa',  -4.3420, 15.3850, 'Christian Mwamba','+243820000003','cit-3', 'com-3', 'off-4', 12, now() - interval '2 hours'),
  ('alert-4', 'ALT-2024-004', 'incendie',   'haute',   'en_cours', 'Incendie dans un entrepôt',  'Lubumbashi',        -11.6644,27.4796, 'Dorothée Kasongo','+243820000004','cit-4', 'com-4', 'off-5', 8,  now() - interval '1 hour'),
  ('alert-5', 'ALT-2024-005', 'vol',        'moyenne', 'recue',    'Vol de téléphone',           'Matadi',            -5.8167, 13.4500, 'Emmanuel Tshibangu','+243820000005','cit-5','com-5', null,  null,now() - interval '15 minutes'),
  ('alert-6', 'ALT-2024-006', 'agression',  'urgente', 'traitee',  'Agression nocturne',         'Goma',              -1.6788, 29.2228, 'Fatuma Mukendi', '+243820000006', 'cit-6', 'com-6', 'off-6', 10, now() - interval '5 hours'),
  ('alert-7', 'ALT-2024-007', 'autre',      'basse',   'cloturee', 'Tapage nocturne',            'Gombe, Kinshasa',   -4.3250, 15.3150, 'Gloire Bemba',   '+243820000007', 'cit-7', 'com-1', 'off-2', 25, now() - interval '1 day'),
  ('alert-8', 'ALT-2024-008', 'vol',        'haute',   'recue',    'Tentative de cambriolage',   'Lemba, Kinshasa',   -4.3905, 15.3145, 'Hélène Lukusa',  '+243820000008', 'cit-8', 'com-2', null,   null,now() - interval '10 minutes')
on conflict do nothing;

-- ---- Plaintes ----
insert into public.complaints (id, reference, type, status, description, location, plaintiff_name, plaintiff_phone, plaintiff_email, plaintiff_addr, citizen_id, commissariat_id, reviewed_by_id, review_notes, created_at) values
  ('comp-1', 'PLT-2024-001', 'vol',         'soumise',     'Vol de mon téléphone dans le bus',           'Gombe, Kinshasa',   'Aimé Kalala',     '+243820000001', 'aime.kalala@gmail.com',   'Av. du Port 12',    'cit-1', 'com-1', null,  null, now() - interval '1 hour'),
  ('comp-2', 'PLT-2024-002', 'harassment',  'en_revision', 'Harcèlement de mon voisin',                 'Lemba, Kinshasa',   'Béatrice Ngoyi',  '+243820000002', 'beatrice.ngoyi@gmail.com','Av. Kasa-Vubu 45',  'cit-2', 'com-2', 'off-3','En cours de vérification', now() - interval '3 hours'),
  ('comp-3', 'PLT-2024-003', 'agression',   'approuvee',   'Agression physique au marché',               'Ndjili, Kinshasa',  'Christian Mwamba','+243820000003', 'c.mwamba@gmail.com',      'Bd Ndjili 78',      'cit-3', 'com-3', 'off-4', 'Plainte recevable, enquête ouverte', now() - interval '1 day'),
  ('comp-4', 'PLT-2024-004', 'corruption',  'approuvee',   'Corruption d''un agent',                     'Lubumbashi',        'Dorothée Kasongo','+243820000004', 'd.kasongo@gmail.com',     'Av. Lumumba 23',    'cit-4', 'com-4', 'off-5', 'Transmise aux affaires internes', now() - interval '2 days'),
  ('comp-5', 'PLT-2024-005', 'vol',         'rejetee',     'Vol présumé sans preuve',                    'Matadi',            'Emmanuel Tshibangu','+243820000005','e.tshibangu@gmail.com',   'Bd du 30 Juin 5',   'cit-5', 'com-5', 'off-5', 'Manque de preuves', now() - interval '3 days'),
  ('comp-6', 'PLT-2024-006', 'agression',   'traitee',     'Agression verbale et menace',                'Goma',              'Fatuma Mukendi',  '+243820000006', 'fatuma.m@gmail.com',      'Av. des Acacias 9', 'cit-6', 'com-6', 'off-6', 'Médiation réussie', now() - interval '10 days')
on conflict do nothing;

-- ---- Services externes ----
insert into public.external_services (id, name, type, endpoint, api_key, status, last_sync_at, description) values
  ('svc-1', 'Ministère de la Justice',      'justice',    'https://justice.gouv.cd/api',     'key_justice_demo',    'actif',   now() - interval '1 hour',   'Échange de dossiers judiciaires'),
  ('svc-2', 'Hôpital Général de Kinshasa',  'hopital',    'https://hgk.cd/api',             'key_hgk_demo',        'actif',   now() - interval '2 hours',   'Vérification des admissions'),
  ('svc-3', 'Mairie de Kinshasa',           'mairie',     'https://mairie-kinshasa.cd/api', 'key_mairie_demo',     'actif',   now() - interval '3 hours',   'Actes d''état civil'),
  ('svc-4', 'Direction Générale des Douanes','douane',    'https://douanes.gouv.cd/api',    'key_douanes_demo',    'inactif', now() - interval '1 day',    'Vérification douanière'),
  ('svc-5', 'Service d''Immigration',       'immigration','https://dgm.gouv.cd/api',         'key_dgm_demo',        'actif',   now() - interval '6 hours',   'Vérification des passeports'),
  ('svc-6', 'Casernes militaires',          'autre',      'https://military.cd/api',        'key_military_demo',   'erreur',  now() - interval '12 hours',  'Coordination sécurité')
on conflict do nothing;

-- ---- Logs de service ----
insert into public.service_logs (service_id, direction, message_type, content, status, error_message, created_at) values
  ('svc-1', 'envoi',     'requête',      'Envoi du dossier DOS-2024-001',         'succes',     null, now() - interval '1 hour'),
  ('svc-1', 'reception', 'notification', 'Confirmation réception dossier',        'succes',     null, now() - interval '55 minutes'),
  ('svc-2', 'envoi',     'requête',      'Vérification admission patient',        'succes',     null, now() - interval '2 hours'),
  ('svc-3', 'envoi',     'sync',         'Synchronisation actes naissance',       'succes',     null, now() - interval '3 hours'),
  ('svc-4', 'envoi',     'requête',      'Vérification douane',                    'en_attente', null, now() - interval '1 day'),
  ('svc-5', 'reception', 'notification', 'Mise à jour base passeports',           'succes',     null, now() - interval '6 hours'),
  ('svc-6', 'envoi',     'requête',      'Demande coordination',                   'echec',      'Timeout: serveur injoignable', now() - interval '12 hours'),
  ('svc-6', 'envoi',     'notification', 'Relance demande coordination',           'echec',      'Connexion refusée', now() - interval '11 hours'),
  ('svc-1', 'reception', 'notification', 'Nouveau jugement disponible',           'succes',     null, now() - interval '30 minutes'),
  ('svc-2', 'envoi',     'requête',      'Demande rapport médical',                'succes',     null, now() - interval '4 hours')
on conflict do nothing;

-- ---- Preuves ----
insert into public.evidence (criminal_id, type, title, description, file_url, file_name, file_size, collected_at, collected_by, case_id) values
  ('crim-1', 'photo',     'Photo surveillance',   'Image CCTV du vol',           '/evidence/crim-1-cctv.jpg',      'cctv-vol.jpg',      245678, now() - interval '3 days',  'Off. Jean Mukendi',  'case-1'),
  ('crim-1', 'document',  'Fiche signalétique',   'Fiche du suspect',            '/evidence/crim-1-fiche.pdf',     'fiche-suspect.pdf', 89234,  now() - interval '3 days',  'Off. Marie Kabongo', 'case-1'),
  ('crim-3', 'photo',     'Saisie de drogue',     'Photographie de la drogue',   '/evidence/crim-3-drogue.jpg',    'saisie-drogue.jpg', 512345, now() - interval '5 days',  'Off. Grace Ilunga',  'case-2'),
  ('crim-3', 'video',     'Interrogatoire',       'Vidéo interrogatoire suspect','/evidence/crim-3-inter.mp4',     'interrogatoire.mp4',15420000, now() - interval '4 days', 'Off. Grace Ilunga',  'case-2'),
  ('crim-2', 'document',  'Faux documents',       'Faux passeport saisi',        '/evidence/crim-2-passeport.pdf', 'faux-passeport.pdf',102456, now() - interval '30 days', 'Off. Joseph Mobuti', 'case-3'),
  ('crim-6', 'photo',     'Scène de crime',       'Photos scène homicide',       '/evidence/crim-6-scene.jpg',     'scene-crime.jpg',   389456, now() - interval '3 days',  'Off. Jean Mukendi',  'case-5'),
  ('crim-6', 'temoignage','Témoignage',           'Déposition témoin oculaire',  '/evidence/crim-6-temoin.txt',    'temoin.txt',         4567,  now() - interval '2 days',  'Off. Jean Mukendi',  'case-5'),
  ('crim-4', 'photo',     'Lieu du vol',          'Photo marché Lemba',          '/evidence/crim-4-marche.jpg',    'marche-lemba.jpg',  198234, now() - interval '10 days', 'Off. Pierre Tshisekedi', null),
  ('crim-5', 'document',  'Plainte',              'Copie de plainte',             '/evidence/crim-5-plainte.pdf',   'plainte.pdf',        32100, now() - interval '1 day',   'Off. Anne Mbuyi',    null),
  ('crim-1', 'photo',     'Tatouage',             'Photo tatouage aigle',        '/evidence/crim-1-tatouage.jpg',  'tatouage-aigle.jpg',145678, now() - interval '2 days',  'Off. Marie Kabongo', null),
  ('crim-3', 'document',  'Analyse',              'Rapport analyse drogue',      '/evidence/crim-3-analyse.pdf',   'analyse-drogue.pdf',56789,  now() - interval '4 days',  'Off. Grace Ilunga',  'case-2')
on conflict do nothing;

-- ============================================================================
-- FIN DES DONNÉES DE DÉMONSTRATION
-- ============================================================================
