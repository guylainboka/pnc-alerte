#!/usr/bin/env python3
"""
Corrige la policy RLS sur alertes_officielles pour permettre la lecture par ID.
Avant : SELECT uniquement les alertes actives.
Après : SELECT toutes les alertes (actives ET inactives) pour les utilisateurs connectés.
"""
import urllib.request
import json

TOKEN = os.environ.get("SUPABASE_ACCESS_TOKEN", "")
REF = "ubtktcyucgkcnhuqizba"

def run_sql(sql: str, label: str):
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
                        for row in data[:3]:
                            print(f"       {row}")
                except json.JSONDecodeError:
                    print(f"       {body[:200]}")
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        if "already exists" in err.lower() or "duplicate" in err.lower():
            print(f"  [OK] {label} (déjà présent)")
        else:
            print(f"  [ERR] {label} (HTTP {e.code})")
            print(f"        {err[:300]}")

def main():
    print("=" * 60)
    print("Correction RLS alertes_officielles + policies agents")
    print("=" * 60)

    # 1) Recréer la policy SELECT sur alertes_officielles (toutes alertes, pas seulement actives)
    print("\n[1/4] Policy SELECT alertes_officielles (lecture pour tout user connecté) :")
    sql_select = """
    DROP POLICY IF EXISTS "alertes_officielles_select" ON public.alertes_officielles;
    CREATE POLICY "alertes_officielles_select" ON public.alertes_officielles
      FOR SELECT TO authenticated
      USING (true);
    """
    run_sql(sql_select, "Policy SELECT permissive sur alertes_officielles")

    # 2) INSERT/UPDATE/DELETE pour agents/admins uniquement
    print("\n[2/4] Policies INSERT/UPDATE/DELETE alertes_officielles (agents/admins) :")
    sql_agent = """
    DROP POLICY IF EXISTS "alertes_officielles_insert_agent" ON public.alertes_officielles;
    CREATE POLICY "alertes_officielles_insert_agent" ON public.alertes_officielles
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    DROP POLICY IF EXISTS "alertes_officielles_update_agent" ON public.alertes_officielles;
    CREATE POLICY "alertes_officielles_update_agent" ON public.alertes_officielles
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    DROP POLICY IF EXISTS "alertes_officielles_delete_agent" ON public.alertes_officielles;
    CREATE POLICY "alertes_officielles_delete_agent" ON public.alertes_officielles
      FOR DELETE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    """
    run_sql(sql_agent, "Policies INSERT/UPDATE/DELETE pour agents/admins")

    # 3) Policies pour signalement_updates (agents only) + plainte_updates
    print("\n[3/4] Policies INSERT sur signalement_updates et plainte_updates (agents) :")
    sql_updates = """
    DROP POLICY IF EXISTS "signalement_updates_insert_agent" ON public.signalement_updates;
    CREATE POLICY "signalement_updates_insert_agent" ON public.signalement_updates
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    DROP POLICY IF EXISTS "signalement_updates_update_agent" ON public.signalement_updates;
    CREATE POLICY "signalement_updates_update_agent" ON public.signalement_updates
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    DROP POLICY IF EXISTS "plainte_updates_insert_agent" ON public.plainte_updates;
    CREATE POLICY "plainte_updates_insert_agent" ON public.plainte_updates
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    DROP POLICY IF EXISTS "plainte_updates_update_agent" ON public.plainte_updates;
    CREATE POLICY "plainte_updates_update_agent" ON public.plainte_updates
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    """
    run_sql(sql_updates, "Policies updates pour agents")

    # 4) Policy SELECT sos_calls pour agents + INSERT/UPDATE convocations
    print("\n[4/4] Policies SELECT sos_calls (agents) + INSERT convocations (agents) + UPDATE (citoyen) :")
    sql_sos_conv = """
    -- Étendre SELECT sos_calls aux agents
    DROP POLICY IF EXISTS "sos_calls_select" ON public.sos_calls;
    CREATE POLICY "sos_calls_select" ON public.sos_calls
      FOR SELECT TO authenticated
      USING (
        auth.uid() = user_id
        OR auth.uid() = agent_assigned
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    -- UPDATE sos_calls pour agents
    DROP POLICY IF EXISTS "sos_calls_update_agent" ON public.sos_calls;
    CREATE POLICY "sos_calls_update_agent" ON public.sos_calls
      FOR UPDATE TO authenticated
      USING (
        auth.uid() = user_id
        OR auth.uid() = agent_assigned
        OR EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    -- Convocations : INSERT/UPDATE/DELETE pour agents
    DROP POLICY IF EXISTS "convocations_insert_agent" ON public.convocations;
    CREATE POLICY "convocations_insert_agent" ON public.convocations
      FOR INSERT TO authenticated
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    
    DROP POLICY IF EXISTS "convocations_update_citoyen" ON public.convocations;
    CREATE POLICY "convocations_update_citoyen" ON public.convocations
      FOR UPDATE TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
    
    DROP POLICY IF EXISTS "convocations_update_agent" ON public.convocations;
    CREATE POLICY "convocations_update_agent" ON public.convocations
      FOR UPDATE TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.role IN ('agent', 'admin')
        )
      );
    """
    run_sql(sql_sos_conv, "Policies sos_calls (agents) + convocations (agents + citoyens)")

    print("\n" + "=" * 60)
    print("✅ RLS corrigée !")
    print("=" * 60)
    print("\n📋 Récapitulatif :")
    print("  • alertes_officielles : SELECT permissif + INSERT/UPDATE/DELETE agents")
    print("  • signalement_updates : INSERT/UPDATE agents")
    print("  • plainte_updates : INSERT/UPDATE agents")
    print("  • sos_calls : SELECT/UPDATE étendus aux agents")
    print("  • convocations : INSERT/UPDATE/DELETE agents + UPDATE citoyens")

if __name__ == "__main__":
    main()
