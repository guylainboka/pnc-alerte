// ============================================================================
// Alerts Gateway — Diffusion temps réel des nouveaux signalements (auth)
// ============================================================================
// Émet l'événement `alert:new` uniquement aux opérateurs authentifiés
// (room `operators`) — n'importe quel client non authentifié est déconnecté
// à la connexion, donc ne peut rejoindre la room ni recevoir le payload.
// ============================================================================

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { verifyJwt } from '../../common/auth/jwt';
import { OPERATORS_ROOM } from '../sos/sos.gateway';
import type { SignalementRecord } from './alerts.service';

@WebSocketGateway({
  namespace: '/',
  // Même logique que SosGateway : path par défaut "/socket.io/" pour ne pas
  // intercepter les routes REST /api/*.
  cors: {
    origin: (process.env.CORS_ORIGIN?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:81',
    ]).map((s) => s.trim()),
    credentials: true,
    methods: ['GET', 'POST'],
  },
})
export class AlertsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(AlertsGateway.name);

  /**
   * Authentifie le socket à la connexion. Si le token JWT est absent ou
   * invalide, le socket est déconnecté immédiatement.
   */
  handleConnection(client: Socket): void {
    const auth =
      (client.handshake.auth?.token as string | undefined) ??
      (client.handshake.headers?.authorization as string | undefined);

    if (!auth || typeof auth !== 'string' || auth.trim().length === 0) {
      this.logger.warn(
        `Connexion Socket.io refusée (sans token) — client=${client.id}`,
      );
      client.disconnect(true);
      return;
    }

    const token = auth.startsWith('Bearer ')
      ? auth.slice('Bearer '.length).trim()
      : auth.trim();

    const payload = verifyJwt(token);
    if (!payload) {
      this.logger.warn(
        `Connexion Socket.io refusée (token invalide) — client=${client.id}`,
      );
      client.disconnect(true);
      return;
    }

    client.data.userId = payload.sub;
    client.data.username = payload.username;
    client.data.role = payload.role;
    void client.join(OPERATORS_ROOM);

    this.logger.log(
      `Client authentifié connecté — id=${client.id} user=${payload.username} role=${payload.role}`,
    );
  }

  /**
   * Diffuse un nouveau signalement **uniquement aux opérateurs
   * authentifiés**. Le payload complet (incluant citizenName /
   * citizenPhone) est diffusé aux opérateurs — ils en ont besoin pour la
   * réponse d'urgence.
   */
  broadcastNewAlert(alert: SignalementRecord): void {
    if (!this.server) {
      this.logger.warn('Socket.io server indisponible — pas de diffusion alert:new');
      return;
    }
    this.server.to(OPERATORS_ROOM).emit('alert:new', alert);
    this.logger.log(`📡 alert:new diffusé (room=operators) — ${alert.reference}`);
  }
}
