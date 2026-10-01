/**
 * API SOS — Appels SOS en direct depuis l'application mobile
 * ============================================================
 * GET /api/sos          → liste tous les SOS (ou ?active=true pour les actifs)
 *
 * Ces appels sont envoyés en TEMPS RÉEL par les citoyens via le bouton SOS
 * de l'app mobile PNC Alerte. Ils atterrissent dans la table `sos_calls`
 * (shared Supabase) et remontent instantanément dans le dashboard grâce à
 * Supabase Realtime.
 */

import { NextResponse } from 'next/server';
import { sosRepository } from '@/lib/repositories';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('active') === 'true';
    const sos = await sosRepository.findMany({ activeOnly });
    return NextResponse.json(sos);
  } catch (error: any) {
    console.error('GET /api/sos error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération des SOS' },
      { status: 500 }
    );
  }
}
