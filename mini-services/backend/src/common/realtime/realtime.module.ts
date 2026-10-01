// ============================================================================
// Realtime module — configuration Socket.io pour NestJS
// ============================================================================
// NestJS gère les WebSockets via un "adapter". On utilise ici l'IoAdapter de
// @nestjs/platform-socket.io qui crée un serveur socket.io branché sur le
// même serveur HTTP que NestJS (port configurable via PORT, défaut 3001).
//
// Le path Socket.io par défaut est "/socket.io/" — il est conservé pour ne
// pas intercepter les routes REST /api/*. Le frontend se connecte avec
// io("/?XTransformPort=3001") ; socket.io-client ajoute automatiquement le
// path /socket.io/ et fusionne la query string XTransformPort.
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
