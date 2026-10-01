// ============================================================================
// Citizens Controller — Routes REST /api/citizens
// ============================================================================

import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { CitizensService } from './citizens.service';

@Controller('api/citizens')
export class CitizensController {
  constructor(private readonly citizensService: CitizensService) {}

  /** GET /api/citizens — liste tous les profils citoyens */
  @Get()
  async findAll() {
    return this.citizensService.findAll();
  }

  /** GET /api/citizens/:id — détail d'un profil */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const c = await this.citizensService.findOne(id);
    if (!c) {
      throw new HttpException('Citoyen introuvable', HttpStatus.NOT_FOUND);
    }
    return c;
  }
}
