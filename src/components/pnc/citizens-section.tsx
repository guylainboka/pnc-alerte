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
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search, Filter, MapPin, Phone, Mail, Clock, UserCircle,
  CheckCircle2, XCircle, AlertCircle, Users, Activity, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

interface CitizenData {
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
  createdAt: string;
  commissariat: { id: string; name: string; code: string } | null;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  actif: { label: 'Actif', color: 'bg-green-500 text-white', icon: CheckCircle2 },
  suspendu: { label: 'Suspendu', color: 'bg-yellow-500 text-black', icon: AlertCircle },
  bloque: { label: 'Bloqué', color: 'bg-red-500 text-white', icon: XCircle },
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

export function CitizensSection() {
  const [citizens, setCitizens] = useState<CitizenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterVerified, setFilterVerified] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenData | null>(null);

  const fetchCitizens = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterVerified !== 'all') params.set('verified', filterVerified);
      const res = await fetch(`/api/citizens?${params.toString()}`);
      const data = await res.json();
      setCitizens(data);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCitizens();
  }, [filterStatus, filterVerified]);

  const filteredCitizens = citizens.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      c.phone.includes(term) ||
      c.reference.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term))
    );
  });

  const updateCitizenStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/citizens/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success(`Statut mis à jour: ${statusConfig[status]?.label || status}`);
      fetchCitizens();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const toggleVerified = async (id: string, verified: boolean) => {
    try {
      await fetch(`/api/citizens/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !verified }),
      });
      toast.success(verified ? 'Citoyen dé-vérifié' : 'Citoyen vérifié');
      fetchCitizens();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const activeCount = citizens.filter((c) => c.status === 'actif').length;
  const verifiedCount = citizens.filter((c) => c.verified).length;
  const totalAlerts = citizens.reduce((sum, c) => sum + c.totalAlerts, 0);

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{citizens.length}</p>
              <p className="text-xs text-muted-foreground">Citoyens inscrits</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{verifiedCount}</p>
              <p className="text-xs text-muted-foreground">Vérifiés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalAlerts}</p>
              <p className="text-xs text-muted-foreground">Alertes envoyées</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, téléphone, email..."
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="actif">Actif</SelectItem>
                <SelectItem value="suspendu">Suspendu</SelectItem>
                <SelectItem value="bloque">Bloqué</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterVerified} onValueChange={setFilterVerified}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Vérification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="true">Vérifiés</SelectItem>
                <SelectItem value="false">Non vérifiés</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">{filteredCitizens.length} citoyen(s)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Citizens Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Référence</TableHead>
                  <TableHead>Nom complet</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Commune</TableHead>
                  <TableHead>Localisation</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Vérifié</TableHead>
                  <TableHead>Activité</TableHead>
                  <TableHead>Dernière position</TableHead>
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
                ) : filteredCitizens.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Aucun citoyen trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCitizens.map((c) => {
                    const stConfig = statusConfig[c.status] || statusConfig.actif;
                    const StIcon = stConfig.icon;
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCitizen(c)}
                      >
                        <TableCell className="font-mono text-xs">{c.reference}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-muted-foreground">
                                {c.firstName[0]}{c.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{c.firstName} {c.lastName}</p>
                              {c.gender && (
                                <p className="text-xs text-muted-foreground">
                                  {c.gender === 'M' ? 'Masculin' : 'Féminin'}
                                </p>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">{c.phone}</TableCell>
                        <TableCell className="text-xs">
                          {c.commune ? `${c.commune}, ${c.city || ''}` : c.city || '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {c.lastLocation ? (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-primary" />
                              <span className="line-clamp-1 max-w-[140px]">{c.lastLocation}</span>
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${stConfig.color}`}>
                            <StIcon className="w-3 h-3 mr-1" />
                            {stConfig.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {c.verified ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <XCircle className="w-4 h-4 text-muted-foreground" />
                          )}
                        </TableCell>
                        <TableCell className="text-xs">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-red-600">{c.totalAlerts} alertes</span>
                            <span className="text-blue-600">{c.totalComplaints} plaintes</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {c.lastLocationAt ? formatTimeAgo(c.lastLocationAt) : '—'}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {c.status === 'actif' ? (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCitizenStatus(c.id, 'suspendu');
                                }}
                              >
                                Suspendre
                              </Button>
                            ) : c.status === 'suspendu' ? (
                              <Button
                                size="sm"
                                className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCitizenStatus(c.id, 'actif');
                                }}
                              >
                                Activer
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateCitizenStatus(c.id, 'actif');
                                }}
                              >
                                Débloquer
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Citizen Detail Dialog */}
      <Dialog open={!!selectedCitizen} onOpenChange={() => setSelectedCitizen(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedCitizen && (() => {
            const stConfig = statusConfig[selectedCitizen.status] || statusConfig.actif;
            const StIcon = stConfig.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <UserCircle className="w-5 h-5 text-primary" />
                    Fiche Citoyen — {selectedCitizen.reference}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-muted-foreground">
                        {selectedCitizen.firstName[0]}{selectedCitizen.lastName[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold">
                        {selectedCitizen.firstName} {selectedCitizen.lastName}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={stConfig.color}>
                          <StIcon className="w-3 h-3 mr-1" />
                          {stConfig.label}
                        </Badge>
                        <Badge variant={selectedCitizen.verified ? 'default' : 'outline'} className="text-xs">
                          {selectedCitizen.verified ? '✓ Vérifié' : 'Non vérifié'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* Contact info */}
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCitizen.phone}</span>
                    </div>
                    {selectedCitizen.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-muted-foreground" />
                        <span className="truncate">{selectedCitizen.email}</span>
                      </div>
                    )}
                    {selectedCitizen.gender && (
                      <div>
                        <p className="text-muted-foreground text-xs">Sexe</p>
                        <p>{selectedCitizen.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                      </div>
                    )}
                    {selectedCitizen.dateOfBirth && (
                      <div>
                        <p className="text-muted-foreground text-xs">Date de naissance</p>
                        <p>{new Date(selectedCitizen.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                  </div>

                  {/* Address */}
                  {(selectedCitizen.address || selectedCitizen.commune || selectedCitizen.city) && (
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs mb-1">Adresse</p>
                      <p>{selectedCitizen.address || '—'}</p>
                      <p className="text-xs text-muted-foreground">
                        {[selectedCitizen.commune, selectedCitizen.city].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  )}

                  {/* Localisation actuelle */}
                  {selectedCitizen.lastLocation && (
                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-xs font-medium text-primary mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Dernière localisation connue
                      </p>
                      <p className="text-sm font-medium">{selectedCitizen.lastLocation}</p>
                      {selectedCitizen.latitude && selectedCitizen.longitude && (
                        <p className="text-xs text-muted-foreground mt-1 font-mono">
                          {selectedCitizen.latitude.toFixed(4)}, {selectedCitizen.longitude.toFixed(4)}
                        </p>
                      )}
                      {selectedCitizen.lastLocationAt && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeAgo(selectedCitizen.lastLocationAt)}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Commissariat */}
                  {selectedCitizen.commissariat && (
                    <div className="text-sm">
                      <p className="text-muted-foreground text-xs">Commissariat de rattachement</p>
                      <p>{selectedCitizen.commissariat.name}</p>
                    </div>
                  )}

                  {/* Activity */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border">
                      <p className="text-2xl font-bold text-red-600">{selectedCitizen.totalAlerts}</p>
                      <p className="text-xs text-muted-foreground">Alertes envoyées</p>
                    </div>
                    <div className="p-3 rounded-lg border">
                      <p className="text-2xl font-bold text-blue-600">{selectedCitizen.totalComplaints}</p>
                      <p className="text-xs text-muted-foreground">Plaintes déposées</p>
                    </div>
                  </div>

                  {/* Inscription */}
                  <div className="text-xs text-muted-foreground">
                    Inscrit le {new Date(selectedCitizen.createdAt).toLocaleDateString('fr-FR')}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t">
                    {!selectedCitizen.verified && (
                      <Button
                        size="sm"
                        onClick={() => {
                          toggleVerified(selectedCitizen.id, selectedCitizen.verified);
                          setSelectedCitizen(null);
                        }}
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        Vérifier le compte
                      </Button>
                    )}
                    {selectedCitizen.status === 'actif' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          updateCitizenStatus(selectedCitizen.id, 'suspendu');
                          setSelectedCitizen(null);
                        }}
                      >
                        Suspendre
                      </Button>
                    )}
                    {selectedCitizen.status !== 'actif' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => {
                          updateCitizenStatus(selectedCitizen.id, 'actif');
                          setSelectedCitizen(null);
                        }}
                      >
                        Activer
                      </Button>
                    )}
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
