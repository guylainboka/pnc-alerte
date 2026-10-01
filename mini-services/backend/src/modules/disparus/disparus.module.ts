// ============================================================================
// Disparus Module
// ============================================================================

import { Module } from '@nestjs/common';
import { DisparusController } from './disparus.controller';
import { DisparusService } from './disparus.service';

@Module({
  controllers: [DisparusController],
  providers: [DisparusService],
  exports: [DisparusService],
})
export class DisparusModule {}
