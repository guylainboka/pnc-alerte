// ============================================================================
// App Module — Module racine NestJS
// ============================================================================
// Regroupe tous les modules métier : SOS, Alerts, Citizens, Complaints,
// Disparus, Map, Auth. Le module Realtime importe les gateways (SosGateway,
// AlertsGateway) et les branche sur le serveur Socket.io au démarrage.
// ThrottlerModule fournit le guard de limitation de débit (appliqué
// ponctuellement sur /api/auth/login).
// ============================================================================

import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { RealtimeModule } from './common/realtime/realtime.module';
import { SosModule } from './modules/sos/sos.module';
import { AlertsModule } from './modules/alerts/alerts.module';
import { CitizensModule } from './modules/citizens/citizens.module';
import { ComplaintsModule } from './modules/complaints/complaints.module';
import { DisparusModule } from './modules/disparus/disparus.module';
import { MapModule } from './modules/map/map.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    // Throttler global — par défaut très permissif (1000 req / 15 min / IP)
    // pour fournir un anti-DoS minimal sans casser l'usage normal.
    // Les routes sensibles (login) override avec @Throttle({ default: ... }).
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 900000, // 15 min en ms
        limit: 1000,
      },
    ]),
    RealtimeModule, // gateways Socket.io (sos + alerts)
    SosModule,
    AlertsModule,
    CitizensModule,
    ComplaintsModule,
    DisparusModule,
    MapModule,
    AuthModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
