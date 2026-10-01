// ============================================================================
// Alerts DTO — Validation des signalements citoyens
// ============================================================================

import { IsString, IsNumber, IsOptional, IsBoolean, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

export const SIGNALEMENT_TYPES = [
  'vol', 'agression', 'corruption', 'nuisance', 'trafic', 'violence', 'autre',
] as const;
export const SIGNALEMENT_PRIORITIES = ['basse', 'moyenne', 'haute', 'critique'] as const;

export class CreateSignalementDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsIn(SIGNALEMENT_TYPES as unknown as string[])
  type: string;

  @IsString()
  description: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  latitude?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  longitude?: number;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsBoolean()
  @IsOptional()
  anonymous?: boolean;

  @IsString()
  @IsOptional()
  reference?: string;
}
