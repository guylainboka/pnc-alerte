/**
 * API Mobile - Criminels recherchés (avis de recherche publics)
 * GET /api/mobile/criminals/wanted
 *
 * Retourne la liste des criminels actuellement recherchés.
 * Accessible publiquement pour que les citoyens puissent signaler
 * s'ils aperçoivent une personne recherchée.
 *
 * Sécurité :
 *  - En mode Supabase, la politique RLS "criminals_public_read_wanted"
 *    limite la lecture aux criminels avec status='recherche'.
 *  - En mode local, on filtre manuellement.
 */

import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseServer, isSupabaseMode } from '@/lib/supabase';

export async function GET() {
  try {
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data, error } = await supabase
          .from('criminals')
          .select(
            'id, reference, first_name, last_name, alias, photo, gender, nationality, physical_desc, height, weight, eye_color, hair_color, scars, tattoos, danger_level, last_known_addr, last_seen_location, last_seen_at, modus_operandi, warrant_status'
          )
          .eq('status', 'recherche')
          .order('danger_level', { ascending: false });
        if (error) throw error;
        return NextResponse.json({ wanted: data || [] });
      }
    }

    const criminals = await db.criminal.findMany({
      where: { status: 'recherche' },
      orderBy: [{ dangerLevel: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        reference: true,
        firstName: true,
        lastName: true,
        alias: true,
        photo: true,
        gender: true,
        nationality: true,
        physicalDesc: true,
        height: true,
        weight: true,
        eyeColor: true,
        hairColor: true,
        scars: true,
        tattoos: true,
        dangerLevel: true,
        lastKnownAddr: true,
        lastSeenLocation: true,
        lastSeenAt: true,
        modusOperandi: true,
        warrantStatus: true,
      },
    });

    return NextResponse.json({
      wanted: criminals.map((c) => ({
        ...c,
        lastSeenAt: c.lastSeenAt?.toISOString?.() ?? c.lastSeenAt,
      })),
    });
  } catch (error: any) {
    console.error('Mobile wanted criminals error:', error);
    return NextResponse.json(
      { error: 'Erreur: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}
