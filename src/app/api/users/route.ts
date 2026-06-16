import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const isActive = searchParams.get('isActive');

    const where: Record<string, unknown> = {};
    if (role) where.role = role;
    if (isActive === 'true') where.isActive = true;
    if (isActive === 'false') where.isActive = false;

    const users = await db.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        officerId: true,
        createdAt: true,
        updatedAt: true,
        officer: {
          select: {
            id: true,
            matricule: true,
            rank: true,
            commissariat: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Users GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

function hashPassword(password: string): string {
  return `hash_${Buffer.from(password).toString('base64')}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, firstName, lastName, role, phone, officerId } = body;

    if (!username || !email || !password || !firstName || !lastName || !role) {
      return NextResponse.json(
        { error: 'Champs requis: username, email, password, firstName, lastName, role' },
        { status: 400 }
      );
    }

    // Check if username or email already exists
    const existing = await db.user.findFirst({
      where: { OR: [{ username }, { email }] },
    });
    if (existing) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur ou email déjà utilisé' },
        { status: 409 }
      );
    }

    const user = await db.user.create({
      data: {
        username,
        email,
        passwordHash: hashPassword(password),
        firstName,
        lastName,
        role,
        phone: phone ?? null,
        officerId: officerId ?? null,
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error('Users POST error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
