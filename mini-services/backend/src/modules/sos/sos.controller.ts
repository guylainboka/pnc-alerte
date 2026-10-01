// ============================================================================
// SOS Controller — Routes REST /api/sos
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { SosService } from './sos.service';
import { SosGateway } from './sos.gateway';
import { CreateSosDto, UpdateSosDto } from './sos.dto';

@Controller('api/sos')
export class SosController {
  constructor(
    private readonly sosService: SosService,
    private readonly sosGateway: SosGateway,
  ) {}

  /**
   * GET /api/sos?active=true
   * Liste tous les SOS, ou seulement les actifs si active=true.
   */
  @Get()
  async findAll(@Query('active') active?: string) {
    const activeOnly = active === 'true';
    return this.sosService.findAll(activeOnly);
  }

  /**
   * GET /api/sos/:id
   * Détail d'un SOS.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const sos = await this.sosService.findOne(id);
    if (!sos) {
      throw new HttpException('SOS introuvable', HttpStatus.NOT_FOUND);
    }
    return sos;
  }

  /**
   * POST /api/sos
   * Crée un nouveau SOS (depuis l'app mobile PNC Alerte) et diffuse
   * en temps réel l'événement sos:new à tous les clients connectés.
   */
  @Post()
  async create(@Body() dto: CreateSosDto) {
    if (dto.latitude === undefined || dto.longitude === undefined) {
      throw new HttpException(
        'Les champs latitude et longitude sont requis',
        HttpStatus.BAD_REQUEST,
      );
    }
    const sos = await this.sosService.create(dto);
    this.sosGateway.broadcastNewSos(sos);
    return sos;
  }

  /**
   * PATCH /api/sos/:id
   * Met à jour le statut d'un SOS et diffuse sos:update en temps réel.
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateSosDto) {
    const updated = await this.sosService.update(id, dto);
    if (!updated) {
      throw new HttpException('SOS introuvable', HttpStatus.NOT_FOUND);
    }
    this.sosGateway.broadcastUpdateSos(updated);
    return updated;
  }
}
