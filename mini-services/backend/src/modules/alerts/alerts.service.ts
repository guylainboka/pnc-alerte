// ============================================================================
// Alerts Service — Gestion des signalements citoyens
// ============================================================================

import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { query, queryOne, exec } from '../../common/database/pg.client';
import { CreateSignalementDto } from './alerts.dto';

export interface SignalementRecord {
  id: string;
  reference: string;
  userId: string | null;
  type: string;
  description: string;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  photoUrl: string | null;
  anonymous: boolean;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
  // Champs enrichis (JOIN profiles)
  citizenName?: string | null;
  citizenPhone?: string | null;
  citizenCommune?: string | null;
}

function rowToSig(r: any): SignalementRecord {
  return {
    id: r.id,
    reference: r.reference,
    userId: r.user_id ?? null,
    type: r.type,
    description: r.description,
    location: r.location ?? null,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    photoUrl: r.photo_url ?? null,
    anonymous: r.anonymous ?? false,
    status: r.status,
    priority: r.priority,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    citizenName: r.citizen_name ?? null,
    citizenPhone: r.citizen_phone ?? null,
    citizenCommune: r.citizen_commune ?? null,
  };
}

@Injectable()
export class AlertsService {
  async findAll(): Promise<SignalementRecord[]> {
    const rows = await query(
      `SELECT s.*, p.full_name AS citizen_name, p.phone AS citizen_phone, p.commune AS citizen_commune
       FROM signalements s
       LEFT JOIN profiles p ON p.id = s.user_id
       ORDER BY s.created_at DESC`
    );
    return rows.map(rowToSig);
  }

  async findOne(id: string): Promise<SignalementRecord | null> {
    const row = await queryOne(
      `SELECT s.*, p.full_name AS citizen_name, p.phone AS citizen_phone, p.commune AS citizen_commune
       FROM signalements s
       LEFT JOIN profiles p ON p.id = s.user_id
       WHERE s.id = $1`,
      [id]
    );
    return row ? rowToSig(row) : null;
  }

  async create(dto: CreateSignalementDto): Promise<SignalementRecord> {
    const id = randomUUID();
    const reference = dto.reference || (await this.generateReference());
    const priority = this.derivePriority(dto.type);

    await exec(
      `INSERT INTO signalements
        (id, user_id, type, description, location, latitude, longitude, photo_url, anonymous, status, reference, priority, created_at, updated_at)
       VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'en-attente', $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        id,
        dto.userId ?? null,
        dto.type,
        dto.description,
        dto.location ?? null,
        dto.latitude ?? null,
        dto.longitude ?? null,
        dto.photoUrl ?? null,
        dto.anonymous ?? false,
        reference,
        priority,
      ]
    );

    const created = await this.findOne(id);
    if (!created) {
      // Très peu probable : on vient d'insérer la ligne, le re-fetch doit
      // marcher. Si ça arrive (concurrence / suppression), on throw.
      throw new Error('Signalement inséré mais introuvable au re-fetch');
    }
    return created;
  }

  /** Déduit la priorité à partir du type de signalement */
  private derivePriority(type: string): string {
    if (type === 'agression' || type === 'violence' || type === 'corruption') {
      return 'critique';
    }
    if (type === 'vol' || type === 'trafic') {
      return 'haute';
    }
    if (type === 'nuisance') {
      return 'basse';
    }
    return 'moyenne';
  }

  /** Génère une référence SIG-YYYY-NNN */
  private async generateReference(): Promise<string> {
    const year = new Date().getFullYear();
    const row = await queryOne<{ count: number }>(
      `SELECT COUNT(*)::int as count FROM signalements WHERE reference LIKE $1`,
      [`SIG-${year}-%`]
    );
    const next = ((row?.count as number) || 0) + 1;
    return `SIG-${year}-${String(next).padStart(3, '0')}`;
  }
}
