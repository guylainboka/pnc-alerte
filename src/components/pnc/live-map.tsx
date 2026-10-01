'use client';

/**
 * Carte Live PNC — Maplibre GL
 * ============================================================
 * Affiche en temps réel :
 *  - Tous les commissariats PNC (marqueurs verts)
 *  - Tous les SOS actifs (marqueurs rouges pulsants)
 *  - Les signalements récents (marqueurs oranges)
 *
 * Données : backend NestJS (port 3001) via /api/map/*
 * Temps réel : Socket.io (événements sos:new, sos:update)
 *
 * Tuiles : OpenStreetMap (gratuit, aucune clé API)
 */

import { useEffect, useRef, useState } from 'react';
import {
  Map as MaplibreMap,
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { io, Socket } from 'socket.io-client';
import { Siren, Building2, Navigation } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { Badge } from '@/components/ui/badge';

interface SosFeature {
  id: string;
  reference: string;
  citizenName: string | null;
  citizenPhone: string | null;
  status: string;
  createdAt: string;
  latitude: number;
  longitude: number;
  locationText?: string | null;
  notes?: string | null;
}

interface CommissariatFeature {
  id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
}

const statusLabels: Record<string, string> = {
  actif: 'ACTIF — En attente',
  'en-route': 'Patrouille en route',
  'sur-place': 'Patrouille sur place',
  cloture: 'Clôturé',
  annule: 'Annulé',
};

const statusColors: Record<string, string> = {
  actif: '#ef4444', // red-500
  'en-route': '#f97316', // orange-500
  'sur-place': '#eab308', // yellow-500
  cloture: '#22c55e', // green-500
  annule: '#9ca3af', // gray-400
};

// Centre de Kinshasa
const KINSHASA_CENTER: [number, number] = [15.307, -4.325];

function SosPin({ color }: { color: string }) {
  return (
    <div style={{ transform: 'translateY(-100%)' }}>
      <div
        style={{
          width: 28,
          height: 28,
          background: color,
          borderRadius: '50% 50% 50% 0',
          transform: 'rotate(-45deg)',
          border: '2px solid white',
          boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Siren
          style={{
            width: 14,
            height: 14,
            color: 'white',
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    </div>
  );
}

function CommissariatPin() {
  return (
    <div
      style={{
        width: 24,
        height: 24,
        background: '#1a5632',
        borderRadius: '50%',
        border: '2px solid white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Building2 style={{ width: 12, height: 12, color: 'white' }} />
    </div>
  );
}

export function LiveMap() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MaplibreMap | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const sosMarkersRef = useRef<Map<string, Marker>>(new Map());
  const commissariatMarkersRef = useRef<Map<string, Marker>>(new Map());

  const [activeSos, setActiveSos] = useState<SosFeature[]>([]);
  const [commissariats, setCommissariats] = useState<CommissariatFeature[]>([]);
  const [connected, setConnected] = useState(false);
  const [nearestCommissariat, setNearestCommissariat] = useState<string | null>(null);

  // Charger les données initiales
  useEffect(() => {
    Promise.all([
      fetch('/api/map/active-sos?XTransformPort=3001').then((r) => r.json()),
      fetch('/api/map/commissariats?XTransformPort=3001').then((r) => r.json()),
    ])
      .then(([sosData, comData]) => {
        if (sosData?.features) {
          const sos: SosFeature[] = sosData.features.map((f: any) => ({
            id: f.properties.id,
            reference: f.properties.reference,
            citizenName: f.properties.citizenName,
            citizenPhone: f.properties.citizenPhone,
            status: f.properties.status,
            createdAt: f.properties.createdAt,
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
            locationText: f.properties.locationText,
            notes: f.properties.notes,
          }));
          setActiveSos(sos);
        }
        if (comData?.features) {
          const coms: CommissariatFeature[] = comData.features.map((f: any) => ({
            id: f.properties.id,
            name: f.properties.name,
            code: f.properties.code,
            latitude: f.geometry.coordinates[1],
            longitude: f.geometry.coordinates[0],
          }));
          setCommissariats(coms);
        }
      })
      .catch(console.error);
  }, []);

  // Initialiser la carte
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new MaplibreMap({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
          },
        ],
      },
      center: KINSHASA_CENTER,
      zoom: 12,
    });

    map.addControl(new NavigationControl(), 'top-right');
    map.addControl(new ScaleControl({ unit: 'metric' }));
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Marqueurs commissariats (stables)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    commissariatMarkersRef.current.forEach((m) => m.remove());
    commissariatMarkersRef.current.clear();

    commissariats.forEach((com) => {
      const el = document.createElement('div');
      const root = createRoot(el);
      root.render(<CommissariatPin />);
      const marker = new Marker({ element: el })
        .setLngLat([com.longitude, com.latitude])
        .setPopup(
          new Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px; min-width: 180px;">
              <strong>${com.name}</strong><br/>
              <span style="font-size: 11px; color: #666;">Code: ${com.code}</span><br/>
              <span style="font-size: 11px; color: #999;">Commissariat PNC</span>
            </div>`
          )
        )
        .addTo(map);
      commissariatMarkersRef.current.set(com.id, marker);
    });
  }, [commissariats]);

  // Marqueurs SOS (mis à jour en temps réel)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    // Supprimer les marqueurs obsolètes
    sosMarkersRef.current.forEach((marker, id) => {
      if (!activeSos.find((s) => s.id === id)) {
        marker.remove();
        sosMarkersRef.current.delete(id);
      }
    });

    // Ajouter / mettre à jour les marqueurs
    activeSos.forEach((sos) => {
      const color = statusColors[sos.status] || '#ef4444';
      const existing = sosMarkersRef.current.get(sos.id);
      if (existing) {
        // Mettre à jour le popup
        existing.setPopup(
          new Popup({ offset: 25, maxWidth: 280 }).setHTML(
            `<div style="padding: 8px; min-width: 220px;">
              <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                <strong style="font-size: 12px; font-family: monospace;">${sos.reference}</strong>
              </div>
              <div style="margin-bottom: 4px;">
                <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                  ${statusLabels[sos.status] || sos.status}
                </span>
              </div>
              ${sos.citizenName ? `<div style="font-size: 12px; font-weight: 500;">${sos.citizenName}</div>` : ''}
              ${sos.citizenPhone ? `<div style="font-size: 11px; color: #666;">📞 ${sos.citizenPhone}</div>` : ''}
              ${sos.locationText ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">📍 ${sos.locationText}</div>` : ''}
              <div style="font-size: 10px; color: #999; margin-top: 4px;">📅 ${new Date(sos.createdAt).toLocaleString('fr-FR')}</div>
              <div style="font-size: 10px; color: #999; font-family: monospace;">📌 ${sos.latitude.toFixed(4)}, ${sos.longitude.toFixed(4)}</div>
            </div>`
          )
        );
      } else {
        const el = document.createElement('div');
        const root = createRoot(el);
        root.render(<SosPin color={color} />);
        const marker = new Marker({ element: el })
          .setLngLat([sos.longitude, sos.latitude])
          .setPopup(
            new Popup({ offset: 25, maxWidth: 280 }).setHTML(
              `<div style="padding: 8px; min-width: 220px;">
                <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
                  <strong style="font-size: 12px; font-family: monospace;">${sos.reference}</strong>
                </div>
                <div style="margin-bottom: 4px;">
                  <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px;">
                    ${statusLabels[sos.status] || sos.status}
                  </span>
                </div>
                ${sos.citizenName ? `<div style="font-size: 12px; font-weight: 500;">${sos.citizenName}</div>` : ''}
                ${sos.citizenPhone ? `<div style="font-size: 11px; color: #666;">📞 ${sos.citizenPhone}</div>` : ''}
                ${sos.locationText ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">📍 ${sos.locationText}</div>` : ''}
                <div style="font-size: 10px; color: #999; margin-top: 4px;">📅 ${new Date(sos.createdAt).toLocaleString('fr-FR')}</div>
                <div style="font-size: 10px; color: #999; font-family: monospace;">📌 ${sos.latitude.toFixed(4)}, ${sos.longitude.toFixed(4)}</div>
              </div>`
            )
          )
          .addTo(map);
        sosMarkersRef.current.set(sos.id, marker);

        // Si nouveau SOS actif → centrer la carte + calculer le commissariat le plus proche
        if (sos.status === 'actif') {
          map.flyTo({
            center: [sos.longitude, sos.latitude],
            zoom: 15,
            duration: 1500,
          });
          // Commissariat le plus proche
          fetch(
            `/api/map/nearest-commissariat?lat=${sos.latitude}&lon=${sos.longitude}&XTransformPort=3001`
          )
            .then((r) => r.json())
            .then((d) => {
              if (d?.name) setNearestCommissariat(d.name);
            })
            .catch(() => {});
        }
      }
    });
  }, [activeSos]);

  // Connexion Socket.io pour le temps réel
  useEffect(() => {
    const socket = io('/?XTransformPort=3001', {
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      console.log('🟢 Connecté au backend temps réel (NestJS + Socket.io)');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('sos:new', (sos: SosFeature) => {
      console.log('🚨 Nouveau SOS reçu:', sos.reference);
      setActiveSos((prev) => {
        if (prev.find((s) => s.id === sos.id)) return prev;
        return [sos, ...prev];
      });
    });

    socket.on('sos:update', (sos: SosFeature) => {
      setActiveSos((prev) =>
        prev.map((s) => (s.id === sos.id ? sos : s))
      );
    });

    socket.on('alert:new', (alert: any) => {
      console.log('📝 Nouveau signalement:', alert.reference);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const activeCount = activeSos.filter(
    (s) => s.status === 'actif' || s.status === 'en-route' || s.status === 'sur-place'
  ).length;

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      {/* Header overlay */}
      <div className="absolute top-2 left-2 z-10 bg-card/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border">
        <div className="flex items-center gap-2">
          <span
            className={`relative flex h-2.5 w-2.5 ${activeCount > 0 ? 'animate-pulse' : ''}`}
          >
            <span
              className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                connected ? 'bg-green-500 animate-ping' : 'bg-gray-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                connected ? 'bg-green-600' : 'bg-gray-400'
              }`}
            />
          </span>
          <span className="text-xs font-medium">
            {connected ? 'Temps réel actif' : 'Hors ligne'}
          </span>
          {activeCount > 0 && (
            <Badge className="bg-red-500 text-white animate-pulse ml-2">
              {activeCount} SOS actif{activeCount > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </div>

      {/* Map container */}
      <div ref={mapContainer} className="w-full h-[500px] relative" />

      {/* Footer overlay */}
      {nearestCommissariat && (
        <div className="absolute bottom-2 left-2 z-10 bg-card/95 backdrop-blur px-3 py-2 rounded-lg shadow-md border max-w-xs">
          <div className="flex items-center gap-2">
            <Navigation className="w-4 h-4 text-green-600" />
            <div>
              <p className="text-[10px] text-muted-foreground">Commissariat le plus proche</p>
              <p className="text-xs font-medium">{nearestCommissariat}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
