// ============================================================================
// SOS Service — Logique métier + requêtes PGlite
// ============================================================================

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { query, queryOne, exec } from '../../common/database/pg.client';
import { CreateSosDto, UpdateSosDto, SOS_STATUSES } from './sos.dto';

export interface SosRecord {
  id: string;
  reference: string;
  userId: string | null;
  latitude: number;
  longitude: number;
  locationText: string | null;
  status: string;
  agentAssigned: string | null;
  responseTimeSeconds: number | null;
  notes: string | null;
  createdAt: string;
  closedAt: string | null;
  // Champs enrichis (JOIN profiles)
  citizenName?: string | null;
  citizenPhone?: string | null;
}

function rowToSos(r: any): SosRecord {
  return {
    id: r.id,
    reference: r.reference,
    userId: r.user_id ?? null,
    latitude: r.latitude,
    longitude: r.longitude,
    locationText: r.location_text ?? null,
    status: r.status,
    agentAssigned: r.agent_assigned ?? null,
    responseTimeSeconds: r.response_time_seconds ?? null,
    notes: r.notes ?? null,
    createdAt: r.created_at,
    closedAt: r.closed_at ?? null,
    citizenName: r.citizen_name ?? null,
    citizenPhone: r.citizen_phone ?? null,
  };
}

@Injectable()
export class SosService {
  /**
   * Liste tous les SOS, ou seulement les actifs si activeOnly=true.
   * Joint la table profiles pour récupérer le nom et téléphone du citoyen.
   */
  async findAll(activeOnly = false): Promise<SosRecord[]> {
    const sql = activeOnly
      ? `SELECT s.*, p.full_name AS citizen_name, p.phone AS citizen_phone
         FROM sos_calls s
         LEFT JOIN profiles p ON p.id = s.user_id
         WHERE s.status IN ('actif', 'en-route', 'sur-place')
         ORDER BY s.created_at DESC`
      : `SELECT s.*, p.full_name AS citizen_name, p.phone AS citizen_phone
         FROM sos_calls s
         LEFT JOIN profiles p ON p.id = s.user_id
         ORDER BY s.created_at DESC`;

    const rows = await query(sql);
    return rows.map(rowToSos);
  }

  /**
   * Récupère un SOS par son id.
   */
  async findOne(id: string): Promise<SosRecord | null> {
    const row = await queryOne(
      `SELECT s.*, p.full_name AS citizen_name, p.phone AS citizen_phone
       FROM sos_calls s
       LEFT JOIN profiles p ON p.id = s.user_id
       WHERE s.id = $1`,
      [id]
    );
    return row ? rowToSos(row) : null;
  }

  /**
   * Crée un nouveau SOS. Génère un id et une référence unique.
   * Retourne le SOS créé avec les infos citoyen.
   */
  async create(dto: CreateSosDto): Promise<SosRecord> {
    const id = randomUUID();
    const reference = dto.reference || (await this.generateReference());

    await exec(
      `INSERT INTO sos_calls (id, user_id, reference, latitude, longitude, location_text, status, notes, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, 'actif', $7, CURRENT_TIMESTAMP)`,
      [
        id,
        dto.userId ?? null,
        reference,
        dto.latitude,
        dto.longitude,
        dto.locationText ?? null,
        dto.notes ?? null,
      ]
    );

    const created = await this.findOne(id);
    return created!;
  }

  /**
   * Met à jour le statut d'un SOS. Si le statut passe à 'cloture' ou 'annule',
   * on enregistre la date de clôture.
   */
  async update(id: string, dto: UpdateSosDto): Promise<SosRecord | null> {
    const existing = await this.findOne(id);
    if (!existing) {
      return null;
    }

    const isClosing = dto.status === 'cloture' || dto.status === 'annule';
    const closedAt = isClosing ? 'CURRENT_TIMESTAMP' : 'NULL';

    // Construction dynamique des SET
    const updates: string[] = [`status = $2`, `updated_at = CURRENT_TIMESTAMP`];
    const params: any[] = [id, dto.status];
    let nextParamIdx = 3;

    if (dto.agentAssigned !== undefined) {
      updates.push(`agent_assigned = $${nextParamIdx}`);
      params.push(dto.agentAssigned);
      nextParamIdx++;
    }
    if (dto.responseTimeSeconds !== undefined) {
      updates.push(`response_time_seconds = $${nextParamIdx}`);
      params.push(dto.responseTimeSeconds);
      nextParamIdx++;
    }
    if (dto.notes !== undefined) {
      updates.push(`notes = $${nextParamIdx}`);
      params.push(dto.notes);
      nextParamIdx++;
    }
    if (isClosing) {
      updates.push(`closed_at = CURRENT_TIMESTAMP`);
    }

    await exec(
      `UPDATE sos_calls SET ${updates.join(', ')} WHERE id = $1`,
      params
    );

    return this.findOne(id);
  }

  /**
   * Génère une référence unique au format SOS-YYYY-NNN.
   */
  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    // Compte les SOS de l'année courante pour incrémenter le compteur
    const row = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM sos_calls WHERE reference LIKE $1`,
      [`SOS-${year}-%`]
    );
    const next = ((row?.count as number) || 0) + 1;
    return `SOS-${year}-${String(next).padStart(3, '0')}`;
  }
}
