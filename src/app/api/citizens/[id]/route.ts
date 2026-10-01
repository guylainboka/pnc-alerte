import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    // select: omet passwordHash — les mots de passe hachés ne sortent jamais du serveur.
    const citizen = await db.citizen.findUnique({
      where: { id },
      select: {
        id: true, reference: true, firstName: true, lastName: true,
        phone: true, email: true, gender: true, dateOfBirth: true,
        address: true, city: true, commune: true, latitude: true,
        longitude: true, lastLocation: true, lastLocationAt: true,
        status: true, verified: true, totalAlerts: true, totalComplaints: true,
        commissariatId: true, createdAt: true, updatedAt: true,
        commissariat: { select: { id: true, name: true, code: true } },
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
    if (process.env.NODE_ENV !== 'production') console.error('Citizen GET error:', error);
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

    // select: omet passwordHash dans la réponse PATCH également.
    const citizen = await db.citizen.update({
      where: { id },
      data: updateData,
      select: {
        id: true, reference: true, firstName: true, lastName: true,
        phone: true, email: true, gender: true, dateOfBirth: true,
        address: true, city: true, commune: true, latitude: true,
        longitude: true, lastLocation: true, lastLocationAt: true,
        status: true, verified: true, totalAlerts: true, totalComplaints: true,
        commissariatId: true, createdAt: true, updatedAt: true,
        commissariat: { select: { id: true, name: true, code: true } },
      },
    });

    return NextResponse.json(citizen);
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') console.error('Citizen PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update citizen' },
      { status: 500 }
    );
  }
}
