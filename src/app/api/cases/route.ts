import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');
    const priority = searchParams.get('priority');

    const where: Record<string, string> = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (priority) where.priority = priority;

    const cases = await db.case.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        commissariat: {
          select: { id: true, name: true, code: true },
        },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true },
        },
        criminals: {
          include: {
            criminal: {
              select: { id: true, firstName: true, lastName: true, alias: true, status: true, dangerLevel: true, reference: true },
            },
          },
        },
      },
    });

    return NextResponse.json(cases);
  } catch (error) {
    console.error('Cases GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cases' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      type,
      priority,
      description,
      location,
      incidentDate,
      commissariatId,
      assignedToId,
      criminalIds,
    } = body;

    if (!title || !type || !priority || !description || !commissariatId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, type, priority, description, commissariatId' },
        { status: 400 }
      );
    }

    // Auto-generate reference
    const year = new Date().getFullYear();
    const lastCase = await db.case.findFirst({
      where: { reference: { startsWith: `DOS-${year}-` } },
      orderBy: { reference: 'desc' },
    });
    let nextNum = 1;
    if (lastCase) {
      const parts = lastCase.reference.split('-');
      nextNum = parseInt(parts[2], 10) + 1;
    }
    const reference = `DOS-${year}-${String(nextNum).padStart(3, '0')}`;

    const caseRecord = await db.case.create({
      data: {
        reference,
        title,
        type,
        status: 'ouvert',
        priority,
        description,
        location: location ?? null,
        incidentDate: incidentDate ? new Date(incidentDate) : null,
        commissariatId,
        assignedToId: assignedToId ?? null,
        criminals: criminalIds
          ? {
              create: criminalIds.map((c: { criminalId: string; role: string }) => ({
                criminalId: c.criminalId,
                role: c.role ?? 'suspect',
              })),
            }
          : undefined,
      },
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

    return NextResponse.json(caseRecord, { status: 201 });
  } catch (error) {
    console.error('Cases POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create case' },
      { status: 500 }
    );
  }
}
