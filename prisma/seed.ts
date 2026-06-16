import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Provinces
  const kinshasa = await prisma.province.create({ data: { name: 'Kinshasa', code: 'KIN' } });
  const katanga = await prisma.province.create({ data: { name: 'Haut-Katanga', code: 'HKAT' } });
  const kongoCentral = await prisma.province.create({ data: { name: 'Kongo-Central', code: 'KC' } });
  const nordKivu = await prisma.province.create({ data: { name: 'Nord-Kivu', code: 'NKV' } });

  // Districts
  const lukunga = await prisma.district.create({ data: { name: 'Lukunga', code: 'LUK', provinceId: kinshasa.id } });
  const montAmba = await prisma.district.create({ data: { name: 'Mont-Amba', code: 'MAM', provinceId: kinshasa.id } });
  const lubumbashi = await prisma.district.create({ data: { name: 'Lubumbashi', code: 'LUB', provinceId: katanga.id } });
  const goma = await prisma.district.create({ data: { name: 'Goma', code: 'GOM', provinceId: nordKivu.id } });

  // Sous-Districts
  const gombe = await prisma.sousDistrict.create({ data: { name: 'Gombe', code: 'GOM', districtId: lukunga.id } });
  const barumbu = await prisma.sousDistrict.create({ data: { name: 'Barumbu', code: 'BAR', districtId: lukunga.id } });
  const matonge = await prisma.sousDistrict.create({ data: { name: 'Kalamu', code: 'KAL', districtId: lukunga.id } });
  const ndjili = await prisma.sousDistrict.create({ data: { name: 'Ndjili', code: 'NDJ', districtId: montAmba.id } });
  const kenya = await prisma.sousDistrict.create({ data: { name: 'Kenya', code: 'KEN', districtId: lubumbashi.id } });
  const karisimbi = await prisma.sousDistrict.create({ data: { name: 'Karisimbi', code: 'KSM', districtId: goma.id } });

  // Commissariats
  const comGombe = await prisma.commissariat.create({ data: { name: 'Commissariat de la Gombe', code: 'COM-GOM', address: 'Avenue du Port, Gombe', phone: '+243810000001', sousDistrictId: gombe.id } });
  const comBarumbu = await prisma.commissariat.create({ data: { name: 'Commissariat de Barumbu', code: 'COM-BAR', address: 'Avenue Kasai, Barumbu', phone: '+243810000002', sousDistrictId: barumbu.id } });
  const comKalamu = await prisma.commissariat.create({ data: { name: 'Commissariat de Kalamu', code: 'COM-KAL', address: 'Boulevard du 30 Juin, Kalamu', phone: '+243810000003', sousDistrictId: matonge.id } });
  const comNdjili = await prisma.commissariat.create({ data: { name: 'Commissariat de Ndjili', code: 'COM-NDJ', address: 'Avenue Ndjili, Ndjili', phone: '+243810000004', sousDistrictId: ndjili.id } });
  const comLubumbashi = await prisma.commissariat.create({ data: { name: 'Commissariat Central de Lubumbashi', code: 'COM-LUB', address: 'Avenue Kisangani, Lubumbashi', phone: '+243810000005', sousDistrictId: kenya.id } });
  const comGoma = await prisma.commissariat.create({ data: { name: 'Commissariat de Goma', code: 'COM-GMA', address: 'Avenue de la Paix, Goma', phone: '+243810000006', sousDistrictId: karisimbi.id } });

  // Officers
  const officer1 = await prisma.officer.create({ data: { matricule: 'PNC-001', firstName: 'Jean', lastName: 'Mukendi', rank: 'Commissaire Principal', phone: '+243811000001', email: 'j.mukendi@pnc.cd', commissariatId: comGombe.id } });
  const officer2 = await prisma.officer.create({ data: { matricule: 'PNC-002', firstName: 'Marie', lastName: 'Tshisekedi', rank: 'Inspecteur', phone: '+243811000002', email: 'm.tshisekedi@pnc.cd', commissariatId: comGombe.id } });
  const officer3 = await prisma.officer.create({ data: { matricule: 'PNC-003', firstName: 'Patrick', lastName: 'Lumumba', rank: 'Agent Supérieur', phone: '+243811000003', email: 'p.lumumba@pnc.cd', commissariatId: comBarumbu.id } });
  const officer4 = await prisma.officer.create({ data: { matricule: 'PNC-004', firstName: 'Grace', lastName: 'Kabila', rank: 'Inspecteur Principal', phone: '+243811000004', email: 'g.kabila@pnc.cd', commissariatId: comKalamu.id } });
  const officer5 = await prisma.officer.create({ data: { matricule: 'PNC-005', firstName: 'Félix', lastName: 'Kasongo', rank: 'Agent', phone: '+243811000005', email: 'f.kasongo@pnc.cd', commissariatId: comNdjili.id } });
  const officer6 = await prisma.officer.create({ data: { matricule: 'PNC-006', firstName: 'Clarisse', lastName: 'Mbuyi', rank: 'Commissaire', phone: '+243811000006', email: 'c.mbuyi@pnc.cd', commissariatId: comLubumbashi.id } });

  // Criminals
  const criminal1 = await prisma.criminal.create({ data: { reference: 'CRIM-2024-001', firstName: 'Alain', lastName: 'Mbala', alias: 'Le Boss', dateOfBirth: new Date('1985-03-15'), gender: 'M', nationality: 'Congolaise', idNumber: 'ID-8547291', physicalDesc: '1m78, cicatrice sur la joue gauche', status: 'recherche', dangerLevel: 'eleve', lastKnownAddr: 'Quartier Matonge, Kinshasa' } });
  const criminal2 = await prisma.criminal.create({ data: { reference: 'CRIM-2024-002', firstName: 'Serge', lastName: 'Ilunga', alias: 'Serge 9 vie', dateOfBirth: new Date('1990-07-22'), gender: 'M', nationality: 'Congolaise', idNumber: 'ID-9083421', physicalDesc: '1m72, tatouage bras droit', status: 'incarcere', dangerLevel: 'eleve', lastKnownAddr: 'Ndjili, Kinshasa' } });
  const criminal3 = await prisma.criminal.create({ data: { reference: 'CRIM-2024-003', firstName: 'Nadia', lastName: 'Kalonji', alias: null, dateOfBirth: new Date('1995-11-08'), gender: 'F', nationality: 'Congolaise', idNumber: 'ID-9526173', physicalDesc: '1m65, grain de beauté sur la tempe droite', status: 'libre', dangerLevel: 'faible', lastKnownAddr: 'Gombe, Kinshasa' } });
  const criminal4 = await prisma.criminal.create({ data: { reference: 'CRIM-2024-004', firstName: 'Hervé', lastName: 'Nkulu', alias: 'Hervé Cash', dateOfBirth: new Date('1988-01-30'), gender: 'M', nationality: 'Congolaise', idNumber: 'ID-8839102', physicalDesc: '1m80, barbe fine', status: 'sous_surveillance', dangerLevel: 'moyen', lastKnownAddr: 'Lubumbashi, Haut-Katanga' } });
  const criminal5 = await prisma.criminal.create({ data: { reference: 'CRIM-2024-005', firstName: 'Pascal', lastName: 'Mwamba', alias: 'Paco', dateOfBirth: new Date('1992-05-14'), gender: 'M', nationality: 'Congolaise', idNumber: 'ID-9251480', physicalDesc: '1m75, lunettes, cheveux rasés', status: 'recherche', dangerLevel: 'moyen', lastKnownAddr: 'Goma, Nord-Kivu' } });
  const criminal6 = await prisma.criminal.create({ data: { reference: 'CRIM-2024-006', firstName: 'Chantal', lastName: 'Banza', alias: 'Maman Chantal', dateOfBirth: new Date('1978-09-20'), gender: 'F', nationality: 'Congolaise', idNumber: 'ID-7865234', physicalDesc: '1m60, taille forte', status: 'incarcere', dangerLevel: 'eleve', lastKnownAddr: 'Barumbu, Kinshasa' } });

  // Cases
  const case1 = await prisma.case.create({ data: { reference: 'DOS-2024-001', title: 'Vol à main armée - Banque Commerce', type: 'vol', status: 'en_enquete', priority: 'urgente', description: 'Vol à main armée perpétré contre la Banque de Commerce de la Gombe. Les malfaiteurs ont emporté une somme importante en devises.', location: 'Banque de Commerce, Gombe', incidentDate: new Date('2024-11-15'), commissariatId: comGombe.id, assignedToId: officer1.id } });
  const case2 = await prisma.case.create({ data: { reference: 'DOS-2024-002', title: 'Réseau de trafic de stupéfiants', type: 'stupéfiants', status: 'en_instruction', priority: 'urgente', description: 'Réseau organisé de trafic et distribution de drogue dans les quartiers de Barumbu et Matonge.', location: 'Barumbu / Matonge', incidentDate: new Date('2024-10-20'), commissariatId: comBarumbu.id, assignedToId: officer3.id } });
  const case3 = await prisma.case.create({ data: { reference: 'DOS-2024-003', title: 'Homicide - Marché central', type: 'homicide', status: 'ouvert', priority: 'haute', description: 'Découverte du corps sans vie d\'un homme identifié comme étant M. Kabongo, retrouvé au marché central de Kalamu.', location: 'Marché Central, Kalamu', incidentDate: new Date('2024-12-01'), commissariatId: comKalamu.id, assignedToId: officer4.id } });
  const case4 = await prisma.case.create({ data: { reference: 'DOS-2024-004', title: 'Fraude immobilière - Ndjili', type: 'fraude', status: 'en_enquete', priority: 'moyenne', description: 'Escroquerie immobilière touchant plusieurs familles dans la cité de Ndjili. Le suspect aurait vendu des parcelles déjà attribuées.', location: 'Cité Ndjili', incidentDate: new Date('2024-09-10'), commissariatId: comNdjili.id, assignedToId: officer5.id } });
  const case5 = await prisma.case.create({ data: { reference: 'DOS-2024-005', title: 'Violences armées - Lubumbashi', type: 'violence', status: 'jugement', priority: 'urgente', description: 'Affaire de violences armées impliquant un groupe armé dans la zone de Kenya, Lubumbashi.', location: 'Quartier Kenya, Lubumbashi', incidentDate: new Date('2024-08-05'), commissariatId: comLubumbashi.id, assignedToId: officer6.id } });

  // Case-Criminal relations
  await prisma.caseCriminal.create({ data: { caseId: case1.id, criminalId: criminal1.id, role: 'suspect' } });
  await prisma.caseCriminal.create({ data: { caseId: case1.id, criminalId: criminal2.id, role: 'suspect' } });
  await prisma.caseCriminal.create({ data: { caseId: case2.id, criminalId: criminal2.id, role: 'suspect' } });
  await prisma.caseCriminal.create({ data: { caseId: case2.id, criminalId: criminal6.id, role: 'suspect' } });
  await prisma.caseCriminal.create({ data: { caseId: case3.id, criminalId: criminal5.id, role: 'suspect' } });
  await prisma.caseCriminal.create({ data: { caseId: case5.id, criminalId: criminal4.id, role: 'suspect' } });
  await prisma.caseCriminal.create({ data: { caseId: case5.id, criminalId: criminal1.id, role: 'temoin' } });

  // Alerts
  const now = new Date();
  await prisma.alert.create({ data: { reference: 'ALT-2024-001', type: 'vol', priority: 'urgente', status: 'en_cours', description: 'Vol à main armée en cours au croisement des avenues Kasai et Liberation. Deux individus armés.', location: 'Ave. Kasai / Ave. Liberation, Gombe', latitude: -4.325, longitude: 15.313, citizenName: 'Tresor Mbeki', citizenPhone: '+243820000001', commissariatId: comGombe.id, assignedToId: officer2.id, createdAt: new Date(now.getTime() - 15 * 60000) } });
  await prisma.alert.create({ data: { reference: 'ALT-2024-002', type: 'agression', priority: 'haute', status: 'recue', description: 'Agression physique devant le marché de Barumbu. La victime est blessée et nécessite des soins.', location: 'Marché Barumbu', latitude: -4.331, longitude: 15.313, citizenName: 'Claudine Ngoie', citizenPhone: '+243820000002', commissariatId: comBarumbu.id, createdAt: new Date(now.getTime() - 30 * 60000) } });
  await prisma.alert.create({ data: { reference: 'ALT-2024-003', type: 'accident', priority: 'moyenne', status: 'traitee', description: 'Accident de circulation grave sur le Boulevard du 30 Juin. Un véhicule a renversé un piéton.', location: 'Boulevard 30 Juin, Kalamu', latitude: -4.328, longitude: 15.309, citizenName: 'Jacques Mutombo', citizenPhone: '+243820000003', commissariatId: comKalamu.id, assignedToId: officer4.id, responseTime: 12, createdAt: new Date(now.getTime() - 2 * 3600000) } });
  await prisma.alert.create({ data: { reference: 'ALT-2024-004', type: 'incendie', priority: 'urgente', status: 'en_cours', description: 'Incendie dans un entrepôt à Ndjili. Les flammes se propagent aux bâtiments voisins.', location: 'Zone Industrielle, Ndjili', latitude: -4.385, longitude: 15.360, citizenName: 'Emmanuel Lunda', citizenPhone: '+243820000004', commissariatId: comNdjili.id, assignedToId: officer5.id, createdAt: new Date(now.getTime() - 8 * 60000) } });
  await prisma.alert.create({ data: { reference: 'ALT-2024-005', type: 'agression', priority: 'haute', status: 'cloturee', description: 'Rixes entre groupes rivaux dans le quartier Kenya. Plusieurs blessés signalés.', location: 'Quartier Kenya, Lubumbashi', citizenName: 'Anonyme', citizenPhone: '+243820000005', commissariatId: comLubumbashi.id, assignedToId: officer6.id, responseTime: 25, createdAt: new Date(now.getTime() - 24 * 3600000) } });
  await prisma.alert.create({ data: { reference: 'ALT-2024-006', type: 'vol', priority: 'moyenne', status: 'recue', description: 'Vol de téléphone dans un taxi moto. Le voleur a pris la fuite vers le centre-ville.', location: 'Carrefour Goma', latitude: -1.658, longitude: 29.223, citizenName: 'Aimée Kabuo', citizenPhone: '+243820000006', commissariatId: comGoma.id, createdAt: new Date(now.getTime() - 45 * 60000) } });
  await prisma.alert.create({ data: { reference: 'ALT-2024-007', type: 'autre', priority: 'basse', status: 'traitee', description: 'Nuisances sonores répétées dans le quartier Kalamu. Musique forte après 22h.', location: 'Quartier Kalamu', citizenName: 'Bernard Koko', citizenPhone: '+243820000007', commissariatId: comKalamu.id, assignedToId: officer4.id, responseTime: 45, createdAt: new Date(now.getTime() - 48 * 3600000) } });
  await prisma.alert.create({ data: { reference: 'ALT-2024-008', type: 'agression', priority: 'urgente', status: 'en_cours', description: 'Femme agressée devant son domicile à la Gombe. L\'agresseur est toujours sur les lieux.', location: 'Ave. Mongala, Gombe', latitude: -4.320, longitude: 15.315, citizenName: 'Voisin anonyme', citizenPhone: '+243820000008', commissariatId: comGombe.id, assignedToId: officer1.id, createdAt: new Date(now.getTime() - 5 * 60000) } });

  // Complaints
  await prisma.complaint.create({ data: { reference: 'PLT-2024-001', type: 'vol', status: 'approuvee', description: 'Vol de mon véhicule Toyota Hilux immatriculé KIN-4521 stationné devant mon domicile.', location: 'Résidence, Gombe', plaintiffName: 'Albert Kabongo', plaintiffPhone: '+243830000001', plaintiffEmail: 'a.kabongo@email.cd', plaintiffAddr: '45 Ave. Mongala, Gombe', commissariatId: comGombe.id, reviewedById: officer1.id, reviewNotes: 'Plainte recevable. Dossier transmis à la brigade criminelle.', caseId: case1.id } });
  await prisma.complaint.create({ data: { reference: 'PLT-2024-002', type: 'agression', status: 'en_revision', description: 'J\'ai été agressé par un groupe de jeunes près du marché de Barumbu. J\'ai été blessé au bras.', location: 'Marché Barumbu', plaintiffName: 'Serge Bokanga', plaintiffPhone: '+243830000002', plaintiffAddr: '12 Rue Kasa-Vubu, Barumbu', commissariatId: comBarumbu.id } });
  await prisma.complaint.create({ data: { reference: 'PLT-2024-003', type: 'corruption', status: 'soumise', description: 'Un agent de police m\'a demandé un pot-de-vin lors d\'un contrôle routier sur le Boulevard du 30 Juin.', location: 'Boulevard 30 Juin', plaintiffName: 'Anonyme', plaintiffPhone: '+243830000003', commissariatId: comKalamu.id } });
  await prisma.complaint.create({ data: { reference: 'PLT-2024-004', type: 'harassment', status: 'approuvee', description: 'Harcèlement répété de la part de mon ancien associé qui me menace et me suit constamment.', plaintiffName: 'Francine Lukaku', plaintiffPhone: '+243830000004', plaintiffEmail: 'f.lukaku@email.cd', plaintiffAddr: '78 Ave. de la Paix, Ndjili', commissariatId: comNdjili.id, reviewedById: officer5.id, reviewNotes: 'Enquête ouverte. Mesures de protection demandées.' } });
  await prisma.complaint.create({ data: { reference: 'PLT-2024-005', type: 'vol', status: 'rejetee', description: 'Plainte pour vol de matériel de construction sur un chantier abandonné.', location: 'Chantier Ndjili', plaintiffName: 'Michel Tshilumba', plaintiffPhone: '+243830000005', commissariatId: comNdjili.id, reviewedById: officer5.id, reviewNotes: 'Preuves insuffisantes. Plainte rejetée.' } });
  await prisma.complaint.create({ data: { reference: 'PLT-2024-006', type: 'autre', status: 'traitee', description: 'Différend foncier avec mon voisin qui a construit sur ma parcelle.', location: 'Quartier Kenya, Lubumbashi', plaintiffName: 'Joseph Kyungu', plaintiffPhone: '+243830000006', plaintiffAddr: '23 Rue Katanga, Kenya', commissariatId: comLubumbashi.id, reviewedById: officer6.id, reviewNotes: 'Médiation réussie. Accord signé entre les parties.' } });

  // External Services
  const svcJustice = await prisma.externalService.create({ data: { name: 'Ministère de la Justice', type: 'justice', endpoint: 'https://api.justice.gouv.cd/v1', apiKey: 'jkey-xxxx-xxxx', status: 'actif', lastSyncAt: new Date(now.getTime() - 3600000), description: 'Synchronisation des dossiers judiciaires et mandats d\'arrêt' } });
  const svcHopital = await prisma.externalService.create({ data: { name: 'Hôpital Général de Kinshasa', type: 'hopital', endpoint: 'https://api.hgrk.cd/v1', apiKey: 'hkey-xxxx-xxxx', status: 'actif', lastSyncAt: new Date(now.getTime() - 7200000), description: 'Échange de rapports médicaux et certificats pour les enquêtes' } });
  const svcMairie = await prisma.externalService.create({ data: { name: 'Mairie de Kinshasa', type: 'mairie', endpoint: 'https://api.mairie-kinshasa.cd/v1', status: 'actif', lastSyncAt: new Date(now.getTime() - 86400000), description: 'Vérification d\'identité et documents d\'état civil' } });
  const svcDouane = await prisma.externalService.create({ data: { name: 'Direction Générale des Douanes', type: 'douane', endpoint: 'https://api.douanes.cd/v1', status: 'inactif', description: 'Suivi des marchandises suspectes et contrebande' } });
  const svcImmigration = await prisma.externalService.create({ data: { name: 'Direction Générale de l\'Immigration', type: 'immigration', endpoint: 'https://api.dgi.cd/v1', apiKey: 'ikey-xxxx-xxxx', status: 'actif', lastSyncAt: new Date(now.getTime() - 43200000), description: 'Vérification des passeports et contrôle des frontières' } });
  const svcInterpol = await prisma.externalService.create({ data: { name: 'INTERPOL - Bureau Kinshasa', type: 'justice', endpoint: 'https://api.interpol.int/v1', apiKey: 'intkey-xxxx-xxxx', status: 'actif', lastSyncAt: new Date(now.getTime() - 1800000), description: 'Recherche de criminels internationaux et notices rouges' } });

  // Service Logs
  await prisma.serviceLog.create({ data: { serviceId: svcJustice.id, direction: 'envoi', messageType: 'requête', content: 'Transmission dossier DOS-2024-001 au parquet', status: 'succes' } });
  await prisma.serviceLog.create({ data: { serviceId: svcJustice.id, direction: 'reception', messageType: 'notification', content: 'Mandat d\'arrêt confirmé pour CRIM-2024-001', status: 'succes' } });
  await prisma.serviceLog.create({ data: { serviceId: svcHopital.id, direction: 'envoi', messageType: 'requête', content: 'Demande rapport médical - Victime agression Barumbu', status: 'succes' } });
  await prisma.serviceLog.create({ data: { serviceId: svcHopital.id, direction: 'reception', messageType: 'notification', content: 'Rapport médical reçu - Blessures par arme blanche', status: 'succes' } });
  await prisma.serviceLog.create({ data: { serviceId: svcMairie.id, direction: 'envoi', messageType: 'requête', content: 'Vérification identité suspect DOS-2024-004', status: 'succes' } });
  await prisma.serviceLog.create({ data: { serviceId: svcDouane.id, direction: 'envoi', messageType: 'requête', content: 'Recherche marchandises volées - Banque Commerce', status: 'echec', errorMessage: 'Service indisponible - Timeout après 30s' } });
  await prisma.serviceLog.create({ data: { serviceId: svcImmigration.id, direction: 'envoi', messageType: 'requête', content: 'Vérification mouvement frontalier suspect CRIM-2024-005', status: 'succes' } });
  await prisma.serviceLog.create({ data: { serviceId: svcImmigration.id, direction: 'reception', messageType: 'notification', content: 'Alerte: CRIM-2024-005 détecté à la frontière Rwanda', status: 'succes' } });
  await prisma.serviceLog.create({ data: { serviceId: svcInterpol.id, direction: 'envoi', messageType: 'requête', content: 'Recherche notice rouge - Mbala Alain', status: 'en_attente' } });
  await prisma.serviceLog.create({ data: { serviceId: svcInterpol.id, direction: 'reception', messageType: 'sync', content: 'Synchronisation base de données criminelle internationale', status: 'succes' } });

  console.log('Seed data created successfully!');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
