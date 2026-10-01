// ============================================================================
// Bootstrap NestJS — Démarrage du serveur (port par défaut 3001)
// ============================================================================
// 1. Initialise la base PGlite (création des tables + seed au premier boot)
// 2. Crée l'application NestJS
// 3. Active Helmet (sécurité des headers HTTP), compression gzip, et un
//    CORS explicite (pas `origin: '*'` — origins listées via CORS_ORIGIN).
// 4. Active la validation globale des DTO (class-validator).
// 5. Branche l'adapter Socket.io (IoAdapter de @nestjs/platform-socket.io).
// 6. Active `enableShutdownHooks()` pour gérer proprement SIGTERM/SIGINT
//    (flush des connexions, fermeture propre de PGlite, pas de WAL corrompu).
// 7. Écoute sur 0.0.0.0:PORT (PORT depuis l'env, défaut 3001).
// ============================================================================

import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import compression from 'compression';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { initSchema } from './common/database/schema';

/** Liste d'origines autorisées pour CORS (depuis l'env, défaut local). */
function getAllowedOrigins(): (string | RegExp)[] {
  const raw = process.env.CORS_ORIGIN;
  if (!raw) {
    return ['http://localhost:3000', 'http://localhost:81'];
  }
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Port d'écoute — lu depuis l'env (défaut 3001). */
function getPort(): number {
  const raw = process.env.PORT;
  const parsed = raw ? parseInt(raw, 10) : 3001;
  if (Number.isNaN(parsed) || parsed <= 0 || parsed > 65535) {
    return 3001;
  }
  return parsed;
}

export async function bootstrap(): Promise<void> {
  const logger = new Logger('PNC-Backend');

  // 1. Initialise la base de données (PGlite + schema + seed)
  try {
    logger.log('Initialisation de la base de données ...');
    await initSchema();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error(`Échec d'initialisation de la base : ${message}`);
    throw err;
  }

  // 2. Crée l'app NestJS (backend Express)
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: ['log', 'warn', 'error', 'debug'],
  });

  // 3a. Helmet — headers de sécurité (HSTS, X-Content-Type-Options, ...)
  app.use(helmet());

  // 3b. Compression gzip des réponses HTTP
  app.use(compression());

  // 3c. CORS — origines explicites (jamais `*` avec `credentials: true`)
  const allowedOrigins = getAllowedOrigins();
  app.enableCors({
    origin: allowedOrigins,
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

  // 6. Hooks d'arrêt propre (SIGTERM/SIGINT) — ferme HTTP + WS + DB
  app.enableShutdownHooks();

  // 7. Démarre le serveur sur 0.0.0.0:PORT
  const PORT = getPort();
  await app.listen(PORT, '0.0.0.0');

  logger.log(`🚀 NestJS backend démarré sur http://localhost:${PORT}`);
  logger.log(`   REST : http://localhost:${PORT}/api/*`);
  logger.log(`   Socket.io : ws://localhost:${PORT}/?XTransformPort=${PORT}`);
  logger.log(
    `   CORS : origines autorisées = ${allowedOrigins.map((o) => o.toString()).join(', ')}`,
  );
  logger.log(
    `   Sécurité : helmet activé, compression gzip, JWT signé (24h), bcrypt, throttler login`,
  );
}

// Exporter pour permettre l'import depuis index.ts
export { bootstrap as default };
