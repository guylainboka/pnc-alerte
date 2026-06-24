#!/usr/bin/env python3
"""
Crée le bucket Storage 'photos' + policies RLS + triggers manquants.
À exécuter UNE FOIS sur le projet Supabase.
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
        if "already exists" in err.lower() or "duplicate" in err.lower() or "conflict" in err.lower():
            print(f"  [OK] {label} (déjà présent)")
        else:
            print(f"  [ERR] {label} (HTTP {e.code})")
            print(f"        {err[:300]}")
    except Exception as e:
        print(f"  [ERR] {label} ({e})")

def main():
    print("=" * 60)
    print("Setup Storage bucket + triggers + RLS additions")
    print("=" * 60)

    # 1) Storage bucket 'photos'
    print("\n[1/5] Création du bucket Storage 'photos' :")
    bucket_sql = """
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES ('photos', 'photos', true, 5242880, 
            ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
    ON CONFLICT (id) DO NOTHING;
    """
    run_sql(bucket_sql, "Bucket 'photos' créé (public, 5MB, jpeg/png/webp/gif)")

    # 2) Storage RLS policies pour 'photos'
    print("\n[2/5] Policies RLS Storage pour 'photos' :")
    storage_policies = """
    -- Permettre à tout utilisateur authentifié d'uploader
    CREATE POLICY "photos_upload_auth" ON storage.objects
      FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'photos');
    
    -- Lecture publique (photos de signalements, profils, etc.)
    CREATE POLICY "photos_read_public" ON storage.objects
      FOR SELECT TO anon, authenticated
      USING (bucket_id = 'photos');
    
    -- Update : seulement le propriétaire
    CREATE POLICY "photos_update_owner" ON storage.objects
      FOR UPDATE TO authenticated
      USING (bucket_id = 'photos' AND owner = auth.uid());
    
    -- Delete : seulement le propriétaire
    CREATE POLICY "photos_delete_owner" ON storage.objects
      FOR DELETE TO authenticated
      USING (bucket_id = 'photos' AND owner = auth.uid());
    """
    run_sql(storage_policies, "Policies Storage RLS (upload/read/update/delete)")

    # 3) Trigger set_updated_at_personnes_disparues
    print("\n[3/5] Trigger set_updated_at_personnes_disparues :")
    trigger_pd = """
    CREATE OR REPLACE FUNCTION public.update_updated_at_personnes_disparues()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    DROP TRIGGER IF EXISTS set_updated_at_personnes_disparues ON public.personnes_disparues;
    CREATE TRIGGER set_updated_at_personnes_disparues
      BEFORE UPDATE ON public.personnes_disparues
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_personnes_disparues();
    """
    run_sql(trigger_pd, "Trigger set_updated_at_personnes_disparues créé")

    # 4) Auto-insert signalement_updates après création signalement
    print("\n[4/5] Trigger auto-insert signalement_updates + notifications :")
    auto_updates = """
    -- Fonction pour insérer un update + une notification automatique
    CREATE OR REPLACE FUNCTION public.handle_new_signalement()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Insert update "Reçu"
      INSERT INTO public.signalement_updates (signalement_id, status, message, created_by, created_at)
      VALUES (NEW.id, 'Reçu', 'Signalement enregistré, prise en charge en cours.', NEW.user_id, now());
      
      -- Insert notification de confirmation
      INSERT INTO public.notifications (user_id, type, titre, message, read, created_at)
      VALUES (
        NEW.user_id, 
        'succes', 
        'Signalement reçu',
        'Votre signalement ' || NEW.reference || ' a été enregistré. Référence à conserver.',
        false,
        now()
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    DROP TRIGGER IF EXISTS on_signalement_created ON public.signalements;
    CREATE TRIGGER on_signalement_created
      AFTER INSERT ON public.signalements
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_signalement();
    
    -- Idem pour les plaintes
    CREATE OR REPLACE FUNCTION public.handle_new_plainte()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.plainte_updates (plainte_id, status, message, created_by, created_at)
      VALUES (NEW.id, 'Reçu', 'Plainte enregistrée, en attente d''examen par un officier.', NEW.user_id, now());
      
      INSERT INTO public.notifications (user_id, type, titre, message, read, created_at)
      VALUES (
        NEW.user_id, 
        'succes', 
        'Plainte reçue',
        'Votre plainte ' || NEW.reference || ' a été enregistrée.',
        false,
        now()
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    DROP TRIGGER IF EXISTS on_plainte_created ON public.plaintes;
    CREATE TRIGGER on_plainte_created
      AFTER INSERT ON public.plaintes
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_plainte();
    
    -- Idem pour SOS
    CREATE OR REPLACE FUNCTION public.handle_new_sos()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.notifications (user_id, type, titre, message, read, created_at)
      VALUES (
        NEW.user_id, 
        'urgence', 
        'SOS reçu',
        'Votre appel SOS ' || NEW.reference || ' a été reçu. Un agent est en route.',
        false,
        now()
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    
    DROP TRIGGER IF EXISTS on_sos_created ON public.sos_calls;
    CREATE TRIGGER on_sos_created
      AFTER INSERT ON public.sos_calls
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_sos();
    """
    run_sql(auto_updates, "Triggers auto-insert updates + notifications (signalements/plaintes/sos)")

    # 5) Compléter handle_new_user pour carte_electeur, province, commune
    print("\n[5/5] Mise à jour trigger handle_new_user :")
    update_trigger = """
    CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS TRIGGER AS $$
    BEGIN
      INSERT INTO public.profiles (id, full_name, email, phone, carte_electeur_numero, province, commune, role, created_at, updated_at)
      VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        NEW.raw_user_meta_data->>'carte_electeur_numero',
        COALESCE(NEW.raw_user_meta_data->>'province', 'Kinshasa'),
        COALESCE(NEW.raw_user_meta_data->>'commune', 'Gombe'),
        'citoyen',
        now(),
        now()
      );
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
    """
    run_sql(update_trigger, "Trigger handle_new_user mis à jour (carte_electeur + province + commune)")

    # Vérification finale
    print("\n" + "=" * 60)
    print("✅ Setup terminé !")
    print("=" * 60)
    print("\n📋 Récapitulatif :")
    print("  • Bucket 'photos' créé (public, 5MB)")
    print("  • 4 policies Storage RLS ajoutées")
    print("  • Trigger updated_at_personnes_disparues ajouté")
    print("  • 3 triggers auto-insert (signalements/plaintes/sos)")
    print("  • Trigger handle_new_user complété")

if __name__ == "__main__":
    main()
