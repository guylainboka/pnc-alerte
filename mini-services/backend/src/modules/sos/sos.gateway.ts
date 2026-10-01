// ============================================================================
// SOS Gateway — Diffusion temps réel via Socket.io (authentifiée)
// ============================================================================
// Émet deux événements uniquement aux opérateurs authentifiés (room
// `operators`) :
//  - sos:new    : un nouveau SOS vient d'être déclenché par l'app mobile
//  - sos:update : le statut d'un SOS existant a été modifié par le centre
// ============================================================================
// Sécurité :
//  - À la connexion, on extrait un Bearer JWT de `socket.handshake.auth`
//    ou `socket.handshake.headers.authorization`. Si invalide → déconnexion
//    immédiate.
//  - Le socket est ajouté à la room `operators` (utilisée pour limiter la
//    diffusion des PII — nom/téléphone du citoyen — aux opérateurs PNC).
// ============================================================================

import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { verifyJwt } from '../../common/auth/jwt';
import type { SosRecord } from './sos.service';

/** Room qui contient tous les opérateurs authentifiés (broadcast PII-safe). */
export const OPERATORS_ROOM = 'operators';

@WebSocketGateway({
  namespace: '/',
  // Le path Socket.io par défaut est "/socket.io/". On le garde par défaut
  // pour ne pas intercepter les routes REST /api/*. Le frontend se connecte
  // avec io("/?XTransformPort=3001") — socket.io-client ajoute automatiquement
  // le path /socket.io/ et fusionne la query string XTransformPort.
  cors: {
    // CORS verrouillé aux origines listées dans CORS_ORIGIN (défaut local).
    origin: (process.env.CORS_ORIGIN?.split(',') ?? [
      'http://localhost:3000',
      'http://localhost:81',
    ]).map((s) => s.trim()),
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

  /**
   * Authentifie le socket à la connexion. Si le token JWT est absent ou
   * invalide, le socket est déconnecté immédiatement.
   */
  handleConnection(client: Socket): void {
    // Le token peut arriver via `socket.handshake.auth.token` (client JS :
    // io({ auth: { token: 'Bearer xxx' } }) ou { auth: { token: 'xxx' } })
    // ou via l'en-tête HTTP `Authorization`.
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

    // Accepter "Bearer xxx" ou "xxx" directement.
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

    // On attache l'identité au socket pour usage ultérieur + on rejoint la
    // room des opérateurs (broadcast PII-safe).
    client.data.userId = payload.sub;
    client.data.username = payload.username;
    client.data.role = payload.role;
    void client.join(OPERATORS_ROOM);

    this.logger.log(
      `Client authentifié connecté — id=${client.id} user=${payload.username} role=${payload.role}`,
    );
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`Client déconnecté : ${client.id}`);
  }

  /** Ping du client — utile pour vérifier l'authentification côté frontend. */
  @SubscribeMessage('ping')
  handlePing(@MessageBody() _data: unknown, client: Socket): { ok: true; user: string } {
    return { ok: true, user: client.data?.username ?? 'inconnu' };
  }

  /**
   * Diffuse un nouveau SOS **uniquement aux opérateurs authentifiés**.
   * Le payload complet (incluant citizenName / citizenPhone) est diffusé
   * aux opérateurs — les PNC opérateurs en ont besoin pour la réponse
   * d'urgence ; aucun client non authentifié ne peut rejoindre la room.
   */
  broadcastNewSos(sos: SosRecord): void {
    if (!this.server) {
      this.logger.warn('Socket.io server indisponible — pas de diffusion sos:new');
      return;
    }
    this.server.to(OPERATORS_ROOM).emit('sos:new', sos);
    this.logger.log(`📡 sos:new diffusé (room=operators) — ${sos.reference}`);
  }

  /**
   * Diffuse une mise à jour de statut SOS aux opérateurs authentifiés.
   */
  broadcastUpdateSos(sos: SosRecord): void {
    if (!this.server) {
      this.logger.warn('Socket.io server indisponible — pas de diffusion sos:update');
      return;
    }
    this.server.to(OPERATORS_ROOM).emit('sos:update', sos);
    this.logger.log(
      `📡 sos:update diffusé (room=operators) — ${sos.reference} → ${sos.status}`,
    );
  }
}
