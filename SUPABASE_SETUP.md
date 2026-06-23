# Guide Complet — Connecter PNC Alerte à Supabase

> **Temps estimé : 15–20 minutes**
> **Niveau : Débutant**
> **Coût : Gratuit (plan Free suffisant pour débuter)**

---

## Table des matières

1. [Vue d'ensemble](#1-vue-densemble)
2. [Créer un compte Supabase](#2-créer-un-compte-supabase)
3. [Créer un nouveau projet](#3-créer-un-nouveau-projet)
4. [Récupérer les clés API](#4-récupérer-les-clés-api)
5. [Exécuter le schéma SQL](#5-exécuter-le-schéma-sql)
6. [Configurer l'authentification](#6-configurer-lauthentification)
7. [Créer le bucket Storage pour les photos](#7-créer-le-bucket-storage-pour-les-photos)
8. [Configurer le fichier `.env.local`](#8-configurer-le-fichier-envlocal)
9. [Redémarrer et tester](#9-redémarrer-et-tester)
10. [Vérifier que tout fonctionne](#10-vérifier-que-tout-fonctionne)
11. [Dépannage (Troubleshooting)](#11-dépannage-troubleshooting)
12. [Aller plus loin](#12-aller-plus-loin)

---

## 1. Vue d'ensemble

### Architecture actuelle

```
┌─────────────────────────────────────────────┐
│   Application PNC Alerte (Next.js 16)       │
│   ├─ Capteur (Capacitor) → Android APK      │
│   └─ Web (z.ai) → https://preview-...        │
└────────────────┬────────────────────────────┘
                 │
                 │  HTTP (Supabase JS SDK)
                 ▼
┌─────────────────────────────────────────────┐
│            Supabase (Cloud)                  │
│   ├─ Auth : Inscription / Connexion         │
│   ├─ PostgreSQL : Toutes les données        │
│   ├─ Storage : Photos (cartes, signalements)│
│   └─ Realtime : Suivi SOS en direct         │
└─────────────────────────────────────────────┘
```

### Ce qui sera connecté

| Fonctionnalité | Avant (mode démo) | Après (Supabase) |
|---|---|---|
| Inscription | Stockée dans le navigateur | Compte réel Supabase Auth |
| Connexion | Toujours réussie (fake) | Vraie vérification mot de passe |
| Mot de passe oublié | Code `123456` | E-mail réel envoyé par Supabase |
| Signalements | Local seulement | Sauvegardés en base, visibles par les agents |
| SOS | Local seulement | Appel réel en base + Realtime |
| Photos | Base64 (lourd) | URL Supabase Storage |
| Notifications | Simulées | Persistantes, multi-appareils |

---

## 2. Créer un compte Supabase

### Étapes

1. **Ouvrez** https://supabase.com dans votre navigateur
2. Cliquez sur **"Start your project"** (en haut à droite)
3. Choisissez votre méthode de connexion :
   - **GitHub** (recommandé — le plus rapide)
   - **Email** (créer un compte avec e-mail + mot de passe)

### Si vous choisissez Email

- Entrez votre e-mail professionnel
- Créez un mot de passe fort (min. 8 caractères)
- Cochez "I agree to the Terms of Service"
- Cliquez sur **"Sign up"**
- **Validez votre e-mail** en cliquant sur le lien reçu (important !)

### Si vous choisissez GitHub

- Autorisez Supabase à accéder à votre compte GitHub
- Vous serez redirigé automatiquement

> ✅ **Checkpoint** : Vous êtes connecté au dashboard Supabase (`https://supabase.com/dashboard`)

---

## 3. Créer un nouveau projet

### Étapes

1. Sur le dashboard, cliquez sur **"New project"** (bouton vert en haut à droite)

2. **Choisissez votre organisation**
   - Si vous n'en avez pas, Supabase crée automatiquement une organisation personnelle
   - Sinon, sélectionnez "Personal" ou créez une nouvelle org

3. **Remplissez les informations du projet** :

   | Champ | Valeur recommandée |
   |---|---|
   | **Name** | `PNC Alerte` (ou `pnc-alerte-prod`) |
   | **Database Password** | Cliquez sur "Generate" pour générer un mot de passe fort, **COPIEZ-LE** et sauvegardez-le dans un gestionnaire de mots de passe (Bitwarden, 1Password, etc.) |
   | **Region** | `EU West 1 - Ireland` (le plus proche de la RDC avec une bonne connectivité) ou `US East 1 - N. Virginia` si vous visez l'Amérique |
   | **Pricing Plan** | **Free** (suffisant pour démarrer) |

4. Cliquez sur **"Create new project"**

### ⏳ Attendez 2–3 minutes

Supabase provisionne votre base de données PostgreSQL. Ne fermez pas la page. Vous verrez le statut "Setting up project" puis "Project is ready".

> ✅ **Checkpoint** : Vous voyez le dashboard de votre projet avec un menu à gauche (Table Editor, SQL Editor, Auth, Storage, etc.)

---

## 4. Récupérer les clés API

### Étapes

1. Dans le menu de gauche, cliquez sur **"Project Settings"** (icône ⚙️ en bas)

2. Dans le sous-menu, cliquez sur **"API"**

3. Vous verrez plusieurs URLs et clés. Copiez ces deux valeurs :

   #### a) Project URL
   ```
   https://xxxxxxxxxxxxx.supabase.co
   ```
   Exemple : `https://pncalerteabc123.supabase.co`

   #### b) Project API Keys → `anon` `public`
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1...
   ```
   ⚠️ **IMPORTANT** : Prenez bien la clé `anon` `public`, **PAS** la clé `service_role` (qui est secrète et donne accès à tout sans RLS).

> ✅ **Checkpoint** : Vous avez noté quelque part :
> - L'URL du projet (`https://xxx.supabase.co`)
> - La clé anon (`eyJ...`)

---

## 5. Exécuter le schéma SQL

Cette étape crée toutes les tables nécessaires (profils, signalements, plaintes, SOS, etc.).

### Étapes

1. Dans le menu de gauche, cliquez sur **"SQL Editor"** (icône `>_`)

2. Cliquez sur **"+ New query"** (en haut à droite)

3. **Ouvrez le fichier** `/home/z/my-project/supabase/schema.sql` dans votre éditeur
   - (Ou téléchargez-le depuis votre projet local)

4. **Copiez tout le contenu** du fichier (Ctrl+A puis Ctrl+C)

5. **Collez-le** dans l'éditeur SQL de Supabase (Ctrl+V)

6. Cliquez sur le bouton **"Run"** (bouton vert en bas) ou faites Ctrl+Enter

7. Attendez l'exécution (quelques secondes). Vous devriez voir :
   ```
   Success. No rows returned.
   ```

### Vérification

1. Allez dans **"Table Editor"** (menu de gauche)
2. Vous devriez voir ces tables dans le sélecteur :
   - `profiles`
   - `signalements`
   - `plaintes`
   - `sos_calls`
   - `personnes_disparues`
   - `convocations`
   - `notifications`
   - `alertes_officielles`
   - `signalement_updates`
   - `plainte_updates`

> ✅ **Checkpoint** : Les 10 tables sont visibles dans Table Editor

---

## 6. Configurer l'authentification

### Désactiver la confirmation d'e-mail (optionnel, pour tester rapidement)

Par défaut, Supabase exige que les utilisateurs confirment leur e-mail. Pour tester plus vite :

1. Allez dans **"Authentication"** → **"Providers"** → **"Email"**
2. Décochez **"Confirm email"**
3. Cliquez sur **"Save"**

> ⚠️ **Production** : Réactivez cette option avant la mise en production réelle.

### Configurer le template d'e-mail "Reset Password"

1. Allez dans **"Authentication"** → **"Email Templates"** → **"Reset Password"**
2. Modifiez le template pour le rendre cohérent avec PNC Alerte :

   **Subject line :**
   ```
   PNC Alerte — Réinitialisation de votre mot de passe
   ```

   **Content body :**
   ```html
   <h2>Réinitialisation de mot de passe — PNC Alerte</h2>
   <p>Bonjour,</p>
   <p>Vous avez demandé à réinitialiser votre mot de passe pour votre compte PNC Alerte.</p>
   <p>Cliquez sur le bouton ci-dessous pour définir un nouveau mot de passe :</p>
   <p>
     <a href="{{ .ConfirmationURL }}" style="background:#1E5EFF;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">
       Réinitialiser mon mot de passe
     </a>
   </p>
   <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet e-mail.</p>
   <p><strong>Police Nationale Congolaise — PNC Alerte</strong></p>
   ```

3. Cliquez sur **"Save"**

### Configurer l'URL de redirection

1. Allez dans **"Authentication"** → **"URL Configuration"**
2. **Site URL** : `https://preview-<votre-bot-id>.space-z.ai` (votre URL z.ai)
   - Ou pour le dev local : `http://localhost:3000`
3. **Redirect URLs** : ajoutez
   - `https://preview-<votre-bot-id>.space-z.ai/reset-password`
   - `http://localhost:3000/reset-password`
4. Cliquez sur **"Save"**

> ✅ **Checkpoint** : Auth configurée, templates prêts

---

## 7. Créer le bucket Storage pour les photos

Les photos (cartes d'électeur, signalements, photos de personnes disparues) seront stockées dans Supabase Storage.

### Étapes

1. Allez dans **"Storage"** (menu de gauche, icône 📁)

2. Cliquez sur **"New bucket"**

3. Remplissez :
   - **Name** : `photos`
   - **Public bucket** : ✅ Cochez (pour que les images soient accessibles par URL publique)
   - **File size limit** : `5 MB` (suffisant pour des photos)
   - **Allowed MIME types** : `image/jpeg, image/png, image/webp`

4. Cliquez sur **"Create bucket"**

### Politiques d'accès (RLS Storage)

1. Dans le bucket `photos`, cliquez sur l'onglet **"Policies"**
2. Cliquez sur **"New policy"** → **"For full customization"**
3. Remplissez :
   - **Policy name** : `Users can manage their own photos`
   - **Allowed operation** : ✅ SELECT, ✅ INSERT, ✅ UPDATE, ✅ DELETE
   - **Target roles** : `anon` et `authenticated`
   - **WITH clause** (lecture) :
     ```sql
     (bucket_id = 'photos' AND auth.uid() IS NOT NULL)
     ```
   - **WITH check clause** (écriture) :
     ```sql
     (bucket.id = 'photos' AND auth.uid() IS NOT NULL)
     ```
4. Cliquez sur **"Save"**

> ✅ **Checkpoint** : Bucket `photos` créé et accessible

---

## 8. Configurer le fichier `.env.local`

### Étapes

1. Dans votre projet local, copiez le fichier d'exemple :
   ```bash
   cd /home/z/my-project
   cp .env.local.example .env.local
   ```

2. **Éditez** `.env.local` et remplacez les valeurs par vos vraies clés Supabase :

   ```env
   # Configuration Supabase — PNC Alerte
   NEXT_PUBLIC_SUPABASE_URL=https://pncalerteabc123.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZWZhdWx0LXJlZmVyZW5jZS5...
   ```

3. **Sauvegardez** le fichier

### ⚠️ Sécurité

- **Ne committez JAMAIS** `.env.local` dans Git (le fichier `.gitignore` doit déjà l'exclure)
- Vérifiez avec : `cat .gitignore | grep env` (devrait afficher `.env*.local`)
- La clé `anon` est conçue pour être exposée côté client — elle est protégée par RLS
- **NE JAMAIS** mettre la clé `service_role` dans le code client

### Pour le build Android (Capacitor)

Le build Android utilise les mêmes variables d'environnement via `next.config.ts`. Assurez-vous qu'elles sont bien définies au moment du build :

```bash
# Build Android
CAPACITOR_BUILD=true bun run build
```

Les variables `NEXT_PUBLIC_*` sont automatiquement inlinées dans le code JavaScript du bundle.

---

## 9. Redémarrer et tester

### Redémarrer le serveur de dev

```bash
cd /home/z/my-project
# Arrêter le serveur actuel (Ctrl+C ou)
pkill -f "next dev"

# Relancer
bun run dev
```

### Vérifier que Supabase est détecté

1. Ouvrez l'app : http://localhost:3000
2. Allez sur l'écran de connexion
3. **La bannière jaune "Mode démo activé" doit avoir disparu** ✅

### Tester l'inscription

1. Cliquez sur **"Créer un compte"**
2. Remplissez le formulaire :
   - Nom : `Test User`
   - Téléphone : `+243 812 000 000`
   - Email : `test@exemple.com`
   - Province : `Kinshasa`
   - Commune : `Gombe`
   - Mot de passe : `password123` (min. 6 caractères)
   - Confirmez le mot de passe
   - Carte électeur : entrez un numéro et prenez une photo
3. Acceptez les conditions
4. Cliquez sur **"Créer mon compte"**

### Si vous avez désactivé la confirmation d'e-mail

- Vous êtes connecté automatiquement → ✅ Succès

### Si la confirmation d'e-mail est activée

- Vous verrez un message "Vérifiez votre e-mail"
- Allez sur la boîte mail de `test@exemple.com`
- Cliquez sur le lien de confirmation
- Revenez sur l'app et connectez-vous avec vos identifiants

> ✅ **Checkpoint** : Inscription réussie, vous êtes sur le dashboard

---

## 10. Vérifier que tout fonctionne

### Vérifier dans Supabase Dashboard

#### a) Profil créé automatiquement
1. Allez dans **"Table Editor"** → **`profiles`**
2. Vous devriez voir une ligne avec votre utilisateur :
   - `id` : UUID long
   - `email` : `test@exemple.com`
   - `full_name` : `Test User`
   - `phone` : `+243 812 000 000`
   - `province` : `Kinshasa`
   - `commune` : `Gombe`

#### b) Tester un signalement
1. Dans l'app, allez sur **"Signaler"**
2. Créez un signalement (ex: "Vol à la tire")
3. Soumettez
4. Vérifiez dans **Table Editor** → **`signalements`** : votre signalement doit apparaître avec une référence (`SIG-2026-XXXXXX`)

#### c) Tester un SOS
1. Cliquez sur le bouton SOS (icône rouge)
2. Confirmez (3 secondes)
3. Le son doit se déclencher 🚨
4. Vérifiez dans **Table Editor** → **`sos_calls`** : un appel SOS est enregistré avec votre position GPS

#### d) Tester "Mot de passe oublié"
1. Déconnectez-vous
2. Cliquez sur **"Mot de passe oublié ?"**
3. Entrez votre e-mail
4. Cliquez sur **"Envoyer le code"**
5. **Vérifiez votre boîte mail** : vous devez avoir reçu un e-mail de Supabase avec un lien
6. Cliquez sur le lien → vous serez redirigé vers l'app
7. Définissez un nouveau mot de passe

### Vérifier les RLS (Row Level Security)

Pour confirmer que les utilisateurs ne voient que leurs propres données :

1. Inscrivez un **deuxième utilisateur** (autre email)
2. Connectez-vous avec ce deuxième compte
3. Allez dans **"Mes alertes"**
4. **Vous ne devez PAS voir les signalements du premier utilisateur** ✅
5. Chaque utilisateur ne voit que ses propres signalements, plaintes, SOS, notifications

> ✅ **Checkpoint complet** : Toutes les fonctionnalités principales fonctionnent avec Supabase !

---

## 11. Dépannage (Troubleshooting)

### Problème : La bannière "Mode démo" reste affichée

**Cause** : Les variables d'environnement ne sont pas chargées

**Solution** :
1. Vérifiez que le fichier s'appelle bien `.env.local` (et non `.env`)
2. Vérifiez qu'il est à la racine du projet : `/home/z/my-project/.env.local`
3. Vérifiez le contenu :
   ```bash
   cat /home/z/my-project/.env.local
   ```
   Les variables doivent commencer par `NEXT_PUBLIC_SUPABASE_`
4. **Redémarrez** le serveur de dev (les variables `.env` ne se rechargent pas à chaud)

### Problème : "Invalid login credentials"

**Cause** : Mauvais e-mail ou mot de passe, ou e-mail non confirmé

**Solution** :
1. Vérifiez votre mot de passe
2. Si vous avez activé la confirmation d'e-mail, vérifiez votre boîte mail
3. Ou désactivez "Confirm email" dans Supabase → Authentication → Providers → Email

### Problème : "Email rate limit exceeded"

**Cause** : Trop de tentatives de connexion/inscription en peu de temps

**Solution** :
- Attendez 5–10 minutes
- Ou changez d'adresse IP (redémarrez votre routeur)
- Ou utilisez un autre e-mail

### Problème : Erreur "User already registered"

**Cause** : L'e-mail est déjà utilisé

**Solution** :
1. Soit connectez-vous avec cet e-mail
2. Soit supprimez l'utilisateur dans Supabase → **Authentication** → **Users** → cliquez sur l'utilisateur → **"Delete user"**

### Problème : Photos ne s'uploadent pas

**Cause** : Le bucket Storage n'est pas configuré ou les politiques RLS manquent

**Solution** :
1. Vérifiez que le bucket s'appelle bien `photos` (minuscules)
2. Vérifiez qu'il est **Public**
3. Vérifiez les politiques dans l'onglet "Policies" du bucket
4. La politique doit autoriser `authenticated` à INSERT

### Problème : "new row violates row-level security policy"

**Cause** : L'utilisateur n'est pas authentifié ou la politique RLS est mal configurée

**Solution** :
1. Vérifiez que vous êtes connecté
2. Vérifiez que vos politiques RLS utilisent `auth.uid() = user_id` (et pas seulement `true`)
3. Pour le debug temporaire, vous pouvez désactiver RLS :
   ```sql
   alter table public.signalements disable row level security;
   ```
   ⚠️ **Réactivez-la avant la production** :
   ```sql
   alter table public.signalements enable row level security;
   ```

### Problème : Les tables n'apparaissent pas dans Table Editor

**Cause** : Le schéma SQL n'a pas été exécuté correctement

**Solution** :
1. Allez dans **SQL Editor**
2. Exécutez cette requête pour vérifier :
   ```sql
   select table_name from information_schema.tables 
   where table_schema = 'public' order by table_name;
   ```
3. Si aucune table n'apparaît, ré-exécutez tout le `schema.sql`

### Problème : L'app Android ne se connecte pas à Supabase

**Cause** : Variables d'env non inlinées au moment du build

**Solution** :
1. Vérifiez que `.env.local` existe avant le build Capacitor
2. Rebuild :
   ```bash
   CAPACITOR_BUILD=true bun run build
   cap sync android
   ```
3. Le bundle static (`out/`) doit contenir les URLs Supabase
4. Testez : décompressez l'APK et vérifiez que `supabase.co` apparaît dans les fichiers JS

### Problème : Réseau (timeout) sur mobile

**Cause** : L'APK Android ne peut pas atteindre Supabase

**Solution** :
1. Vérifiez que l'appareil a internet
2. Vérifiez les permissions Android : `INTERNET` doit être dans `AndroidManifest.xml`
3. Capacitor gère normalement ça automatiquement, mais vérifiez :
   ```bash
   cat android/app/src/main/AndroidManifest.xml | grep internet
   ```
   Devrait afficher : `<uses-permission android:name="android.permission.INTERNET" />`

---

## 12. Aller plus loin

### Option A : Activer les notifications Realtime pour les SOS

Quand un citoyen déclenche un SOS, les agents PNC peuvent le voir en temps réel sur leur dashboard.

1. Dans Supabase → **Database** → **Replication**
2. Activez **Realtime** pour les tables :
   - `sos_calls`
   - `signalements`
   - `notifications`
3. L'app utilise déjà `subscribeToSOSUpdates()` dans `src/lib/sos-service.ts`

### Option B : Ajouter l'authentification par téléphone (SMS)

Supabase supporte l'OTP par SMS via Twilio.

1. Dans Supabase → **Authentication** → **Providers** → **Phone**
2. Configurez Twilio (vous aurez besoin d'un compte Twilio payant)
3. Activez le provider

### Option C : Créer un dashboard admin (agents PNC)

Les agents PNC ont un rôle `agent` ou `admin` (défini dans la table `profiles`).

1. Créez une route `/admin` dans Next.js
2. Vérifiez le rôle utilisateur :
   ```typescript
   const { data: profile } = await supabase
     .from('profiles')
     .select('role')
     .eq('id', user.id)
     .single()
   
   if (profile?.role !== 'agent' && profile?.role !== 'admin') {
     return <AccessDenied />
   }
   ```
3. Affichez tous les signalements, SOS, etc. (les politiques RLS devront être ajustées pour permettre aux agents de voir toutes les données)

### Option D : Backup automatique de la base

Le plan Free de Supabase ne fait pas de backup automatique. Pour la production :

1. Passez au plan **Pro** ($25/mois) → backups quotidiens
2. Ou scriptez un dump quotidien :
   ```bash
   # Script cron
   pg_dump "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" > backup-$(date +%Y%m%d).sql
   ```

### Option E : Migrer vers la production

Checklist avant mise en production :

- [ ] Réactiver "Confirm email" dans Auth
- [ ] Personnaliser les templates d'e-mails
- [ ] Configurer un domaine personnalisé dans Supabase (Settings → General → Custom Domain)
- [ ] Passer au plan Pro si > 500MB de données ou > 50k requêtes/mois
- [ ] Activer les backups automatiques
- [ ] Vérifier que toutes les politiques RLS sont strictes
- [ ] Mettre en place un monitoring (Supabase → Logs)
- [ ] Cacher les clés sensibles (ne pas exposer `service_role` côté client)

---

## Récapitulatif rapide (TL;DR)

Si vous êtes pressé, voici les 5 étapes essentielles :

```bash
# 1. Créez un projet sur https://supabase.com (gratuit)
# 2. Dans SQL Editor, exécutez le contenu de : supabase/schema.sql
# 3. Dans Settings → API, copiez Project URL et anon key
# 4. Configurez votre .env.local :

cd /home/z/my-project
cp .env.local.example .env.local
nano .env.local
# Remplissez :
# NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# 5. Redémarrez l'app
pkill -f "next dev"
bun run dev
```

**C'est tout !** L'app bascule automatiquement du mode démo vers Supabase.

---

## Fichiers importants du projet

| Fichier | Rôle |
|---|---|
| `supabase/schema.sql` | Schéma SQL complet (tables, RLS, triggers) |
| `.env.local.example` | Template du fichier de configuration |
| `.env.local` | Vos clés réelles (à créer, ne pas committer) |
| `src/lib/supabase-client.ts` | Client Supabase singleton |
| `src/lib/auth-service.ts` | Service Auth (signUp, signIn, resetPassword) |
| `src/lib/signalements-service.ts` | Service signalements + plaintes + photos |
| `src/lib/sos-service.ts` | Service SOS + Realtime + notifications |

---

## Support

- **Documentation Supabase** : https://supabase.com/docs
- **Discord Supabase** : https://discord.supabase.com/
- **Status Supabase** : https://status.supabase.com/

**Pour toute question sur l'intégration dans PNC Alerte**, vérifiez d'abord la section [Dépannage](#11-dépannage-troubleshooting) ci-dessus.

---

*Guide créé pour PNC Alerte — Police Nationale Congolaise*
*Version : 1.0 — Juin 2026*
