/**
 * API SOS/[id] — Mettre à jour le statut d'un appel SOS
 * ============================================================
 * PATCH /api/sos/[id]
 *   { status: 'en-route' | 'sur-place' | 'cloture' | 'annule',
 *     agentAssigned?: string, responseTimeSeconds?: number, notes?: string }
 *
 * Permet au centre de commandement d'indiquer qu'une patrouille est en route,
 * sur place, ou a clôturé l'intervention. Le citoyen est notifié via l'app
 * mobile (Realtime + notifications).
 */

import { NextResponse } from 'next/server';
import { sosRepository } from '@/lib/repositories';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, agentAssigned, responseTimeSeconds, notes } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Le champ "status" est requis' },
        { status: 400 }
      );
    }

    const updated = await sosRepository.updateStatus(id, status, {
      agentAssigned: agentAssigned ?? null,
      responseTimeSeconds: responseTimeSeconds ?? null,
      notes: notes ?? null,
    });

    if (!updated) {
      return NextResponse.json(
        { error: 'SOS introuvable ou mode local non supporté' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PATCH /api/sos/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour du SOS' },
      { status: 500 }
    );
  }
}
