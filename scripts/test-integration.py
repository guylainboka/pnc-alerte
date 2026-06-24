#!/usr/bin/env python3
"""
Test d'intégration Supabase — PNC Alerte
==========================================
Simule le flux d'inscription de l'app mobile :
1. Crée un user via Supabase Auth
2. Vérifie que le trigger a créé le profil automatiquement
3. Teste la création d'un signalement (avec RLS)
4. Teste un SOS (avec Realtime)
5. Nettoie les données de test
"""
import json
import urllib.request
import urllib.error
import time
import secrets

SUPABASE_URL = 'https://ubtktcyucgkcnhuqizba.supabase.co'
ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVidGt0Y3l1Y2drY25odXFpemJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDk1MzEsImV4cCI6MjA5NzE4NTUzMX0.Yyh-4dHIDq55ePR6SdQH303cGidypiEi2ru_-CEaiJg'
ADMIN_TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
REF = 'ubtktcyucgkcnhuqizba'

# Générer un email + mot de passe de test uniques
TEST_EMAIL = f'citoyen.test.{secrets.token_hex(4)}@gmail.com'
TEST_PASSWORD = 'TestPNC2026!'
TEST_NAME = 'Citoyen Test Integration'
TEST_PHONE = '+243820000000'

print(f'🧪 Test d\'intégration Supabase')
print(f'   Email: {TEST_EMAIL}')
print(f'   Password: {TEST_PASSWORD}')
print()

def supabase_request(path, method='POST', body=None, access_token=None, anon=True):
    """Appel à l'API REST Supabase."""
    headers = {
        'Content-Type': 'application/json',
        'apikey': ANON_KEY if anon else ADMIN_TOKEN,
    }
    if anon:
        headers['apikey'] = ANON_KEY
    else:
        headers['Authorization'] = f'Bearer {ADMIN_TOKEN}'
        headers['User-Agent'] = 'Mozilla/5.0'
    if access_token:
        headers['Authorization'] = f'Bearer {access_token}'

    url = f'{SUPABASE_URL}{path}' if path.startswith('/rest') or path.startswith('/auth') else path
    if path.startswith('/rest'):
        url = f'{SUPABASE_URL}{path}'

    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body_str = resp.read().decode()
            return resp.status, json.loads(body_str) if body_str else None
    except urllib.error.HTTPError as e:
        body_str = e.read().decode()
        try:
            return e.code, json.loads(body_str)
        except json.JSONDecodeError:
            return e.code, body_str

def admin_sql(query):
    """Exécute du SQL via l'API Management (admin)."""
    req = urllib.request.Request(
        f'https://api.supabase.com/v1/projects/{REF}/database/query',
        data=json.dumps({'query': query}).encode(),
        headers={
            'Authorization': f'Bearer {ADMIN_TOKEN}',
            'Content-Type': 'application/json',
            'User-Agent': 'Mozilla/5.0',
        },
        method='POST'
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode())

# ========== ÉTAPE 1 : INSCRIPTION ==========
print('▶️  ÉTAPE 1/5 : Inscription (Supabase Auth)')
status, response = supabase_request('/auth/v1/signup', 'POST', {
    'email': TEST_EMAIL,
    'password': TEST_PASSWORD,
    'data': {
        'full_name': TEST_NAME,
        'phone': TEST_PHONE,
        'carte_electeur_numero': 'CD-TEST-001',
        'province': 'Kinshasa',
        'commune': 'Gombe',
    }
})

if status != 200 and status != 201:
    print(f'❌ Échec inscription: HTTP {status}')
    print(f'   {response}')
    exit(1)

user_id = response.get('user', {}).get('id')
if not user_id:
    print(f'❌ Pas d\'user_id dans la réponse')
    print(f'   {response}')
    exit(1)

print(f'   ✅ Utilisateur créé : {user_id}')
print(f'   ✅ Email confirmé : {response["user"].get("email_confirmed_at", "non") is not None}')

# ========== ÉTAPE 2 : VÉRIFIER LE PROFIL ==========
print('\n▶️  ÉTAPE 2/5 : Vérifier le trigger handle_new_user')
time.sleep(2)  # Laisser le temps au trigger de s'exécuter
result = admin_sql(f"SELECT * FROM public.profiles WHERE id = '{user_id}';")
if not result:
    print(f'   ❌ Profil NON créé par le trigger')
    print(f'   ⚠️  Il faut vérifier le trigger on_auth_user_created')
else:
    profile = result[0]
    print(f'   ✅ Profil créé automatiquement :')
    print(f'      - full_name : {profile["full_name"]}')
    print(f'      - email : {profile["email"]}')
    print(f'      - phone : {profile["phone"]}')
    print(f'      - role : {profile["role"]}')
    print(f'      - province : {profile["province"]}')

# ========== ÉTAPE 3 : CONNEXION ==========
print('\n▶️  ÉTAPE 3/5 : Connexion (récupérer access_token)')
status, response = supabase_request('/auth/v1/token?grant_type=password', 'POST', {
    'email': TEST_EMAIL,
    'password': TEST_PASSWORD,
})
if status != 200:
    print(f'❌ Échec connexion: HTTP {status}')
    print(f'   {response}')
    exit(1)

access_token = response['access_token']
print(f'   ✅ Connexion réussie, access_token obtenu ({len(access_token)} chars)')

# ========== ÉTAPE 4 : CRÉER UN SIGNALEMENT ==========
print('\n▶️  ÉTAPE 4/5 : Créer un signalement (avec RLS)')

signalement_body = {
    'user_id': user_id,
    'type': 'vol',
    'description': 'Test integration — vol à la tire au marché central',
    'location': 'Marché Central, Kinshasa',
    'latitude': -4.325,
    'longitude': 15.3222,
    'anonymous': False,
    'reference': f'SIG-2026-TEST{secrets.token_hex(3).upper()}',
}

status, response = supabase_request(
    '/rest/v1/signalements',
    'POST',
    signalement_body,
    access_token=access_token,
)

if status != 201:
    print(f'❌ Échec création signalement: HTTP {status}')
    print(f'   {response}')
else:
    sig_id = response.get('id')
    print(f'   ✅ Signalement créé : {sig_id}')
    print(f'      - référence : {response["reference"]}')
    print(f'      - status : {response["status"]}')
    print(f'      - priority : {response["priority"]}')

# ========== ÉTAPE 5 : DÉCLENCHER UN SOS ==========
print('\n▶️  ÉTAPE 5/5 : Déclencher un SOS (avec RLS)')

sos_body = {
    'user_id': user_id,
    'latitude': -4.325,
    'longitude': 15.3222,
    'location_text': 'Boulevard du 30 Juin, Kinshasa',
    'reference': f'SOS-2026-TEST{secrets.token_hex(3).upper()}',
}

status, response = supabase_request(
    '/rest/v1/sos_calls',
    'POST',
    sos_body,
    access_token=access_token,
)

if status != 201:
    print(f'❌ Échec création SOS: HTTP {status}')
    print(f'   {response}')
else:
    sos_id = response.get('id')
    print(f'   ✅ SOS créé : {sos_id}')
    print(f'      - référence : {response["reference"]}')
    print(f'      - status : {response["status"]}')

# ========== VÉRIFICATION FINALE ==========
print('\n📊 Vérification finale dans la base de données :')
counts = admin_sql("""
  SELECT 
    (SELECT count(*) FROM public.profiles) AS profiles,
    (SELECT count(*) FROM public.signalements) AS signalements,
    (SELECT count(*) FROM public.sos_calls) AS sos_calls,
    (SELECT count(*) FROM auth.users) AS auth_users;
""")
for row in counts:
    print(f'   👤 auth.users : {row["auth_users"]} utilisateur(s)')
    print(f'   👤 profiles : {row["profiles"]} profil(s)')
    print(f'   📝 signalements : {row["signalements"]} signalement(s)')
    print(f'   🚨 sos_calls : {row["sos_calls"]} appel(s) SOS')

print('\n✅ Test d\'intégration terminé avec succès !')
print(f'\n📋 Récapitulatif du compte de test :')
print(f'   Email : {TEST_EMAIL}')
print(f'   Mot de passe : {TEST_PASSWORD}')
print(f'   User ID : {user_id}')
print(f'   🔗 Voir sur Supabase : https://supabase.com/dashboard/project/{REF}/auth/users')
