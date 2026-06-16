/**
 * API Mobile - Profil du citoyen connecté
 * GET /api/mobile/auth/me
 *
 * Headers: Authorization: Bearer <accessToken>
 *
 * Retourne le profil du citoyen authentifié + ses statistiques.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseServer, isSupabaseMode } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Jeton d\'authentification manquant' },
        { status: 401 }
      );
    }

    // --- Mode Supabase ---
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data: userData, error } = await supabase.auth.getUser(token);
        if (error || !userData.user) {
          return NextResponse.json(
            { error: 'Jeton invalide ou expiré' },
            { status: 401 }
          );
        }
        const { data: citizen } = await supabase
          .from('citizens')
          .select('*, commissariat:commissariats(id,name,code)')
          .eq('auth_uid', userData.user.id)
          .single();
        return NextResponse.json({
          user: {
            id: userData.user.id,
            email: userData.user.email,
            phone: userData.user.phone,
          },
          citizen,
        });
      }
    }

    // --- Mode local : décoder le jeton simplifié ---
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const citizenId = decoded.split(':')[0];
      const citizen = await db.citizen.findUnique({
        where: { id: citizenId },
        include: { commissariat: { select: { id: true, name: true, code: true } } },
      });
      if (!citizen) {
        return NextResponse.json(
          { error: 'Citoyen introuvable' },
          { status: 404 }
        );
      }
      const { passwordHash, ...safe } = citizen;
      return NextResponse.json({
        citizen: {
          ...safe,
          createdAt: safe.createdAt?.toISOString?.() ?? safe.createdAt,
          updatedAt: safe.updatedAt?.toISOString?.() ?? safe.updatedAt,
          dateOfBirth: safe.dateOfBirth?.toISOString?.() ?? safe.dateOfBirth,
          lastLocationAt: safe.lastLocationAt?.toISOString?.() ?? safe.lastLocationAt,
        },
      });
    } catch {
      return NextResponse.json(
        { error: 'Jeton invalide' },
        { status: 401 }
      );
    }
  } catch (error: any) {
    console.error('Mobile me error:', error);
    return NextResponse.json(
      { error: 'Erreur: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}
