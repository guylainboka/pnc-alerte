// ============================================================================
// Alerts Gateway — Diffusion temps réel des nouveaux signalements
// ============================================================================

import {
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import type { SignalementRecord } from './alerts.service';

@WebSocketGateway({
  namespace: '/',
  // Même logique que SosGateway : path par défaut "/socket.io/" pour ne pas
  // intercepter les routes REST /api/*.
  cors: { origin: '*', credentials: true, methods: ['GET', 'POST'] },
})
export class AlertsGateway {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AlertsGateway.name);

  broadcastNewAlert(alert: SignalementRecord) {
    if (!this.server) return;
    this.server.emit('alert:new', alert);
    this.logger.log(`📡 alert:new diffusé — ${alert.reference}`);
  }
}
