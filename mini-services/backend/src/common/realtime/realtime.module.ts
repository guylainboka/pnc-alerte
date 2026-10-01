// ============================================================================
// Realtime module — configuration Socket.io pour NestJS
// ============================================================================
// NestJS gère les WebSockets via un "adapter". On utilise ici l'IoAdapter de
// @nestjs/platform-socket.io qui crée un serveur socket.io branché sur le
// même serveur HTTP que NestJS (port 3001).
//
// Le path Socket.io est "/" pour que Caddy puisse router la connexion via
// ?XTransformPort=3001 sans configuration supplémentaire.
//
// Les gateways (SosGateway, AlertsGateway) sont importés via leurs modules
// respectifs (SosModule, AlertsModule). Une fois importés, NestJS détecte
// automatiquement les classes décorées @WebSocketGateway() et les branche
// sur le serveur.
// ============================================================================

import { Module } from '@nestjs/common';
import { SosModule } from '../../modules/sos/sos.module';
import { AlertsModule } from '../../modules/alerts/alerts.module';

@Module({
  imports: [SosModule, AlertsModule],
})
export class RealtimeModule {}
