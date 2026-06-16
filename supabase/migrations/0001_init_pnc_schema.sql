-- ============================================================================
-- PNC - Police Nationale Congolaise
-- Schéma PostgreSQL pour Supabase
-- ============================================================================
-- Ce schéma crée la base de données partagée entre :
--   1. Le Centre de Commandement PNC (application web Next.js)
--   2. L'Application Mobile Citoyenne (React Native / Flutter)
--
-- À exécuter dans : Supabase Dashboard > SQL Editor > New query
-- ============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ============================================================================
-- 1. HIÉRARCHIE GÉOGRAPHIQUE
-- ============================================================================

create table if not exists public.provinces (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  code        text not null unique,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.districts (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  code        text not null,
  province_id text not null references public.provinces(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.sous_districts (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  code        text not null,
  district_id text not null references public.districts(id) on delete cascade,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.commissariats (
  id               text primary key default gen_random_uuid()::text,
  name             text not null,
  code             text not null,
  address          text,
  phone            text,
  sous_district_id text not null references public.sous_districts(id) on delete cascade,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================================
-- 2. PERSONNEL PNC
-- ============================================================================

create table if not exists public.officers (
  id               text primary key default gen_random_uuid()::text,
  matricule        text not null unique,
  first_name       text not null,
  last_name        text not null,
  rank             text not null,
  phone            text,
  email            text,
  commissariat_id  text not null references public.commissariats(id) on delete restrict,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- users_pnc : comptes du personnel PNC (Centre de Commandement)
-- Les citoyens utilisent Supabase Auth directement (auth.users)
create table if not exists public.users_pnc (
  id              text primary key default gen_random_uuid()::text,
  username        text not null unique,
  email           text not null unique,
  password_hash   text not null,
  first_name      text not null,
  last_name       text not null,
  role            text not null default 'agent',
  phone           text,
  officer_id      text unique references public.officers(id) on delete set null,
  is_active       boolean not null default true,
  last_login_at   timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- ============================================================================
-- 3. CITOYENS (profil étendu des utilisateurs authentifiés via Supabase Auth)
-- ============================================================================
-- La table auth.users (gérée par Supabase) stocke les credentials des citoyens.
-- La table public.citizens stocke les informations de profil additionnelles.

create table if not exists public.citizens (
  id               text primary key default gen_random_uuid()::text,
  auth_uid         uuid unique references auth.users(id) on delete cascade,
  reference        text not null unique,
  first_name       text not null,
  last_name        text not null,
  phone            text not null unique,
  email            text,
  password_hash    text,
  gender           text,
  date_of_birth    timestamptz,
  address          text,
  city             text,
  commune          text,
  -- Localisation GPS en temps réel (envoyée par le mobile)
  latitude         double precision,
  longitude        double precision,
  last_location    text,
  last_location_at timestamptz,
  -- Statut
  status           text not null default 'actif',
  verified         boolean not null default false,
  total_alerts     integer not null default 0,
  total_complaints integer not null default 0,
  commissariat_id  text references public.commissariats(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================================
-- 4. ALERTES (envoyées par les citoyens depuis le mobile)
-- ============================================================================

create table if not exists public.alerts (
  id               text primary key default gen_random_uuid()::text,
  reference        text not null unique,
  type             text not null,
  priority         text not null default 'moyenne',
  status           text not null default 'recue',
  description      text not null,
  location         text not null,
  latitude         double precision,
  longitude        double precision,
  citizen_name     text,
  citizen_phone    text,
  citizen_id       text references public.citizens(id) on delete set null,
  commissariat_id  text not null references public.commissariats(id) on delete restrict,
  assigned_to_id   text references public.officers(id) on delete set null,
  response_time    integer,
  case_id          text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_alerts_status on public.alerts(status);
create index if not exists idx_alerts_priority on public.alerts(priority);
create index if not exists idx_alerts_citizen on public.alerts(citizen_id);
create index if not exists idx_alerts_created on public.alerts(created_at desc);

-- ============================================================================
-- 5. DOSSIERS / AFFAIRES CRIMINELLES
-- ============================================================================

create table if not exists public.cases (
  id               text primary key default gen_random_uuid()::text,
  reference        text not null unique,
  title            text not null,
  type             text not null,
  status           text not null default 'ouvert',
  priority         text not null default 'moyenne',
  description      text not null,
  location         text,
  incident_date    timestamptz,
  commissariat_id  text not null references public.commissariats(id) on delete restrict,
  assigned_to_id   text references public.officers(id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ============================================================================
-- 6. BASE DE DONNÉES CRIMINELLE
-- ============================================================================

create table if not exists public.criminals (
  id                 text primary key default gen_random_uuid()::text,
  reference          text not null unique,
  first_name         text not null,
  last_name          text not null,
  alias              text,
  date_of_birth      timestamptz,
  gender             text,
  nationality        text,
  id_number          text,
  photo              text,
  physical_desc      text,
  height             text,
  weight             text,
  eye_color          text,
  hair_color         text,
  scars              text,
  tattoos            text,
  status             text not null default 'libre',
  danger_level       text not null default 'faible',
  last_known_addr    text,
  last_latitude      double precision,
  last_longitude     double precision,
  last_seen_at       timestamptz,
  last_seen_location text,
  criminal_history   text,
  known_associates   text,
  modus_operandi     text,
  warrant_status     text,
  warrant_issued_at  timestamptz,
  notes              text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create table if not exists public.case_criminals (
  id          text primary key default gen_random_uuid()::text,
  case_id     text not null references public.cases(id) on delete cascade,
  criminal_id text not null references public.criminals(id) on delete cascade,
  role        text not null default 'suspect',
  created_at  timestamptz not null default now(),
  unique(case_id, criminal_id)
);

-- Preuves et pièces à conviction (images, vidéos, documents)
create table if not exists public.evidence (
  id           text primary key default gen_random_uuid()::text,
  criminal_id  text not null references public.criminals(id) on delete cascade,
  type         text not null,
  title        text not null,
  description  text,
  file_url     text not null,
  file_name    text,
  file_size    integer,
  collected_at timestamptz,
  collected_by text,
  case_id      text references public.cases(id) on delete set null,
  created_at   timestamptz not null default now()
);

create index if not exists idx_evidence_criminal on public.evidence(criminal_id);

-- ============================================================================
-- 7. PLAINTE DES CITOYENS
-- ============================================================================

create table if not exists public.complaints (
  id               text primary key default gen_random_uuid()::text,
  reference        text not null unique,
  type             text not null,
  status           text not null default 'soumise',
  description      text not null,
  location         text,
  plaintiff_name   text not null,
  plaintiff_phone  text not null,
  plaintiff_email  text,
  plaintiff_addr   text,
  citizen_id       text references public.citizens(id) on delete set null,
  commissariat_id  text not null references public.commissariats(id) on delete restrict,
  reviewed_by_id   text references public.officers(id) on delete set null,
  review_notes     text,
  case_id          text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists idx_complaints_status on public.complaints(status);
create index if not exists idx_complaints_citizen on public.complaints(citizen_id);

-- ============================================================================
-- 8. SERVICES EXTERNES (intégrations)
-- ============================================================================

create table if not exists public.external_services (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  type        text not null,
  endpoint    text not null,
  api_key     text,
  status      text not null default 'actif',
  last_sync_at timestamptz,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table if not exists public.service_logs (
  id            text primary key default gen_random_uuid()::text,
  service_id    text not null references public.external_services(id) on delete cascade,
  direction     text not null,
  message_type  text not null,
  content       text not null,
  status        text not null default 'en_attente',
  error_message text,
  created_at    timestamptz not null default now()
);

-- ============================================================================
-- 9. TRIGGERS : updated_at automatique
-- ============================================================================

create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  for t in select unnest(array[
    'provinces','districts','sous_districts','commissariats','officers',
    'users_pnc','citizens','alerts','cases','criminals','complaints','external_services'
  ])
  loop
    execute format('drop trigger if exists set_updated_at on public.%I;', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.handle_updated_at();', t);
  end loop;
end$$;

-- ============================================================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Les politiques RLS contrôlent l'accès aux données selon l'utilisateur.
-- Le Centre de Commandement utilise la clé SERVICE_ROLE qui BYPASS la RLS.
-- L'application mobile (clé ANON) est soumise à ces politiques.
-- ============================================================================

alter table public.provinces          enable row level security;
alter table public.districts          enable row level security;
alter table public.sous_districts     enable row level security;
alter table public.commissariats      enable row level security;
alter table public.officers           enable row level security;
alter table public.users_pnc          enable row level security;
alter table public.citizens           enable row level security;
alter table public.alerts             enable row level security;
alter table public.cases              enable row level security;
alter table public.criminals          enable row level security;
alter table public.case_criminals     enable row level security;
alter table public.evidence           enable row level security;
alter table public.complaints         enable row level security;
alter table public.external_services  enable row level security;
alter table public.service_logs       enable row level security;

-- Données géographiques : lecture publique (pour que le mobile puisse lister les commissariats)
create policy "public_read_geography" on public.provinces      for select using (true);
create policy "public_read_geography" on public.districts      for select using (true);
create policy "public_read_geography" on public.sous_districts for select using (true);
create policy "public_read_geography" on public.commissariats  for select using (true);

-- Citoyens : un utilisateur ne voit/modifie que SON propre profil
create policy "citizens_self_select" on public.citizens
  for select using (auth_uid = auth.uid());
create policy "citizens_self_update" on public.citizens
  for update using (auth_uid = auth.uid());

-- Alertes : un citoyen peut créer une alerte et voir les siennes
create policy "alerts_citizen_insert" on public.alerts
  for insert with check (true);
create policy "alerts_citizen_select_own" on public.alerts
  for select using (
    citizen_id in (select id from public.citizens where auth_uid = auth.uid())
  );

-- Plaintes : un citoyen peut créer une plainte et voir les siennes
create policy "complaints_citizen_insert" on public.complaints
  for insert with check (true);
create policy "complaints_citizen_select_own" on public.complaints
  for select using (
    citizen_id in (select id from public.citizens where auth_uid = auth.uid())
  );

-- Criminels recherchés : lecture publique (avis de recherche)
create policy "criminals_public_read_wanted" on public.criminals
  for select using (status = 'recherche');

-- Le reste (officers, users_pnc, cases, evidence, services, logs) :
-- accessible UNIQUEMENT via la clé SERVICE_ROLE (côté serveur web).
-- Aucune politique ANON → accès refusé par défaut pour le mobile.

-- ============================================================================
-- 11. REALTIME - Activer la publication des tables sur Realtime
-- ============================================================================
-- Permet au Centre de Commandement de recevoir les alertes en temps réel
-- quand un citoyen envoie une alerte depuis le mobile.

alter publication supabase_realtime add table public.alerts;
alter publication supabase_realtime add table public.complaints;
alter publication supabase_realtime add table public.citizens;
alter publication supabase_realtime add table public.cases;

-- ============================================================================
-- FIN DU SCHÉMA
-- ============================================================================
-- Après exécution :
--  1. Créez le bucket de stockage "pnc-evidence" dans Storage > New bucket
--  2. Configurez les variables d'environnement dans le web (.env) et le mobile
--  3. Voir MOBILE_INTEGRATION.md pour le guide complet d'intégration
-- ============================================================================
