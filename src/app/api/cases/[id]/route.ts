import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const caseRecord = await db.case.findUnique({
      where: { id },
      include: {
        commissariat: {
          include: {
            sousDistrict: {
              include: {
                district: {
                  include: { province: true },
                },
              },
            },
          },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true, phone: true, email: true },
        },
        criminals: {
          include: {
            criminal: true,
          },
        },
      },
    });

    if (!caseRecord) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    return NextResponse.json(caseRecord);
  } catch (error) {
    console.error('Case GET by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch case' },
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

    const existing = await db.case.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Case not found' }, { status: 404 });
    }

    const allowedFields = ['status', 'assignedToId', 'priority', 'title', 'type', 'description', 'location', 'incidentDate'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }
    // Convert incidentDate string to Date if provided
    if (data.incidentDate && typeof data.incidentDate === 'string') {
      data.incidentDate = new Date(data.incidentDate as string);
    }

    const caseRecord = await db.case.update({
      where: { id },
      data,
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, rank: true, matricule: true } },
        criminals: {
          include: {
            criminal: { select: { id: true, firstName: true, lastName: true, alias: true, status: true, dangerLevel: true } },
          },
        },
      },
    });

    return NextResponse.json(caseRecord);
  } catch (error) {
    console.error('Case PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update case' },
      { status: 500 }
    );
  }
}
