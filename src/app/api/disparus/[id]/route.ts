/**
 * API Personne Disparue (détail)
 * ============================================================
 * GET   /api/disparus/[id]   → détail d'un signalement
 * PATCH /api/disparus/[id]   → mettre à jour le statut (recherche / retrouve / clture)
 */

import { NextResponse } from 'next/server';
import { personnesDisparuesRepository } from '@/lib/repositories';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const disparu = await personnesDisparuesRepository.findById(id);
    if (!disparu) {
      return NextResponse.json({ error: 'Signalement introuvable' }, { status: 404 });
    }
    return NextResponse.json(disparu);
  } catch (error: any) {
    console.error('GET /api/disparus/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    if (!body.status) {
      return NextResponse.json({ error: 'Le statut est requis' }, { status: 400 });
    }
    const updated = await personnesDisparuesRepository.updateStatus(id, body.status);
    if (!updated) {
      return NextResponse.json({ error: 'Signalement introuvable' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('PATCH /api/disparus/[id] error:', error);
    return NextResponse.json(
      { error: error.message || 'Erreur lors de la mise à jour' },
      { status: 500 }
    );
  }
}
