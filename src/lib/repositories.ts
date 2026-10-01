/**
 * Couche d'accès aux données - Mode dual (Supabase / Prisma)
 * ============================================================
 * Fournit une interface unifiée pour lire/écrire les données.
 *
 * - Si Supabase est configuré → utilise le backend Supabase partagé (PostgreSQL)
 * - Sinon → utilise la base locale SQLite via Prisma
 *
 * Le centre de commande ET l'application mobile pointent vers le MÊME backend
 * Supabase. Ainsi, une alerte envoyée depuis le mobile apparaît instantanément
 * dans le centre de commande (via Realtime).
 */

import { db } from '@/lib/db';
import {
  getSupabaseServer,
  isSupabaseMode,
  isSupabaseConfigured,
} from '@/lib/supabase';

// Types partagés (compatibles avec les deux backends)
export interface AlertRecord {
  id: string;
  reference: string;
  type: string;
  priority: string;
  status: string;
  description: string;
  location: string;
  latitude: number | null;
  longitude: number | null;
  citizenName: string | null;
  citizenPhone: string | null;
  citizenId: string | null;
  commissariatId: string;
  assignedToId: string | null;
  responseTime: number | null;
  caseId: string | null;
  createdAt: string;
  updatedAt: string;
  commissariat?: { id: string; name: string; code: string };
  assignedTo?: {
    id: string;
    firstName: string;
    lastName: string;
    rank: string;
    matricule: string;
  } | null;
}

export interface ComplaintRecord {
  id: string;
  reference: string;
  type: string;
  status: string;
  description: string;
  location: string | null;
  plaintiffName: string;
  plaintiffPhone: string;
  plaintiffEmail: string | null;
  plaintiffAddr: string | null;
  citizenId: string | null;
  commissariatId: string;
  reviewedById: string | null;
  reviewNotes: string | null;
  caseId: string | null;
  createdAt: string;
  updatedAt: string;
  commissariat?: { id: string; name: string; code: string };
  reviewedBy?: {
    id: string;
    firstName: string;
    lastName: string;
    rank: string;
  } | null;
}

export interface CitizenRecord {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  gender: string | null;
  dateOfBirth: string | null;
  address: string | null;
  city: string | null;
  commune: string | null;
  latitude: number | null;
  longitude: number | null;
  lastLocation: string | null;
  lastLocationAt: string | null;
  status: string;
  verified: boolean;
  totalAlerts: number;
  totalComplaints: number;
  commissariatId: string | null;
  createdAt: string;
  updatedAt: string;
  commissariat?: { id: string; name: string; code: string } | null;
}

// ============================================================================
// Helpers de conversion Prisma → Record
// ============================================================================

function mapAlertFromPrisma(a: any): AlertRecord {
  return {
    id: a.id,
    reference: a.reference,
    type: a.type,
    priority: a.priority,
    status: a.status,
    description: a.description,
    location: a.location,
    latitude: a.latitude,
    longitude: a.longitude,
    citizenName: a.citizenName,
    citizenPhone: a.citizenPhone,
    citizenId: a.citizenId,
    commissariatId: a.commissariatId,
    assignedToId: a.assignedToId,
    responseTime: a.responseTime,
    caseId: a.caseId,
    createdAt: a.createdAt?.toISOString?.() ?? a.createdAt,
    updatedAt: a.updatedAt?.toISOString?.() ?? a.updatedAt,
    commissariat: a.commissariat
      ? {
          id: a.commissariat.id,
          name: a.commissariat.name,
          code: a.commissariat.code,
        }
      : undefined,
    assignedTo: a.assignedTo
      ? {
          id: a.assignedTo.id,
          firstName: a.assignedTo.firstName,
          lastName: a.assignedTo.lastName,
          rank: a.assignedTo.rank,
          matricule: a.assignedTo.matricule,
        }
      : null,
  };
}

function mapComplaintFromPrisma(c: any): ComplaintRecord {
  return {
    id: c.id,
    reference: c.reference,
    type: c.type,
    status: c.status,
    description: c.description,
    location: c.location,
    plaintiffName: c.plaintiffName,
    plaintiffPhone: c.plaintiffPhone,
    plaintiffEmail: c.plaintiffEmail,
    plaintiffAddr: c.plaintiffAddr,
    citizenId: c.citizenId,
    commissariatId: c.commissariatId,
    reviewedById: c.reviewedById,
    reviewNotes: c.reviewNotes,
    caseId: c.caseId,
    createdAt: c.createdAt?.toISOString?.() ?? c.createdAt,
    updatedAt: c.updatedAt?.toISOString?.() ?? c.updatedAt,
    commissariat: c.commissariat
      ? { id: c.commissariat.id, name: c.commissariat.name, code: c.commissariat.code }
      : undefined,
    reviewedBy: c.reviewedBy
      ? {
          id: c.reviewedBy.id,
          firstName: c.reviewedBy.firstName,
          lastName: c.reviewedBy.lastName,
          rank: c.reviewedBy.rank,
        }
      : null,
  };
}

function mapCitizenFromPrisma(c: any): CitizenRecord {
  return {
    id: c.id,
    reference: c.reference,
    firstName: c.firstName,
    lastName: c.lastName,
    phone: c.phone,
    email: c.email,
    gender: c.gender,
    dateOfBirth: c.dateOfBirth?.toISOString?.() ?? c.dateOfBirth,
    address: c.address,
    city: c.city,
    commune: c.commune,
    latitude: c.latitude,
    longitude: c.longitude,
    lastLocation: c.lastLocation,
    lastLocationAt: c.lastLocationAt?.toISOString?.() ?? c.lastLocationAt,
    status: c.status,
    verified: c.verified,
    totalAlerts: c.totalAlerts,
    totalComplaints: c.totalComplaints,
    commissariatId: c.commissariatId,
    createdAt: c.createdAt?.toISOString?.() ?? c.createdAt,
    updatedAt: c.updatedAt?.toISOString?.() ?? c.updatedAt,
    commissariat: c.commissariat
      ? { id: c.commissariat.id, name: c.commissariat.name, code: c.commissariat.code }
      : null,
  };
}

// ============================================================================
// REPOSITORY : ALERTES
// ============================================================================

export const alertsRepository = {
  async findMany(filters: {
    status?: string;
    priority?: string;
    type?: string;
  } = {}): Promise<AlertRecord[]> {
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        let query = supabase
          .from('alerts')
          .select(
            '*, commissariat:commissariats(id,name,code), assignedTo:officers(id,first_name,last_name,rank,matricule)'
          )
          .order('created_at', { ascending: false });
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.priority) query = query.eq('priority', filters.priority);
        if (filters.type) query = query.eq('type', filters.type);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((a: any) => ({
          id: a.id,
          reference: a.reference,
          type: a.type,
          priority: a.priority,
          status: a.status,
          description: a.description,
          location: a.location,
          latitude: a.latitude,
          longitude: a.longitude,
          citizenName: a.citizen_name,
          citizenPhone: a.citizen_phone,
          citizenId: a.citizen_id,
          commissariatId: a.commissariat_id,
          assignedToId: a.assigned_to_id,
          responseTime: a.response_time,
          caseId: a.case_id,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          commissariat: a.commissariat,
          assignedTo: a.assignedTo,
        }));
      }
    }
    // Mode Prisma
    const where: Record<string, string> = {};
    if (filters.status) where.status = filters.status;
    if (filters.priority) where.priority = filters.priority;
    if (filters.type) where.type = filters.type;
    const alerts = await db.alert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true },
        },
      },
    });
    return alerts.map(mapAlertFromPrisma);
  },

  async create(input: {
    type: string;
    priority: string;
    description: string;
    location: string;
    latitude?: number | null;
    longitude?: number | null;
    citizenName?: string | null;
    citizenPhone?: string | null;
    citizenId?: string | null;
    commissariatId: string;
    assignedToId?: string | null;
  }): Promise<AlertRecord> {
    // Génération de la référence
    const year = new Date().getFullYear();
    const prefix = `ALT-${year}-`;

    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data: last } = await supabase
          .from('alerts')
          .select('reference')
          .like('reference', `${prefix}%`)
          .order('reference', { ascending: false })
          .limit(1);
        const nextNum = last && last[0] ? parseInt(last[0].reference.split('-')[2], 10) + 1 : 1;
        const reference = `${prefix}${String(nextNum).padStart(3, '0')}`;

        const { data, error } = await supabase
          .from('alerts')
          .insert({
            reference,
            type: input.type,
            priority: input.priority,
            status: 'recue',
            description: input.description,
            location: input.location,
            latitude: input.latitude ?? null,
            longitude: input.longitude ?? null,
            citizen_name: input.citizenName ?? null,
            citizen_phone: input.citizenPhone ?? null,
            citizen_id: input.citizenId ?? null,
            commissariat_id: input.commissariatId,
            assigned_to_id: input.assignedToId ?? null,
          })
          .select(
            '*, commissariat:commissariats(id,name,code), assignedTo:officers(id,first_name,last_name,rank,matricule)'
          )
          .single();
        if (error) throw error;
        const a: any = data;
        return {
          id: a.id,
          reference: a.reference,
          type: a.type,
          priority: a.priority,
          status: a.status,
          description: a.description,
          location: a.location,
          latitude: a.latitude,
          longitude: a.longitude,
          citizenName: a.citizen_name,
          citizenPhone: a.citizen_phone,
          citizenId: a.citizen_id,
          commissariatId: a.commissariat_id,
          assignedToId: a.assigned_to_id,
          responseTime: a.response_time,
          caseId: a.case_id,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          commissariat: a.commissariat,
          assignedTo: a.assignedTo,
        };
      }
    }

    // Mode Prisma
    const lastAlert = await db.alert.findFirst({
      where: { reference: { startsWith: prefix } },
      orderBy: { reference: 'desc' },
    });
    const nextNum = lastAlert ? parseInt(lastAlert.reference.split('-')[2], 10) + 1 : 1;
    const reference = `${prefix}${String(nextNum).padStart(3, '0')}`;

    const alert = await db.alert.create({
      data: {
        reference,
        type: input.type,
        priority: input.priority,
        status: 'recue',
        description: input.description,
        location: input.location,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
        citizenName: input.citizenName ?? null,
        citizenPhone: input.citizenPhone ?? null,
        citizenId: input.citizenId ?? null,
        commissariatId: input.commissariatId,
        assignedToId: input.assignedToId ?? null,
      },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true },
        },
      },
    });

    // Incrémenter le compteur d'alertes du citoyen
    if (input.citizenId) {
      await db.citizen.update({
        where: { id: input.citizenId },
        data: { totalAlerts: { increment: 1 } },
      }).catch(() => {});
    }

    return mapAlertFromPrisma(alert);
  },

  async updateStatus(
    id: string,
    status: string,
    extra?: { assignedToId?: string | null; responseTime?: number | null }
  ): Promise<AlertRecord | null> {
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const update: Record<string, unknown> = { status };
        if (extra?.assignedToId !== undefined) update.assigned_to_id = extra.assignedToId;
        if (extra?.responseTime !== undefined) update.response_time = extra.responseTime;
        const { data, error } = await supabase
          .from('alerts')
          .update(update)
          .eq('id', id)
          .select(
            '*, commissariat:commissariats(id,name,code), assignedTo:officers(id,first_name,last_name,rank,matricule)'
          )
          .single();
        if (error) throw error;
        const a: any = data;
        return {
          id: a.id,
          reference: a.reference,
          type: a.type,
          priority: a.priority,
          status: a.status,
          description: a.description,
          location: a.location,
          latitude: a.latitude,
          longitude: a.longitude,
          citizenName: a.citizen_name,
          citizenPhone: a.citizen_phone,
          citizenId: a.citizen_id,
          commissariatId: a.commissariat_id,
          assignedToId: a.assigned_to_id,
          responseTime: a.response_time,
          caseId: a.case_id,
          createdAt: a.created_at,
          updatedAt: a.updated_at,
          commissariat: a.commissariat,
          assignedTo: a.assignedTo,
        };
      }
    }
    const alert = await db.alert.update({
      where: { id },
      data: {
        status,
        assignedToId: extra?.assignedToId,
        responseTime: extra?.responseTime,
      },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        assignedTo: {
          select: { id: true, firstName: true, lastName: true, rank: true, matricule: true },
        },
      },
    });
    return mapAlertFromPrisma(alert);
  },
};

// ============================================================================
// REPOSITORY : PLAINTE
// ============================================================================

export const complaintsRepository = {
  async findMany(filters: { status?: string; type?: string } = {}): Promise<ComplaintRecord[]> {
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        let query = supabase
          .from('complaints')
          .select(
            '*, commissariat:commissariats(id,name,code), reviewedBy:officers(id,first_name,last_name,rank)'
          )
          .order('created_at', { ascending: false });
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.type) query = query.eq('type', filters.type);
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((c: any) => ({
          id: c.id,
          reference: c.reference,
          type: c.type,
          status: c.status,
          description: c.description,
          location: c.location,
          plaintiffName: c.plaintiff_name,
          plaintiffPhone: c.plaintiff_phone,
          plaintiffEmail: c.plaintiff_email,
          plaintiffAddr: c.plaintiff_addr,
          citizenId: c.citizen_id,
          commissariatId: c.commissariat_id,
          reviewedById: c.reviewed_by_id,
          reviewNotes: c.review_notes,
          caseId: c.case_id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          commissariat: c.commissariat,
          reviewedBy: c.reviewedBy,
        }));
      }
    }
    const where: Record<string, string> = {};
    if (filters.status) where.status = filters.status;
    if (filters.type) where.type = filters.type;
    const complaints = await db.complaint.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true, rank: true } },
      },
    });
    return complaints.map(mapComplaintFromPrisma);
  },

  async create(input: {
    type: string;
    description: string;
    location?: string | null;
    plaintiffName: string;
    plaintiffPhone: string;
    plaintiffEmail?: string | null;
    plaintiffAddr?: string | null;
    citizenId?: string | null;
    commissariatId: string;
  }): Promise<ComplaintRecord> {
    const year = new Date().getFullYear();
    const prefix = `PLT-${year}-`;

    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data: last } = await supabase
          .from('complaints')
          .select('reference')
          .like('reference', `${prefix}%`)
          .order('reference', { ascending: false })
          .limit(1);
        const nextNum = last && last[0] ? parseInt(last[0].reference.split('-')[2], 10) + 1 : 1;
        const reference = `${prefix}${String(nextNum).padStart(3, '0')}`;

        const { data, error } = await supabase
          .from('complaints')
          .insert({
            reference,
            type: input.type,
            status: 'soumise',
            description: input.description,
            location: input.location ?? null,
            plaintiff_name: input.plaintiffName,
            plaintiff_phone: input.plaintiffPhone,
            plaintiff_email: input.plaintiffEmail ?? null,
            plaintiff_addr: input.plaintiffAddr ?? null,
            citizen_id: input.citizenId ?? null,
            commissariat_id: input.commissariatId,
          })
          .select(
            '*, commissariat:commissariats(id,name,code), reviewedBy:officers(id,first_name,last_name,rank)'
          )
          .single();
        if (error) throw error;
        const c: any = data;
        return {
          id: c.id,
          reference: c.reference,
          type: c.type,
          status: c.status,
          description: c.description,
          location: c.location,
          plaintiffName: c.plaintiff_name,
          plaintiffPhone: c.plaintiff_phone,
          plaintiffEmail: c.plaintiff_email,
          plaintiffAddr: c.plaintiff_addr,
          citizenId: c.citizen_id,
          commissariatId: c.commissariat_id,
          reviewedById: c.reviewed_by_id,
          reviewNotes: c.review_notes,
          caseId: c.case_id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          commissariat: c.commissariat,
          reviewedBy: c.reviewedBy,
        };
      }
    }

    const lastComplaint = await db.complaint.findFirst({
      where: { reference: { startsWith: prefix } },
      orderBy: { reference: 'desc' },
    });
    const nextNum = lastComplaint ? parseInt(lastComplaint.reference.split('-')[2], 10) + 1 : 1;
    const reference = `${prefix}${String(nextNum).padStart(3, '0')}`;

    const complaint = await db.complaint.create({
      data: {
        reference,
        type: input.type,
        status: 'soumise',
        description: input.description,
        location: input.location ?? null,
        plaintiffName: input.plaintiffName,
        plaintiffPhone: input.plaintiffPhone,
        plaintiffEmail: input.plaintiffEmail ?? null,
        plaintiffAddr: input.plaintiffAddr ?? null,
        citizenId: input.citizenId ?? null,
        commissariatId: input.commissariatId,
      },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true, rank: true } },
      },
    });

    if (input.citizenId) {
      await db.citizen.update({
        where: { id: input.citizenId },
        data: { totalComplaints: { increment: 1 } },
      }).catch(() => {});
    }

    return mapComplaintFromPrisma(complaint);
  },

  async updateStatus(
    id: string,
    status: string,
    extra?: { reviewedById?: string | null; reviewNotes?: string | null }
  ): Promise<ComplaintRecord | null> {
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const update: Record<string, unknown> = { status };
        if (extra?.reviewedById !== undefined) update.reviewed_by_id = extra.reviewedById;
        if (extra?.reviewNotes !== undefined) update.review_notes = extra.reviewNotes;
        const { data, error } = await supabase
          .from('complaints')
          .update(update)
          .eq('id', id)
          .select(
            '*, commissariat:commissariats(id,name,code), reviewedBy:officers(id,first_name,last_name,rank)'
          )
          .single();
        if (error) throw error;
        const c: any = data;
        return {
          id: c.id,
          reference: c.reference,
          type: c.type,
          status: c.status,
          description: c.description,
          location: c.location,
          plaintiffName: c.plaintiff_name,
          plaintiffPhone: c.plaintiff_phone,
          plaintiffEmail: c.plaintiff_email,
          plaintiffAddr: c.plaintiff_addr,
          citizenId: c.citizen_id,
          commissariatId: c.commissariat_id,
          reviewedById: c.reviewed_by_id,
          reviewNotes: c.review_notes,
          caseId: c.case_id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          commissariat: c.commissariat,
          reviewedBy: c.reviewedBy,
        };
      }
    }
    const complaint = await db.complaint.update({
      where: { id },
      data: {
        status,
        reviewedById: extra?.reviewedById,
        reviewNotes: extra?.reviewNotes,
      },
      include: {
        commissariat: { select: { id: true, name: true, code: true } },
        reviewedBy: { select: { id: true, firstName: true, lastName: true, rank: true } },
      },
    });
    return mapComplaintFromPrisma(complaint);
  },
};

// ============================================================================
// REPOSITORY : CITOYENS
// ============================================================================

export const citizensRepository = {
  async findMany(filters: { status?: string; search?: string } = {}): Promise<CitizenRecord[]> {
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        let query = supabase
          .from('citizens')
          .select('*, commissariat:commissariats(id,name,code)')
          .order('created_at', { ascending: false });
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.search) {
          query = query.or(
            `first_name.ilike.%${filters.search}%,last_name.ilike.%${filters.search}%,phone.ilike.%${filters.search}%,reference.ilike.%${filters.search}%`
          );
        }
        const { data, error } = await query;
        if (error) throw error;
        return (data || []).map((c: any) => ({
          id: c.id,
          reference: c.reference,
          firstName: c.first_name,
          lastName: c.last_name,
          phone: c.phone,
          email: c.email,
          gender: c.gender,
          dateOfBirth: c.date_of_birth,
          address: c.address,
          city: c.city,
          commune: c.commune,
          latitude: c.latitude,
          longitude: c.longitude,
          lastLocation: c.last_location,
          lastLocationAt: c.last_location_at,
          status: c.status,
          verified: c.verified,
          totalAlerts: c.total_alerts,
          totalComplaints: c.total_complaints,
          commissariatId: c.commissariat_id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          commissariat: c.commissariat,
        }));
      }
    }
    const where: any = {};
    if (filters.status) where.status = filters.status;
    if (filters.search) {
      where.OR = [
        { firstName: { contains: filters.search } },
        { lastName: { contains: filters.search } },
        { phone: { contains: filters.search } },
        { reference: { contains: filters.search } },
      ];
    }
    const citizens = await db.citizen.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { commissariat: { select: { id: true, name: true, code: true } } },
    });
    return citizens.map(mapCitizenFromPrisma);
  },

  async updateLocation(
    id: string,
    location: { latitude: number; longitude: number; lastLocation?: string }
  ): Promise<void> {
    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { error } = await supabase
          .from('citizens')
          .update({
            latitude: location.latitude,
            longitude: location.longitude,
            last_location: location.lastLocation ?? null,
            last_location_at: new Date().toISOString(),
          })
          .eq('id', id);
        if (error) throw error;
        return;
      }
    }
    await db.citizen.update({
      where: { id },
      data: {
        latitude: location.latitude,
        longitude: location.longitude,
        lastLocation: location.lastLocation ?? null,
        lastLocationAt: new Date(),
      },
    });
  },

  async create(input: {
    firstName: string;
    lastName: string;
    phone: string;
    email?: string | null;
    gender?: string | null;
    city?: string | null;
    commune?: string | null;
    address?: string | null;
    commissariatId?: string | null;
    passwordHash?: string | null;
  }): Promise<CitizenRecord> {
    const year = new Date().getFullYear();
    const prefix = `CIT-${year}-`;

    if (isSupabaseMode()) {
      const supabase = getSupabaseServer();
      if (supabase) {
        const { data: last } = await supabase
          .from('citizens')
          .select('reference')
          .like('reference', `${prefix}%`)
          .order('reference', { ascending: false })
          .limit(1);
        const nextNum = last && last[0] ? parseInt(last[0].reference.split('-')[2], 10) + 1 : 1;
        const reference = `${prefix}${String(nextNum).padStart(3, '0')}`;

        const { data, error } = await supabase
          .from('citizens')
          .insert({
            reference,
            first_name: input.firstName,
            last_name: input.lastName,
            phone: input.phone,
            email: input.email ?? null,
            gender: input.gender ?? null,
            city: input.city ?? null,
            commune: input.commune ?? null,
            address: input.address ?? null,
            commissariat_id: input.commissariatId ?? null,
            password_hash: input.passwordHash ?? null,
            status: 'actif',
            verified: false,
          })
          .select('*, commissariat:commissariats(id,name,code)')
          .single();
        if (error) throw error;
        const c: any = data;
        return {
          id: c.id,
          reference: c.reference,
          firstName: c.first_name,
          lastName: c.last_name,
          phone: c.phone,
          email: c.email,
          gender: c.gender,
          dateOfBirth: c.date_of_birth,
          address: c.address,
          city: c.city,
          commune: c.commune,
          latitude: c.latitude,
          longitude: c.longitude,
          lastLocation: c.last_location,
          lastLocationAt: c.last_location_at,
          status: c.status,
          verified: c.verified,
          totalAlerts: c.total_alerts,
          totalComplaints: c.total_complaints,
          commissariatId: c.commissariat_id,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
          commissariat: c.commissariat,
        };
      }
    }

    const lastCitizen = await db.citizen.findFirst({
      where: { reference: { startsWith: prefix } },
      orderBy: { reference: 'desc' },
    });
    const nextNum = lastCitizen ? parseInt(lastCitizen.reference.split('-')[2], 10) + 1 : 1;
    const reference = `${prefix}${String(nextNum).padStart(3, '0')}`;

    const citizen = await db.citizen.create({
      data: {
        reference,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        email: input.email ?? null,
        gender: input.gender ?? null,
        city: input.city ?? null,
        commune: input.commune ?? null,
        address: input.address ?? null,
        commissariatId: input.commissariatId ?? null,
        passwordHash: input.passwordHash ?? null,
      },
      include: { commissariat: { select: { id: true, name: true, code: true } } },
    });
    return mapCitizenFromPrisma(citizen);
  },
};

// ============================================================================
// UTILITAIRES
// ============================================================================

export function getBackendStatus() {
  return {
    mode: isSupabaseMode() ? 'supabase' : 'local',
    configured: isSupabaseConfigured,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || null,
  };
}
