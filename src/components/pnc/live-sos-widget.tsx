'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Siren,
  MapPin,
  Phone,
  Clock,
  X,
  Eye,
  ExternalLink,
  Navigation,
  MapPinOff,
  User,
} from 'lucide-react';
import { useLiveSos } from '@/lib/use-realtime';

interface SosCall {
  id: string;
  reference: string;
  citizenName: string | null;
  citizenPhone: string | null;
  latitude: number | null;
  longitude: number | null;
  locationText: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  closedAt: string | null;
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return `il y a ${seconds}s`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

const statusLabels: Record<string, string> = {
  actif: 'ACTIF — En attente',
  'en-route': 'Patrouille en route',
  'sur-place': 'Patrouille sur place',
  cloture: 'Clôturé',
  annule: 'Annulé',
};

const statusColors: Record<string, string> = {
  actif: 'bg-red-500 text-white animate-pulse',
  'en-route': 'bg-orange-500 text-white',
  'sur-place': 'bg-yellow-500 text-black',
  cloture: 'bg-green-600 text-white',
  annule: 'bg-gray-400 text-white',
};

const OSM_OFFSET = 0.005;

function buildOsmEmbedUrl(lat: number, lon: number): string {
  const minLon = lon - OSM_OFFSET;
  const minLat = lat - OSM_OFFSET;
  const maxLon = lon + OSM_OFFSET;
  const maxLat = lat + OSM_OFFSET;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${lat},${lon}`;
}

function buildOsmLinkUrl(lat: number, lon: number): string {
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=17/${lat}/${lon}`;
}

function MiniMap({ lat, lon }: { lat: number | null; lon: number | null }) {
  if (lat == null || lon == null) {
    return (
      <div className="flex flex-col items-center justify-center h-[280px] rounded-lg border border-dashed border-muted-foreground/30 bg-muted/30 text-center p-4">
        <MapPinOff className="w-10 h-10 text-muted-foreground mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          Coordonnées GPS non disponibles
        </p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Aucune position GPS n&apos;a été transmise avec cet appel SOS
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <iframe
        title="Localisation GPS — SOS"
        src={buildOsmEmbedUrl(lat, lon)}
        width="100%"
        height="280"
        style={{ border: 0, borderRadius: 8 }}
        loading="lazy"
      />
      <a
        href={buildOsmLinkUrl(lat, lon)}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-green-700 dark:text-green-400 hover:underline"
      >
        <ExternalLink className="w-3 h-3" />
        Ouvrir dans OpenStreetMap
      </a>
    </div>
  );
}

export function LiveSosWidget() {
  const [sosCalls, setSosCalls] = useState<SosCall[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSos, setSelectedSos] = useState<SosCall | null>(null);

  const fetchSos = useCallback(async () => {
    try {
      const res = await fetch('/api/sos?active=true');
      if (res.ok) {
        const data = await res.json();
        setSosCalls(data);
      }
    } catch (e) {
      console.error('fetchSos error:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSos();
  }, [fetchSos]);

  // Realtime : se rafraîchir à chaque nouveau SOS ou changement de statut
  useLiveSos(undefined, fetchSos);

  const handleClose = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/sos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'cloture', notes: 'Intervention terminée' }),
        });
        fetchSos();
      } catch (e) {
        console.error('close SOS error:', e);
      }
    },
    [fetchSos]
  );

  const handleEnRoute = useCallback(
    async (id: string) => {
      try {
        await fetch(`/api/sos/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'en-route' }),
        });
        fetchSos();
      } catch (e) {
        console.error('update SOS error:', e);
      }
    },
    [fetchSos]
  );

  const activeCount = sosCalls.filter(
    (s) => s.status === 'actif' || s.status === 'en-route' || s.status === 'sur-place'
  ).length;

  return (
    <>
      <Card className="border-red-200 dark:border-red-900/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Siren className={`w-4 h-4 text-red-500 ${activeCount > 0 ? 'animate-pulse' : ''}`} />
              SOS en Direct — App Mobile
              {activeCount > 0 && (
                <Badge className="bg-red-500 text-white animate-pulse">
                  {activeCount} actif{activeCount > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
            <span className="text-[10px] text-muted-foreground">
              Sync temps réel · Supabase Realtime
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="h-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : sosCalls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <CheckCircleGreen />
              <p className="text-sm text-muted-foreground mt-2">
                Aucun SOS actif pour le moment
              </p>
              <p className="text-xs text-muted-foreground">
                Les appels SOS déclenchés depuis l&apos;app mobile apparaîtront ici en temps réel
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {sosCalls.map((sos) => (
                <div
                  key={sos.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-950/10"
                >
                  <Siren className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0 animate-pulse" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-xs font-mono font-semibold text-red-600">
                        {sos.reference}
                      </span>
                      <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[sos.status] || ''}`}>
                        {statusLabels[sos.status] || sos.status}
                      </Badge>
                      <span className="flex items-center gap-1 text-[10px] text-muted-foreground ml-auto">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(sos.createdAt)}
                      </span>
                    </div>
                    {sos.citizenName && (
                      <p className="text-sm font-medium">
                        {sos.citizenName}
                        {sos.citizenPhone && (
                          <span className="text-xs text-muted-foreground ml-2 flex items-center gap-1 inline-flex">
                            <Phone className="w-3 h-3" />
                            {sos.citizenPhone}
                          </span>
                        )}
                      </p>
                    )}
                    {sos.locationText && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" />
                        {sos.locationText}
                        {sos.latitude && sos.longitude && (
                          <span className="font-mono">
                            ({sos.latitude.toFixed(4)}, {sos.longitude.toFixed(4)})
                          </span>
                        )}
                      </p>
                    )}
                    {sos.notes && (
                      <p className="text-xs mt-1 line-clamp-2">{sos.notes}</p>
                    )}
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-green-600 text-green-700 hover:bg-green-50 dark:hover:bg-green-950/40"
                        onClick={() => setSelectedSos(sos)}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        Voir détails et carte
                      </Button>
                      {sos.status === 'actif' && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-orange-400 text-orange-600 hover:bg-orange-50"
                          onClick={() => handleEnRoute(sos.id)}
                        >
                          Patrouille en route
                        </Button>
                      )}
                      {(sos.status === 'actif' || sos.status === 'en-route' || sos.status === 'sur-place') && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs border-green-600 text-green-700 hover:bg-green-50"
                          onClick={() => handleClose(sos.id)}
                        >
                          <X className="w-3 h-3 mr-1" />
                          Clôturer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SOS Detail + Map Dialog */}
      <Dialog
        open={!!selectedSos}
        onOpenChange={(open) => {
          if (!open) setSelectedSos(null);
        }}
      >
        <DialogContent className="max-w-2xl">
          {selectedSos && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 flex-wrap">
                  <Siren className="w-5 h-5 text-red-500" />
                  SOS {selectedSos.reference}
                  <Badge className={`text-[10px] ${statusColors[selectedSos.status] || ''}`}>
                    {statusLabels[selectedSos.status] || selectedSos.status}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {/* Citizen info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <User className="w-3 h-3" /> Citoyen
                    </p>
                    <p className="font-medium">{selectedSos.citizenName || 'Anonyme'}</p>
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Téléphone
                    </p>
                    <p className="font-medium">{selectedSos.citizenPhone || '—'}</p>
                  </div>
                </div>

                {/* GPS coords */}
                {selectedSos.latitude != null && selectedSos.longitude != null && (
                  <div className="text-sm space-y-0.5">
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <Navigation className="w-3 h-3" /> Coordonnées GPS
                    </p>
                    <p className="font-mono text-xs">
                      Lat: {selectedSos.latitude.toFixed(6)}, Lon: {selectedSos.longitude.toFixed(6)}
                    </p>
                  </div>
                )}

                {/* Location text */}
                {selectedSos.locationText && (
                  <div className="text-sm space-y-0.5">
                    <p className="text-muted-foreground text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Lieu indiqué
                    </p>
                    <p>{selectedSos.locationText}</p>
                  </div>
                )}

                {/* Mini map section */}
                <div className="space-y-1.5">
                  <p className="text-muted-foreground text-xs flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Localisation GPS
                  </p>
                  <MiniMap lat={selectedSos.latitude} lon={selectedSos.longitude} />
                </div>

                {/* Notes */}
                {selectedSos.notes && (
                  <div className="text-sm space-y-0.5">
                    <p className="text-muted-foreground text-xs">Notes / Description</p>
                    <p className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                      {selectedSos.notes}
                    </p>
                  </div>
                )}

                {/* Time info */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Déclenché {formatTimeAgo(selectedSos.createdAt)}
                  </span>
                  {selectedSos.closedAt && (
                    <span className="flex items-center gap-1">
                      <X className="w-3 h-3" />
                      Clôturé {formatTimeAgo(selectedSos.closedAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Action footer */}
              {(selectedSos.status === 'actif' ||
                selectedSos.status === 'en-route' ||
                selectedSos.status === 'sur-place') && (
                <DialogFooter>
                  {selectedSos.status === 'actif' && (
                    <Button
                      variant="outline"
                      className="border-orange-400 text-orange-600 hover:bg-orange-50"
                      onClick={() => {
                        handleEnRoute(selectedSos.id);
                        setSelectedSos(null);
                      }}
                    >
                      Patrouille en route
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => {
                      handleClose(selectedSos.id);
                      setSelectedSos(null);
                    }}
                  >
                    <X className="w-3 h-3 mr-1" />
                    Clôturer
                  </Button>
                </DialogFooter>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

function CheckCircleGreen() {
  return (
    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
      <svg
        className="w-6 h-6 text-green-600"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  );
}
