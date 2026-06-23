#!/usr/bin/env python3
"""
Active Supabase Realtime sur les tables partagées PNC Alerte.
Utilise le Management API de Supabase pour exécuter du SQL.
"""
import urllib.request
import json
import sys
import time

# --- Config ---
TOKEN = "REDACTED_TOKEN"
REF = "ubtktcyucgkcnhuqizba"

def run_sql(sql: str, label: str):
    """Exécute une requête SQL via le Management API Supabase."""
    url = f"https://api.supabase.com/v1/projects/{REF}/database/query"
    payload = json.dumps({"query": sql}).encode()
    req = urllib.request.Request(
        url, data=payload, method='POST',
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            body = resp.read().decode()
            print(f"  [OK] {label}")
            if body.strip():
                try:
                    data = json.loads(body)
                    if isinstance(data, list) and data:
                        # afficher un résumé compact
                        for row in data[:5]:
                            print(f"       {row}")
                except json.JSONDecodeError:
                    print(f"       {body[:200]}")
            return True
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        print(f"  [ERR] {label} (HTTP {e.code})")
        print(f"        {err[:300]}")
        return False
    except Exception as e:
        print(f"  [ERR] {label} ({e})")
        return False

def main():
    print("=" * 60)
    print("Activation de Realtime sur les tables PNC Alerte")
    print("=" * 60)

    # 1) Vérifier l'état actuel de Realtime
    print("\n[1/4] État actuel des publications Realtime :")
    check_sql = """
    SELECT schemaname, tablename 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime'
    ORDER BY tablename;
    """
    run_sql(check_sql, "Lecture des tables déjà en Realtime")

    # 2) Ajouter les tables à la publication supabase_realtime
    tables = [
        "public.sos_calls",
        "public.signalements",
        "public.plaintes",
        "public.notifications",
        "public.alertes_officielles",
        "public.convocations",
        "public.personnes_disparues",
        "public.profiles",
    ]

    print(f"\n[2/4] Ajout de {len(tables)} tables à la publication supabase_realtime :")
    for tbl in tables:
        # alter publication ... add table est idempotent-safe si on filtre les erreurs
        sql = f"ALTER PUBLICATION supabase_realtime ADD TABLE {tbl};"
        # On catche l'erreur si déjà présente
        url = f"https://api.supabase.com/v1/projects/{REF}/database/query"
        payload = json.dumps({"query": sql}).encode()
        req = urllib.request.Request(
            url, data=payload, method='POST',
            headers={
                "Authorization": f"Bearer {TOKEN}",
                "Content-Type": "application/json",
                "User-Agent": "Mozilla/5.0",
            },
        )
        try:
            with urllib.request.urlopen(req, timeout=30) as resp:
                print(f"  [OK] {tbl} ajoutée à Realtime")
        except urllib.error.HTTPError as e:
            err = e.read().decode()
            if "already member" in err.lower() or "duplicate" in err.lower():
                print(f"  [OK] {tbl} déjà dans Realtime (skip)")
            else:
                print(f"  [ERR] {tbl} → {err[:200]}")

    # 3) Activer REPLICA IDENTITY FULL sur les tables importantes
    # (pour que les anciennes valeurs soient envoyées dans les updates/delete)
    print("\n[3/4] Activation de replica identity full (pour UPDATE/DELETE en Realtime) :")
    for tbl in ["sos_calls", "signalements", "plaintes", "notifications", "alertes_officielles"]:
        sql = f"ALTER TABLE public.{tbl} REPLICA IDENTITY FULL;"
        run_sql(sql, f"replica identity full sur {tbl}")

    # 4) Vérification finale
    print("\n[4/4] Vérification finale — tables en Realtime :")
    verify_sql = """
    SELECT tablename 
    FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public'
    ORDER BY tablename;
    """
    url = f"https://api.supabase.com/v1/projects/{REF}/database/query"
    payload = json.dumps({"query": verify_sql}).encode()
    req = urllib.request.Request(
        url, data=payload, method='POST',
        headers={
            "Authorization": f"Bearer {TOKEN}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            data = json.loads(resp.read().decode())
            print(f"\n  📋 {len(data)} tables PNC en Realtime :")
            for row in data:
                print(f"     • {row['tablename']}")
    except urllib.error.HTTPError as e:
        print(f"  [ERR] Vérification : {e.read().decode()[:300]}")

    print("\n" + "=" * 60)
    print("✅ Realtime activé avec succès !")
    print("=" * 60)

if __name__ == "__main__":
    main()
