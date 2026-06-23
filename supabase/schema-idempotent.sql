-- ============================================================
--  PNC Alerte — Schéma Idempotent
-- ============================================================
--  Version safe à ré-exécuter (drop if exists avant chaque create)
-- ============================================================

-- ---------- TABLES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique,
  phone text,
  province text default 'Kinshasa',
  commune text default 'Gombe',
  carte_electeur_numero text,
  carte_electeur_valide boolean default false,
  carte_electeur_image text,
  profile_image text,
  role text default 'citoyen' check (role in ('citoyen', 'agent', 'admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.signalements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('vol', 'agression', 'violence', 'trafic', 'corruption', 'nuisance', 'autre')),
  description text not null,
  location text,
  latitude double precision,
  longitude double precision,
  photo_url text,
  anonymous boolean default false,
  status text default 'en-attente' check (status in ('en-attente', 'en-cours', 'traite', 'rejete', 'cloture')),
  reference text unique,
  priority text default 'moyenne' check (priority in ('basse', 'moyenne', 'haute', 'critique')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.plaintes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type_plainte text not null check (type_plainte in ('vol', 'escroquerie', 'agression', 'harcèlement', 'violence', 'autre')),
  description text not null,
  suspect_info text,
  lieu_incident text,
  date_incident date,
  pieces_jointes text[],
  status text default 'en-attente' check (status in ('en-attente', 'en-cours', 'traite', 'rejete', 'cloture')),
  reference text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.sos_calls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  latitude double precision,
  longitude double precision,
  location_text text,
  status text default 'actif' check (status in ('actif', 'en-route', 'sur-place', 'cloture', 'annule')),
  agent_assigned uuid references public.profiles(id),
  response_time_seconds integer,
  notes text,
  reference text unique,
  created_at timestamptz default now(),
  closed_at timestamptz
);

create table if not exists public.personnes_disparues (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  nom_complet text not null,
  age integer,
  sexe text check (sexe in ('M', 'F')),
  description text,
  derniere_vue_lieu text,
  derniere_vue_date date,
  photo_url text,
  contact_telephone text not null,
  status text default 'recherche' check (status in ('recherche', 'retrouve', 'alerte')),
  reference text unique,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.convocations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  titre text not null,
  date_convocation date not null,
  heure time not null,
  lieu text not null,
  officier text,
  motif text,
  status text default 'pending' check (status in ('pending', 'confirmed', 'missed', 'completed')),
  reference text unique,
  created_at timestamptz default now()
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade,
  type text not null check (type in ('alerte', 'info', 'urgence', 'succes', 'rappel')),
  titre text not null,
  message text not null,
  read boolean default false,
  screen_target text,
  related_id text,
  created_at timestamptz default now()
);

create table if not exists public.alertes_officielles (
  id uuid primary key default gen_random_uuid(),
  titre text not null,
  type text not null,
  severity text check (severity in ('high', 'medium', 'low')),
  description text,
  location text,
  source text,
  reference text unique,
  publiee_par uuid references public.profiles(id),
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.signalement_updates (
  id uuid primary key default gen_random_uuid(),
  signalement_id uuid references public.signalements(id) on delete cascade,
  status text not null,
  message text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

create table if not exists public.plainte_updates (
  id uuid primary key default gen_random_uuid(),
  plainte_id uuid references public.plaintes(id) on delete cascade,
  status text not null,
  message text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ---------- TRIGGERS ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Citoyen'),
    new.email,
    new.raw_user_meta_data->>'phone'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.update_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_updated_at_profiles on public.profiles;
create trigger set_updated_at_profiles before update on public.profiles
  for each row execute procedure public.update_updated_at();

drop trigger if exists set_updated_at_signalements on public.signalements;
create trigger set_updated_at_signalements before update on public.signalements
  for each row execute procedure public.update_updated_at();

drop trigger if exists set_updated_at_plaintes on public.plaintes;
create trigger set_updated_at_plaintes before update on public.plaintes
  for each row execute procedure public.update_updated_at();

-- ---------- RLS ----------
alter table public.profiles enable row level security;
alter table public.signalements enable row level security;
alter table public.plaintes enable row level security;
alter table public.sos_calls enable row level security;
alter table public.personnes_disparues enable row level security;
alter table public.convocations enable row level security;
alter table public.notifications enable row level security;
alter table public.alertes_officielles enable row level security;
alter table public.signalement_updates enable row level security;
alter table public.plainte_updates enable row level security;

-- PROFILES policies
drop policy if exists "Profiles: lecture propre" on public.profiles;
create policy "Profiles: lecture propre" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "Profiles: update propre" on public.profiles;
create policy "Profiles: update propre" on public.profiles
  for update using (auth.uid() = id);

-- SIGNALEMENTS policies
drop policy if exists "Signalements: lecture propre" on public.signalements;
create policy "Signalements: lecture propre" on public.signalements
  for select using (auth.uid() = user_id or anonymous = true);
drop policy if exists "Signalements: insert propre" on public.signalements;
create policy "Signalements: insert propre" on public.signalements
  for insert with check (auth.uid() = user_id);
drop policy if exists "Signalements: update propre" on public.signalements;
create policy "Signalements: update propre" on public.signalements
  for update using (auth.uid() = user_id);

-- PLAINTE policies
drop policy if exists "Plaintes: lecture propre" on public.plaintes;
create policy "Plaintes: lecture propre" on public.plaintes
  for select using (auth.uid() = user_id);
drop policy if exists "Plaintes: insert propre" on public.plaintes;
create policy "Plaintes: insert propre" on public.plaintes
  for insert with check (auth.uid() = user_id);
drop policy if exists "Plaintes: update propre" on public.plaintes;
create policy "Plaintes: update propre" on public.plaintes
  for update using (auth.uid() = user_id);

-- SOS policies
drop policy if exists "SOS: lecture propre" on public.sos_calls;
create policy "SOS: lecture propre" on public.sos_calls
  for select using (auth.uid() = user_id);
drop policy if exists "SOS: insert propre" on public.sos_calls;
create policy "SOS: insert propre" on public.sos_calls
  for insert with check (auth.uid() = user_id);
drop policy if exists "SOS: update propre" on public.sos_calls;
create policy "SOS: update propre" on public.sos_calls
  for update using (auth.uid() = user_id or auth.uid() = agent_assigned);

-- PERSONNES DISPARUES policies
drop policy if exists "PersonnesDisparues: lecture tous connectés" on public.personnes_disparues;
create policy "PersonnesDisparues: lecture tous connectés" on public.personnes_disparues
  for select using (auth.uid() is not null);
drop policy if exists "PersonnesDisparues: insert propre" on public.personnes_disparues;
create policy "PersonnesDisparues: insert propre" on public.personnes_disparues
  for insert with check (auth.uid() = user_id);
drop policy if exists "PersonnesDisparues: update propre" on public.personnes_disparues;
create policy "PersonnesDisparues: update propre" on public.personnes_disparues
  for update using (auth.uid() = user_id);

-- CONVOCATIONS policies
drop policy if exists "Convocations: lecture propre" on public.convocations;
create policy "Convocations: lecture propre" on public.convocations
  for select using (auth.uid() = user_id);
drop policy if exists "Convocations: insert propre" on public.convocations;
create policy "Convocations: insert propre" on public.convocations
  for insert with check (auth.uid() = user_id);

-- NOTIFICATIONS policies
drop policy if exists "Notifications: lecture propre" on public.notifications;
create policy "Notifications: lecture propre" on public.notifications
  for select using (auth.uid() = user_id);
drop policy if exists "Notifications: insert propre" on public.notifications;
create policy "Notifications: insert propre" on public.notifications
  for insert with check (auth.uid() = user_id);
drop policy if exists "Notifications: update propre" on public.notifications;
create policy "Notifications: update propre" on public.notifications
  for update using (auth.uid() = user_id);
drop policy if exists "Notifications: delete propre" on public.notifications;
create policy "Notifications: delete propre" on public.notifications
  for delete using (auth.uid() = user_id);

-- ALERTES OFFICIELLES policies
drop policy if exists "AlertesOfficielles: lecture tous connectés" on public.alertes_officielles;
create policy "AlertesOfficielles: lecture tous connectés" on public.alertes_officielles
  for select using (auth.uid() is not null and active = true);

-- SIGNALEMENT_UPDATES policies
drop policy if exists "SignalementUpdates: lecture propre" on public.signalement_updates;
create policy "SignalementUpdates: lecture propre" on public.signalement_updates
  for select using (
    exists (
      select 1 from public.signalements s
      where s.id = signalement_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "PlainteUpdates: lecture propre" on public.plainte_updates;
create policy "PlainteUpdates: lecture propre" on public.plainte_updates
  for select using (
    exists (
      select 1 from public.plaintes p
      where p.id = plainte_id and p.user_id = auth.uid()
    )
  );

-- ---------- FONCTIONS ----------
create or replace function public.generate_reference(prefix text)
returns text
language plpgsql
as $$
declare
  ref text;
  year int := extract(year from now())::int;
begin
  ref := prefix || '-' || year::text || '-' || substr(md5(random()::text), 1, 6);
  return upper(ref);
end;
$$;

-- FIN DU SCHÉMA
