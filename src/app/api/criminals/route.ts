import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const dangerLevel = searchParams.get('dangerLevel');

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (dangerLevel) where.dangerLevel = dangerLevel;

    const criminals = await db.criminal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        cases: {
          include: {
            case: {
              select: {
                id: true,
                reference: true,
                title: true,
                status: true,
                type: true,
              },
            },
          },
        },
        evidence: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(criminals);
  } catch (error) {
    console.error('Criminals GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch criminals' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName, lastName, alias, dateOfBirth, gender, nationality, idNumber,
      photo, physicalDesc, height, weight, eyeColor, hairColor, scars, tattoos,
      status, dangerLevel, lastKnownAddr, lastLatitude, lastLongitude,
      lastSeenAt, lastSeenLocation, criminalHistory, knownAssociates,
      modusOperandi, warrantStatus, warrantIssuedAt, notes,
    } = body;

    if (!firstName || !lastName || !dangerLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: firstName, lastName, dangerLevel' },
        { status: 400 }
      );
    }

    // Auto-generate reference
    const year = new Date().getFullYear();
    const lastCriminal = await db.criminal.findFirst({
      where: { reference: { startsWith: `CRIM-${year}-` } },
      orderBy: { reference: 'desc' },
    });
    let nextNum = 1;
    if (lastCriminal) {
      const parts = lastCriminal.reference.split('-');
      nextNum = parseInt(parts[2], 10) + 1;
    }
    const reference = `CRIM-${year}-${String(nextNum).padStart(3, '0')}`;

    const criminal = await db.criminal.create({
      data: {
        reference, firstName, lastName,
        alias: alias ?? null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender: gender ?? null,
        nationality: nationality ?? null,
        idNumber: idNumber ?? null,
        photo: photo ?? null,
        physicalDesc: physicalDesc ?? null,
        height: height ?? null,
        weight: weight ?? null,
        eyeColor: eyeColor ?? null,
        hairColor: hairColor ?? null,
        scars: scars ?? null,
        tattoos: tattoos ?? null,
        status: status ?? 'recherche',
        dangerLevel,
        lastKnownAddr: lastKnownAddr ?? null,
        lastLatitude: lastLatitude ?? null,
        lastLongitude: lastLongitude ?? null,
        lastSeenAt: lastSeenAt ? new Date(lastSeenAt) : null,
        lastSeenLocation: lastSeenLocation ?? null,
        criminalHistory: criminalHistory ?? null,
        knownAssociates: knownAssociates ?? null,
        modusOperandi: modusOperandi ?? null,
        warrantStatus: warrantStatus ?? null,
        warrantIssuedAt: warrantIssuedAt ? new Date(warrantIssuedAt) : null,
        notes: notes ?? null,
      },
    });

    return NextResponse.json(criminal, { status: 201 });
  } catch (error) {
    console.error('Criminals POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create criminal' },
      { status: 500 }
    );
  }
}
