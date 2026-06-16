'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
import { FolderOpen, Clock, MapPin, Filter, User, Users } from 'lucide-react';
import { toast } from 'sonner';

interface CaseData {
  id: string;
  reference: string;
  title: string;
  type: string;
  status: string;
  priority: string;
  description: string;
  location: string | null;
  incidentDate: string | null;
  createdAt: string;
  commissariat: { name: string };
  assignedTo: { firstName: string; lastName: string; rank: string } | null;
  criminals: Array<{
    criminal: { id: string; firstName: string; lastName: string; alias: string | null; status: string; dangerLevel: string };
    role: string;
  }>;
}

const priorityColors: Record<string, string> = {
  urgente: 'bg-red-500 text-white',
  haute: 'bg-orange-500 text-white',
  moyenne: 'bg-yellow-500 text-black',
  basse: 'bg-gray-400 text-white',
};

const statusColors: Record<string, string> = {
  ouvert: 'bg-blue-500 text-white',
  en_enquete: 'bg-yellow-600 text-white',
  en_instruction: 'bg-orange-500 text-white',
  jugement: 'bg-purple-500 text-white',
  cloture: 'bg-green-600 text-white',
};

const typeLabels: Record<string, string> = {
  vol: 'Vol',
  homicide: 'Homicide',
  fraude: 'Fraude',
  'stupéfiants': 'Stupéfiants',
  violence: 'Violence',
  autre: 'Autre',
};

const statusLabels: Record<string, string> = {
  ouvert: 'Ouvert',
  en_enquete: 'En enquête',
  en_instruction: 'En instruction',
  jugement: 'Jugement',
  cloture: 'Clôturé',
};

const roleLabels: Record<string, string> = {
  suspect: 'Suspect',
  temoin: 'Témoin',
  victime: 'Victime',
  accuse: 'Accusé',
};

const dangerColors: Record<string, string> = {
  eleve: 'text-red-600',
  moyen: 'text-yellow-600',
  faible: 'text-green-600',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

export function CasesSection() {
  const [cases, setCases] = useState<CaseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedCase, setSelectedCase] = useState<CaseData | null>(null);

  const fetchCases = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterType !== 'all') params.set('type', filterType);
      const res = await fetch(`/api/cases?${params.toString()}`);
      const data = await res.json();
      setCases(data);
    } catch {
      toast.error('Erreur lors du chargement des dossiers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [filterStatus, filterType]);

  const updateCaseStatus = async (id: string, status: string) => {
    try {
      await fetch(`/api/cases/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      toast.success(`Dossier mis à jour: ${statusLabels[status] || status}`);
      fetchCases();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const getNextStatus = (currentStatus: string): string | null => {
    const flow: Record<string, string> = {
      ouvert: 'en_enquete',
      en_enquete: 'en_instruction',
      en_instruction: 'jugement',
      jugement: 'cloture',
    };
    return flow[currentStatus] || null;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="ouvert">Ouvert</SelectItem>
                <SelectItem value="en_enquete">En enquête</SelectItem>
                <SelectItem value="en_instruction">En instruction</SelectItem>
                <SelectItem value="jugement">Jugement</SelectItem>
                <SelectItem value="cloture">Clôturé</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="vol">Vol</SelectItem>
                <SelectItem value="homicide">Homicide</SelectItem>
                <SelectItem value="fraude">Fraude</SelectItem>
                <SelectItem value="stupéfiants">Stupéfiants</SelectItem>
                <SelectItem value="violence">Violence</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">{cases.length} dossier(s)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cases Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Référence</TableHead>
                  <TableHead>Titre</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priorité</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Commissariat</TableHead>
                  <TableHead>Agent</TableHead>
                  <TableHead>Personnes</TableHead>
                  <TableHead>Date incident</TableHead>
                  <TableHead className="w-36">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : cases.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Aucun dossier trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  cases.map((c) => (
                    <TableRow
                      key={c.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedCase(c)}
                    >
                      <TableCell className="font-mono text-xs">{c.reference}</TableCell>
                      <TableCell className="font-medium text-sm max-w-48 line-clamp-1">{c.title}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">{typeLabels[c.type] || c.type}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${priorityColors[c.priority] || ''}`}>
                          {c.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`text-xs ${statusColors[c.status] || ''}`}>
                          {statusLabels[c.status] || c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{c.commissariat?.name}</TableCell>
                      <TableCell className="text-xs">
                        {c.assignedTo ? `${c.assignedTo.firstName} ${c.assignedTo.lastName}` : '—'}
                      </TableCell>
                      <TableCell className="text-xs">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {c.criminals.length}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs">{formatDate(c.incidentDate)}</TableCell>
                      <TableCell>
                        {getNextStatus(c.status) && (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCaseStatus(c.id, getNextStatus(c.status)!);
                            }}
                          >
                            → {statusLabels[getNextStatus(c.status)!]}
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

      {/* Case Detail Dialog */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCase && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FolderOpen className="w-5 h-5 text-primary" />
                  Dossier {selectedCase.reference}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={priorityColors[selectedCase.priority]}>{selectedCase.priority}</Badge>
                  <Badge className={statusColors[selectedCase.status]}>
                    {statusLabels[selectedCase.status] || selectedCase.status}
                  </Badge>
                  <Badge variant="outline">{typeLabels[selectedCase.type] || selectedCase.type}</Badge>
                </div>

                <div>
                  <h3 className="font-semibold text-lg">{selectedCase.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedCase.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  {selectedCase.location && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCase.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span>Incident: {formatDate(selectedCase.incidentDate)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span>Agent: {selectedCase.assignedTo ? `${selectedCase.assignedTo.firstName} ${selectedCase.assignedTo.lastName} (${selectedCase.assignedTo.rank})` : 'Non assigné'}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Commissariat: </span>
                    <span>{selectedCase.commissariat?.name}</span>
                  </div>
                </div>

                {/* Persons involved */}
                {selectedCase.criminals.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Personnes impliquées
                    </h4>
                    <div className="space-y-2">
                      {selectedCase.criminals.map((cc, i) => (
                        <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                          <div>
                            <p className="text-sm font-medium">
                              {cc.criminal.firstName} {cc.criminal.lastName}
                              {cc.criminal.alias && (
                                <span className="text-muted-foreground ml-1">&quot;{cc.criminal.alias}&quot;</span>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Rôle: {roleLabels[cc.role] || cc.role}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {cc.criminal.status}
                            </Badge>
                            <span className={`text-xs font-medium ${dangerColors[cc.criminal.dangerLevel]}`}>
                              {cc.criminal.dangerLevel}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Status progression */}
                <div className="flex gap-2 pt-2">
                  {getNextStatus(selectedCase.status) && (
                    <Button onClick={() => { updateCaseStatus(selectedCase.id, getNextStatus(selectedCase.status)!); setSelectedCase(null); }}>
                      Avancer → {statusLabels[getNextStatus(selectedCase.status)!]}
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
