import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const citizen = await db.citizen.findUnique({
      where: { id },
      include: {
        commissariat: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    if (!citizen) {
      return NextResponse.json(
        { error: 'Citizen not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(citizen);
  } catch (error) {
    console.error('Citizen GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch citizen' },
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
    const { status, verified, latitude, longitude, lastLocation } = body;

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (verified !== undefined) updateData.verified = verified;
    if (latitude !== undefined) updateData.latitude = latitude;
    if (longitude !== undefined) updateData.longitude = longitude;
    if (lastLocation) {
      updateData.lastLocation = lastLocation;
      updateData.lastLocationAt = new Date();
    }

    const citizen = await db.citizen.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(citizen);
  } catch (error) {
    console.error('Citizen PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update citizen' },
      { status: 500 }
    );
  }
}
