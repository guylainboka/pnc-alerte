/**
 * API Personnes Disparues
 * ============================================================
 * GET  /api/disparus          → liste tous les signalements (?status=recherche pour filtrer)
 * POST /api/disparus          → crée un signalement (généralement depuis l'app mobile,
 *                               mais le centre peut aussi en créer pour un citoyen en appel)
 *
 * Source de données : table `personnes_disparues` (Supabase partagé avec l'app mobile)
 */

import { NextResponse } from 'next/server';
import { personnesDisparuesRepository } from '@/lib/repositories';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const disparus = await personnesDisparuesRepository.findMany({ status });
    return NextResponse.json(disparus);
  } catch (error: any) {
    console.error('GET /api/disparus error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des personnes disparues' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.nomComplet) {
      return NextResponse.json({ error: 'Le nom complet est requis' }, { status: 400 });
    }
    const created = await personnesDisparuesRepository.create({
      nomComplet: body.nomComplet,
      age: body.age ?? null,
      sexe: body.sexe ?? null,
      description: body.description ?? null,
      derniereVueLieu: body.derniereVueLieu ?? null,
      derniereVueDate: body.derniereVueDate ?? null,
      photoUrl: body.photoUrl ?? null,
      contactTelephone: body.contactTelephone ?? null,
      userId: body.userId ?? null,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('POST /api/disparus error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la création du signalement' },
      { status: 500 }
    );
  }
}
