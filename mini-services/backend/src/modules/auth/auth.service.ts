// ============================================================================
// Auth Service — Authentification simple pour le web (centre de commandement)
// ============================================================================
// Vérifie les credentials contre la table `users_pnc`. Le mot de passe est
// stocké sous la forme `hash_<base64(password)>`. En production, on utiliserait
// bcrypt ou argon2. Le token retourné est un token "faux JWT" : base64 de
// `userId:timestamp`. C'est suffisant pour le dev et l'intégration frontend.
// ============================================================================

import { Injectable } from '@nestjs/common';
import { HttpException, HttpStatus } from '@nestjs/common';
import { queryOne, exec } from '../../common/database/pg.client';

export interface LoginPayload {
  username: string;
  password: string;
}

export interface AuthenticatedUser {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  commissariatId: string | null;
  officerId: string | null;
  isActive: boolean;
  accessToken: string;
}

function verifyPassword(plain: string, hash: string): boolean {
  if (!hash.startsWith('hash_')) return false;
  const expected = Buffer.from(hash.slice(5), 'base64').toString('utf8');
  return plain === expected;
}

function makeToken(userId: string): string {
  // Token "faux JWT" : base64("userId:timestamp")
  const payload = `${userId}:${Date.now()}`;
  return Buffer.from(payload, 'utf8').toString('base64');
}

@Injectable()
export class AuthService {
  async login(payload: LoginPayload): Promise<AuthenticatedUser> {
    const { username, password } = payload;
    if (!username || !password) {
      throw new HttpException(
        'Username et password sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }

    const row = await queryOne<any>(
      `SELECT * FROM users_pnc WHERE username = $1 LIMIT 1`,
      [username]
    );

    if (!row) {
      throw new HttpException(
        'Utilisateur introuvable',
        HttpStatus.UNAUTHORIZED,
      );
    }

    if (!row.is_active) {
      throw new HttpException(
        "Compte désactivé. Contactez l'administrateur.",
        HttpStatus.FORBIDDEN,
      );
    }

    if (!verifyPassword(password, row.password_hash)) {
      throw new HttpException(
        'Mot de passe incorrect',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Mettre à jour last_login_at
    await exec(
      `UPDATE users_pnc SET last_login_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
      [row.id]
    );

    return {
      id: row.id,
      username: row.username,
      email: row.email,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      phone: row.phone ?? null,
      commissariatId: row.commissariat_id ?? null,
      officerId: row.officer_id ?? null,
      isActive: row.is_active,
      accessToken: makeToken(row.id),
    };
  }
}
