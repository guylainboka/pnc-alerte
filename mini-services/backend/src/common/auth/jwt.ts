// ============================================================================
// JWT helpers — utilitaires partagés entre le AuthService et les gateways
// ============================================================================
// Centralise la récupération du secret JWT (avec fallback éphémère + warn)
// et la vérification d'un token. Utilisé par :
//  - src/modules/auth/auth.service.ts (sign + verify)
//  - src/common/guards/jwt-auth.guard.ts (verify sur routes REST)
//  - src/modules/sos/sos.gateway.ts et src/modules/alerts/alerts.gateway.ts
//    (verify sur les connexions Socket.io)
// ============================================================================

import jwt from 'jsonwebtoken';
import { Logger } from '@nestjs/common';

export interface JwtUserData {
  sub: string;
  username: string;
  role: string;
}

let warnedAboutMissingSecret = false;
let cachedFallbackSecret: string | null = null;

/**
 * Récupère la clé secrète JWT. Si JWT_SECRET n'est pas défini dans l'env,
 * on génère une chaîne aléatoire éphémère **une seule fois** (mise en cache
 * pour la durée du process) pour que le backend puisse démarrer, et on log
 * un warning (une fois).
 *
 * ATTENTION : en production JWT_SECRET doit absolument être défini via env.
 * Le fallback n'existe que pour le dev local sans configuration. Avec le
 * fallback, un redémarrage du backend invalide tous les tokens émis, et la
 * clé n'est pas partagée entre instances.
 */
export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.trim().length >= 32) {
    return secret.trim();
  }
  if (!warnedAboutMissingSecret) {
    Logger.warn(
      'JWT_SECRET absent ou < 32 chars — utilisation d\'une clé éphémère. ' +
        'Définir JWT_SECRET dans l\'environnement pour la production.',
      'JWT',
    );
    warnedAboutMissingSecret = true;
  }
  if (cachedFallbackSecret === null) {
    const generated =
      process.cwd().length.toString(36).padStart(8, '0') +
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2) +
      Math.random().toString(36).slice(2);
    cachedFallbackSecret = generated.padEnd(64, 'x').slice(0, 64);
  }
  return cachedFallbackSecret;
}

/**
 * Vérifie un token JWT signé avec le secret partagé.
 * Retourne `{ sub, username, role }` si valide, sinon `null`.
 */
export function verifyJwt(token: string): JwtUserData | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as Record<string, unknown>;
    const sub = typeof decoded.sub === 'string' ? decoded.sub : '';
    const username = typeof decoded.username === 'string' ? decoded.username : '';
    const role = typeof decoded.role === 'string' ? decoded.role : '';
    if (!sub || !username) return null;
    return { sub, username, role };
  } catch {
    return null;
  }
}
