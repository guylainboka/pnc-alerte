'use client'

import { useAppStore } from '@/lib/store'
import {
  ChevronLeft, Car, Shield, Home, Heart, Flame, Droplets,
  Cloud, Baby, Stethoscope, ShoppingBag, Zap, Users, Smartphone,
  Biohazard, Search
} from 'lucide-react'
import { useState } from 'react'

export interface ConseilCategory {
  id: string
  icon: typeof Car
  label: string
  color: string
  bg: string
  articles: ConseilArticle[]
}

export interface ConseilArticle {
  id: string
  title: string
  readTime: string
  sections: { title: string; items: string[] }[]
}

export const conseilCategories: ConseilCategory[] = [
  {
    id: 'securite-routiere',
    icon: Car,
    label: 'Sécurité routière',
    color: '#1E5EFF',
    bg: '#EBF0FF',
    articles: [
      {
        id: 'sr-1',
        title: 'Conseils pour la conduite nocturne',
        readTime: '4 min',
        sections: [
          {
            title: 'La conduite de nuit présente davantage de risques en raison de la faible visibilité.',
            items: [
              'Vérifiez le bon fonctionnement des phares.',
              'Réduisez votre vitesse.',
              'Gardez une distance de sécurité suffisante.',
              'Évitez l\'utilisation du téléphone au volant.',
              'Faites des pauses régulières lors des longs trajets.',
              'Restez attentif aux piétons et aux cyclistes.',
            ],
          },
        ],
      },
      {
        id: 'sr-2',
        title: 'Prévenir les accidents',
        readTime: '3 min',
        sections: [
          {
            title: 'Adoptez les bons réflexes pour éviter les accidents de la route.',
            items: [
              'Respectez le code de la route.',
              'Ne conduisez jamais sous l\'influence de l\'alcool ou de drogues.',
              'Portez toujours votre ceinture de sécurité.',
              'Utilisez un siège adapté pour les enfants.',
              'Respectez les limitations de vitesse.',
            ],
          },
        ],
      },
      {
        id: 'sr-3',
        title: 'En cas d\'accident',
        readTime: '3 min',
        sections: [
          {
            title: 'Les gestes à poser immédiatement après un accident de la route.',
            items: [
              'Sécurisez les lieux.',
              'Appelez les services d\'urgence.',
              'Portez assistance aux blessés sans les déplacer inutilement.',
              'Prenez des photos pour le constat.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cybercriminalite',
    icon: Shield,
    label: 'Cybercriminalité',
    color: '#8B5CF6',
    bg: '#F3F0FF',
    articles: [
      {
        id: 'cy-1',
        title: 'Les arnaques en ligne les plus courantes',
        readTime: '5 min',
        sections: [
          {
            title: 'Les fraudeurs utilisent Internet pour voler des informations personnelles ou de l\'argent.',
            items: [
              'Messages promettant des gains rapides.',
              'Demandes urgentes d\'argent.',
              'Liens suspects.',
              'Offres trop belles pour être vraies.',
              'Faux services clients.',
            ],
          },
          {
            title: 'Comment se protéger',
            items: [
              'Ne partagez jamais vos mots de passe.',
              'Activez l\'authentification à deux facteurs.',
              'Vérifiez les adresses des sites web.',
              'Utilisez des mots de passe complexes.',
              'Mettez régulièrement vos applications à jour.',
            ],
          },
        ],
      },
      {
        id: 'cy-2',
        title: 'Protection des réseaux sociaux',
        readTime: '4 min',
        sections: [
          {
            title: 'Protégez votre vie privée sur les réseaux sociaux.',
            items: [
              'Limitez les informations publiques.',
              'N\'acceptez pas les inconnus.',
              'Vérifiez les paramètres de confidentialité.',
              'Signalez les comptes frauduleux.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'cambriolage',
    icon: Home,
    label: 'Cambriolage',
    color: '#F59E0B',
    bg: '#FFF8EB',
    articles: [
      {
        id: 'cb-1',
        title: 'Comment sécuriser votre domicile',
        readTime: '4 min',
        sections: [
          {
            title: 'Adoptez des mesures simples pour protéger votre maison contre les intrusions.',
            items: [
              'Verrouillez toujours les portes et fenêtres.',
              'Installez un éclairage extérieur.',
              'Utilisez des serrures de qualité.',
              'Installez une alarme ou une caméra.',
              'Ne publiez pas vos absences sur les réseaux sociaux.',
            ],
          },
          {
            title: 'Pendant une absence prolongée',
            items: [
              'Demandez à un voisin de surveiller votre domicile.',
              'Faites relever votre courrier.',
              'Utilisez des minuteries pour les lumières.',
            ],
          },
          {
            title: 'En cas de cambriolage',
            items: [
              'N\'entrez pas immédiatement dans le logement.',
              'Appelez la police.',
              'Ne touchez à rien avant l\'arrivée des autorités.',
              'Dressez la liste des biens volés.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'violence-domestique',
    icon: Heart,
    label: 'Violence domestique',
    color: '#EC4899',
    bg: '#FDF2F8',
    articles: [
      {
        id: 'vd-1',
        title: 'Reconnaître les signes',
        readTime: '5 min',
        sections: [
          {
            title: 'La violence domestique peut être physique, psychologique, économique ou sexuelle.',
            items: [
              'Menaces répétées.',
              'Contrôle excessif.',
              'Humiliations.',
              'Isolement forcé.',
              'Violences physiques.',
            ],
          },
          {
            title: 'Comment obtenir de l\'aide',
            items: [
              'Contactez les services d\'urgence en cas de danger.',
              'Parlez à une personne de confiance.',
              'Contactez une association spécialisée.',
              'Conservez les preuves des violences.',
            ],
          },
          {
            title: 'Plan de sécurité',
            items: [
              'Préparez un contact d\'urgence.',
              'Gardez vos documents importants accessibles.',
              'Identifiez un lieu sûr où vous réfugier.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'incendie',
    icon: Flame,
    label: 'Incendie',
    color: '#FF3B30',
    bg: '#FFF0EF',
    articles: [
      {
        id: 'in-1',
        title: 'Prévenir les incendies domestiques',
        readTime: '4 min',
        sections: [
          {
            title: 'Les incendies domestiques sont souvent dus à la négligence. Voici les précautions essentielles.',
            items: [
              'Ne laissez jamais de cuisinière allumée sans surveillance.',
              'Vérifiez régulièrement les installations électriques.',
              'Ne surchargez pas les prises électriques.',
              'Gardez les allumettes et briquets hors de portée des enfants.',
              'Installez des détecteurs de fumée dans chaque pièce.',
            ],
          },
        ],
      },
      {
        id: 'in-2',
        title: 'Utilisation sécurisée du gaz',
        readTime: '3 min',
        sections: [
          {
            title: 'Le gaz domestique peut être dangereux s\'il est mal utilisé.',
            items: [
              'Vérifiez régulièrement les tuyaux et raccords.',
              'Ne stockez pas de bouteilles de gaz à l\'intérieur.',
              'En cas de fuite, n\'allumez aucun appareil électrique.',
              'Aérez immédiatement la pièce.',
            ],
          },
        ],
      },
      {
        id: 'in-3',
        title: 'Que faire en cas d\'incendie ?',
        readTime: '3 min',
        sections: [
          {
            title: 'Les gestes qui sauvent en cas d\'incendie.',
            items: [
              'Alertez immédiatement les occupants et les pompiers (119).',
              'Évacuez le bâtiment par les issues de secours.',
              'Ne prenez pas l\'ascenseur.',
              'Restez bas — la fumée monte.',
              'Fermez les portes derrière vous pour ralentir la propagation.',
            ],
          },
        ],
      },
      {
        id: 'in-4',
        title: 'Utilisation d\'un extincteur',
        readTime: '2 min',
        sections: [
          {
            title: 'Savoir utiliser un extincteur peut sauver des vies.',
            items: [
              'Tirez la goupille de sécurité.',
              'Dirigez la lance vers la base des flammes.',
              'Appuyez sur la poignée.',
              'Balayez de gauche à droite.',
              'N\'essayez d\'éteindre que les petits feux naissants.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'inondations',
    icon: Droplets,
    label: 'Inondations',
    color: '#06B6D4',
    bg: '#ECFEFF',
    articles: [
      {
        id: 'io-1',
        title: 'Préparation avant une inondation',
        readTime: '4 min',
        sections: [
          {
            title: 'Anticipez les risques d\'inondation pour protéger votre famille et vos biens.',
            items: [
              'Identifiez les zones inondables autour de chez vous.',
              'Préparez un kit d\'urgence (eau, nourriture, lampe, médicaments).',
              'Stockez les objets de valeur en hauteur.',
              'Connaître les itinéraires d\'évacuation.',
              'Gardez les documents importants dans des sacs étanches.',
            ],
          },
        ],
      },
      {
        id: 'io-2',
        title: 'Pendant une inondation',
        readTime: '3 min',
        sections: [
          {
            title: 'Mesures de sécurité pendant une inondation.',
            items: [
              'Montez aux étages supérieurs ou sur le toit.',
              'Ne traversez jamais une zone inondée à pied ou en voiture.',
              'Écoutez la radio pour les informations officielles.',
              'Coupez l\'électricité et le gaz si possible.',
              'Ne buvez pas l\'eau du robinet sans confirmation.',
            ],
          },
        ],
      },
      {
        id: 'io-3',
        title: 'Après une inondation',
        readTime: '3 min',
        sections: [
          {
            title: 'Retour au domicile après une inondation — précautions essentielles.',
            items: [
              'Attendez l\'autorisation des autorités pour rentrer.',
              'Aérez les pièces avant de séjourner.',
              'Désinfectez les surfaces touchées par l\'eau.',
              'Faites vérifier les installations électriques.',
              'Photographiez les dégâts pour l\'assurance.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'catastrophes-naturelles',
    icon: Cloud,
    label: 'Catastrophes naturelles',
    color: '#6366F1',
    bg: '#EEF2FF',
    articles: [
      {
        id: 'cn-1',
        title: 'Orages et foudre',
        readTime: '3 min',
        sections: [
          {
            title: 'Protégez-vous pendant les orages violents.',
            items: [
              'Restez à l\'intérieur autant que possible.',
              'Éloignez-vous des arbres et poteaux métalliques.',
              'N\'utilisez pas le téléphone fixe.',
              'Débranchez les appareils électriques.',
              'En plein air, accroupissez-vous, pieds joints.',
            ],
          },
        ],
      },
      {
        id: 'cn-2',
        title: 'Tremblements de terre',
        readTime: '4 min',
        sections: [
          {
            title: 'Les gestes de survie en cas de tremblement de terre.',
            items: [
              'Abritez-vous sous une table ou un cadre de porte solide.',
              'Éloignez-vous des fenêtres et murs extérieurs.',
              'Si vous êtes dehors, éloignez-vous des bâtiments.',
              'Après la secousse, évacuez calmement le bâtiment.',
              'Vérifiez les fuites de gaz et les fils électriques.',
            ],
          },
        ],
      },
      {
        id: 'cn-3',
        title: 'Glissements de terrain',
        readTime: '3 min',
        sections: [
          {
            title: 'Reconnaître les signes avant-coureurs d\'un glissement de terrain.',
            items: [
              'Fissures dans le sol ou les murs.',
              'Inclinaison soudaine des arbres ou poteaux.',
              'Écoulement anormal d\'eau.',
              'Sons de craquement dans le sol.',
              'Évacuez immédiatement si vous observez ces signes.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'protection-enfants',
    icon: Baby,
    label: 'Protection des enfants',
    color: '#F97316',
    bg: '#FFF7ED',
    articles: [
      {
        id: 'pe-1',
        title: 'Sécurité des enfants à la maison',
        readTime: '4 min',
        sections: [
          {
            title: 'Protégez vos enfants des dangers domestiques.',
            items: [
              'Installez des barrières de sécurité en haut des escaliers.',
              'Cachez les prises électriques.',
              'Rangez les produits toxiques en hauteur.',
              'Ne laissez jamais un enfant seul dans le bain.',
              'Fixez les meubles lourds aux murs.',
            ],
          },
        ],
      },
      {
        id: 'pe-2',
        title: 'Prévention des enlèvements',
        readTime: '3 min',
        sections: [
          {
            title: 'Apprenez à vos enfants les règles de sécurité.',
            items: [
              'Ne parlez pas aux inconnus.',
              'N\'acceptez jamais de cadeau d\'un inconnu.',
              'Apprenez votre numéro de téléphone par cœur.',
              'Dites toujours à un adulte où vous allez.',
              'Criez et courez si quelqu\'un vous attrape.',
            ],
          },
        ],
      },
      {
        id: 'pe-3',
        title: 'Protection sur Internet',
        readTime: '4 min',
        sections: [
          {
            title: 'Surveillez et protégez l\'activité en ligne de vos enfants.',
            items: [
              'Utilisez le contrôle parental.',
              'Discutez régulièrement avec eux de leurs activités en ligne.',
              'Interdisez les rencontres avec des personnes rencontrées en ligne.',
              'Apprenez-leur à ne pas partager de photos personnelles.',
              'Signalez tout contenu inapproprié.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'sante-premiers-secours',
    icon: Stethoscope,
    label: 'Santé & Premiers secours',
    color: '#0B9D5A',
    bg: '#EDFFF5',
    articles: [
      {
        id: 'ss-1',
        title: 'Premiers gestes de secours',
        readTime: '5 min',
        sections: [
          {
            title: 'Les gestes de premiers secours qui sauvent des vies.',
            items: [
              'Vérifiez la conscience de la victime.',
              'Appelez les secours (118 SAMU).',
              'Pratiquez le massage cardiaque si nécessaire.',
              'Mettez la victime en position latérale de sécurité si elle respire.',
              'Ne donnez jamais à boire à une personne inconsciente.',
            ],
          },
        ],
      },
      {
        id: 'ss-2',
        title: 'Traitement des brûlures',
        readTime: '3 min',
        sections: [
          {
            title: 'Réagir correctement face à une brûlure.',
            items: [
              'Refroidissez la brûlure sous l\'eau tiède pendant 10 minutes.',
              'Ne percez jamais les cloques.',
              'Ne mettez pas de glace directement sur la peau.',
              'Couvrez avec un pansement stérile.',
              'Consultez un médecin si la brûlure est étendue ou profonde.',
            ],
          },
        ],
      },
      {
        id: 'ss-3',
        title: 'Gestion des saignements',
        readTime: '3 min',
        sections: [
          {
            title: 'Comment arrêter un saignement abondant.',
            items: [
              'Appuyez fermement sur la plaie avec un tissu propre.',
              'Maintenez la pression pendant au moins 10 minutes.',
              'Surélevez le membre blessé si possible.',
              'Ne retirez pas les objets enfoncés dans la plaie.',
              'Appelez les secours si le saignement ne s\'arrête pas.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'escroqueries-fraudes',
    icon: ShoppingBag,
    label: 'Escroqueries & Fraudes',
    color: '#D946EF',
    bg: '#FDF4FF',
    articles: [
      {
        id: 'ef-1',
        title: 'Faux agents administratifs',
        readTime: '4 min',
        sections: [
          {
            title: 'Comment reconnaître un faux agent administratif.',
            items: [
              'Exigez toujours une pièce d\'identité officielle.',
              'Un vrai agent ne vous demandera jamais d\'argent sur place.',
              'Vérifiez en appelant le service concerné.',
              'Signalez toute tentative d\'escroquerie.',
              'Ne signez jamais un document sans le lire intégralement.',
            ],
          },
        ],
      },
      {
        id: 'ef-2',
        title: 'Arnaques bancaires',
        readTime: '4 min',
        sections: [
          {
            title: 'Protégez vos comptes bancaires contre les arnaques.',
            items: [
              'Ne communiquez jamais votre code PIN.',
              'Vérifiez vos relevés bancaires régulièrement.',
              'Signalez immédiatement toute opération suspecte.',
              'N\'utilisez que des distributeurs situés dans des lieux sûrs.',
              'Méfiez-vous des appels prétendant venir de votre banque.',
            ],
          },
        ],
      },
      {
        id: 'ef-3',
        title: 'Fraudes mobiles et SMS',
        readTime: '3 min',
        sections: [
          {
            title: 'Les fraudes par SMS et applications mobiles sont en augmentation.',
            items: [
              'Ne cliquez pas sur les liens reçus par SMS d\'expéditeurs inconnus.',
              'Vérifiez l\'identité de l\'expéditeur avant de répondre.',
              'Ne transférez jamais d\'argent à un inconnu.',
              'Bloquez et signalez les numéros suspects.',
              'Activez les alertes de transaction sur votre compte mobile.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'securite-electrique',
    icon: Zap,
    label: 'Sécurité électrique',
    color: '#EAB308',
    bg: '#FEFCE8',
    articles: [
      {
        id: 'se-1',
        title: 'Prévenir les électrocutions',
        readTime: '3 min',
        sections: [
          {
            title: 'L\'électricité est dangereuse — adoptez les bonnes pratiques.',
            items: [
              'Ne touchez jamais un appareil électrique les mains mouillées.',
              'Ne surchargez pas les prises avec des multiprises.',
              'Faites vérifier vos installations par un électricien qualifié.',
              'Utilisez des prises avec mise à la terre.',
              'Coupez le courant avant toute intervention.',
            ],
          },
        ],
      },
      {
        id: 'se-2',
        title: 'Risques des installations défectueuses',
        readTime: '3 min',
        sections: [
          {
            title: 'Les installations vétustes sont une cause majeure d\'incendies et d\'électrocutions.',
            items: [
              'Remplacez les fils dénudés ou endommagés.',
              'Ne branchez jamais un appareil sur une prise qui fume ou grésille.',
              'Faites installer un disjoncteur différentiel.',
              'Vérifiez les câbles des appareils avant chaque utilisation.',
              'Éloignez les câbles des sources de chaleur et de l\'eau.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'disparition-personnes',
    icon: Users,
    label: 'Disparition de personnes',
    color: '#F97316',
    bg: '#FFF7ED',
    articles: [
      {
        id: 'dp-1',
        title: 'Que faire lorsqu\'un enfant disparaît ?',
        readTime: '4 min',
        sections: [
          {
            title: 'La disparition d\'un enfant est une urgence absolue — réagissez immédiatement.',
            items: [
              'Alertez immédiatement la police (117).',
              'Fournissez une photo récente de l\'enfant.',
              'Décrivez les vêtements portés au moment de la disparition.',
              'Recherchez dans les environs immédiats.',
              'Prévenez l\'école et les voisins.',
              'Partagez l\'alerte sur les réseaux sociaux.',
            ],
          },
        ],
      },
      {
        id: 'dp-2',
        title: 'Signalement rapide aux autorités',
        readTime: '3 min',
        sections: [
          {
            title: 'Un signalement rapide augmente les chances de retrouver la personne.',
            items: [
              'Il n\'y a pas de délai d\'attente pour signaler une disparition.',
              'Rendez-vous au commissariat le plus proche.',
              'Apportez tous les documents d\'identité disponibles.',
              'Fournissez les coordonnées des proches à contacter.',
              'Restez joignable en permanence.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'criminalite-urbaine',
    icon: Shield,
    label: 'Criminalité urbaine',
    color: '#DC2626',
    bg: '#FEF2F2',
    articles: [
      {
        id: 'cu-1',
        title: 'Prévention des agressions',
        readTime: '4 min',
        sections: [
          {
            title: 'Adoptez les bons réflexes pour éviter les agressions en ville.',
            items: [
              'Évitez de marcher seul la nuit dans les zones isolées.',
              'Restez vigilant dans les lieux bondés (marchés, gares).',
              'Ne montez pas vos objets de valeur en public.',
              'Prévoyez un moyen de communication chargé.',
              'Connaissancez les numéros d\'urgence par cœur.',
            ],
          },
        ],
      },
      {
        id: 'cu-2',
        title: 'Sécurité dans les lieux publics',
        readTime: '3 min',
        sections: [
          {
            title: 'Protégez-vous dans les espaces publics.',
            items: [
              'Gardez votre sac fermé et près du corps.',
              'Ne laissez pas vos affaires sans surveillance.',
              'Privilégiez les zones bien éclairées.',
              'En cas d\'agression, ne résistez pas — votre vie vaut plus que vos biens.',
              'Signalez immédiatement tout incident à la police.',
            ],
          },
        ],
      },
      {
        id: 'cu-3',
        title: 'Vol de véhicule',
        readTime: '3 min',
        sections: [
          {
            title: 'Protégez votre véhicule contre le vol.',
            items: [
              'Verrouillez toujours les portes et fermez les fenêtres.',
              'Ne laissez pas d\'objets de valeur visibles dans l\'habitacle.',
              'Garez-vous dans des endroits sécurisés et éclairés.',
              'Utilisez un antivol (cadenas volant, alarme).',
              'Notez le numéro de châssis et la plaque d\'immatriculation.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'securite-numerique',
    icon: Smartphone,
    label: 'Sécurité numérique avancée',
    color: '#3B82F6',
    bg: '#EFF6FF',
    articles: [
      {
        id: 'sn-1',
        title: 'Protection des données personnelles',
        readTime: '4 min',
        sections: [
          {
            title: 'Vos données personnelles sont précieuses — protégez-les.',
            items: [
              'Lisez les conditions d\'utilisation avant de vous inscrire.',
              'Limitez les informations partagées en ligne.',
              'Utilisez un VPN sur les réseaux Wi-Fi publics.',
              'Supprimez vos comptes inutilisés.',
              'Demandez la suppression de vos données auprès des entreprises.',
            ],
          },
        ],
      },
      {
        id: 'sn-2',
        title: 'Sécurité des paiements mobiles',
        readTime: '4 min',
        sections: [
          {
            title: 'Payer par téléphone est pratique mais comporte des risques.',
            items: [
              'Utilisez uniquement des applications officielles.',
              'Activez les notifications de transaction.',
              'Ne partagez jamais votre code de vérification.',
              'Vérifiez le montant avant de confirmer.',
              'Signalez immédiatement toute transaction non autorisée.',
            ],
          },
        ],
      },
      {
        id: 'sn-3',
        title: 'Reconnaître le phishing',
        readTime: '3 min',
        sections: [
          {
            title: 'Le phishing (hameçonnage) est la technique de fraude la plus répandue.',
            items: [
              'Vérifiez l\'adresse email de l\'expéditeur.',
              'Méfiez-vous des messages urgents demandant des informations.',
              'Ne cliquez pas sur les liens suspects — passez par le site officiel.',
              'Vérifiez le certificat HTTPS du site (cadenas vert).',
              'Signalez les tentatives de phishing à la plateforme.',
            ],
          },
        ],
      },
    ],
  },
  {
    id: 'risques-sanitaires',
    icon: Biohazard,
    label: 'Risques sanitaires',
    color: '#84CC16',
    bg: '#F7FEE7',
    articles: [
      {
        id: 'rs-1',
        title: 'Prévention des épidémies',
        readTime: '4 min',
        sections: [
          {
            title: 'Adoptez les mesures d\'hygiène pour prévenir la propagation des maladies.',
            items: [
              'Lavez-vous les mains régulièrement avec du savon.',
              'Portez un masque en cas de symptômes respiratoires.',
              'Faites-vous vacciner selon les recommandations officielles.',
              'Évitez les contacts rapprochés avec les personnes malades.',
              'Signalez les symptômes inhabituels aux autorités sanitaires.',
            ],
          },
        ],
      },
      {
        id: 'rs-2',
        title: 'Hygiène et santé publique',
        readTime: '3 min',
        sections: [
          {
            title: 'Les gestes essentiels d\'hygiène pour la communauté.',
            items: [
              'Utilisez de l\'eau potable ou traitée.',
              'Conservez les aliments dans des conditions hygiéniques.',
              'Éliminez correctement les déchets.',
              'Maintenez votre environnement propre.',
              'Participez aux campagnes de santé publique.',
            ],
          },
        ],
      },
      {
        id: 'rs-3',
        title: 'Gestion des intoxications alimentaires',
        readTime: '3 min',
        sections: [
          {
            title: 'Réagissez rapidement en cas d\'intoxication alimentaire.',
            items: [
              'Hydratez-vous abondamment.',
              'Ne vous faites pas vomir sans avis médical.',
              'Consultez un médecin si les symptômes persistent.',
              'Conservez les restes de l\'aliment suspect pour analyse.',
              'Signalez les cas groupés aux autorités sanitaires.',
            ],
          },
        ],
      },
    ],
  },
]

export default function ConseilsScreen() {
  const { navigate, darkMode } = useAppStore()
  const [searchQuery, setSearchQuery] = useState('')

  const bg = darkMode ? 'bg-[#0a1a3a]' : 'bg-[#F5F6FA]'
  const cardBg = darkMode ? 'bg-[#0f2555]' : 'bg-white'
  const textPrimary = darkMode ? 'text-white' : 'text-[#0B2D6B]'
  const textMuted = darkMode ? 'text-gray-400' : 'text-gray-500'

  const filteredCategories = searchQuery
    ? conseilCategories.filter(
        (cat) =>
          cat.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
          cat.articles.some((a) => a.title.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : conseilCategories

  const allArticles = conseilCategories.flatMap((cat) =>
    cat.articles.map((a) => ({ ...a, categoryLabel: cat.label, categoryColor: cat.color, categoryBg: cat.bg }))
  )

  const filteredArticles = searchQuery
    ? allArticles.filter(
        (a) =>
          a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allArticles.slice(0, 8)

  return (
    <div className={`min-h-screen ${bg} pb-20 transition-colors`}>
      {/* Header */}
      <div className="bg-[#0B2D6B] pt-12 pb-6 px-6">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate('dashboard')} className="text-white">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-white text-lg font-bold">Conseils de prévention</h1>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <input
            type="text"
            placeholder="Rechercher un conseil..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white/10 rounded-xl text-sm text-white placeholder-white/50 outline-none focus:bg-white/20"
          />
        </div>
      </div>

      <div className="px-6 pt-4 space-y-5">
        {/* Emergency numbers banner */}
        <button
          onClick={() => navigate('urgence-numeros')}
          className={`w-full ${cardBg} rounded-xl p-4 shadow-sm flex items-center gap-3 active:scale-[0.98] transition-transform`}
        >
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#FF3B30]/10">
            <Flame className="w-5 h-5 text-[#FF3B30]" />
          </div>
          <div className="flex-1 text-left">
            <p className={`text-sm font-semibold ${textPrimary}`}>Numéros d&apos;urgence</p>
            <p className={`text-[10px] ${textMuted}`}>Police, SAMU, Pompiers — Accès rapide</p>
          </div>
        </button>

        {/* Categories */}
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} mb-3`}>Catégories</h3>
          <div className="grid grid-cols-2 gap-3">
            {filteredCategories.map(({ icon: Icon, label, color, bg: catBg, articles }) => (
              <button
                key={label}
                onClick={() => {
                  const cat = conseilCategories.find((c) => c.label === label)
                  if (cat && cat.articles.length > 0) {
                    navigate('conseils')
                    // Navigate to the first article of this category
                    setTimeout(() => {
                      const { setSelectedConseilId } = useAppStore.getState()
                      setSelectedConseilId(cat.articles[0].id)
                      navigate('conseil-detail')
                    }, 50)
                  }
                }}
                className={`${cardBg} rounded-xl p-4 shadow-sm text-left active:scale-[0.98] transition-transform`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ backgroundColor: catBg }}
                >
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <p className={`text-xs font-semibold ${textPrimary}`}>{label}</p>
                <p className={`text-[10px] ${textMuted}`}>{articles.length} articles</p>
              </button>
            ))}
          </div>
        </div>

        {/* Articles */}
        <div>
          <h3 className={`text-sm font-bold ${textPrimary} mb-3`}>
            {searchQuery ? 'Résultats de recherche' : 'Articles récents'}
          </h3>
          <div className="space-y-3">
            {filteredArticles.map((article) => (
              <button
                key={article.id}
                onClick={() => {
                  const { setSelectedConseilId } = useAppStore.getState()
                  setSelectedConseilId(article.id)
                  navigate('conseil-detail')
                }}
                className={`w-full ${cardBg} rounded-xl p-4 shadow-sm text-left active:scale-[0.99] transition-transform`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{
                      backgroundColor: `${article.categoryColor}15`,
                      color: article.categoryColor,
                    }}
                  >
                    {article.categoryLabel}
                  </span>
                  <span className={`text-[10px] ${textMuted}`}>{article.readTime}</span>
                </div>
                <h4 className={`text-sm font-semibold ${textPrimary}`}>{article.title}</h4>
                {article.sections[0] && (
                  <p className={`text-xs ${textMuted} mt-1 line-clamp-2`}>
                    {article.sections[0].title}
                  </p>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
