import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const services = await db.externalService.findMany({
      orderBy: { name: 'asc' },
      // select: omet apiKey — les clés API ne doivent jamais être exposées
      // via l'API REST, même aux opérateurs PNC authentifiés. La lecture
      // des clés doit passer par un endpoint dédié à accès admin uniquement.
      select: {
        id: true,
        name: true,
        type: true,
        endpoint: true,
        status: true,
        lastSyncAt: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        logs: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(services);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('External Services GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external services' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, endpoint, apiKey, status, description } = body;

    if (!name || !type || !endpoint) {
      return NextResponse.json(
        { error: 'Missing required fields: name, type, endpoint' },
        { status: 400 }
      );
    }

    const service = await db.externalService.create({
      data: {
        name,
        type,
        endpoint,
        apiKey: apiKey ?? null,
        status: status ?? 'inactif',
        description: description ?? null,
      },
      // select: omet apiKey de la réponse de création
      select: {
        id: true, name: true, type: true, endpoint: true,
        status: true, lastSyncAt: true, description: true,
        createdAt: true, updatedAt: true,
        logs: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('External Services POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create external service' },
      { status: 500 }
    );
  }
}
