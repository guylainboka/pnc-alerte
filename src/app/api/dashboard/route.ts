import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Alert counts by status
    const alertCountsRaw = await db.alert.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Case counts by status
    const caseCountsRaw = await db.case.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Criminal counts by status
    const criminalCountsRaw = await db.criminal.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Complaint counts by status
    const complaintCountsRaw = await db.complaint.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Recent alerts (last 10)
    const recentAlerts = await db.alert.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        assignedTo: { select: { id: true, firstName: true, lastName: true, rank: true, matricule: true } },
      },
    });

    // Recent cases (last 10)
    const recentCases = await db.case.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
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

    // Station count
    const stationCount = await db.commissariat.count();

    // Officer count
    const officerCount = await db.officer.count();

    // Citizen count
    const citizenCount = await db.citizen.count();
    const activeCitizens = await db.citizen.count({ where: { status: 'actif' } });

    // Helper to format counts
    const toCounts = (raw: Array<{ status: string; _count: { status: number } }>, keys: string[]) => {
      const map = Object.fromEntries(raw.map((item) => [item.status, item._count.status]));
      const result: Record<string, number> = {};
      let total = 0;
      for (const key of keys) {
        result[key] = map[key] || 0;
        total += result[key];
      }
      result.total = total;
      return result;
    };

    const alertCounts = toCounts(alertCountsRaw, ['recue', 'en_cours', 'traitee', 'cloturee']);
    const caseCounts = toCounts(caseCountsRaw, ['ouvert', 'en_enquete', 'en_instruction', 'jugement', 'cloture']);
    const criminalCounts = toCounts(criminalCountsRaw, ['recherche', 'incarcere', 'libre', 'sous_surveillance']);
    const complaintCounts = toCounts(complaintCountsRaw, ['soumise', 'en_revision', 'approuvee', 'rejetee', 'traitee']);

    return NextResponse.json({
      alertCounts,
      caseCounts,
      criminalCounts,
      complaintCounts,
      recentAlerts,
      recentCases,
      stationCount,
      officerCount,
      citizenCount,
      activeCitizens,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
