// ============================================================================
// Alerts Controller — Routes REST /api/alerts
// ============================================================================

import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { AlertsGateway } from './alerts.gateway';
import { CreateSignalementDto } from './alerts.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/alerts')
@UseGuards(JwtAuthGuard)
export class AlertsController {
  constructor(
    private readonly alertsService: AlertsService,
    private readonly alertsGateway: AlertsGateway,
  ) {}

  /** GET /api/alerts — liste tous les signalements */
  @Get()
  async findAll() {
    return this.alertsService.findAll();
  }

  /** GET /api/alerts/:id — détail d'un signalement */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const alert = await this.alertsService.findOne(id);
    if (!alert) {
      throw new HttpException('Signalement introuvable', HttpStatus.NOT_FOUND);
    }
    return alert;
  }

  /** POST /api/alerts — crée un nouveau signalement et diffuse alert:new.
   * La validation des champs `type` et `description` est garantie par le DTO
   * (CreateSignalementDto : @IsString() @IsIn(...) + @IsString() non-opt).
   */
  @Post()
  async create(@Body() dto: CreateSignalementDto) {
    const alert = await this.alertsService.create(dto);
    this.alertsGateway.broadcastNewAlert(alert);
    return alert;
  }
}
