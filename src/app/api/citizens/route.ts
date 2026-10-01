import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const verified = searchParams.get('verified');
    const commissariatId = searchParams.get('commissariatId');

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (verified === 'true') where.verified = true;
    if (verified === 'false') where.verified = false;
    if (commissariatId) where.commissariatId = commissariatId;

    const citizens = await db.citizen.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      // select: omet passwordHash pour éviter la fuite de données sensibles.
      // Toute nouvelle colonne ajoutée au modèle Citizen devra être listée ici
      // explicitement — c'est la defence en profondeur (pas de fuite par défaut).
      select: {
        id: true,
        reference: true,
        firstName: true,
        lastName: true,
        phone: true,
        email: true,
        gender: true,
        dateOfBirth: true,
        address: true,
        city: true,
        commune: true,
        latitude: true,
        longitude: true,
        lastLocation: true,
        lastLocationAt: true,
        status: true,
        verified: true,
        totalAlerts: true,
        totalComplaints: true,
        commissariatId: true,
        createdAt: true,
        updatedAt: true,
        commissariat: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(citizens);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Citizens GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch citizens' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      phone,
      email,
      gender,
      dateOfBirth,
      address,
      city,
      commune,
      latitude,
      longitude,
      lastLocation,
      commissariatId,
    } = body;

    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Champs requis: firstName, lastName, phone' },
        { status: 400 }
      );
    }

    // Auto-generate reference
    const year = new Date().getFullYear();
    const lastCitizen = await db.citizen.findFirst({
      where: { reference: { startsWith: `CIT-${year}-` } },
      orderBy: { reference: 'desc' },
    });
    let nextNum = 1;
    if (lastCitizen) {
      const parts = lastCitizen.reference.split('-');
      nextNum = parseInt(parts[2], 10) + 1;
    }
    const reference = `CIT-${year}-${String(nextNum).padStart(3, '0')}`;

    // select: omet passwordHash (les mots de passe hachés ne doivent jamais
    // quitter le serveur, même pour les opérateurs PNC authentifiés).
    const citizen = await db.citizen.create({
      data: {
        reference,
        firstName,
        lastName,
        phone,
        email: email ?? null,
        gender: gender ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        address: address ?? null,
        city: city ?? null,
        commune: commune ?? null,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        lastLocation: lastLocation ?? null,
        lastLocationAt: new Date(),
        commissariatId: commissariatId ?? null,
      },
      select: {
        id: true, reference: true, firstName: true, lastName: true,
        phone: true, email: true, gender: true, dateOfBirth: true,
        address: true, city: true, commune: true, latitude: true,
        longitude: true, lastLocation: true, lastLocationAt: true,
        status: true, verified: true, totalAlerts: true, totalComplaints: true,
        commissariatId: true, createdAt: true, updatedAt: true,
        commissariat: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json(citizen, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Citizens POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create citizen' },
      { status: 500 }
    );
  }
}
