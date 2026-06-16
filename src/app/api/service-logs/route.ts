import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceId = searchParams.get('serviceId');
    const status = searchParams.get('status');
    const direction = searchParams.get('direction');

    const where: Record<string, string> = {};
    if (serviceId) where.serviceId = serviceId;
    if (status) where.status = status;
    if (direction) where.direction = direction;

    const logs = await db.serviceLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        service: {
          select: { id: true, name: true, type: true, status: true },
        },
      },
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Service Logs GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch service logs' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { serviceId, direction, messageType, content, status, errorMessage } = body;

    if (!serviceId || !direction || !messageType || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: serviceId, direction, messageType, content' },
        { status: 400 }
      );
    }

    // Verify service exists
    const service = await db.externalService.findUnique({ where: { id: serviceId } });
    if (!service) {
      return NextResponse.json({ error: 'External service not found' }, { status: 404 });
    }

    const log = await db.serviceLog.create({
      data: {
        serviceId,
        direction,
        messageType,
        content,
        status: status ?? 'en_attente',
        errorMessage: errorMessage ?? null,
      },
      include: {
        service: {
          select: { id: true, name: true, type: true, status: true },
        },
      },
    });

    return NextResponse.json(log, { status: 201 });
  } catch (error) {
    console.error('Service Logs POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create service log' },
      { status: 500 }
    );
  }
}
