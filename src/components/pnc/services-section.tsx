'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Globe,
  ArrowUp,
  ArrowDown,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Server,
  Activity,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';

interface ServiceLogData {
  id: string;
  direction: string;
  messageType: string;
  content: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
}

interface ServiceData {
  id: string;
  name: string;
  type: string;
  endpoint: string;
  status: string;
  lastSyncAt: string | null;
  description: string | null;
  logs: ServiceLogData[];
}

interface AllLogData {
  id: string;
  direction: string;
  messageType: string;
  content: string;
  status: string;
  errorMessage: string | null;
  createdAt: string;
  service: { name: string; type: string };
}

const typeIcons: Record<string, React.ElementType> = {
  justice: Server,
  hopital: Activity,
  mairie: Globe,
  douane: Globe,
  immigration: Globe,
  autre: Globe,
};

const typeLabels: Record<string, string> = {
  justice: 'Justice',
  hopital: 'Hôpital',
  mairie: 'Mairie',
  douane: 'Douanes',
  immigration: 'Immigration',
  autre: 'Autre',
};

const statusColors: Record<string, string> = {
  actif: 'bg-green-500 text-white',
  inactif: 'bg-gray-400 text-white',
  erreur: 'bg-red-500 text-white',
};

const logStatusColors: Record<string, string> = {
  succes: 'text-green-600',
  echec: 'text-red-600',
  en_attente: 'text-yellow-600',
};

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export function ServicesSection() {
  const [services, setServices] = useState<ServiceData[]>([]);
  const [allLogs, setAllLogs] = useState<AllLogData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<ServiceData | null>(null);

  const fetchData = async () => {
    try {
      const [servicesRes, logsRes] = await Promise.all([
        fetch('/api/external-services'),
        fetch('/api/service-logs'),
      ]);
      const servicesData = await servicesRes.json();
      const logsData = await logsRes.json();
      setServices(servicesData);
      setAllLogs(logsData);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const syncService = async (id: string) => {
    try {
      await fetch(`/api/external-services/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lastSyncAt: new Date().toISOString() }),
      });
      toast.success('Synchronisation lancée');
      fetchData();
    } catch {
      toast.error('Erreur de synchronisation');
    }
  };

  const activeServices = services.filter((s) => s.status === 'actif').length;
  const failedLogs = allLogs.filter((l) => l.status === 'echec').length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeServices}</p>
              <p className="text-xs text-muted-foreground">Services actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{services.length}</p>
              <p className="text-xs text-muted-foreground">Services total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className={`p-3 rounded-full ${failedLogs > 0 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{failedLogs}</p>
              <p className="text-xs text-muted-foreground">Erreurs récentes</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Cards */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Services Externes Connectés</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            [1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-24 bg-muted rounded" />
                </CardContent>
              </Card>
            ))
          ) : (
            services.map((service) => {
              const Icon = typeIcons[service.type] || Globe;
              const recentLogs = service.logs.slice(0, 3);
              return (
                <Card
                  key={service.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => setSelectedService(service)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{service.name}</h4>
                          <p className="text-xs text-muted-foreground">{typeLabels[service.type] || service.type}</p>
                        </div>
                      </div>
                      <Badge className={`text-[10px] ${statusColors[service.status]}`}>
                        {service.status}
                      </Badge>
                    </div>
                    {service.description && (
                      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{service.description}</p>
                    )}
                    {/* Recent activity */}
                    {recentLogs.length > 0 && (
                      <div className="space-y-1.5 border-t pt-3">
                        <p className="text-[10px] text-muted-foreground font-medium">Activité récente</p>
                        {recentLogs.map((log) => (
                          <div key={log.id} className="flex items-center gap-2 text-xs">
                            {log.direction === 'envoi' ? (
                              <ArrowUp className="w-3 h-3 text-blue-500" />
                            ) : (
                              <ArrowDown className="w-3 h-3 text-green-500" />
                            )}
                            <span className={`flex-1 line-clamp-1 ${logStatusColors[log.status]}`}>
                              {log.content}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-muted-foreground">
                        {service.lastSyncAt ? `Sync: ${formatTimeAgo(service.lastSyncAt)}` : 'Jamais synchronisé'}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          syncService(service.id);
                        }}
                      >
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Sync
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Communication Logs */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Journal des Communications
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-96 overflow-y-auto">
          <div className="space-y-2">
            {allLogs.map((log) => (
              <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50">
                <div className="mt-0.5">
                  {log.direction === 'envoi' ? (
                    <ArrowUp className="w-4 h-4 text-blue-500" />
                  ) : (
                    <ArrowDown className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-medium">{log.service.name}</span>
                    <Badge variant="outline" className="text-[10px]">{log.messageType}</Badge>
                    <span className={`text-[10px] font-medium ${logStatusColors[log.status]}`}>
                      {log.status === 'succes' ? '✓' : log.status === 'echec' ? '✗' : '⏳'}
                    </span>
                  </div>
                  <p className="text-sm line-clamp-1">{log.content}</p>
                  {log.errorMessage && (
                    <p className="text-xs text-red-500 mt-0.5">{log.errorMessage}</p>
                  )}
                </div>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatTimeAgo(log.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Service Detail Dialog */}
      <Dialog open={!!selectedService} onOpenChange={() => setSelectedService(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedService && (() => {
            const Icon = typeIcons[selectedService.type] || Globe;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-primary" />
                    {selectedService.name}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[selectedService.status]}>{selectedService.status}</Badge>
                    <Badge variant="outline">{typeLabels[selectedService.type] || selectedService.type}</Badge>
                  </div>

                  <div className="text-sm space-y-2">
                    <div>
                      <p className="text-muted-foreground text-xs">Endpoint</p>
                      <p className="font-mono text-xs bg-muted p-2 rounded">{selectedService.endpoint}</p>
                    </div>
                    {selectedService.description && (
                      <div>
                        <p className="text-muted-foreground text-xs">Description</p>
                        <p>{selectedService.description}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs">Dernière synchronisation</p>
                      <p>{selectedService.lastSyncAt ? formatTimeAgo(selectedService.lastSyncAt) : 'Jamais'}</p>
                    </div>
                  </div>

                  {/* All logs for this service */}
                  {selectedService.logs.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Historique des communications</h4>
                      <div className="space-y-2">
                        {selectedService.logs.map((log) => (
                          <div key={log.id} className="p-3 rounded-lg border">
                            <div className="flex items-center gap-2 mb-1">
                              {log.direction === 'envoi' ? (
                                <ArrowUp className="w-3 h-3 text-blue-500" />
                              ) : (
                                <ArrowDown className="w-3 h-3 text-green-500" />
                              )}
                              <Badge variant="outline" className="text-[10px]">{log.messageType}</Badge>
                              <span className={`text-[10px] font-medium ${logStatusColors[log.status]}`}>
                                {log.status}
                              </span>
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {formatTimeAgo(log.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm">{log.content}</p>
                            {log.errorMessage && (
                              <p className="text-xs text-red-500 mt-1">Erreur: {log.errorMessage}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <Button onClick={() => syncService(selectedService.id)}>
                      <RefreshCw className="w-4 h-4 mr-1" />
                      Synchroniser
                    </Button>
                  </div>
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
