// ============================================================================
// Map Service — Données géospatiales (GeoJSON) via Turf.js
// ============================================================================
// Toutes les réponses sont au format GeoJSON FeatureCollection<Point>.
// Le calcul du commissariat le plus proche utilise turf.nearestPoint().
// ============================================================================

import { Injectable } from '@nestjs/common';
import { query } from '../../common/database/pg.client';
import { nearestPoint, toGeoJSON, distanceKm, bearingDeg, GeoPoint } from '../../common/spatial/turf.helper';
import type { FeatureCollection, Point } from 'geojson';

@Injectable()
export class MapService {
  /**
   * GET /api/map/active-sos
   * Retourne un FeatureCollection des SOS actifs (actif, en-route, sur-place)
   * avec propriétés : id, reference, citizenName, phone, status, createdAt.
   */
  async getActiveSosGeoJSON(): Promise<FeatureCollection<Point>> {
    const rows = await query<any>(
      `SELECT s.id, s.reference, s.latitude, s.longitude, s.location_text,
              s.status, s.created_at,
              p.full_name AS citizen_name, p.phone AS citizen_phone
       FROM sos_calls s
       LEFT JOIN profiles p ON p.id = s.user_id
       WHERE s.status IN ('actif', 'en-route', 'sur-place')`
    );

    const points: GeoPoint[] = rows
      .filter((r) => r.latitude !== null && r.longitude !== null)
      .map((r) => ({
        id: r.id,
        reference: r.reference,
        latitude: r.latitude,
        longitude: r.longitude,
        locationText: r.location_text,
        status: r.status,
        createdAt: r.created_at,
        citizenName: r.citizen_name,
        phone: r.citizen_phone,
      }));

    return toGeoJSON(points);
  }

  /**
   * GET /api/map/commissariats
   * Retourne un FeatureCollection de tous les commissariats.
   */
  async getCommissariatsGeoJSON(): Promise<FeatureCollection<Point>> {
    const rows = await query<any>(`SELECT * FROM commissariats`);

    const points: GeoPoint[] = rows
      .filter((r) => r.latitude !== null && r.longitude !== null)
      .map((r) => ({
        id: r.id,
        name: r.name,
        code: r.code,
        address: r.address,
        phone: r.phone,
        city: r.city,
        province: r.province,
        latitude: r.latitude,
        longitude: r.longitude,
      }));

    return toGeoJSON(points);
  }

  /**
   * GET /api/map/nearest-commissariat?lat=X&lon=Y
   * Retourne le commissariat le plus proche + distance + bearing.
   * Utilise turf.nearestPoint().
   */
  async getNearestCommissariat(lat: number, lon: number): Promise<{
    commissariat: any;
    distance: number;
    bearing: number;
  } | null> {
    const rows = await query<any>(`SELECT * FROM commissariats`);

    const points: GeoPoint[] = rows
      .filter((r) => r.latitude !== null && r.longitude !== null)
      .map((r) => ({ ...r, id: r.id, latitude: r.latitude, longitude: r.longitude }));

    const result = nearestPoint(lat, lon, points);
    if (!result) {
      return null;
    }

    return {
      commissariat: result.point,
      distance: distanceKm(lat, lon, result.point.latitude, result.point.longitude),
      bearing: bearingDeg(lat, lon, result.point.latitude, result.point.longitude),
    };
  }
}
