// ============================================================================
// Citizens Service — Lecture de la table profiles
// ============================================================================

import { Injectable } from '@nestjs/common';
import { query, queryOne } from '../../common/database/pg.client';

export interface CitizenRecord {
  id: string;
  fullName: string;
  email: string | null;
  phone: string;
  province: string | null;
  commune: string | null;
  latitude: number | null;
  longitude: number | null;
  lastLocation: string | null;
  status: string;
  verified: boolean;
  createdAt: string;
  updatedAt: string;
}

function rowToCitizen(r: any): CitizenRecord {
  return {
    id: r.id,
    fullName: r.full_name,
    email: r.email,
    phone: r.phone,
    province: r.province,
    commune: r.commune,
    latitude: r.latitude ?? null,
    longitude: r.longitude ?? null,
    lastLocation: r.last_location ?? null,
    status: r.status,
    verified: r.verified ?? false,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

@Injectable()
export class CitizensService {
  async findAll(): Promise<CitizenRecord[]> {
    const rows = await query(`SELECT * FROM profiles ORDER BY created_at DESC`);
    return rows.map(rowToCitizen);
  }

  async findOne(id: string): Promise<CitizenRecord | null> {
    const row = await queryOne(`SELECT * FROM profiles WHERE id = $1`, [id]);
    return row ? rowToCitizen(row) : null;
  }
}
