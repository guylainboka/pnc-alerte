import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const stations = await db.commissariat.findMany({
      orderBy: { name: 'asc' },
      include: {
        sousDistrict: {
          include: {
            district: {
              include: {
                province: true,
              },
            },
          },
        },
        _count: {
          select: { officers: true },
        },
      },
    });

    const formatted = stations.map((station) => ({
      id: station.id,
      name: station.name,
      code: station.code,
      address: station.address,
      phone: station.phone,
      sousDistrict: station.sousDistrict
        ? {
            id: station.sousDistrict.id,
            name: station.sousDistrict.name,
            code: station.sousDistrict.code,
            district: station.sousDistrict.district
              ? {
                  id: station.sousDistrict.district.id,
                  name: station.sousDistrict.district.name,
                  code: station.sousDistrict.district.code,
                  province: station.sousDistrict.district.province
                    ? {
                        id: station.sousDistrict.district.province.id,
                        name: station.sousDistrict.district.province.name,
                        code: station.sousDistrict.district.province.code,
                      }
                    : null,
                }
              : null,
          }
        : null,
      officerCount: station._count.officers,
      createdAt: station.createdAt,
      updatedAt: station.updatedAt,
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    console.error('Stations GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations' },
      { status: 500 }
    );
  }
}
