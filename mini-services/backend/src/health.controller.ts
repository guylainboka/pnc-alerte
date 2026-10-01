// ============================================================================
// Health Controller — GET /api/health, GET /
// ============================================================================
// Permet de vérifier que le backend est bien démarré (utile pour les
// healthchecks Kubernetes / monitoring interne).
// ============================================================================

import { Controller, Get, Logger } from '@nestjs/common';
import { query } from './common/database/pg.client';

/** Port d'écoute — lu depuis l'env (défaut 3001). */
function getPort(): number {
  const raw = process.env.PORT;
  const parsed = raw ? parseInt(raw, 10) : 3001;
  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 65535) {
    return 3001;
  }
  return parsed;
}

@Controller()
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  /** GET / — page d'accueil du backend (informative) */
  @Get()
  async root() {
    return {
      name: 'PNC Command Center — Backend',
      version: '1.0.0',
      port: getPort(),
      status: 'running',
      docs: '/api/health, /api/sos, /api/alerts, /api/citizens, /api/complaints, /api/disparus, /api/map/*, /api/auth/login',
    };
  }

  /** GET /api/health — healthcheck détaillé */
  @Get('api/health')
  async health() {
    try {
      const rows = await query('SELECT 1 as ok');
      const dbOk = rows.length === 1;
      return {
        status: dbOk ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        database: dbOk ? 'connected' : 'disconnected',
        service: 'pnc-backend',
        port: getPort(),
      };
    } catch (err: unknown) {
      // On log le détail côté serveur, mais on renvoie un message générique
      // au client pour éviter de leak du SQL / des noms de tables.
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Health DB check failed: ${message}`);
      return {
        status: 'degraded',
        error: 'database unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
