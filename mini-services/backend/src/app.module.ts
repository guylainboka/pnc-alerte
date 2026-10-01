// ============================================================================
// App Module — Module racine NestJS
// ============================================================================
// Regroupe tous les modules métier : SOS, Alerts, Citizens, Complaints,
// Disparus, Map, Auth. Le module Realtime importe les gateways (SosGateway,
// AlertsGateway) et les branche sur le serveur Socket.io au démarrage.
// ============================================================================

import { Module } from '@nestjs/common';
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
