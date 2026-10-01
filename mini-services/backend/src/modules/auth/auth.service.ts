// ============================================================================
// Auth Service — Authentification du centre de commandement PNC
// ============================================================================
// Vérifie les credentials contre la table `users_pnc`. Le mot de passe est
// haché avec bcrypt (sel 10 tours). Le token retourné est un vrai JWT signé
// avec `JWT_SECRET` (env var) ; durée de validité configurable via
// `JWT_EXPIRES_IN` (24h par défaut).
// ============================================================================

import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { queryOne, exec } from '../../common/database/pg.client';
import { getJwtSecret, verifyJwt } from '../../common/auth/jwt';

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

interface UserRow {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  phone: string | null;
  officer_id: string | null;
  commissariat_id: string | null;
  is_active: boolean;
}

/**
 * Vérifie un mot de passe en clair contre un hash bcrypt. Constant-time côté
 * bcrypt ; résistant au timing attack. Synchrone car bcryptjs expose
 * `compareSync` — plus simple à utiliser dans un guard synchrone.
 */
function verifyPassword(plain: string, hash: string): boolean {
  if (!hash || typeof hash !== 'string') return false;
  // Bcrypt génère toujours un hash commençant par $2a$ / $2b$ / $2y$.
  if (!/^\$2[abxy]\$\d{2}\$/.test(hash)) return false;
  try {
    return bcrypt.compareSync(plain, hash);
  } catch {
    return false;
  }
}

/**
 * Génère un JWT signé avec JWT_SECRET. Le payload contient
 * `{ sub: userId, username, role }` ; l'expiration est lue de
 * `JWT_EXPIRES_IN` (défaut 24h).
 */
function makeToken(userId: string, username: string, role: string): string {
  const payload = { sub: userId, username, role };
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';
  // `expiresIn` est lu depuis l'env ; on le cast vers le type attendu par
  // jsonwebtoken (StringValue de `ms`). En pratique, "24h" / "7d" / "3600"
  // sont acceptés.
  return jwt.sign(payload, getJwtSecret(), {
    expiresIn: expiresIn as unknown as jwt.SignOptions['expiresIn'],
  });
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  async login(payload: LoginPayload): Promise<AuthenticatedUser> {
    const { username, password } = payload;
    if (!username || !password) {
      throw new HttpException(
        'Username et password sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }

    const row = await queryOne<UserRow>(
      `SELECT id, username, email, password_hash, first_name, last_name,
              role, phone, officer_id, commissariat_id, is_active
       FROM users_pnc WHERE username = $1 LIMIT 1`,
      [username],
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
      [row.id],
    );

    const accessToken = makeToken(row.id, row.username, row.role);
    this.logger.log(`Connexion réussie — user=${row.username} role=${row.role}`);

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
      accessToken,
    };
  }

  /**
   * Vérifie un token JWT côté serveur (utilisé par les gateways Socket.io).
   * Délègue à la fonction partagée `verifyJwt` du module common/auth.
   * Retourne le payload si valide, sinon null.
   */
  verifyToken(token: string): { sub: string; username: string; role: string } | null {
    return verifyJwt(token);
  }
}
