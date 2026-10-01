// ============================================================================
// Health Controller — GET /api/health, GET /
// ============================================================================
// Permet de vérifier que le backend est bien démarré (utile pour les
// healthchecks et pour tester avec curl sans autre dépendance).
// ============================================================================

import { Controller, Get } from '@nestjs/common';
import { query } from './common/database/pg.client';

@Controller()
export class HealthController {
  /** GET / — page d'accueil du backend (informative) */
  @Get()
  async root() {
    return {
      name: 'PNC Command Center — Backend',
      version: '1.0.0',
      port: 3001,
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
        port: 3001,
      };
    } catch (err: any) {
      return {
        status: 'degraded',
        error: err?.message ?? 'unknown error',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
