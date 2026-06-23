#!/usr/bin/env python3
"""Désactive la confirmation email pour les tests."""
import json
import urllib.request
import urllib.error

TOKEN = 'REDACTED_TOKEN'
REF = 'ubtktcyucgkcnhuqizba'

# Désactiver la confirmation email
config = {
    'mailer_autoconfirm': True,
    'enable_signup': True,
    'enable_email_signin': True,
}

req = urllib.request.Request(
    f'https://api.supabase.com/v1/projects/{REF}/config/auth',
    data=json.dumps(config).encode(),
    headers={
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0',
    },
    method='PATCH'
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        body = resp.read().decode()
        print(f'✅ Status: {resp.status}')
        print(f'   Confirmation email désactivée')
        print(f'   Réponse: {body[:200]}')
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f'❌ HTTP {e.code}:')
    print(f'   {body[:500]}')
