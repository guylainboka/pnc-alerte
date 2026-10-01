// ============================================================================
// Turf.js helpers — Requêtes spatiales sans PostGIS (dev)
// ============================================================================
// En développement, on utilise PGlite (sans PostGIS). Les calculs spatiaux
// (distance, point le plus proche, cap) se font donc côté applicatif avec
// Turf.js. En production, ces helpers peuvent être remplacés par des
// requêtes SQL PostGIS ST_Distance, etc.
// ============================================================================

import * as turf from '@turf/turf';
import type { Feature, Point, FeatureCollection } from 'geojson';

export interface GeoPoint {
  id: string;
  latitude: number;
  longitude: number;
  [key: string]: any;
}

/**
 * Crée un point GeoJSON Turf (coordonnées [lng, lat]).
 */
export function makePoint(lng: number, lat: number): Feature<Point> {
  return turf.point([lng, lat]);
}

/**
 * Distance en kilomètres entre deux coordonnées (lat, lng).
 */
export function distanceKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const p1 = makePoint(lng1, lat1);
  const p2 = makePoint(lng2, lat2);
  return turf.distance(p1, p2, { units: 'kilometers' });
}

/**
 * Cap (bearing) en degrés entre deux coordonnées (0 = nord, sens horaire).
 */
export function bearingDeg(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const p1 = makePoint(lng1, lat1);
  const p2 = makePoint(lng2, lat2);
  return turf.bearing(p1, p2);
}

/**
 * Trouve le point le plus proche d'une cible parmi une liste de points.
 * Retourne le point le plus proche + sa distance en km + le cap (bearing).
 */
export function nearestPoint(
  targetLat: number,
  targetLng: number,
  points: GeoPoint[]
): { point: GeoPoint; distance: number; bearing: number } | null {
  if (!points || points.length === 0) {
    return null;
  }

  const fc: FeatureCollection<Point> = {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature' as const,
      geometry: { type: 'Point', coordinates: [p.longitude, p.latitude] },
      properties: { id: p.id, ...p },
    })),
  };

  const target = makePoint(targetLng, targetLat);
  const nearest = turf.nearestPoint(target, fc);

  if (!nearest) {
    return null;
  }

  const idx = nearest.properties.featureIndex as number;
  const point = points[idx];
  const dist = nearest.properties.distanceToPoint as number;
  const bear = bearingDeg(targetLat, targetLng, point.latitude, point.longitude);

  return { point, distance: dist, bearing: bear };
}

/**
 * Construit un GeoJSON FeatureCollection à partir d'une liste de points.
 */
export function toGeoJSON(
  points: GeoPoint[]
): FeatureCollection<Point> {
  return {
    type: 'FeatureCollection',
    features: points.map((p) => ({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [p.longitude, p.latitude],
      },
      properties: { ...p },
    })),
  };
}
