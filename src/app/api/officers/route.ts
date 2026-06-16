import { db } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const commissariatId = searchParams.get('commissariatId');
    const rank = searchParams.get('rank');

    const where: Record<string, string> = {};
    if (commissariatId) where.commissariatId = commissariatId;
    if (rank) where.rank = rank;

    const officers = await db.officer.findMany({
      where,
      orderBy: { lastName: 'asc' },
      include: {
        commissariat: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(officers);
  } catch (error) {
    console.error('Officers GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch officers' },
      { status: 500 }
    );
  }
}
