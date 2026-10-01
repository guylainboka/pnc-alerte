// ============================================================================
// Complaints Service — Lecture des plaintes formelles
// ============================================================================

import { Injectable } from '@nestjs/common';
import { query, queryOne } from '../../common/database/pg.client';

export interface PlainteRecord {
  id: string;
  reference: string;
  userId: string | null;
  typePlainte: string;
  description: string;
  suspectInfo: string | null;
  lieuIncident: string | null;
  dateIncident: string | null;
  piecesJointes: string | null;
  status: string;
  reviewedBy: string | null;
  reviewNotes: string | null;
  caseId: string | null;
  createdAt: string;
  updatedAt: string;
  // Champs enrichis (JOIN profiles)
  plaintiffName?: string | null;
  plaintiffPhone?: string | null;
  plaintiffCommune?: string | null;
}

function rowToPlainte(r: any): PlainteRecord {
  return {
    id: r.id,
    reference: r.reference,
    userId: r.user_id ?? null,
    typePlainte: r.type_plainte,
    description: r.description,
    suspectInfo: r.suspect_info ?? null,
    lieuIncident: r.lieu_incident ?? null,
    dateIncident: r.date_incident ?? null,
    piecesJointes: r.pieces_jointes ?? null,
    status: r.status,
    reviewedBy: r.reviewed_by ?? null,
    reviewNotes: r.review_notes ?? null,
    caseId: r.case_id ?? null,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    plaintiffName: r.citizen_name ?? null,
    plaintiffPhone: r.citizen_phone ?? null,
    plaintiffCommune: r.citizen_commune ?? null,
  };
}

@Injectable()
export class ComplaintsService {
  async findAll(): Promise<PlainteRecord[]> {
    const rows = await query(
      `SELECT c.*, p.full_name AS citizen_name, p.phone AS citizen_phone, p.commune AS citizen_commune
       FROM plaintes c
       LEFT JOIN profiles p ON p.id = c.user_id
       ORDER BY c.created_at DESC`
    );
    return rows.map(rowToPlainte);
  }

  async findOne(id: string): Promise<PlainteRecord | null> {
    const row = await queryOne(
      `SELECT c.*, p.full_name AS citizen_name, p.phone AS citizen_phone, p.commune AS citizen_commune
       FROM plaintes c
       LEFT JOIN profiles p ON p.id = c.user_id
       WHERE c.id = $1`,
      [id]
    );
    return row ? rowToPlainte(row) : null;
  }
}
