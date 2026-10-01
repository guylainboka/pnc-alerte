// ============================================================================
// SOS Gateway — Diffusion temps réel via Socket.io
// ============================================================================
// Émet deux événements à tous les clients connectés (le dashboard web) :
//  - sos:new    : un nouveau SOS vient d'être déclenché par l'app mobile
//  - sos:update : le statut d'un SOS existant a été modifié par le centre
// ============================================================================

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import type { SosRecord } from './sos.service';

@WebSocketGateway({
  namespace: '/',
  // Le path Socket.io par défaut est "/socket.io/". On le garde par défaut
  // pour ne pas intercepter les routes REST /api/*. Le frontend se connecte
  // avec io("/?XTransformPort=3001") — socket.io-client ajoute automatiquement
  // le path /socket.io/ et fusionne la query string XTransformPort.
  cors: {
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST'],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})
export class SosGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SosGateway.name);

  handleConnection(client: Socket) {
    this.logger.log(`Client connecté : ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  /** Diffuse un nouveau SOS à tous les clients web */
  broadcastNewSos(sos: SosRecord) {
    if (!this.server) {
      this.logger.warn('Socket.io server indisponible — pas de diffusion sos:new');
      return;
    }
    this.server.emit('sos:new', sos);
    this.logger.log(`📡 sos:new diffusé — ${sos.reference}`);
  }

  /** Diffuse une mise à jour de statut SOS à tous les clients web */
  broadcastUpdateSos(sos: SosRecord) {
    if (!this.server) {
      this.logger.warn('Socket.io server indisponible — pas de diffusion sos:update');
      return;
    }
    this.server.emit('sos:update', sos);
    this.logger.log(`📡 sos:update diffusé — ${sos.reference} → ${sos.status}`);
  }
}
