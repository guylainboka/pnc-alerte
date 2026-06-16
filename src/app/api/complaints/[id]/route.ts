import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const complaint = await db.complaint.findUnique({
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
        reviewedBy: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true, phone: true, email: true },
        },
      },
    });

    if (!complaint) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Complaint GET by ID error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaint' },
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

    const existing = await db.complaint.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Complaint not found' }, { status: 404 });
    }

    const allowedFields = ['status', 'reviewedById', 'reviewNotes', 'type', 'description', 'caseId'];
    const data: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        data[field] = body[field];
      }
    }

    const complaint = await db.complaint.update({
      where: { id },
      data,
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true, rank: true, matricule: true } },
      },
    });

    return NextResponse.json(complaint);
  } catch (error) {
    console.error('Complaint PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update complaint' },
      { status: 500 }
    );
  }
}
