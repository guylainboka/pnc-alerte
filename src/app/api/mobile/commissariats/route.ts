/**
 * API Mobile - Liste des commissariats
 * GET /api/mobile/commissariats
 *
 * Retourne la liste publique des commissariats (pour que le mobile puisse
 * afficher les commissariats à proximité ou permettre au citoyen d'en choisir un).
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
          .from('commissariats')
          .select('id, name, code, address, phone, sous_district:sous_districts(name, district:districts(name, province:provinces(name)))')
          .order('name', { ascending: true });
        if (error) throw error;
        return NextResponse.json({ commissariats: data || [] });
      }
    }

    const commissariats = await db.commissariat.findMany({
      orderBy: { name: 'asc' },
      include: {
        sousDistrict: {
          select: {
            name: true,
            district: {
              select: {
                name: true,
                province: { select: { name: true } },
              },
            },
          },
        },
      },
    });

    return NextResponse.json({
      commissariats: commissariats.map((c) => ({
        id: c.id,
        name: c.name,
        code: c.code,
        address: c.address,
        phone: c.phone,
        sousDistrict: c.sousDistrict?.name,
        district: c.sousDistrict?.district?.name,
        province: c.sousDistrict?.district?.province?.name,
      })),
    });
  } catch (error: any) {
    console.error('Mobile commissariats error:', error);
    return NextResponse.json(
      { error: 'Erreur: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}
