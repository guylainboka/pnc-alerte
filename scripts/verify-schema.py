#!/usr/bin/env python3
"""Vérifie l'état du projet Supabase PNC Alerte."""
import json
import urllib.request

TOKEN = 'REDACTED_TOKEN'
REF = 'ubtktcyucgkcnhuqizba'

def run_sql(query):
    req = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{REF}/database/query',
        data=json.dumps({'query': query}).encode(),
        headers={
            'Authorization': f'Bearer {TOKEN}',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

# 1. Tables du schéma PNC
print('=== TABLES PNC ALERTE ===')
result = run_sql("""
SELECT tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'profiles','signalements','plaintes','sos_calls',
    'personnes_disparues','convocations','notifications',
    'alertes_officielles','signalement_updates','plainte_updates'
  )
ORDER BY tablename;
""")
for row in result:
    print(f'  ✅ {row["tablename"]}')

# 2. Triggers
print('\n=== TRIGGERS ===')
result = run_sql("""
SELECT tgname, tgrelid::regclass AS table_name
FROM pg_trigger 
WHERE tgname IN (
  'on_auth_user_created',
  'set_updated_at_profiles',
  'set_updated_at_signalements',
  'set_updated_at_plaintes'
)
ORDER BY tgname;
""")
for row in result:
    print(f'  ✅ {row["tgname"]} sur {row["table_name"]}')

# 3. Policies RLS
print('\n=== RLS POLICIES ===')
result = run_sql("""
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
""")
for row in result:
    print(f'  ✅ {row["tablename"]}: {row["policyname"]}')

# 4. Compter les enregistrements dans chaque table
print('\n=== NB ENREGISTREMENTS ===')
tables = ['profiles','signalements','plaintes','sos_calls','personnes_disparues',
          'convocations','notifications','alertes_officielles']
for t in tables:
    result = run_sql(f'SELECT count(*) AS n FROM public.{t};')
    print(f'  📊 {t}: {result[0]["n"]} enregistrement(s)')

# 5. Storage buckets
print('\n=== STORAGE BUCKETS ===')
req = urllib.request.Request(
    f'https://api.supabase.com/v1/projects/{REF}/storage/buckets',
    headers={
        'Authorization': f'Bearer {TOKEN}',
        'User-Agent': 'Mozilla/5.0',
    },
)
with urllib.request.urlopen(req, timeout=30) as resp:
    buckets = json.loads(resp.read().decode())
    for b in buckets:
        public = '🌐 public' if b.get('public') else '🔒 privé'
        print(f'  📁 {b["name"]} ({public})')

print('\n✅ Vérification terminée.')
