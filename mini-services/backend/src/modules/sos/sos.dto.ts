// ============================================================================
// SOS DTO — Validation des requêtes entrantes (class-validator)
// ============================================================================

import { IsString, IsNumber, IsOptional, IsIn, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Statuts possibles d'un SOS :
 *  - actif     : SOS déclenché, en attente d'intervention
 *  - en-route  : patrouille en route vers le lieu
 *  - sur-place : patrouille sur place
 *  - cloture   : intervention terminée
 *  - annule    : faux déclenchement / annulé
 */
export const SOS_STATUSES = ['actif', 'en-route', 'sur-place', 'cloture', 'annule'] as const;
export type SosStatus = (typeof SOS_STATUSES)[number];

/**
 * DTO de création d'un SOS — envoyé par l'application mobile PNC Alerte.
 */
export class CreateSosDto {
  @IsString()
  @IsOptional()
  userId?: string;

  @IsNumber()
  @Type(() => Number)
  latitude: number;

  @IsNumber()
  @Type(() => Number)
  longitude: number;

  @IsString()
  @IsOptional()
  locationText?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  reference?: string;
}

/**
 * DTO de mise à jour du statut d'un SOS — appelé par le centre de commandement.
 */
export class UpdateSosDto {
  @IsString()
  @IsIn(SOS_STATUSES as unknown as string[])
  status: SosStatus;

  @IsString()
  @IsOptional()
  agentAssigned?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  responseTimeSeconds?: number;

  @IsString()
  @IsOptional()
  notes?: string;
}
