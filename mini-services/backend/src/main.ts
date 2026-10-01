// ============================================================================
// Bootstrap NestJS — Démarrage du serveur sur le port 3001
// ============================================================================
// 1. Initialise la base PGlite (création des tables + seed au premier boot)
// 2. Crée l'application NestJS
// 3. Active CORS (origin : * — le frontend Next.js appelle ce backend
//    depuis le navigateur via le gateway Caddy)
// 4. Branche l'adapter Socket.io (IoAdapter de @nestjs/platform-socket.io)
//    Les gateways décorés @WebSocketGateway() sont automatiquement attachés
//    au serveur Socket.io via ce module RealtimeModule.
// 5. Écoute sur 0.0.0.0:3001
// ============================================================================

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { initSchema } from './common/database/schema';

export async function bootstrap(): Promise<void> {
  const logger = new Logger('PNC-Backend');

  // 1. Initialise la base de données (PGlite + schema + seed)
  try {
    logger.log('Initialisation de la base de données ...');
    await initSchema();
  } catch (err: any) {
    logger.error(`Échec d'initialisation de la base : ${err?.message ?? err}`);
    throw err;
  }

  // 2. Crée l'app NestJS
  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });

  // 3. Active CORS pour permettre les appels depuis le navigateur (Next.js)
  app.enableCors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // 4. Active la validation globale des DTO (class-validator)
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // 5. Branche l'adapter Socket.io
  app.useWebSocketAdapter(new IoAdapter(app));

  // 6. Démarre le serveur sur 0.0.0.0:3001
  const PORT = 3001;
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 NestJS backend démarré sur http://localhost:${PORT}`);
  logger.log(`   REST : http://localhost:${PORT}/api/*`);
  logger.log(`   Socket.io : ws://localhost:${PORT}/?XTransformPort=${PORT}`);
  logger.log(`   CORS : origine * autorisée`);
}

// Exporter pour permettre l'import depuis index.ts
export { bootstrap as default };
