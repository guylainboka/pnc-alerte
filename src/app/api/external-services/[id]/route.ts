import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const service = await db.externalService.findUnique({
      where: { id },
      include: {
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!service) {
      return NextResponse.json({ error: 'External service not found' }, { status: 404 });
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error('External Service GET by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch external service' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await db.externalService.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'External service not found' }, { status: 404 });
    }

    const allowedFields = ['status', 'name', 'type', 'endpoint', 'apiKey', 'description', 'lastSyncAt'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }
    // Convert lastSyncAt string to Date if provided
    if (data.lastSyncAt && typeof data.lastSyncAt === 'string') {
      data.lastSyncAt = new Date(data.lastSyncAt as string);
    }

    const service = await db.externalService.update({
      where: { id },
      data,
      include: {
        logs: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error('External Service PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update external service' },
      { status: 500 }
    );
  }
}
