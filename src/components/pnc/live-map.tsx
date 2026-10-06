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
 *
 * SÉCURITÉ : les popups sont construits via setDOMContent() avec des
 * nœuds DOM créés via document.createElement + textContent. AUCUNE
 * interpolation de données utilisateur dans du HTML → immunité XSS.
 */

import { useEffect, useRef, useState } from 'react';
import {
  Map as MaplibreMap,
  Marker,
  Popup,
  NavigationControl,
  ScaleControl,
  setWorkerUrl,
} from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { io, Socket } from 'socket.io-client';
import { Siren, Building2, Navigation } from 'lucide-react';
import { createRoot } from 'react-dom/client';
import { Badge } from '@/components/ui/badge';

// Le bundler Next.js casse la résolution du worker embarqué de MapLibre
// (« Worker failed to load »). On sert explicitement le worker depuis /public
// (copié de node_modules/maplibre-gl/dist/maplibre-gl-worker.mjs).
if (typeof window !== 'undefined') {
  setWorkerUrl('/maplibre-gl-worker.mjs');
}

const isDev = process.env.NODE_ENV !== 'production';
const log = (...args: unknown[]) => {
  if (isDev) console.log(...args);
};

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

// ============================================================================
// Helpers de construction DOM SÉCURISÉS (anti-XSS)
// ============================================================================
// Tous les textes proviennent de la base de données (citoyens, commissariats)
// et peuvent contenir des caractères malveillants. On les insère via
// textContent (qui échappe automatiquement le HTML) — JAMAIS via innerHTML.

function el(
  tag: string,
  opts: {
    text?: string;
    className?: string;
    style?: Record<string, string | number>;
    children?: HTMLElement[];
  } = {}
): HTMLElement {
  const node = document.createElement(tag);
  if (opts.text !== undefined) node.textContent = opts.text;
  if (opts.className) node.className = opts.className;
  if (opts.style) {
    for (const [k, v] of Object.entries(opts.style)) {
      (node.style as unknown as Record<string, string | number>)[k] = v;
    }
  }
  if (opts.children) {
    for (const c of opts.children) node.appendChild(c);
  }
  return node;
}

function buildCommissariatPopup(com: CommissariatFeature): HTMLElement {
  // Toutes les valeurs utilisateur passent par textContent → pas d'injection HTML possible
  return el('div', {
    style: { padding: '8px', minWidth: '180px' },
    children: [
      el('strong', { text: com.name }),
      el('br'),
      el('span', {
        text: `Code: ${com.code}`,
        style: { fontSize: '11px', color: '#666' },
      }),
      el('br'),
      el('span', {
        text: 'Commissariat PNC',
        style: { fontSize: '11px', color: '#999' },
      }),
    ],
  });
}

function buildSosPopup(sos: SosFeature): HTMLElement {
  const color = statusColors[sos.status] || '#ef4444';
  const children: HTMLElement[] = [];

  // Référence (neutre, format contrôlé)
  children.push(
    el('div', {
      style: { marginBottom: '4px' },
      children: [
        el('strong', {
          text: sos.reference,
          style: { fontSize: '12px', fontFamily: 'monospace' },
        }),
      ],
    })
  );

  // Badge de statut (couleur statique issue de la map, texte mappé)
  children.push(
    el('div', {
      style: { marginBottom: '4px' },
      children: [
        el('span', {
          text: statusLabels[sos.status] || sos.status,
          style: {
            background: color,
            color: 'white',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '10px',
          },
        }),
      ],
    })
  );

  // Données citoyen (VARIABLES — risquées si on utilisait innerHTML)
  if (sos.citizenName) {
    children.push(
      el('div', {
        text: sos.citizenName,
        style: { fontSize: '12px', fontWeight: 500 },
      })
    );
  }
  if (sos.citizenPhone) {
    children.push(
      el('div', {
        text: `📞 ${sos.citizenPhone}`,
        style: { fontSize: '11px', color: '#666' },
      })
    );
  }
  if (sos.locationText) {
    children.push(
      el('div', {
        text: `📍 ${sos.locationText}`,
        style: { fontSize: '11px', color: '#666', marginTop: '2px' },
      })
    );
  }
  if (sos.notes) {
    children.push(
      el('div', {
        text: `📝 ${sos.notes}`,
        style: { fontSize: '11px', color: '#666', marginTop: '2px' },
      })
    );
  }

  // Dates / coords (valeurs internes, mais on reste cohérent avec textContent)
  children.push(
    el('div', {
      text: `📅 ${new Date(sos.createdAt).toLocaleString('fr-FR')}`,
      style: { fontSize: '10px', color: '#999', marginTop: '4px' },
    })
  );
  children.push(
    el('div', {
      text: `📌 ${sos.latitude.toFixed(4)}, ${sos.longitude.toFixed(4)}`,
      style: { fontSize: '10px', color: '#999', fontFamily: 'monospace' },
    })
  );

  return el('div', {
    style: { padding: '8px', minWidth: '220px' },
    children,
  });
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

  // Récupère le JWT stocké après login (pour authentifier les appels backend)
  function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem('pnc_auth_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      return parsed?.token ?? null;
    } catch {
      return null;
    }
  }

  function authHeaders(): Record<string, string> {
    const token = getAuthToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  // Charger les données initiales
  useEffect(() => {
    let active = true;
    const headers = authHeaders();
    Promise.all([
      fetch('/api/map/active-sos?XTransformPort=3001', { headers }).then((r) => r.json()),
      fetch('/api/map/commissariats?XTransformPort=3001', { headers }).then((r) => r.json()),
    ])
      .then(([sosData, comData]) => {
        if (!active) return;
        if (sosData?.features) {
          const sos: SosFeature[] = sosData.features.map((f: any) => ({
            id: f.properties.id,
            reference: f.properties.reference,
            citizenName: f.properties.citizenName,
            citizenPhone: f.properties.phone ?? f.properties.citizenPhone,
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
      .catch((err) => {
        if (isDev) console.error('LiveMap: erreur chargement initial:', err);
      });
    return () => {
      active = false;
    };
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

  // Marqueurs commissariats (stables) — popups en DOM sécurisé (anti-XSS)
  useEffect(() => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    commissariatMarkersRef.current.forEach((m) => m.remove());
    commissariatMarkersRef.current.clear();

    commissariats.forEach((com) => {
      const pinEl = document.createElement('div');
      const root = createRoot(pinEl);
      root.render(<CommissariatPin />);
      const marker = new Marker({ element: pinEl })
        .setLngLat([com.longitude, com.latitude])
        .setPopup(
          new Popup({ offset: 25 }).setDOMContent(buildCommissariatPopup(com))
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

    // Ajouter / mettre à jour les marqueurs — popups en DOM sécurisé (anti-XSS)
    activeSos.forEach((sos) => {
      const color = statusColors[sos.status] || '#ef4444';
      const existing = sosMarkersRef.current.get(sos.id);
      if (existing) {
        // Mettre à jour le popup (DOM safe, pas d'interpolation HTML)
        existing.setPopup(
          new Popup({ offset: 25, maxWidth: '280px' }).setDOMContent(buildSosPopup(sos))
        );
      } else {
        const pinEl = document.createElement('div');
        const root = createRoot(pinEl);
        root.render(<SosPin color={color} />);
        const marker = new Marker({ element: pinEl })
          .setLngLat([sos.longitude, sos.latitude])
          .setPopup(
            new Popup({ offset: 25, maxWidth: '280px' }).setDOMContent(buildSosPopup(sos))
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
            `/api/map/nearest-commissariat?lat=${sos.latitude}&lon=${sos.longitude}&XTransformPort=3001`,
            { headers: authHeaders() }
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
    const token = getAuthToken();
    const socket = io('/?XTransformPort=3001', {
      transports: ['websocket', 'polling'],
      auth: { token: token ?? undefined },
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      log('🟢 Connecté au backend temps réel (NestJS + Socket.io)');
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('sos:new', (sos: SosFeature) => {
      log('🚨 Nouveau SOS reçu:', sos.reference);
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
      log('📝 Nouveau signalement:', alert?.reference);
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
