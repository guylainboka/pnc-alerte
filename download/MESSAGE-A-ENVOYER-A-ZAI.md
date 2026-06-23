# 📋 MESSAGE À ENVOYER À Z.AI — Centre de Commandement PNC

## Contexte
Le projet `pnccom123.space-z.ai` (centre de commandement) doit être connecté au même backend Supabase que l'application mobile PNC Alerte, afin que les données saisies par les citoyens (inscriptions, signalements, SOS) apparaissent en temps réel dans le centre de commandement, et inversement (alertes officielles publiées par les agents remontées aux citoyens).

## Configuration à ajouter dans le `.env.local` du centre de commandement

```env
# Supabase — Backend partagé avec l'app mobile PNC Alerte
NEXT_PUBLIC_SUPABASE_URL=https://ubtktcyucgkcnhuqizba.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGt0Y3l1Y2drY25odXFpemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDk1MzEsImV4cCI6MjA5NzE4NTUzMX0.Yyh-4dHIDq55ePR6SdQH303cGidypiEi2ru_-CEaiJg

# Clé service_role (côté serveur uniquement, NE JAMAIS exposer côté client)
# À récupérer sur: https://supabase.com/dashboard/project/ubtktcyucgkcnhuqizba/settings/api
SUPABASE_SERVICE_ROLE_KEY=<à_récupérer_dans_le_dashboard>
```

## Tables partagées entre les deux applications

L'app mobile écrit dans ces tables, le centre de commandement doit les lire (et parfois écrire) :

| Table | Sens d'écriture | Description |
|-------|-----------------|-------------|
| `profiles` | Mobile → Centre | Citoyens inscrits (vue "Citoyens Inscrits") |
| `signalements` | Mobile → Centre | Signalements citoyens (vue "Alertes") |
| `plaintes` | Mobile → Centre | Plaintes déposées (vue "Plaintes") |
| `sos_calls` | Mobile → Centre | Appels SOS en direct (vue dashboard temps réel) |
| `personnes_disparues` | Mobile → Centre | Avis de recherche (vue dédiée) |
| `convocations` | Centre → Mobile | Convocations envoyées aux citoyens |
| `notifications` | Centre → Mobile | Notifications push vers l'app |
| `alertes_officielles` | Centre → Mobile | Alertes PNC diffusées aux citoyens |
| `signalement_updates` | Centre → Mobile | Mises à jour de statut des signalements |
| `plainte_updates` | Centre → Mobile | Mises à jour de statut des plaintes |

## Realtime à activer (notifications push live)

Pour que les SOS et signalements arrivent instantanément dans le centre de commandement (sans polling), activer Supabase Realtime sur :

```typescript
// Côté centre de commandement — s'abonner aux nouveaux SOS
supabase
  .channel('sos-incoming')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'sos_calls' },
    (payload) => {
      // payload.new contient le nouveau SOS
      console.log('🚨 Nouveau SOS reçu :', payload.new)
    }
  )
  .subscribe()

// S'abonner aux nouveaux signalements
supabase
  .channel('signalements-incoming')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'signalements' },
    (payload) => {
      console.log('📝 Nouveau signalement :', payload.new)
    }
  )
  .subscribe()
```

## Comptes admin

Le centre de commandement utilise actuellement des comptes codés en dur (`admin` / `admin123`). Pour une vraie intégration, recommandé :

1. Ajouter une colonne `role` à la table `profiles` (déjà présente : `'citoyen' | 'agent' | 'admin'`)
2. Créer les comptes agents/admin via Supabase Auth
3. Connexion du centre de commandement via `supabase.auth.signInWithPassword()` au lieu du système maison

## Étapes recommandées pour Z.ai

1. **Ajouter les variables d'env** ci-dessus dans le projet centre de commandement
2. **Remplacer le système Prisma/SQLite** par des appels Supabase directs :
   - `prisma.citizen.findMany()` → `supabase.from('profiles').select()`
   - `prisma.alert.create()` → `supabase.from('signalements').insert()`
   - `prisma.complaint.findMany()` → `supabase.from('plaintes').select()`
3. **Activer Realtime** sur `sos_calls` et `signalements` dans le dashboard
4. **Tester en bout en bout** :
   - Inscription d'un citoyen sur l'app mobile → doit apparaître dans "Citoyens Inscrits"
   - Signalement depuis l'app mobile → doit apparaître dans "Alertes"
   - SOS déclenché → doit apparaître en direct dans le dashboard
5. **Supprimer le dossier `mobile-sdk/`** créé précédemment — il n'est plus nécessaire car l'app mobile parle directement à Supabase via `@supabase/supabase-js` (client JS officiel)
6. **Mettre à jour le `ConnectionBadge`** pour qu'il affiche "Mobile connecté" (vert) au lieu de "Mode démo" (ambre) une fois les vars d'env configurées

## Architecture cible

```
┌─────────────────────┐                    ┌─────────────────────┐
│  APP MOBILE PNC     │                    │  CENTRE COMMANDE    │
│  (Android/iOS)      │                    │  (Web Next.js)      │
│                     │                    │                     │
│  @supabase/js       │                    │  @supabase/js       │
│  (anon key + RLS)   │                    │  (service_role)     │
└─────────────────────┘                    └─────────────────────┘
              ↑                                       ↑
              └───────── SUPABASE UNIQUE ────────────┘
                ubtktcyucgkcnhuqizba.supabase.co
                (PostgreSQL + Auth + Realtime + Storage)
```

## Liens utiles

- Dashboard Supabase : https://supabase.com/dashboard/project/ubtktcyucgkcnhuqizba
- Clés API : https://supabase.com/dashboard/project/ubtktcyucgkcnhuqizba/settings/api
- Table Editor : https://supabase.com/dashboard/project/ubtktcyucgkcnhuqizba/editor
- Auth Users : https://supabase.com/dashboard/project/ubtktcyucgkcnhuqizba/auth/users
- Storage : https://supabase.com/dashboard/project/ubtktcyucgkcnhuqizba/storage/buckets

## Vérification de l'intégration

Une fois configuré, Z.ai peut vérifier que ça marche en :
1. Ouvrant le Table Editor Supabase → table `signalements` → doit être vide initialement
2. Lançant l'app mobile PNC Alerte → créant un compte citoyen
3. Vérifiant que la ligne apparaît dans `profiles` ET `auth.users`
4. Faisant un signalement dans l'app mobile → la ligne doit apparaître dans `signalements`
5. Côté centre de commandement, la liste des alertes doit se mettre à jour

---

**Contact technique** : Guylain Boka (GitHub : https://github.com/guylainboka/pnc-alerte)
