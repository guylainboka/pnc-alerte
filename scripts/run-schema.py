#!/usr/bin/env python3
"""
Exécute le schéma SQL sur le projet Supabase via l'API Management.
"""
import json
import urllib.request
import urllib.error
import sys

TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
REF = 'ubtktcyucgkcnhuqizba'

# Lire le schéma SQL
with open('/home/z/my-project/supabase/schema-idempotent.sql', 'r') as f:
    sql = f.read()

print(f'📊 Taille du SQL: {len(sql)} caractères, {sql.count(chr(10))} lignes')

req = urllib.request.Request(
    f'https://api.supabase.com/v1/projects/{REF}/database/query',
    data=json.dumps({'query': sql}).encode(),
    headers={
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (PNC-Alerte-Setup)',
    },
    method='POST'
)

try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        body = resp.read().decode()
        print(f'✅ Status: {resp.status}')
        if body.strip():
            print(f'📄 Réponse (premiers 500 chars): {body[:500]}')
        else:
            print('✅ Schéma exécuté avec succès (réponse vide = OK)')
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'❌ ERREUR HTTP {e.code}:')
    print(body[:3000])
    sys.exit(1)
