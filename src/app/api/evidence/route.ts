import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const criminalId = searchParams.get('criminalId');
    const type = searchParams.get('type');

    const where: Record<string, string> = {};
    if (criminalId) where.criminalId = criminalId;
    if (type) where.type = type;

    const evidence = await db.evidence.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        criminal: {
          select: { id: true, firstName: true, lastName: true, reference: true },
        },
      },
    });

    return NextResponse.json(evidence);
  } catch (error) {
    console.error('Evidence GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch evidence' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      criminalId, type, title, description, fileUrl, fileName, fileSize,
      collectedAt, collectedBy, caseId,
    } = body;

    if (!criminalId || !type || !title || !fileUrl) {
      return NextResponse.json(
        { error: 'Champs requis: criminalId, type, title, fileUrl' },
        { status: 400 }
      );
    }

    const evidence = await db.evidence.create({
      data: {
        criminalId,
        type,
        title,
        description: description ?? null,
        fileUrl,
        fileName: fileName ?? null,
        fileSize: fileSize ?? null,
        collectedAt: collectedAt ? new Date(collectedAt) : null,
        collectedBy: collectedBy ?? null,
        caseId: caseId ?? null,
      },
    });

    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    console.error('Evidence POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create evidence' },
      { status: 500 }
    );
  }
}
