// ============================================================================
// Disparus Service — Personnes disparues
// ============================================================================

import { Injectable } from '@nestjs/common';
import { query, queryOne } from '../../common/database/pg.client';

export interface DisparuRecord {
  id: string;
  reference: string;
  userId: string | null;
  nomComplet: string;
  age: number | null;
  sexe: string | null;
  description: string | null;
  derniereVueLieu: string | null;
  derniereVueDate: string | null;
  photoUrl: string | null;
  contactTelephone: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  declarantName?: string | null;
  declarantPhone?: string | null;
}

function rowToDisparu(r: any): DisparuRecord {
  return {
    id: r.id,
    reference: r.reference,
    userId: r.user_id ?? null,
    nomComplet: r.nom_complet,
    age: r.age ?? null,
    sexe: r.sexe ?? null,
    description: r.description ?? null,
    derniereVueLieu: r.derniere_vue_lieu ?? null,
    derniereVueDate: r.derniere_vue_date ?? null,
    photoUrl: r.photo_url ?? null,
    contactTelephone: r.contact_telephone ?? null,
    status: r.status,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    declarantName: r.declarant_name ?? null,
    declarantPhone: r.declarant_phone ?? null,
  };
}

@Injectable()
export class DisparusService {
  async findAll(): Promise<DisparuRecord[]> {
    const rows = await query(
      `SELECT d.*, p.full_name AS declarant_name, p.phone AS declarant_phone
       FROM personnes_disparues d
       LEFT JOIN profiles p ON p.id = d.user_id
       ORDER BY d.created_at DESC`
    );
    return rows.map(rowToDisparu);
  }

  async findOne(id: string): Promise<DisparuRecord | null> {
    const row = await queryOne(
      `SELECT d.*, p.full_name AS declarant_name, p.phone AS declarant_phone
       FROM personnes_disparues d
       LEFT JOIN profiles p ON p.id = d.user_id
       WHERE d.id = $1`,
      [id]
    );
    return row ? rowToDisparu(row) : null;
  }
}
