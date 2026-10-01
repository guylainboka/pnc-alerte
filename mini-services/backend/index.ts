// ============================================================================
// Point d'entrée — Backend NestJS PNC (port 3001)
// ============================================================================
// Le backend écoute sur http://localhost:3001 (port interne).
// Le gateway Caddy expose ce port vers l'extérieur via le query param
// ?XTransformPort=3001 dans l'URL de l'API.
// ============================================================================

import 'reflect-metadata';
import { bootstrap } from './src/main';

bootstrap().catch((err) => {
  console.error('❌ Erreur fatale lors du démarrage du backend PNC :', err);
  process.exit(1);
});
