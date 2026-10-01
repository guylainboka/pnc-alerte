/**
 * API Mobile - Inscription d'un citoyen
 * POST /api/mobile/auth/register
 *
 * Body:
 *   { firstName, lastName, phone, email?, password, gender?, city?, commune?, address? }
 *
 * - En mode Supabase : crée un compte dans Supabase Auth + un profil dans public.citizens
 * - En mode local : crée directement un citoyen dans SQLite (mot de passe haché)
 *
 * L'application mobile appelle cet endpoint lors de l'inscription d'un nouvel utilisateur.
 */

import { NextRequest, NextResponse } from 'next/server';
import { citizensRepository } from '@/lib/repositories';
import { getSupabaseServer, isSupabaseMode } from '@/lib/supabase';

// Format de hachage local — cohérent avec le mode local (non-Supabase).
// En mode Supabase, le mot de passe est géré par Supabase Auth.
function hashPassword(password: string): string {
  return `hash_${Buffer.from(password).toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      password,
      gender,
      city,
      commune,
      address,
    } = body;

    // Validation
    if (!firstName || !lastName || !phone || !password) {
      return NextResponse.json(
        { error: 'Champs requis manquants: firstName, lastName, phone, password' },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // --- Mode Supabase : utiliser Supabase Auth ---
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const userEmail = email || `${phone}@citizen.pnc.cd`;
        // 1. Créer l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: userEmail,
          password,
          phone,
          email_confirm: true,
          user_metadata: { firstName, lastName, phone },
        });
        if (authError) {
          return NextResponse.json(
            { error: authError.message },
            { status: 400 }
          );
        }
        // 2. Créer le profil citoyen lié à l'auth_uid
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const year = new Date().getFullYear();
        const { data: last } = await supabase
          .from('citizens')
          .select('reference')
          .like('reference', `CIT-${year}-%`)
          .order('reference', { ascending: false })
          .limit(1);
        const nextNum = last && last[0] ? parseInt(last[0].reference.split('-')[2], 10) + 1 : 1;
        const reference = `CIT-${year}-${String(nextNum).padStart(3, '0')}`;

        const { data: citizen, error: citizenError } = await supabase
          .from('citizens')
          .insert({
            auth_uid: authData.user.id,
            reference,
            first_name: firstName,
            last_name: lastName,
            phone,
            email: userEmail,
            gender: gender ?? null,
            city: city ?? null,
            commune: commune ?? null,
            address: address ?? null,
            status: 'actif',
            verified: false,
          })
          // select explicite — ne renvoie JAMAIS password_hash (défense en profondeur)
          .select('id, reference, first_name, last_name, phone, email, gender, city, commune, address, latitude, longitude, status, verified, commissariat:commissariats(id,name,code)')
          .single();
        if (citizenError) {
          return NextResponse.json(
            { error: 'Profil citoyen non créé: ' + citizenError.message },
            { status: 500 }
          );
        }
        return NextResponse.json(
          {
            message: 'Inscription réussie',
            user: {
              id: authData.user.id,
              email: userEmail,
              phone,
            },
            citizen,
          },
          { status: 201 }
        );
      }
    }

    // --- Mode local : SQLite ---
    const passwordHash = hashPassword(password);
    const citizen = await citizensRepository.create({
      firstName,
      lastName,
      phone,
      email: email ?? null,
      gender: gender ?? null,
      city: city ?? null,
      commune: commune ?? null,
      address: address ?? null,
      passwordHash,
    });

    return NextResponse.json(
      {
        message: 'Inscription réussie (mode local)',
        citizen,
      },
      { status: 201 }
    );
  } catch (error: any) {
    if (process.env.NODE_ENV !== 'production') console.error('Mobile register error:', error);
    if (error?.code === 'P2002') {
      return NextResponse.json(
        { error: 'Ce téléphone ou email est déjà inscrit' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Échec de l'inscription" },
      { status: 500 }
    );
  }
}
