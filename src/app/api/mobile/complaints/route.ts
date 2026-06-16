/**
 * API Mobile - Plaintes citoyennes
 * =================================
 * POST /api/mobile/complaints
 *   Un citoyen dépose une plainte depuis l'application mobile.
 *   La plainte est ensuite traitée/approuvée par la PNC dans le Centre de Commandement.
 *
 *   Body:
 *     {
 *       type: 'vol'|'agression'|'harassment'|'corruption'|'autre',
 *       description: string,
 *       location?: string,
 *       commissariatId?: string
 *     }
 *
 * GET /api/mobile/complaints
 *   Retourne les plaintes du citoyen connecté.
 */

import { NextRequest, NextResponse } from 'next/server';
import { complaintsRepository } from '@/lib/repositories';
import { db } from '@/lib/db';
import { getSupabaseServer, isSupabaseMode } from '@/lib/supabase';

const VALID_TYPES = ['vol', 'agression', 'harassment', 'corruption', 'autre'];

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data: userData, error } = await supabase.auth.getUser(token);
        if (error || !userData.user) {
          return NextResponse.json({ error: 'Jeton invalide' }, { status: 401 });
        }
        const { data: citizen } = await supabase
          .from('citizens')
          .select('id')
          .eq('auth_uid', userData.user.id)
          .single();
        if (!citizen) {
          return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });
        }
        const { data: complaints } = await supabase
          .from('complaints')
          .select('*, commissariat:commissariats(id,name,code)')
          .eq('citizen_id', citizen.id)
          .order('created_at', { ascending: false });
        return NextResponse.json({ complaints: complaints || [] });
      }
    }

    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const citizenId = decoded.split(':')[0];
      const complaints = await db.complaint.findMany({
        where: { citizenId },
        orderBy: { createdAt: 'desc' },
        include: { commissariat: { select: { id: true, name: true, code: true } } },
      });
      return NextResponse.json({
        complaints: complaints.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
      });
    } catch {
      return NextResponse.json({ error: 'Jeton invalide' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Mobile complaints GET error:', error);
    return NextResponse.json(
      { error: 'Erreur: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, description, location, commissariatId } = body;

    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Type invalide. Valeurs acceptées: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    if (!description) {
      return NextResponse.json(
        { error: 'Description requise' },
        { status: 400 }
      );
    }

    // Récupérer le citoyen
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let citizenId: string | null = null;
    let plaintiffName = 'Citoyen';
    let plaintiffPhone = '';
    let plaintiffEmail: string | null = null;
    let plaintiffAddr: string | null = null;

    if (token) {
      if (isSupabaseMode()) {
        const supabase = getSupabaseServer();
        if (supabase) {
          const { data: userData } = await supabase.auth.getUser(token);
          if (userData?.user) {
            const { data: citizen } = await supabase
              .from('citizens')
              .select('id, first_name, last_name, phone, email, address')
              .eq('auth_uid', userData.user.id)
              .single();
            if (citizen) {
              citizenId = citizen.id;
              plaintiffName = `${citizen.first_name} ${citizen.last_name}`;
              plaintiffPhone = citizen.phone;
              plaintiffEmail = citizen.email;
              plaintiffAddr = citizen.address;
            }
          }
        }
      } else {
        try {
          const decoded = Buffer.from(token, 'base64').toString('utf-8');
          const id = decoded.split(':')[0];
          const citizen = await db.citizen.findUnique({
            where: { id },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              phone: true,
              email: true,
              address: true,
            },
          });
          if (citizen) {
            citizenId = citizen.id;
            plaintiffName = `${citizen.firstName} ${citizen.lastName}`;
            plaintiffPhone = citizen.phone;
            plaintiffEmail = citizen.email;
            plaintiffAddr = citizen.address;
          }
        } catch {
          // anonyme
        }
      }
    }

    // Déterminer le commissariat
    let finalCommissariatId = commissariatId;
    if (!finalCommissariatId) {
      const first = await db.commissariat.findFirst({
        orderBy: { name: 'asc' },
        select: { id: true },
      });
      finalCommissariatId = first?.id;
    }
    if (!finalCommissariatId) {
      return NextResponse.json(
        { error: 'Aucun commissariat disponible' },
        { status: 500 }
      );
    }

    const complaint = await complaintsRepository.create({
      type,
      description,
      location: location ?? null,
      plaintiffName,
      plaintiffPhone,
      plaintiffEmail,
      plaintiffAddr,
      citizenId,
      commissariatId: finalCommissariatId,
    });

    return NextResponse.json(
      {
        message: 'Plainte déposée. Elle sera examinée par la PNC.',
        complaint,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Mobile complaints POST error:', error);
    return NextResponse.json(
      { error: 'Erreur: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}
