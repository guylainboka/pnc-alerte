import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const criminal = await db.criminal.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            case: {
              select: {
                id: true,
                reference: true,
                title: true,
                type: true,
                status: true,
                priority: true,
                createdAt: true,
              },
            },
          },
        },
      },
    });

    if (!criminal) {
      return NextResponse.json({ error: 'Criminal not found' }, { status: 404 });
    }

    return NextResponse.json(criminal);
  } catch (error) {
    console.error('Criminal GET by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch criminal' },
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

    const existing = await db.criminal.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Criminal not found' }, { status: 404 });
    }

    const allowedFields = [
      'firstName', 'lastName', 'alias', 'dateOfBirth', 'gender',
      'nationality', 'idNumber', 'photo', 'physicalDesc', 'status',
      'dangerLevel', 'lastKnownAddr',
    ];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }
    // Convert dateOfBirth string to Date if provided
    if (data.dateOfBirth && typeof data.dateOfBirth === 'string') {
      data.dateOfBirth = new Date(data.dateOfBirth as string);
    }

    const criminal = await db.criminal.update({
      where: { id },
      data,
      include: {
        cases: {
          include: {
            case: {
              select: { id: true, reference: true, title: true, type: true, status: true },
            },
          },
        },
      },
    });

    return NextResponse.json(criminal);
  } catch (error) {
    console.error('Criminal PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update criminal' },
      { status: 500 }
    );
  }
}
