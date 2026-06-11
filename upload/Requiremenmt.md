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
├── Notifications
└── Profil Utilisateur
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
- Fournir accès rapide aux fonctions :
  - Signaler un incident
  - Mes alertes
  - Conseils de sécurité
  - Poste de police proche
  - Assistance IA
  - Déposer une plainte

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
- Capturer position GPS automatiquement
- Enregistrer date et heure
- Joindre photos, vidéos ou enregistrements audio
- Soumettre le signalement

### 3.6 Signalement Anonyme

- Accéder au formulaire de signalement
- Masquer automatiquement le nom de l'utilisateur
- Masquer le numéro de téléphone
- Masquer la localisation précise (afficher uniquement la commune)
- Soumettre le signalement anonyme

### 3.7 Alertes Officielles

- Afficher liste des alertes :
  - Avis de recherche
  - Alertes sécuritaires
  - Catastrophes naturelles
  - Disparitions
- Filtrer par province
- Filtrer par ville
- Filtrer par catégorie
- Consulter détails d'une alerte

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

### 3.10 Dépôt de Plainte en Ligne

- Sélectionner type de plainte :
  - Vol
  - Escroquerie
  - Violence
  - Perte de document
- Remplir formulaire de plainte
- Joindre documents justificatifs
- Soumettre la plainte
- Recevoir numéro de dossier
- Consulter état du dossier
- Consulter historique des plaintes

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

### 3.16 Assistant IA PNC

- Poser questions à l'assistant virtuel
- Obtenir réponses sur :
  - Procédures administratives
  - Dépôt de plainte
  - Documents requis
  - Conseils de sécurité
- Historique des conversations

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

### 3.19 Notifications

- Recevoir notifications pour :
  - Alertes de sécurité
  - Réponses aux dossiers
  - Convocations
  - Avis de recherche
- Consulter historique des notifications

### 3.20 Profil Utilisateur

- Afficher photo de profil
- Afficher nom complet
- Afficher numéro de téléphone
- Afficher email
- Modifier informations personnelles
- Paramètres :
  - Changer langue de l'application
  - Gérer préférences de notifications
  - Configurer sécurité (biométrie, mot de passe)
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

### 4.3 Signalements

- Les signalements anonymes ne permettent pas de suivi personnalisé
- Les photos/vidéos/audio sont limitées à 50 MB par signalement
- Un signalement génère un numéro de référence unique

### 4.4 Vérifications

- La vérification d'identité et de véhicule interroge la base de données centrale de la PNC
- Les résultats de vérification sont affichés en temps réel

### 4.5 Coffre-Fort Numérique

- Les documents sont chiffrés avec AES-256 avant stockage
- L'accès au coffre-fort nécessite authentification biométrique ou mot de passe

### 4.6 Paiements

- Les paiements sont traités via passerelles sécurisées
- Un reçu PDF est généré automatiquement après paiement réussi

### 4.7 Assistant IA

- L'assistant utilise GPT ou Gemini pour répondre aux questions
- Les réponses sont basées sur la documentation officielle de la PNC

## 5. Exceptions et Cas Limites

| Situation | Comportement |
|-----------|-------------|
| Pas de connexion Internet | Afficher message d'erreur, permettre consultation hors ligne des données en cache |
| GPS désactivé | Demander activation GPS, permettre saisie manuelle de localisation |
| Échec d'envoi de signalement | Sauvegarder en local, réessayer automatiquement à la reconnexion |
| Document invalide lors du scan | Afficher message d'erreur, proposer nouvelle tentative |
| Paiement échoué | Afficher raison de l'échec, proposer autre mode de paiement |
| Compte bloqué | Afficher message de contact du support PNC |
| Convocation expirée | Marquer comme expirée, conserver dans l'historique |
| Aucun commissariat trouvé | Afficher message, proposer élargir zone de recherche |

## 6. Critères d'Acceptation

1. L'utilisateur crée un compte avec nom complet, téléphone, email, province, commune et mot de passe
2. L'utilisateur se connecte avec ses identifiants et accède au tableau de bord
3. L'utilisateur active le bouton SOS Urgence, ses données (GPS, heure, identité) sont envoyées au centre opérationnel
4. L'utilisateur signale un incident en sélectionnant une catégorie, saisissant une description, et joignant une photo
5. L'utilisateur consulte les alertes officielles filtrées par sa province
6. L'utilisateur localise le commissariat le plus proche et obtient l'itinéraire GPS
7. L'utilisateur dépose une plainte en ligne, reçoit un numéro de dossier et consulte l'état du dossier
8. L'utilisateur vérifie l'authenticité d'une carte d'identité en scannant le document et reçoit le résultat (Valide/Expiré/Suspect)

## 7. Fonctionnalités Non Implémentées dans cette Version

- Appels vidéo avec les agents de police
- Chat en direct avec le centre opérationnel
- Système de récompenses pour signalements vérifiés
- Intégration avec réseaux sociaux
- Traduction automatique multilingue (au-delà des langues configurées)
- Reconnaissance vocale pour signalements
- Mode hors ligne complet avec synchronisation différée
- Statistiques personnalisées de sécurité par quartier
- Notifications push géolocalisées en temps réel
- Système de notation des commissariats
- Partage de localisation en temps réel avec contacts d'urgence
- Historique détaillé des déplacements