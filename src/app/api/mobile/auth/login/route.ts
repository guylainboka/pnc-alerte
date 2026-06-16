/**
 * API Mobile - Connexion d'un citoyen
 * POST /api/mobile/auth/login
 *
 * Body:
 *   { identifier: string (phone ou email), password: string }
 *
 * - En mode Supabase : authentifie via Supabase Auth (retourne access_token + refresh_token)
 * - En mode local : vérifie le mot de passe dans SQLite
 *
 * L'application mobile stocke ensuite le jeton et l'utilise pour les requêtes authentifiées.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseServer, isSupabaseMode } from '@/lib/supabase';

function verifyPassword(password: string, hash: string): boolean {
  const expected = `hash_${Buffer.from(password).toString('base64')}`;
  return hash === expected;
}

export async function POST(request: NextRequest) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Identifiant (phone/email) et mot de passe requis' },
        { status: 400 }
      );
    }

    // --- Mode Supabase ---
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        // Supabase Auth nécessite un email. Si l'identifier est un phone,
        // on reconstruit l'email conventionnel.
        const email = identifier.includes('@')
          ? identifier
          : `${identifier}@citizen.pnc.cd`;
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          return NextResponse.json(
            { error: 'Identifiants invalides' },
            { status: 401 }
          );
        }
        // Récupérer le profil citoyen
        const { data: citizen } = await supabase
          .from('citizens')
          .select('*, commissariat:commissariats(id,name,code)')
          .eq('auth_uid', data.user.id)
          .single();
        return NextResponse.json({
          message: 'Connexion réussie',
          accessToken: data.session?.access_token,
          refreshToken: data.session?.refresh_token,
          expiresIn: data.session?.expires_in,
          user: {
            id: data.user.id,
            email: data.user.email,
            phone: data.user.phone,
          },
          citizen,
        });
      }
    }

    // --- Mode local : SQLite ---
    const citizen = await db.citizen.findFirst({
      where: {
        OR: [{ phone: identifier }, { email: identifier }],
      },
    });

    if (!citizen) {
      return NextResponse.json(
        { error: 'Citoyen introuvable. Inscrivez-vous d\'abord.' },
        { status: 404 }
      );
    }

    if (citizen.status === 'bloque') {
      return NextResponse.json(
        { error: 'Votre compte est bloqué. Contactez la PNC.' },
        { status: 403 }
      );
    }

    if (!citizen.passwordHash || !verifyPassword(password, citizen.passwordHash)) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    const { passwordHash, ...citizenSafe } = citizen;

    // Jeton de session simplifié pour le mode local (démo)
    const token = Buffer.from(`${citizen.id}:${Date.now()}`).toString('base64');

    return NextResponse.json({
      message: 'Connexion réussie (mode local)',
      accessToken: token,
      refreshToken: null,
      expiresIn: 86400,
      citizen: {
        ...citizenSafe,
        createdAt: citizenSafe.createdAt?.toISOString?.() ?? citizenSafe.createdAt,
        updatedAt: citizenSafe.updatedAt?.toISOString?.() ?? citizenSafe.updatedAt,
        dateOfBirth: citizenSafe.dateOfBirth?.toISOString?.() ?? citizenSafe.dateOfBirth,
        lastLocationAt: citizenSafe.lastLocationAt?.toISOString?.() ?? citizenSafe.lastLocationAt,
      },
    });
  } catch (error: any) {
    console.error('Mobile login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}
