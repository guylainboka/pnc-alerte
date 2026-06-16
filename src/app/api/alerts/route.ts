import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    const type = searchParams.get('type');

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (type) where.type = type;

    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        commissariat: {
          select: { id: true, name: true, code: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true },
        },
      },
    });

    return NextResponse.json(alerts);
  } catch (error) {
    console.error('Alerts GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      priority,
      description,
      location,
      latitude,
      longitude,
      citizenName,
      citizenPhone,
      commissariatId,
      assignedToId,
    } = body;

    if (!type || !priority || !description || !location || !commissariatId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, priority, description, location, commissariatId' },
        { status: 400 }
      );
    }

    // Auto-generate reference
    const year = new Date().getFullYear();
    const lastAlert = await db.alert.findFirst({
      where: { reference: { startsWith: `ALT-${year}-` } },
      orderBy: { reference: 'desc' },
    });
    let nextNum = 1;
    if (lastAlert) {
      const parts = lastAlert.reference.split('-');
      nextNum = parseInt(parts[2], 10) + 1;
    }
    const reference = `ALT-${year}-${String(nextNum).padStart(3, '0')}`;

    const alert = await db.alert.create({
      data: {
        reference,
        type,
        priority,
        status: 'recue',
        description,
        location,
        latitude: latitude ?? null,
        longitude: longitude ?? null,
        citizenName: citizenName ?? null,
        citizenPhone: citizenPhone ?? null,
        commissariatId,
        assignedToId: assignedToId ?? null,
      },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, rank: true, matricule: true } },
      },
    });

    return NextResponse.json(alert, { status: 201 });
  } catch (error) {
    console.error('Alerts POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    );
  }
}
