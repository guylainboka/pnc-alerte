// ============================================================================
// Complaints Controller — Routes REST /api/complaints
// ============================================================================

import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ComplaintsService } from './complaints.service';

@Controller('api/complaints')
export class ComplaintsController {
  constructor(private readonly complaintsService: ComplaintsService) {}

  @Get()
  async findAll() {
    return this.complaintsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const c = await this.complaintsService.findOne(id);
    if (!c) {
      throw new HttpException('Plainte introuvable', HttpStatus.NOT_FOUND);
    }
    return c;
  }
}
