import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Simple password verification (in production use bcrypt)
function verifyPassword(password: string, hash: string): boolean {
  const expected = `hash_${Buffer.from(password).toString('base64')}`;
  return hash === expected;
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Nom d\'utilisateur et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { username },
      include: {
        officer: {
          include: {
            commissariat: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'Utilisateur introuvable ou inactif' },
        { status: 401 }
      );
    }

    if (!verifyPassword(password, user.passwordHash)) {
      return NextResponse.json(
        { error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Update last login
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Don't return password hash
    const { passwordHash, ...userWithoutPassword } = user;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'Connexion réussie',
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la connexion' },
      { status: 500 }
    );
  }
}
