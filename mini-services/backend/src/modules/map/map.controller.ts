// ============================================================================
// Map Controller — Routes REST /api/map/*
// ============================================================================

import {
  Controller,
  Get,
  Query,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { MapService } from './map.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@Controller('api/map')
@UseGuards(JwtAuthGuard)
export class MapController {
  constructor(private readonly mapService: MapService) {}

  /** GET /api/map/active-sos → GeoJSON FeatureCollection */
  @Get('active-sos')
  async getActiveSos() {
    return this.mapService.getActiveSosGeoJSON();
  }

  /** GET /api/map/commissariats → GeoJSON FeatureCollection */
  @Get('commissariats')
  async getCommissariats() {
    return this.mapService.getCommissariatsGeoJSON();
  }

  /** GET /api/map/nearest-commissariat?lat=X&lon=Y → commissariat le plus proche */
  @Get('nearest-commissariat')
  async getNearestCommissariat(
    @Query('lat') lat?: string,
    @Query('lon') lon?: string,
  ) {
    const latNum = parseFloat(lat || '');
    const lonNum = parseFloat(lon || '');
    if (Number.isNaN(latNum) || Number.isNaN(lonNum)) {
      throw new HttpException(
        'Les paramètres lat et lon sont requis et doivent être des nombres',
        HttpStatus.BAD_REQUEST,
      );
    }
    const result = await this.mapService.getNearestCommissariat(latNum, lonNum);
    if (!result) {
      throw new HttpException('Aucun commissariat trouvé', HttpStatus.NOT_FOUND);
    }
    return result;
  }
}
