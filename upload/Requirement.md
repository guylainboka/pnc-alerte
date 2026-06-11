# Document d'Exigences

## 1. Aperçu de l'Application

**Nom de l'Application** : PNC Alerte

**Description** : Application mobile officielle de la Police Nationale Congolaise permettant aux citoyens de signaler des incidents, recevoir des alertes de sécurité, communiquer avec la police, consulter les avis de recherche et accéder aux services numériques de la PNC.

**Plateformes** : Android et iOS

**Identité Visuelle** :
- Bleu Marine : #0B2D6B
- Bleu Royal : #1E5EFF
- Rouge Urgence : #FF3B30
- Blanc : #FFFFFF
- Gris Clair : #F5F6FA
- Style UI moderne avec coins arrondis 20px, ombres légères, animations fluides
- Support du mode clair et mode sombre

## 2. Utilisateurs et Scénarios d'Usage

**Utilisateurs Cibles** :
- Citoyens congolais résidents
- Visiteurs et expatriés
- Personnel de la PNC

**Scénarios Principaux** :
- Signaler une urgence ou un incident en temps réel
- Recevoir des alertes de sécurité officielles
- Déposer une plainte en ligne
- Vérifier l'authenticité de documents ou véhicules
- Localiser le commissariat le plus proche
- Consulter les avis de recherche
- Communiquer avec la police via appel vidéo ou chat
- Consulter statistiques de sécurité personnalisées
- Partager sa localisation avec contacts d'urgence

## 3. Structure des Pages et Fonctionnalités

### 3.1 Arborescence des Pages

```
PNC Alerte
├── Authentification
│   ├── Splash Screen
│   ├── Onboarding
│   ├── Connexion
│   ├── Création de Compte
│   └── Réinitialisation Mot de Passe
├── Tableau de Bord
├── SOS Urgence
├── Signalement d'Incident
├── Signalement Anonyme
├── Alertes Officielles
├── Cartographie Sécuritaire
├── Localisation des Commissariats
├── Dépôt de Plainte en Ligne
├── Vérification d'Identité
├── Vérification Véhicule
├── Personnes Disparues
├── Convocations
├── Conseils de Prévention
├── Assistant IA PNC
├── Coffre-Fort Numérique
├── Paiement des Amendes
├── Appel Vidéo avec Agent
├── Chat en Direct
├── Système de Récompenses
├── Statistiques de Sécurité
├── Partage de Localisation
├── Notifications
└── Profil Utilisateur
    ├── Paramètres de Traduction
    ├── Contacts d'Urgence
    └── Mes Récompenses
```

### 3.2 Module Authentification

#### 3.2.1 Splash Screen
- Afficher le logo PNC Alerte au lancement
- Transition automatique vers Onboarding ou Tableau de Bord

#### 3.2.2 Onboarding
- Présenter les fonctionnalités principales de l'application
- Permettre de passer ou terminer l'onboarding

#### 3.2.3 Connexion
- Saisir numéro de téléphone ou email
- Saisir mot de passe
- Option de connexion biométrique (empreinte digitale ou reconnaissance faciale)
- Lien vers réinitialisation mot de passe
- Lien vers création de compte

#### 3.2.4 Création de Compte
- Saisir nom complet
- Saisir numéro de téléphone
- Saisir email
- Sélectionner province
- Sélectionner commune
- Créer mot de passe
- Confirmer mot de passe
- Accepter les conditions d'utilisation
- Valider la création

#### 3.2.5 Réinitialisation Mot de Passe
- Saisir email ou numéro de téléphone
- Recevoir code de vérification
- Saisir code de vérification
- Créer nouveau mot de passe
- Confirmer nouveau mot de passe

### 3.3 Tableau de Bord

- Afficher bouton SOS Urgence en position centrale
- Afficher les alertes récentes
- Afficher statistiques de sécurité de la zone
- Afficher graphiques des incidents par quartier
- Afficher tendances de sécurité
- Afficher points de récompense de l'utilisateur
- Fournir accès rapide aux fonctions :
  - Signaler un incident
  - Mes alertes
  - Conseils de sécurité
  - Poste de police proche
  - Assistance IA
  - Déposer une plainte
  - Appel vidéo avec agent
  - Chat en direct
  - Statistiques détaillées

### 3.4 SOS Urgence

- Activer le bouton SOS depuis le tableau de bord
- Capturer automatiquement la position GPS
- Enregistrer l'heure de l'urgence
- Récupérer l'identité de l'utilisateur
- Envoyer notification au centre opérationnel de la PNC
- Proposer actions rapides :
  - Appeler la Police
  - Appeler le SAMU
  - Appeler les Pompiers
  - Lancer appel vidéo avec agent
  - Partager localisation avec contacts d'urgence

### 3.5 Signalement d'Incident

- Sélectionner catégorie d'incident :
  - Vol
  - Braquage
  - Accident
  - Violence
  - Corruption
  - Trouble public
  - Personne suspecte
  - Autre
- Saisir description de l'incident
- Utiliser reconnaissance vocale pour dicter description
- Capturer position GPS automatiquement
- Enregistrer date et heure
- Joindre photos, vidéos ou enregistrements audio
- Soumettre le signalement
- Partager signalement sur réseaux sociaux (Facebook, Twitter/X, WhatsApp)

### 3.6 Signalement Anonyme

- Accéder au formulaire de signalement
- Masquer automatiquement le nom de l'utilisateur
- Masquer le numéro de téléphone
- Masquer la localisation précise (afficher uniquement la commune)
- Soumettre le signalement anonyme

### 3.7 Alertes Officielles et Contributions Citoyennes

#### 3.7.1 Flux Descendant — Alertes PNC vers Citoyens

**Catégories d'alertes** :
- Alertes Sécuritaires Urgent
- Avis de Recherche (criminels en fuite, suspects)
- Personnes Disparues
- Catastrophes Naturelles et Incidents Majeurs

**Fonctionnalités** :
- Afficher liste des alertes par catégorie
- Filtrer par province
- Filtrer par ville
- Filtrer par commune
- Abonner à plusieurs zones (résidence et travail)
- Consulter détails d'une alerte
- Traduire alerte dans langue sélectionnée (Lingala, Swahili, Tshiluba, Kikongo)
- Partager alerte sur réseaux sociaux
- Bouton Signalement d'Observation sur chaque fiche :
  - Saisir message
  - Joindre photo
  - Capturer position GPS
  - Soumettre observation

**Notifications** :
- Alertes Sécuritaires Urgent : notifications push prioritaires ignorant mode Ne pas déranger
- Autres alertes : notifications push standard

#### 3.7.2 Flux Ascendant — Contributions Citoyennes

**Types de contributions** :
- Disparition d'un proche
- Avis de recherche objet ou véhicule volé
- Avis de recherche témoins

**Formulaire Disparition d'un Proche** :
- Saisir nom complet
- Saisir prénom
- Saisir âge
- Sélectionner genre
- Joindre photo haute résolution (obligatoire)
- Saisir description physique
- Saisir date dernière fois vue (calendrier)
- Saisir lieu dernière fois vue (géolocalisation carte + saisie manuelle)
- Saisir numéro de plainte lié (obligatoire)
- Soumettre contribution

**Formulaire Véhicule Volé** :
- Saisir marque
- Saisir modèle
- Saisir couleur
- Saisir numéro de plaque
- Saisir numéro de châssis
- Joindre photos du véhicule
- Saisir numéro de plainte lié (obligatoire)
- Soumettre contribution

**Formulaire Recherche Témoins** :
- Saisir description de l'incident
- Saisir date de l'incident
- Saisir lieu de l'incident
- Joindre photos ou documents
- Saisir numéro de plainte lié (obligatoire)
- Soumettre contribution

**Modération et Publication** :
- Statut initial : En révision
- Vérification par OPJ
- Statuts possibles :
  - Validée et Publiée
  - Rejetée
- Notification à l'auteur du statut
- Publication dans l'onglet Solidarité Citoyenne

**Interface Utilisateur** :
- Deux onglets :
  - Flux Officiel PNC
  - Solidarité Citoyenne
- Bouton FAB Proposer une Alerte dans l'onglet Solidarité Citoyenne
- Code couleur des bordures :
  - Rouge : danger critique
  - Jaune : avis de recherche
  - Bleu : information
  - Vert : résolu
- Badge RETROUVÉ(E) ou INTERPELLÉ visible sur alertes résolues

### 3.8 Cartographie Sécuritaire

- Afficher carte interactive
- Visualiser emplacements des commissariats
- Visualiser incidents signalés
- Visualiser accidents
- Visualiser zones rouges (zones à risque)
- Visualiser patrouilles actives
- Zoomer et naviguer sur la carte

### 3.9 Localisation des Commissariats

- Rechercher commissariat par nom ou localisation
- Afficher liste des commissariats proches
- Obtenir itinéraire GPS vers un commissariat
- Appeler directement un commissariat
- Consulter horaires d'ouverture
- Consulter notes et commentaires des citoyens
- Noter commissariat (1-5 étoiles)
- Rédiger commentaire sur expérience

### 3.10 Dépôt de Plainte en Ligne

#### 3.10.1 Workflow en 5 Étapes

**Étape 1 : Choix du Type de Plainte**
- Sélectionner type parmi :
  - Vol simple
  - Escroquerie ou Abus de confiance
  - Vandalisme
  - Menaces, Harcèlement ou Cybercriminalité
  - Violence ou Agression
  - Perte de documents officiels
- Si Violence ou Agression en cours : redirection automatique vers SOS Urgence

**Étape 2 : Formulaire Dynamique des Faits**
- Saisir date des faits (calendrier)
- Saisir heure des faits (horloge)
- Option date/heure approximative
- Saisir lieu des faits :
  - Géolocalisation via carte interactive
  - Saisie manuelle : Province, Commune, Quartier, Avenue
- Saisir description des faits (zone texte, minimum 50 caractères)

**Étape 3 : Identification du Suspect**
- Sélectionner statut du suspect :
  - Inconnu (plainte contre X)
  - Identifié
- Si Identifié :
  - Saisir nom du suspect
  - Saisir description physique
  - Saisir coordonnées ou réseaux sociaux

**Étape 4 : Pièces Justificatives**
- Joindre jusqu'à 5 fichiers (50 MB total) :
  - Photos
  - Documents PDF
  - Vidéos
  - Audios

**Étape 5 : Révision et Engagement sur l'Honneur**
- Afficher page récapitulative de la plainte
- Cocher case obligatoire d'engagement sur l'honneur
- Afficher mention légale sur fausse déclaration
- Soumettre la plainte

#### 3.10.2 Traitement de la Plainte

**Génération du Numéro de Dossier** :
- Numéro unique généré à la soumission (format : PNCP-2026-X98B2)
- Envoi du numéro par notification push

**Statuts de la Plainte** :
- En attente
- En cours d'examen
- Validée ou Transmise
- Action requise
- Rejetée

**Récépissé Officiel** :
- Génération d'un récépissé PDF une fois plainte validée
- Contenu du récépissé :
  - Sceau RDC
  - Logo PNC
  - QR Code d'authenticité
  - Numéro de dossier
  - Détails de la plainte
- Téléchargement du récépissé depuis l'application

**Modification de la Plainte** :
- Modification possible uniquement au statut En attente
- Accès au formulaire de modification
- Soumission de la version modifiée

**Routage Automatique** :
- Plainte routée vers le commissariat de la commune des faits
- Pas de routage vers commissariat de résidence

**Déclarations de Perte** :
- Validation automatique en 10 minutes
- Pas de nécessité d'intervention OPJ

#### 3.10.3 Interface Utilisateur

**Stepper Visuel** :
- Afficher progression : Type > Faits > Suspect > Preuves > Validation
- Indicateur visuel de l'étape en cours

**Sauvegarde Automatique** :
- Sauvegarde en brouillon à chaque étape
- Conservation du brouillon pendant 48 heures
- Reprise du brouillon à la reconnexion

**Consultation de l'État du Dossier** :
- Accéder à la liste des plaintes déposées
- Consulter statut actuel de chaque plainte
- Consulter historique des changements de statut
- Télécharger récépissé PDF si disponible

### 3.11 Vérification d'Identité

- Générer QR Code de son identité
- Scanner document d'identité :
  - Carte d'identité nationale
  - Passeport
  - Permis de conduire
- Afficher résultat de vérification :
  - Valide
  - Expiré
  - Suspect

### 3.12 Vérification Véhicule

- Saisir numéro de plaque d'immatriculation
- Saisir numéro de châssis
- Lancer vérification
- Afficher résultats :
  - Statut du véhicule
  - Signalement de vol
  - Statut d'assurance

### 3.13 Personnes Disparues

- Consulter liste des personnes disparues
- Afficher photo de la personne
- Afficher nom complet
- Afficher date de disparition
- Afficher lieu de disparition
- Signaler une observation

### 3.14 Convocations

- Recevoir convocations officielles
- Consulter détails de convocation
- Télécharger convocation en PDF
- Consulter historique des convocations

### 3.15 Conseils de Prévention

- Consulter conseils par catégorie :
  - Sécurité routière
  - Cybercriminalité
  - Cambriolage
  - Violence domestique
- Lire articles de prévention
- Traduire articles dans langue sélectionnée

### 3.16 Assistant IA PNC

- Poser questions à l'assistant virtuel
- Obtenir réponses sur :
  - Procédures administratives
  - Dépôt de plainte
  - Documents requis
  - Conseils de sécurité
- Historique des conversations
- Traduction automatique des réponses

### 3.17 Coffre-Fort Numérique

- Stocker documents personnels :
  - Carte d'identité
  - Passeport
  - Permis de conduire
  - Autres documents
- Chiffrement des documents avec AES-256
- Consulter documents stockés
- Supprimer documents

### 3.18 Paiement des Amendes

- Consulter liste des amendes
- Sélectionner mode de paiement :
  - Mobile Money
  - Carte bancaire
  - Virement bancaire
- Effectuer paiement
- Consulter historique des paiements
- Télécharger reçus en PDF

### 3.19 Appel Vidéo avec Agent

- Lancer demande d'appel vidéo
- Afficher liste des agents disponibles
- Sélectionner agent ou accepter agent assigné automatiquement
- Établir connexion vidéo
- Communiquer avec agent en temps réel
- Terminer appel
- Consulter historique des appels vidéo

### 3.20 Chat en Direct

- Accéder à la messagerie instantanée
- Envoyer messages texte au centre opérationnel
- Recevoir réponses en temps réel
- Joindre photos ou documents
- Consulter historique des conversations
- Traduire messages automatiquement

### 3.21 Système de Récompenses

- Consulter solde de points
- Afficher badges obtenus
- Consulter historique des récompenses
- Visualiser classement des citoyens contributeurs
- Consulter conditions d'obtention des badges

### 3.22 Statistiques de Sécurité

- Afficher graphiques des incidents par quartier
- Afficher tendances mensuelles
- Afficher zones les plus sûres
- Filtrer par commune
- Filtrer par type d'incident
- Filtrer par période
- Exporter statistiques en PDF

### 3.23 Partage de Localisation

- Activer partage de localisation en temps réel
- Sélectionner contacts d'urgence destinataires
- Définir durée de partage
- Envoyer lien de suivi GPS
- Arrêter partage manuellement
- Consulter historique des partages

### 3.24 Notifications

- Recevoir notifications pour :
  - Alertes de sécurité
  - Réponses aux dossiers
  - Convocations
  - Avis de recherche
  - Incidents dans rayon géolocalisé
  - Messages du chat en direct
  - Récompenses obtenues
- Consulter historique des notifications
- Configurer rayon de géolocalisation pour alertes

### 3.25 Profil Utilisateur

- Afficher photo de profil
- Afficher nom complet
- Afficher numéro de téléphone
- Afficher email
- Afficher points de récompense
- Afficher badges obtenus
- Modifier informations personnelles
- Gérer contacts d'urgence :
  - Ajouter contact
  - Modifier contact
  - Supprimer contact
- Paramètres :
  - Changer langue de l'application
  - Sélectionner langue de traduction automatique (Lingala, Swahili, Tshiluba, Kikongo)
  - Gérer préférences de notifications
  - Configurer rayon de géolocalisation pour alertes
  - Configurer sécurité (biométrie, mot de passe)
  - Activer/désactiver mode hors ligne
  - Activer/désactiver reconnaissance vocale
- Se déconnecter

## 4. Règles Métier et Logiques

### 4.1 Authentification et Sécurité

- L'authentification biométrique nécessite activation préalable dans les paramètres
- Le mot de passe doit contenir minimum 8 caractères
- Le code de vérification pour réinitialisation expire après 10 minutes
- Trois tentatives de connexion échouées bloquent le compte temporairement

### 4.2 SOS Urgence

- Le bouton SOS envoie immédiatement les données au centre opérationnel
- La position GPS est capturée au moment de l'activation
- L'utilisateur doit être connecté pour utiliser SOS Urgence
- Le partage de localisation avec contacts d'urgence est automatique lors de l'activation SOS

### 4.3 Signalements

- Les signalements anonymes ne permettent pas de suivi personnalisé
- Les photos/vidéos/audio sont limitées à 50 MB par signalement
- Un signalement génère un numéro de référence unique
- La reconnaissance vocale transcrit automatiquement l'enregistrement audio en texte
- Les signalements vérifiés par la PNC génèrent des points de récompense
- En mode hors ligne, les signalements sont sauvegardés localement et synchronisés à la reconnexion

### 4.4 Alertes Officielles et Contributions Citoyennes

- Les alertes sécuritaires urgent génèrent notifications push prioritaires ignorant mode Ne pas déranger
- Les autres alertes génèrent notifications push standard
- Les contributions citoyennes ne sont jamais publiées directement
- Toute contribution passe par statut En révision
- Vérification par OPJ obligatoire avant publication
- Notification à l'auteur du statut de sa contribution (Validée et Publiée ou Rejetée)
- Alertes citoyennes actives pendant 30 jours
- Notification de prolongation ou clôture envoyée à l'auteur après 30 jours
- Badge RETROUVÉ(E) ou INTERPELLÉ visible 48 heures avant archivage
- Photos de mineurs retrouvés purgées définitivement du fil public et du cache

### 4.5 Dépôt de Plainte en Ligne

- Numéro de dossier unique généré au format PNCP-2026-XXXXX à la soumission
- Notification push envoyée avec numéro de dossier
- Modification de plainte possible uniquement au statut En attente
- Routage automatique vers commissariat de la commune des faits
- Déclarations de perte validées automatiquement en 10 minutes sans intervention OPJ
- Récépissé PDF généré une fois plainte validée
- Récépissé contient sceau RDC, logo PNC et QR Code d'authenticité
- Sauvegarde automatique en brouillon à chaque étape
- Brouillon conservé pendant 48 heures
- Redirection automatique vers SOS Urgence si Violence ou Agression en cours sélectionnée

### 4.6 Vérifications

- La vérification d'identité et de véhicule interroge la base de données centrale de la PNC
- Les résultats de vérification sont affichés en temps réel

### 4.7 Coffre-Fort Numérique

- Les documents sont chiffrés avec AES-256 avant stockage
- L'accès au coffre-fort nécessite authentification biométrique ou mot de passe

### 4.8 Paiements

- Les paiements sont traités via passerelles sécurisées
- Un reçu PDF est généré automatiquement après paiement réussi

### 4.9 Assistant IA

- L'assistant utilise GPT ou Gemini pour répondre aux questions
- Les réponses sont basées sur la documentation officielle de la PNC
- Les réponses sont traduites automatiquement dans la langue sélectionnée par l'utilisateur

### 4.10 Appel Vidéo

- Les appels vidéo nécessitent connexion Internet stable
- Un agent doit être disponible pour établir la connexion
- Les appels sont enregistrés pour assurance qualité

### 4.11 Chat en Direct

- Les messages sont envoyés en temps réel au centre opérationnel
- Les réponses sont fournies par agents disponibles
- Les messages peuvent être traduits automatiquement via API de traduction

### 4.12 Système de Récompenses

- Points attribués pour :
  - Signalement vérifié : 10 points
  - Signalement conduisant à arrestation : 50 points
  - Observation de personne disparue vérifiée : 20 points
- Badges attribués selon seuils de points :
  - Citoyen Vigilant : 50 points
  - Gardien de la Paix : 200 points
  - Héros Civique : 500 points

### 4.13 Traduction Automatique

- Langues supportées : Français, Lingala, Swahili, Tshiluba, Kikongo
- Traduction via API de traduction en temps réel
- L'utilisateur sélectionne langue cible dans paramètres

### 4.14 Mode Hors Ligne

- En mode hors ligne, l'utilisateur peut :
  - Consulter alertes en cache
  - Créer signalements (sauvegardés localement)
  - Consulter documents du coffre-fort
  - Consulter statistiques en cache
- À la reconnexion, synchronisation automatique des données locales

### 4.15 Statistiques de Sécurité

- Les statistiques sont calculées par quartier/commune
- Les données sont mises à jour quotidiennement
- Les graphiques affichent tendances sur 30 jours, 90 jours, 1 an

### 4.16 Notifications Géolocalisées

- Les notifications sont envoyées selon rayon configurable (500m, 1km, 5km, 10km)
- Les alertes sont basées sur position GPS en temps réel
- L'utilisateur peut désactiver notifications géolocalisées dans paramètres

### 4.17 Notation des Commissariats

- Les citoyens peuvent noter commissariat après visite
- Note de 1 à 5 étoiles
- Commentaire optionnel
- Les notes sont modérées par la PNC

### 4.18 Partage de Localisation

- Le partage de localisation envoie lien de suivi GPS aux contacts sélectionnés
- Durée de partage configurable (15 min, 30 min, 1h, 2h, illimité)
- L'utilisateur peut arrêter partage manuellement à tout moment
- Les contacts d'urgence doivent être définis au préalable dans profil

## 5. Exceptions et Cas Limites

| Situation | Comportement |
|-----------|-------------|
| Pas de connexion Internet | Activer mode hors ligne, permettre consultation des données en cache et création de signalements locaux |
| GPS désactivé | Demander activation GPS, permettre saisie manuelle de localisation |
| Échec d'envoi de signalement | Sauvegarder en local, réessayer automatiquement à la reconnexion |
| Document invalide lors du scan | Afficher message d'erreur, proposer nouvelle tentative |
| Paiement échoué | Afficher raison de l'échec, proposer autre mode de paiement |
| Compte bloqué | Afficher message de contact du support PNC |
| Convocation expirée | Marquer comme expirée, conserver dans l'historique |
| Aucun commissariat trouvé | Afficher message, proposer élargir zone de recherche |
| Aucun agent disponible pour appel vidéo | Afficher message d'attente, proposer chat en direct ou rappel ultérieur |
| Échec de traduction automatique | Afficher message d'erreur, conserver texte original |
| Échec de reconnaissance vocale | Afficher message d'erreur, proposer saisie manuelle |
| Aucun contact d'urgence défini | Afficher message d'alerte, rediriger vers paramètres pour ajouter contacts |
| Rayon de géolocalisation trop large | Limiter à 10 km maximum |
| Synchronisation hors ligne échouée | Conserver données locales, réessayer à la prochaine connexion |
| Description de plainte inférieure à 50 caractères | Afficher message d'erreur, empêcher passage à l'étape suivante |
| Fichiers joints dépassant 50 MB | Afficher message d'erreur, demander réduction de taille ou suppression de fichiers |
| Modification de plainte au statut autre que En attente | Afficher message indiquant impossibilité de modification |
| Contribution citoyenne sans numéro de plainte | Afficher message d'erreur, empêcher soumission |
| Photo haute résolution manquante pour disparition | Afficher message d'erreur, empêcher soumission |

## 6. Critères d'Acceptation

1. L'utilisateur crée un compte avec nom complet, téléphone, email, province, commune et mot de passe
2. L'utilisateur se connecte avec ses identifiants et accède au tableau de bord affichant statistiques de sécurité et points de récompense
3. L'utilisateur active le bouton SOS Urgence, ses données (GPS, heure, identité) sont envoyées au centre opérationnel et sa localisation est partagée avec contacts d'urgence
4. L'utilisateur signale un incident en utilisant reconnaissance vocale pour dicter description, joint une photo, et partage signalement sur WhatsApp
5. L'utilisateur consulte les alertes officielles traduites en Lingala
6. L'utilisateur localise le commissariat le plus proche, consulte notes et commentaires, et note le commissariat 4 étoiles
7. L'utilisateur dépose une plainte en ligne en 5 étapes (Type > Faits > Suspect > Preuves > Validation), reçoit un numéro de dossier PNCP-2026-X98B2, et télécharge le récépissé PDF une fois la plainte validée
8. L'utilisateur lance un appel vidéo avec un agent disponible et communique en temps réel
9. L'utilisateur envoie un message via chat en direct au centre opérationnel et reçoit réponse traduite automatiquement
10. L'utilisateur consulte statistiques de sécurité personnalisées par quartier avec graphiques des tendances sur 30 jours
11. L'utilisateur active partage de localisation en temps réel avec contacts d'urgence pour durée de 1 heure
12. L'utilisateur reçoit notification géolocalisée d'incident dans rayon de 1 km
13. L'utilisateur crée signalement en mode hors ligne, puis synchronise automatiquement à la reconnexion
14. L'utilisateur propose une alerte citoyenne de disparition d'un proche avec photo et numéro de plainte, reçoit notification de validation, et voit sa contribution publiée dans l'onglet Solidarité Citoyenne

## 7. Fonctionnalités Non Implémentées dans cette Version

- Historique détaillé des déplacements
- Système de parrainage pour nouveaux utilisateurs
- Intégration avec caméras de surveillance publiques
- Reconnaissance faciale pour identification de suspects
- Paiement des amendes via cryptomonnaies
- Système de vote pour priorités de sécurité communautaire
- Intégration avec services d'urgence médicale privés
- Marketplace pour services de sécurité privée
- Système de covoiturage sécurisé avec agents PNC
- Diffusion en direct d'incidents via streaming vidéo