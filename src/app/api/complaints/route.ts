import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const complaints = await db.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        commissariat: {
          select: { id: true, name: true, code: true },
        },
        reviewedBy: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true },
        },
      },
    });

    return NextResponse.json(complaints);
  } catch (error) {
    console.error('Complaints GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complaints' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      type,
      description,
      location,
      plaintiffName,
      plaintiffPhone,
      plaintiffEmail,
      plaintiffAddr,
      commissariatId,
    } = body;

    if (!type || !description || !plaintiffName || !plaintiffPhone || !commissariatId) {
      return NextResponse.json(
        { error: 'Missing required fields: type, description, plaintiffName, plaintiffPhone, commissariatId' },
        { status: 400 }
      );
    }

    // Auto-generate reference
    const year = new Date().getFullYear();
    const lastComplaint = await db.complaint.findFirst({
      where: { reference: { startsWith: `PLT-${year}-` } },
      orderBy: { reference: 'desc' },
    });
    let nextNum = 1;
    if (lastComplaint) {
      const parts = lastComplaint.reference.split('-');
      nextNum = parseInt(parts[2], 10) + 1;
    }
    const reference = `PLT-${year}-${String(nextNum).padStart(3, '0')}`;

    const complaint = await db.complaint.create({
      data: {
        reference,
        type,
        status: 'soumise',
        description,
        location: location ?? null,
        plaintiffName,
        plaintiffPhone,
        plaintiffEmail: plaintiffEmail ?? null,
        plaintiffAddr: plaintiffAddr ?? null,
        commissariatId,
      },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true, rank: true, matricule: true } },
      },
    });

    return NextResponse.json(complaint, { status: 201 });
  } catch (error) {
    console.error('Complaints POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create complaint' },
      { status: 500 }
    );
  }
}
