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
      include: {
        commissariat: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(citizens);
  } catch (error) {
    console.error('Citizens GET error:', error);
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
    });

    return NextResponse.json(citizen, { status: 201 });
  } catch (error) {
    console.error('Citizens POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create citizen' },
      { status: 500 }
    );
  }
}
