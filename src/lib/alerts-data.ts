// Données centralisées des alertes officielles et citoyennes PNC
// Utilisées par AlertesScreen, AlerteDetailScreen, DashboardScreen

export interface OfficialAlert {
  id: string
  title: string
  type: string
  severity: 'high' | 'medium' | 'low'
  time: string
  location: string
  description: string
  reference: string
  source: string
}

export interface CitizenAlert {
  id: string
  title: string
  type: string
  status: 'published' | 'review'
  time: string
  author: string
  description: string
  location: string
  reference: string
}

export const officialAlerts: OfficialAlert[] = [
  {
    id: '1',
    title: 'Avis de recherche — Cambrioleur présumé',
    type: 'Recherche',
    severity: 'high',
    time: 'Il y a 2h',
    location: 'Kinshasa, Gombe',
    description: 'Un individu est activement recherché pour braquage à main armée commis le 10 juin 2026 dans la commune de la Gombe. L\'individu serait un homme d\'environ 30 ans, de taille moyenne, portant un veston noir. Toute information est à transmettre au commissariat le plus proche ou au 117.',
    reference: 'AR-2026-GOM-0042',
    source: 'Commissariat Central de la Gombe',
  },
  {
    id: '2',
    title: 'Alerte sécurité — Quartier Matonge',
    type: 'Sécurité',
    severity: 'medium',
    time: 'Il y a 4h',
    location: 'Kinshasa, Barumbu',
    description: 'Augmentation des vols à la tire signalés dans le quartier Matonge, particulièrement autour du marché central. La PNC recommande une vigilance accrue et d\'éviter de porter des objets de valeur visibles. En cas d\'incident, composez le 117.',
    reference: 'AS-2026-BAR-0018',
    source: 'Commissariat de Matonge',
  },
  {
    id: '3',
    title: 'Disparition — Jeune fille 14 ans',
    type: 'Disparition',
    severity: 'high',
    time: 'Il y a 6h',
    location: 'Kinshasa, Selembao',
    description: 'Marie Nsimba, 14 ans, a été vue pour la dernière fois au marché de Selembao le 12 juin vers 16h. Elle porte une robe jaune et a les cheveux tressés. Toute information, contacter le 117 ou le +243820000111.',
    reference: 'DIS-2026-SEL-0007',
    source: 'Commissariat de Selembao',
  },
  {
    id: '4',
    title: 'Contrôle routier — Boulevard du 30 Juin',
    type: 'Info',
    severity: 'low',
    time: 'Il y a 1h',
    location: 'Kinshasa, Gombe',
    description: 'Opération de contrôle routier en cours sur le Boulevard du 30 Juin entre le rond-point Victoire et l\'avenue des Aviateurs. Prévoir des ralentissements. Coopération avec les forces de l\'ordre recommandée.',
    reference: 'CR-2026-GOM-0155',
    source: 'Unité de Circulation PNC',
  },
  {
    id: '5',
    title: 'Alerte météo — Risque d\'inondation',
    type: 'Météo',
    severity: 'medium',
    time: 'Il y a 30min',
    location: 'Kinshasa, zone basse',
    description: 'Fortes pluies prévues dans les prochaines 6h. Risque d\'inondation dans les zones basses de Kinshasa (Limete, Barumbu, Kalamu). Évitez les passages à gué et signalez toute situation d\'urgence au 117.',
    reference: 'MET-2026-KIN-0033',
    source: 'Météo RDC / PNC',
  },
]

export const citizenAlerts: CitizenAlert[] = [
  {
    id: '6',
    title: 'Route dégradée — Avenue Kasa-Vubu',
    type: 'Citoyen',
    status: 'published',
    time: 'Il y a 3h',
    author: 'J. Mukendi',
    description: 'Nids de poule dangereux sur l\'Avenue Kasa-Vubu entre les numéros 45 et 60. Risque d\'accident pour les deux-roues. Plusieurs incidents signalés.',
    location: 'Kinshasa, Barumbu',
    reference: 'ACZ-2026-0234',
  },
  {
    id: '7',
    title: 'Éclairage public défaillant',
    type: 'Citoyen',
    status: 'review',
    time: 'Il y a 8h',
    author: 'M. Kabongo',
    description: 'Éclairage public hors service sur le tronçon rue Kintambo — avenue de la Paix depuis 3 jours. Insécurité nocturne signalée par les résidents.',
    location: 'Kinshasa, Kintambo',
    reference: 'ACZ-2026-0198',
  },
]

export const allAlerts = [...officialAlerts, ...citizenAlerts]

export function getAlertById(id: string): OfficialAlert | CitizenAlert | undefined {
  return allAlerts.find(a => a.id === id)
}

export function isOfficialAlert(alert: OfficialAlert | CitizenAlert): alert is OfficialAlert {
  return 'severity' in alert
}
