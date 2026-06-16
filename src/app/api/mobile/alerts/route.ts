/**
 * API Mobile - Alertes citoyennes
 * ==================================
 * POST /api/mobile/alerts
 *   Envoie une alerte SOS depuis l'application mobile vers le Centre de Commandement.
 *   L'alerte apparaît en temps réel dans le tableau de bord PNC.
 *
 *   Body:
 *     {
 *       type: 'vol'|'agression'|'accident'|'incendie'|'autre',
 *       priority?: 'urgente'|'haute'|'moyenne'|'basse',
 *       description: string,
 *       location: string,
 *       latitude?: number,
 *       longitude?: number,
 *       commissariatId?: string  // optionnel, auto-détecté sinon
 *     }
 *
 * GET /api/mobile/alerts
 *   Retourne les alertes du citoyen connecté (avec Authorization: Bearer <token>)
 *
 * L'application mobile appelle POST quand le citoyen appuie sur le bouton SOS.
 * Le Centre de Commandement reçoit l'alerte via Realtime (Supabase) ou polling.
 */

import { NextRequest, NextResponse } from 'next/server';
import { alertsRepository, citizensRepository } from '@/lib/repositories';
import { db } from '@/lib/db';
import { getSupabaseServer, isSupabaseMode } from '@/lib/supabase';

// Types d'alertes valides
const VALID_TYPES = ['vol', 'agression', 'accident', 'incendie', 'autre'];
const VALID_PRIORITIES = ['urgente', 'haute', 'moyenne', 'basse'];

// Trouve le commissariat le plus pertinent (premier par défaut en mode démo)
async function findNearestCommissariat(lat?: number, lng?: number): Promise<string | null> {
  const first = await db.commissariat.findFirst({
    orderBy: { name: 'asc' },
    select: { id: true },
  });
  return first?.id ?? null;
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Authentification requise' }, { status: 401 });
    }

    // --- Mode Supabase ---
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
          return NextResponse.json({ error: 'Profil citoyen introuvable' }, { status: 404 });
        }
        const { data: alerts } = await supabase
          .from('alerts')
          .select('*, commissariat:commissariats(id,name,code)')
          .eq('citizen_id', citizen.id)
          .order('created_at', { ascending: false });
        return NextResponse.json({ alerts: alerts || [] });
      }
    }

    // --- Mode local ---
    try {
      const decoded = Buffer.from(token, 'base64').toString('utf-8');
      const citizenId = decoded.split(':')[0];
      const alerts = await db.alert.findMany({
        where: { citizenId },
        orderBy: { createdAt: 'desc' },
        include: { commissariat: { select: { id: true, name: true, code: true } } },
      });
      return NextResponse.json({
        alerts: alerts.map((a) => ({
          ...a,
          createdAt: a.createdAt.toISOString(),
          updatedAt: a.updatedAt.toISOString(),
        })),
      });
    } catch {
      return NextResponse.json({ error: 'Jeton invalide' }, { status: 401 });
    }
  } catch (error: any) {
    console.error('Mobile alerts GET error:', error);
    return NextResponse.json(
      { error: 'Erreur: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      priority,
      description,
      location,
      latitude,
      longitude,
      commissariatId,
    } = body;

    // Validation
    if (!type || !VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `Type invalide. Valeurs acceptées: ${VALID_TYPES.join(', ')}` },
        { status: 400 }
      );
    }
    if (!description || !location) {
      return NextResponse.json(
        { error: 'Description et localisation requises' },
        { status: 400 }
      );
    }

    // Récupérer le citoyen depuis le jeton
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    let citizenId: string | null = null;
    let citizenName: string | null = null;
    let citizenPhone: string | null = null;

    if (token) {
      if (isSupabaseMode()) {
        const supabase = getSupabaseServer();
        if (supabase) {
          const { data: userData } = await supabase.auth.getUser(token);
          if (userData?.user) {
            const { data: citizen } = await supabase
              .from('citizens')
              .select('id, first_name, last_name, phone')
              .eq('auth_uid', userData.user.id)
              .single();
            if (citizen) {
              citizenId = citizen.id;
              citizenName = `${citizen.first_name} ${citizen.last_name}`;
              citizenPhone = citizen.phone;
            }
          }
        }
      } else {
        try {
          const decoded = Buffer.from(token, 'base64').toString('utf-8');
          const id = decoded.split(':')[0];
          const citizen = await db.citizen.findUnique({
            where: { id },
            select: { id: true, firstName: true, lastName: true, phone: true },
          });
          if (citizen) {
            citizenId = citizen.id;
            citizenName = `${citizen.firstName} ${citizen.lastName}`;
            citizenPhone = citizen.phone;
          }
        } catch {
          // Citoyen non authentifié - on accepte quand même l'alerte (anonyme)
        }
      }
    }

    // Déterminer le commissariat
    let finalCommissariatId = commissariatId;
    if (!finalCommissariatId) {
      finalCommissariatId = await findNearestCommissariat(latitude, longitude);
    }
    if (!finalCommissariatId) {
      return NextResponse.json(
        { error: 'Aucun commissariat disponible' },
        { status: 500 }
      );
    }

    // Priorité par défaut selon le type
    const finalPriority =
      priority && VALID_PRIORITIES.includes(priority)
        ? priority
        : type === 'agression' || type === 'incendie'
        ? 'urgente'
        : 'haute';

    // Créer l'alerte
    const alert = await alertsRepository.create({
      type,
      priority: finalPriority,
      description,
      location,
      latitude: latitude ?? null,
      longitude: longitude ?? null,
      citizenName,
      citizenPhone,
      citizenId,
      commissariatId: finalCommissariatId,
    });

    return NextResponse.json(
      {
        message: 'Alerte reçue par le Centre de Commandement PNC',
        alert,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Mobile alerts POST error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi de l\'alerte: ' + (error?.message || 'erreur inconnue') },
      { status: 500 }
    );
  }
}
