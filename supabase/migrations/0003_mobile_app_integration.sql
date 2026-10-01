-- ============================================================================
-- Migration 0003 : Intégration partagée avec l'application mobile PNC Alerte
-- ============================================================================
-- Cette migration connecte le Centre de Commandement (web) aux tables que
-- l'application mobile PNC Alerte utilise déjà (profiles, signalements,
-- plaintes, sos_calls, personnes_disparues, alertes_officielles, ...).
--
--  1) Active Supabase Realtime sur les tables mobile (SOS, signalements, ...)
--     → les alertes envoyées par les citoyens remontent INSTANTANÉMENT
--       dans le dashboard du Centre de Commandement.
--  2) Insère des données de démonstration réalistes dans ces tables pour
--     que le Centre de Commandement affiche des citoyens, signalements,
--     plaintes et appels SOS dès le premier lancement.
--
-- ⚠️  Le Centre de Commandement lit ces tables avec la clé SERVICE_ROLE
--     (bypass RLS) → il voit TOUTES les données, même celles que le RLS
--     citoyen masque. L'application mobile utilise la clé ANON + RLS.
-- ============================================================================

-- ============================================================================
-- 1) REALTIME : publier les tables mobile sur le canal supabase_realtime
--    (idempotent : ignore si la table est déjà membre de la publication)
-- ============================================================================
DO $$
DECLARE t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profiles','signalements','plaintes','sos_calls','personnes_disparues',
    'alertes_officielles','notifications','convocations','signalement_updates','plainte_updates'
  ] LOOP
    BEGIN
      EXECUTE format('ALTER PUBLICATION supabase_realtime ADD TABLE public.%I', t);
    EXCEPTION WHEN duplicate_object THEN NULL;
    END;
  END LOOP;
END $$;

-- ============================================================================
-- 2) DONNÉES DE DÉMONSTRATION (idempotent : ne réinsère pas si déjà présent)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 2.1) PROFILES — citoyens inscrits via l'application mobile
-- ----------------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, phone, province, commune, carte_electeur_numero, carte_electeur_valide, carte_electeur_image, profile_image, role, created_at, updated_at)
VALUES
  ('a1111111-0000-0000-0000-000000000001', 'Jean-Paul Mbumba', 'jeanpaul.mbumba@gmail.com', '+243810000001', 'Kinshasa', 'Gombe',        'CE-KIN-001',  true,  NULL, NULL, 'citoyen', NOW() - INTERVAL '30 days', NOW() - INTERVAL '2 days'),
  ('a1111111-0000-0000-0000-000000000002', 'Aminata Kabore',  'aminata.kabore@yahoo.fr',  '+243810000002', 'Kinshasa', 'Lemba',        'CE-KIN-002',  true,  NULL, NULL, 'citoyen', NOW() - INTERVAL '28 days', NOW() - INTERVAL '5 days'),
  ('a1111111-0000-0000-0000-000000000003', 'Patrick Ilunga',  'patrick.ilunga@outlook.com','+243810000003', 'Haut-Katanga', 'Lubumbashi','CE-HK-001',   false, NULL, NULL, 'citoyen', NOW() - INTERVAL '25 days', NOW() - INTERVAL '1 day'),
  ('a1111111-0000-0000-0000-000000000004', 'Sandrine Mwila',  'sandrine.mwila@gmail.com', '+243810000004', 'Kinshasa', 'Matete',       'CE-KIN-003',  true,  NULL, NULL, 'citoyen', NOW() - INTERVAL '20 days', NOW() - INTERVAL '3 days'),
  ('a1111111-0000-0000-0000-000000000005', 'Eric Kasongo',    'eric.kasongo@gmail.com',   '+243810000005', 'Haut-Lomami', 'Kamina',     'CE-HL-001',   true,  NULL, NULL, 'citoyen', NOW() - INTERVAL '15 days', NOW() - INTERVAL '12 hours'),
  ('a1111111-0000-0000-0000-000000000006', 'Brigitte Ntumba', 'brigitte.ntumba@yahoo.fr', '+243810000006', 'Kongo Central', 'Matadi',    'CE-KC-001',   true,  NULL, NULL, 'citoyen', NOW() - INTERVAL '10 days', NOW() - INTERVAL '6 hours'),
  ('a1111111-0000-0000-0000-000000000007', 'Joseph Mukendi',  'joseph.mukendi@gmail.com', '+243810000007', 'Kinshasa', 'Bandalungwa',  'CE-KIN-004',  true,  NULL, NULL, 'citoyen', NOW() - INTERVAL '8 days',  NOW() - INTERVAL '2 hours'),
  ('a1111111-0000-0000-0000-000000000008', 'Esther Tshibangu','esther.tshibangu@gmail.com','+243810000008','Kinshasa', 'Ngaliema',     'CE-KIN-005',  true,  NULL, NULL, 'citoyen', NOW() - INTERVAL '5 days',  NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2.2) SIGNALEMENTS — alertes citoyennes envoyées depuis le mobile
-- ----------------------------------------------------------------------------
INSERT INTO public.signalements (id, user_id, type, description, location, latitude, longitude, photo_url, anonymous, status, reference, priority, created_at, updated_at)
VALUES
  ('b2222222-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'vol',           'Vol à la tire par deux individus à moto près du marché. Le sac à main a été arraché.',                       'Marché Central, Gombe',        -4.3217, 15.3122, NULL, false, 'traite',     'SIG-2026-001', 'haute',   NOW() - INTERVAL '6 days',  NOW() - INTERVAL '4 days'),
  ('b2222222-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 'agression',     'Agression physique par un groupe de jeunes devant une boîte de nuit. Blessure au bras.',                   'Av. de la Justice, Lemba',     -4.3614, 15.2956, NULL, false, 'en-cours',   'SIG-2026-002', 'critique',NOW() - INTERVAL '3 days',  NOW() - INTERVAL '1 day'),
  ('b2222222-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000003', 'corruption',     'Escroquerie par un faux agent de recouvrement demandant de l''argent pour une prétendue amende.',         'Quartier Gécamines, Lubumbashi',-11.6647, 27.4794, NULL, false, 'en-attente', 'SIG-2026-003', 'moyenne', NOW() - INTERVAL '2 days',  NOW() - INTERVAL '2 days'),
  ('b2222222-0000-0000-0000-000000000004', 'a1111111-0000-0000-0000-000000000004', 'nuisance',       'Nuisance sonore nocturne récurrente par un bar du quartier après minuit.',                                  'Av. Kasa-Vubu, Matete',        -4.3486, 15.3178, NULL, false, 'en-attente', 'SIG-2026-004', 'basse',   NOW() - INTERVAL '1 day',   NOW() - INTERVAL '1 day'),
  ('b2222222-0000-0000-0000-000000000005', 'a1111111-0000-0000-0000-000000000005', 'vol',           'Cambriolage de mon domicile pendant mon absence. Effets électroménagers dérobés.',                          'Quartier Kamina Est',          -8.7293, 25.0208, NULL, false, 'en-cours',   'SIG-2026-005', 'haute',   NOW() - INTERVAL '20 hours', NOW() - INTERVAL '5 hours'),
  ('b2222222-0000-0000-0000-000000000006', 'a1111111-0000-0000-0000-000000000006', 'corruption',    'Un agent en uniforme a exigé un bakchich au checkpoint de Matadi. J''ai refusé et il est devenu menaçant.', 'Port de Matadi',               -5.8240, 13.4636, NULL, true,  'en-attente', 'SIG-2026-006', 'critique',NOW() - INTERVAL '5 hours',  NOW() - INTERVAL '5 hours'),
  ('b2222222-0000-0000-0000-000000000007', 'a1111111-0000-0000-0000-000000000007', 'trafic',        'Vente de drogue en plein jour devant l''école primaire. Enfants exposés.',                                  'Av. Kasa-Vubu, Bandalungwa',   -4.3320, 15.3001, NULL, false, 'en-attente', 'SIG-2026-007', 'haute',   NOW() - INTERVAL '90 minutes', NOW() - INTERVAL '90 minutes'),
  ('b2222222-0000-0000-0000-000000000008', 'a1111111-0000-0000-0000-000000000008', 'violence',      'Violences conjugales chez le voisin, cris et coups entendus depuis hier soir.',                             'Résidence Haut-Katanga, Ngaliema', -4.3540, 15.2860, NULL, true, 'en-attente','SIG-2026-008', 'critique',NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2.3) PLAINES — plaintes formelles déposées par les citoyens
-- ----------------------------------------------------------------------------
INSERT INTO public.plaintes (id, user_id, type_plainte, description, suspect_info, lieu_incident, date_incident, pieces_jointes, status, reference, created_at, updated_at)
VALUES
  ('c3333333-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'vol',          'Je dépose plainte pour le vol de mon sac à main au marché central. Le présumé voleur portait un tee-shirt noir.', 'Homme, 25-30 ans, tee-shirt noir, pantalon jean', 'Marché Central, Gombe', '2026-01-10', ARRAY[]::text[], 'en-cours', 'PLT-2026-001', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days'),
  ('c3333333-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 'agression',    'Agression verbale et physique devant la boîte de nuit. Témoins présents.', 'Groupe de 4 jeunes, 18-25 ans', 'Av. de la Justice, Lemba', '2026-01-13', ARRAY[]::text[], 'en-attente', 'PLT-2026-002', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
  ('c3333333-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000004', 'harcèlement',  'Harcèlement répété d''un voisin depuis 2 semaines, messages et menaces.', 'Voisin du 3e étage, nommé Joseph', 'Immeuble Kasa-Vubu, Matete', '2026-01-14', ARRAY[]::text[], 'en-attente', 'PLT-2026-003', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('c3333333-0000-0000-0000-000000000005', 'a1111111-0000-0000-0000-000000000005', 'vol',          'Cambriolage de mon domicile, effets dérobés : téléviseur, chaîne hi-fi, argent liquide.', 'Inconnu, effraction par la fenêtre arrière', 'Quartier Kamina Est', '2026-01-15', ARRAY[]::text[], 'traite', 'PLT-2026-004', NOW() - INTERVAL '20 hours', NOW() - INTERVAL '5 hours'),
  ('c3333333-0000-0000-0000-000000000006', 'a1111111-0000-0000-0000-000000000006', 'autre',        'Extorsion par un agent au checkpoint de Matadi, plaque 1234.', 'Agent en uniforme, corpulent, lunettes noires', 'Port de Matadi', '2026-01-16', ARRAY[]::text[], 'en-attente', 'PLT-2026-005', NOW() - INTERVAL '5 hours', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2.4) SOS_CALLS — appels SOS en direct (2 actifs, 2 clôturés)
-- ----------------------------------------------------------------------------
INSERT INTO public.sos_calls (id, user_id, latitude, longitude, location_text, status, agent_assigned, response_time_seconds, notes, reference, created_at, closed_at)
VALUES
  ('d4444444-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000007', -4.3250, 15.3070, 'Av. du Commerce, Gombe — proche du bâtiment Sonas',    'actif',     NULL, NULL, 'SOS déclenché: agression en cours. Victime cachée.', 'SOS-2026-001', NOW() - INTERVAL '3 minutes',  NULL),
  ('d4444444-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000008', -4.3540, 15.2860, 'Résidence Haut-Katanga, Ngaliema — bâtiment B, 2e étage', 'actif',   NULL, NULL, 'SOS déclenché: violences conjugales voisins.',      'SOS-2026-002', NOW() - INTERVAL '45 seconds', NULL),
  ('d4444444-0000-0000-0000-000000000003', 'a1111111-0000-0000-0000-000000000002', -4.3614, 15.2956, 'Av. de la Justice, Lemba',                              'cloture',   NULL, 420,  'Patrouille intervenue, situation maîtrisée.',       'SOS-2026-003', NOW() - INTERVAL '3 days',     NOW() - INTERVAL '3 days'),
  ('d4444444-0000-0000-0000-000000000004', 'a1111111-0000-0000-0000-000000000001', -4.3217, 15.3122, 'Marché Central, Gombe',                                 'cloture',   NULL, 300,  'Vol à la tire, suspect interpellé par patrouille.', 'SOS-2026-004', NOW() - INTERVAL '6 days',     NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2.5) PERSONNES_DISPARUES — avis de recherche
-- ----------------------------------------------------------------------------
INSERT INTO public.personnes_disparues (id, user_id, nom_complet, age, sexe, description, derniere_vue_lieu, derniere_vue_date, photo_url, contact_telephone, status, reference, created_at, updated_at)
VALUES
  ('e5555555-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'Junior Mbumba',     12, 'M', 'Enfant, 1m40, tee-shirt jaune, short bleu, sac à dos rouge.',          'Marché Central, Gombe',     '2026-01-12', NULL, '+243810000001', 'recherche', 'DIS-2026-001', NOW() - INTERVAL '4 days', NOW() - INTERVAL '1 day'),
  ('e5555555-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000004', 'Nadine Mwila',      24, 'F', 'Jeune femme, 1m65, robe verte, cheveux tressés. Démence précoce.',    'Gare de Matete',            '2026-01-15', NULL, '+243810000004', 'recherche', 'DIS-2026-002', NOW() - INTERVAL '1 day',  NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2.6) ALERTES_OFFICIELLES — alertes PNC diffusées aux citoyens
-- ----------------------------------------------------------------------------
INSERT INTO public.alertes_officielles (id, titre, type, severity, description, location, source, reference, publiee_par, active, created_at)
VALUES
  ('f6666666-0000-0000-0000-000000000001', 'Renforcement des patrouilles nocturnes à Gombe',          'securite',   'low',     'La PNC renforce ses patrouilles nocturnes dans la commune de Gombe. Restez vigilants et signalez tout comportement suspect.', 'Gombe',           'PNC Kinshasa', 'AO-2026-001', 'a1111111-0000-0000-0000-000000000001', true,  NOW() - INTERVAL '2 days'),
  ('f6666666-0000-0000-0000-000000000002', 'Avis de recherche — Junior Mbumba, 12 ans',               'recherche',  'medium',  'Avis de recherche : Junior Mbumba, 12 ans, vu pour la dernière fois au Marché Central de Gombe. Contacter le commissariat le plus proche.', 'Gombe', 'PNC Kinshasa', 'AO-2026-002', 'a1111111-0000-0000-0000-000000000001', true,  NOW() - INTERVAL '4 days'),
  ('f6666666-0000-0000-0000-000000000003', 'Opération anti-cambriolage en cours à Kamina',            'operation',  'medium',  'Opération de police en cours dans le quartier Kamina Est. Circulation perturbée. Évitez le secteur.', 'Kamina',       'PNC Haut-Lomami', 'AO-2026-003', 'a1111111-0000-0000-0000-000000000001', true,  NOW() - INTERVAL '18 hours')
ON CONFLICT (id) DO NOTHING;

-- ----------------------------------------------------------------------------
-- 2.7) NOTIFICATIONS — notifications push envoyées vers l'app mobile
-- ----------------------------------------------------------------------------
INSERT INTO public.notifications (id, user_id, type, titre, message, read, screen_target, related_id, created_at)
VALUES
  ('77777777-0000-0000-0000-000000000001', 'a1111111-0000-0000-0000-000000000001', 'info',    'Mise à jour de votre signalement', 'Votre signalement SIG-2026-001 (vol au marché) a été marqué comme résolu. Merci de votre contribution.', false, 'signalement', 'b2222222-0000-0000-0000-000000000001', NOW() - INTERVAL '4 days'),
  ('77777777-0000-0000-0000-000000000002', 'a1111111-0000-0000-0000-000000000002', 'info',    'Plainte en cours de révision',     'Votre plainte PLT-2026-002 (agression) est en cours de révision par un officier du commissariat de Lemba.', false, 'plainte',     'c3333333-0000-0000-0000-000000000002', NOW() - INTERVAL '2 days'),
  ('77777777-0000-0000-0000-000000000005', 'a1111111-0000-0000-0000-000000000005', 'succes',  'Plainte approuvée',                'Votre plainte PLT-2026-004 (cambriolage) a été approuvée. Un dossier a été ouvert.', false, 'plainte',     'c3333333-0000-0000-0000-000000000004', NOW() - INTERVAL '5 hours'),
  ('77777777-0000-0000-0000-000000000006', 'a1111111-0000-0000-0000-000000000001', 'alerte',  'Alerte officielle de la PNC',      'Renforcement des patrouilles nocturnes dans votre commune (Gombe). Restez vigilants.', false, 'alerte',      'f6666666-0000-0000-0000-000000000001', NOW() - INTERVAL '2 days')
ON CONFLICT (id) DO NOTHING;
