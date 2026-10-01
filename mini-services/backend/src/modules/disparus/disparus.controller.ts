// ============================================================================
// Disparus Controller — Routes REST /api/disparus
// ============================================================================

import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { DisparusService } from './disparus.service';

@Controller('api/disparus')
export class DisparusController {
  constructor(private readonly disparusService: DisparusService) {}

  @Get()
  async findAll() {
    return this.disparusService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const d = await this.disparusService.findOne(id);
    if (!d) {
      throw new HttpException('Personne disparue introuvable', HttpStatus.NOT_FOUND);
    }
    return d;
  }
}
