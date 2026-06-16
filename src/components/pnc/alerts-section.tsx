'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertTriangle, Bell, Clock, MapPin, Plus, Filter, Phone, User } from 'lucide-react';
import { toast } from 'sonner';

interface AlertData {
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
  responseTime: number | null;
  createdAt: string;
  commissariat: { name: string };
  assignedTo: { firstName: string; lastName: string; rank: string } | null;
}

const priorityColors: Record<string, string> = {
  urgente: 'bg-red-500 text-white',
  haute: 'bg-orange-500 text-white',
  moyenne: 'bg-yellow-500 text-black',
  basse: 'bg-gray-400 text-white',
};

const statusColors: Record<string, string> = {
  recue: 'bg-blue-500 text-white',
  en_cours: 'bg-yellow-500 text-black',
  traitee: 'bg-green-500 text-white',
  cloturee: 'bg-gray-400 text-white',
};

const typeLabels: Record<string, string> = {
  vol: 'Vol',
  agression: 'Agression',
  accident: 'Accident',
  incendie: 'Incendie',
  autre: 'Autre',
};

const statusLabels: Record<string, string> = {
  recue: 'Reçue',
  en_cours: 'En cours',
  traitee: 'Traitée',
  cloturee: 'Clôturée',
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

export function AlertsSection() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterPriority !== 'all') params.set('priority', filterPriority);
      if (filterType !== 'all') params.set('type', filterType);
      const res = await fetch(`/api/alerts?${params.toString()}`);
      const data = await res.json();
      setAlerts(data);
    } catch {
      toast.error('Erreur lors du chargement des alertes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterStatus, filterPriority, filterType]);

  const updateAlertStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/alerts/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success(`Alerte mise à jour: ${statusLabels[status] || status}`);
      fetchAlerts();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const urgentCount = alerts.filter((a) => a.priority === 'urgente' && (a.status === 'recue' || a.status === 'en_cours')).length;

  return (
    <div className="space-y-4">
      {/* Urgent Banner */}
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200">
          <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse-urgent" />
          <div>
            <p className="text-sm font-semibold text-red-700">
              {urgentCount} alerte(s) urgente(s) en attente de traitement
            </p>
            <p className="text-xs text-red-500">Intervention immédiate requise</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="recue">Reçue</SelectItem>
                <SelectItem value="en_cours">En cours</SelectItem>
                <SelectItem value="traitee">Traitée</SelectItem>
                <SelectItem value="cloturee">Clôturée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Priorité" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes priorités</SelectItem>
                <SelectItem value="urgente">Urgente</SelectItem>
                <SelectItem value="haute">Haute</SelectItem>
                <SelectItem value="moyenne">Moyenne</SelectItem>
                <SelectItem value="basse">Basse</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="vol">Vol</SelectItem>
                <SelectItem value="agression">Agression</SelectItem>
                <SelectItem value="accident">Accident</SelectItem>
                <SelectItem value="incendie">Incendie</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">{alerts.length} alerte(s)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Alerts Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Référence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="max-w-xs">Description</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Commissariat</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Temps</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : alerts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Aucune alerte trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  alerts.map((alert) => (
                    <TableRow
                      key={alert.id}
                      className={`cursor-pointer hover:bg-muted/50 ${alert.priority === 'urgente' && alert.status !== 'traitee' && alert.status !== 'cloturee' ? 'bg-red-50/50' : ''}`}
                      onClick={() => setSelectedAlert(alert)}
                    >
                      <TableCell className="font-mono text-xs">{alert.reference}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{typeLabels[alert.type] || alert.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${priorityColors[alert.priority] || ''}`}>
                          {alert.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColors[alert.status] || ''}`}>
                          {statusLabels[alert.status] || alert.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm line-clamp-2">{alert.description}</p>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {alert.location}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{alert.commissariat?.name}</TableCell>
                      <TableCell className="text-xs">
                        {alert.assignedTo
                          ? `${alert.assignedTo.firstName} ${alert.assignedTo.lastName}`
                          : '—'}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTimeAgo(alert.createdAt)}
                      </TableCell>
                      <TableCell>
                        {alert.status === 'recue' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAlertStatus(alert.id, 'en_cours');
                            }}
                          >
                            Prendre en charge
                          </Button>
                        )}
                        {alert.status === 'en_cours' && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAlertStatus(alert.id, 'traitee');
                            }}
                          >
                            Traiter
                          </Button>
                        )}
                        {alert.status === 'traitee' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateAlertStatus(alert.id, 'cloturee');
                            }}
                          >
                            Clôturer
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Alert Detail Dialog */}
      <Dialog open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <DialogContent className="max-w-lg">
          {selectedAlert && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  Alerte {selectedAlert.reference}
                  <Badge className={priorityColors[selectedAlert.priority]}>
                    {selectedAlert.priority}
                  </Badge>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Type</p>
                    <p className="font-medium">{typeLabels[selectedAlert.type] || selectedAlert.type}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Statut</p>
                    <Badge className={statusColors[selectedAlert.status]}>
                      {statusLabels[selectedAlert.status] || selectedAlert.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Commissariat</p>
                    <p>{selectedAlert.commissariat?.name}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Agent assigné</p>
                    <p>{selectedAlert.assignedTo ? `${selectedAlert.assignedTo.firstName} ${selectedAlert.assignedTo.lastName}` : 'Non assigné'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-muted-foreground text-xs">Description</p>
                  <p className="text-sm">{selectedAlert.description}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{selectedAlert.location}</span>
                </div>
                {selectedAlert.citizenName && (
                  <div className="flex items-center gap-2 text-sm">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedAlert.citizenName}</span>
                  </div>
                )}
                {selectedAlert.citizenPhone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <span>{selectedAlert.citizenPhone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatTimeAgo(selectedAlert.createdAt)}</span>
                  {selectedAlert.responseTime && (
                    <span>• Réponse: {selectedAlert.responseTime} min</span>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  {selectedAlert.status === 'recue' && (
                    <Button onClick={() => { updateAlertStatus(selectedAlert.id, 'en_cours'); setSelectedAlert(null); }}>
                      Prendre en charge
                    </Button>
                  )}
                  {selectedAlert.status === 'en_cours' && (
                    <Button onClick={() => { updateAlertStatus(selectedAlert.id, 'traitee'); setSelectedAlert(null); }}>
                      Marquer comme traitée
                    </Button>
                  )}
                  {selectedAlert.status === 'traitee' && (
                    <Button variant="outline" onClick={() => { updateAlertStatus(selectedAlert.id, 'cloturee'); setSelectedAlert(null); }}>
                      Clôturer
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
