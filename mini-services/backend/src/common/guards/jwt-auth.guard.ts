// ============================================================================
// JwtAuthGuard — Vérifie un Bearer JWT signé sur toutes les routes protégées
// ============================================================================
// Extrait le token depuis l'en-tête HTTP `Authorization: Bearer <token>`,
// le vérifie avec `jwt.verify()` et la clé JWT_SECRET, puis attache
// `{ id, sub, username, role }` à `req.user`. Toute erreur (header manquant,
// token invalide, expiré) renvoie un 401 Unauthorized.
// ============================================================================

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { verifyJwt, type JwtUserData } from '../auth/jwt';

export type AuthenticatedUser = JwtUserData;

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const authHeader = request.headers['authorization'];
    if (!authHeader || typeof authHeader !== 'string') {
      throw new UnauthorizedException('Token d\'authentification manquant');
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      throw new UnauthorizedException(
        'Format d\'autorisation invalide (attendu : Bearer <token>)',
      );
    }

    const token = parts[1];
    if (!token) {
      throw new UnauthorizedException('Token vide');
    }

    const payload = verifyJwt(token);
    if (!payload) {
      this.logger.warn('JWT rejeté (signature invalide, expiré, ou malformé)');
      throw new UnauthorizedException('Token invalide ou expiré');
    }

    request.user = {
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
    };

    return true;
  }
}
