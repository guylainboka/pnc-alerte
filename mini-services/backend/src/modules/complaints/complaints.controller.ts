// ============================================================================
// Complaints Controller — Routes REST /api/complaints
// ============================================================================

import {
  Controller,
  Get,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { ComplaintsService } from './complaints.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/complaints')
@UseGuards(JwtAuthGuard)
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
