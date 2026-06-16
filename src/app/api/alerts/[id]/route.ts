import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const alert = await db.alert.findUnique({
      where: { id },
      include: {
        commissariat: {
          select: { id: true, name: true, code: true, address: true, phone: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true, phone: true, email: true },
        },
      },
    });

    if (!alert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Alert GET by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert' },
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

    const existing = await db.alert.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const allowedFields = ['status', 'assignedToId', 'priority', 'responseTime', 'type', 'description', 'location', 'latitude', 'longitude'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const alert = await db.alert.update({
      where: { id },
      data,
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, rank: true, matricule: true } },
      },
    });

    return NextResponse.json(alert);
  } catch (error) {
    console.error('Alert PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update alert' },
      { status: 500 }
    );
  }
}
