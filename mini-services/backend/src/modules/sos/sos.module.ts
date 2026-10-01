// ============================================================================
// SOS Module
// ============================================================================

import { Module } from '@nestjs/common';
import { SosController } from './sos.controller';
import { SosService } from './sos.service';
import { SosGateway } from './sos.gateway';

@Module({
  controllers: [SosController],
  providers: [SosService, SosGateway],
  exports: [SosService, SosGateway],
})
export class SosModule {}
