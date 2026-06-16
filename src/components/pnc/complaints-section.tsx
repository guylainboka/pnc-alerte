'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
import { FileText, Filter, Clock, CheckCircle2, XCircle, AlertCircle, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface ComplaintData {
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
  reviewNotes: string | null;
  createdAt: string;
  commissariat: { name: string };
  reviewedBy: { firstName: string; lastName: string; rank: string } | null;
}

const statusColors: Record<string, string> = {
  soumise: 'bg-blue-500 text-white',
  en_revision: 'bg-yellow-500 text-black',
  approuvee: 'bg-green-500 text-white',
  rejetee: 'bg-red-500 text-white',
  traitee: 'bg-gray-500 text-white',
};

const statusLabels: Record<string, string> = {
  soumise: 'Soumise',
  en_revision: 'En révision',
  approuvee: 'Approuvée',
  rejetee: 'Rejetée',
  traitee: 'Traitée',
};

const typeLabels: Record<string, string> = {
  vol: 'Vol',
  agression: 'Agression',
  harassment: 'Harcèlement',
  corruption: 'Corruption',
  autre: 'Autre',
};

const statusIcons: Record<string, React.ElementType> = {
  soumise: AlertCircle,
  en_revision: Eye,
  approuvee: CheckCircle2,
  rejetee: XCircle,
  traitee: CheckCircle2,
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

export function ComplaintsSection() {
  const [complaints, setComplaints] = useState<ComplaintData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedComplaint, setSelectedComplaint] = useState<ComplaintData | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  const fetchComplaints = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterType !== 'all') params.set('type', filterType);
      const res = await fetch(`/api/complaints?${params.toString()}`);
      const data = await res.json();
      setComplaints(data);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterStatus, filterType]);

  const updateComplaint = async (id: string, status: string, notes?: string) => {
    try {
      const body: Record<string, string> = { status };
      if (notes) body.reviewNotes = notes;
      await fetch(`/api/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      toast.success(`Plainte mise à jour: ${statusLabels[status]}`);
      setSelectedComplaint(null);
      setReviewNotes('');
      fetchComplaints();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const pendingCount = complaints.filter((c) => c.status === 'soumise' || c.status === 'en_revision').length;

  return (
    <div className="space-y-4">
      {/* Pending Banner */}
      {pendingCount > 0 && (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-yellow-50 border border-yellow-200">
          <AlertCircle className="w-5 h-5 text-yellow-600" />
          <div>
            <p className="text-sm font-semibold text-yellow-700">
              {pendingCount} plainte(s) en attente de traitement
            </p>
            <p className="text-xs text-yellow-500">Révision et approbation requises</p>
          </div>
        </div>
      )}

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
                <SelectItem value="soumise">Soumise</SelectItem>
                <SelectItem value="en_revision">En révision</SelectItem>
                <SelectItem value="approuvee">Approuvée</SelectItem>
                <SelectItem value="rejetee">Rejetée</SelectItem>
                <SelectItem value="traitee">Traitée</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous types</SelectItem>
                <SelectItem value="vol">Vol</SelectItem>
                <SelectItem value="agression">Agression</SelectItem>
                <SelectItem value="harassment">Harcèlement</SelectItem>
                <SelectItem value="corruption">Corruption</SelectItem>
                <SelectItem value="autre">Autre</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">{complaints.length} plainte(s)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Complaints Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-32">Référence</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Plaignant</TableHead>
                  <TableHead className="max-w-xs">Description</TableHead>
                  <TableHead>Commissariat</TableHead>
                  <TableHead>Réviseur</TableHead>
                  <TableHead>Temps</TableHead>
                  <TableHead className="w-40">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : complaints.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Aucune plainte trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((c) => {
                    const StIcon = statusIcons[c.status] || AlertCircle;
                    return (
                      <TableRow
                        key={c.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => {
                          setSelectedComplaint(c);
                          setReviewNotes(c.reviewNotes || '');
                        }}
                      >
                        <TableCell className="font-mono text-xs">{c.reference}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{typeLabels[c.type] || c.type}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={`text-xs ${statusColors[c.status]}`}>
                            <StIcon className="w-3 h-3 mr-1" />
                            {statusLabels[c.status]}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">{c.plaintiffName}</TableCell>
                        <TableCell className="max-w-xs">
                          <p className="text-sm line-clamp-2">{c.description}</p>
                        </TableCell>
                        <TableCell className="text-xs">{c.commissariat?.name}</TableCell>
                        <TableCell className="text-xs">
                          {c.reviewedBy ? `${c.reviewedBy.firstName} ${c.reviewedBy.lastName}` : '—'}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {formatTimeAgo(c.createdAt)}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {c.status === 'soumise' && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  updateComplaint(c.id, 'en_revision');
                                }}
                              >
                                Réviser
                              </Button>
                            )}
                            {c.status === 'en_revision' && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateComplaint(c.id, 'approuvee');
                                  }}
                                >
                                  ✓ Approuver
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-7 text-xs"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateComplaint(c.id, 'rejetee');
                                  }}
                                >
                                  ✗ Rejeter
                                </Button>
                              </>
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

      {/* Complaint Detail Dialog */}
      <Dialog open={!!selectedComplaint} onOpenChange={() => setSelectedComplaint(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selectedComplaint && (() => {
            const StIcon = statusIcons[selectedComplaint.status] || AlertCircle;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Plainte {selectedComplaint.reference}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[selectedComplaint.status]}>
                      <StIcon className="w-3 h-3 mr-1" />
                      {statusLabels[selectedComplaint.status]}
                    </Badge>
                    <Badge variant="outline">{typeLabels[selectedComplaint.type] || selectedComplaint.type}</Badge>
                  </div>

                  <div>
                    <p className="text-muted-foreground text-xs">Description</p>
                    <p className="text-sm">{selectedComplaint.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs">Plaignant</p>
                      <p className="font-medium">{selectedComplaint.plaintiffName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Téléphone</p>
                      <p>{selectedComplaint.plaintiffPhone}</p>
                    </div>
                    {selectedComplaint.plaintiffEmail && (
                      <div>
                        <p className="text-muted-foreground text-xs">Email</p>
                        <p>{selectedComplaint.plaintiffEmail}</p>
                      </div>
                    )}
                    {selectedComplaint.plaintiffAddr && (
                      <div>
                        <p className="text-muted-foreground text-xs">Adresse</p>
                        <p>{selectedComplaint.plaintiffAddr}</p>
                      </div>
                    )}
                    {selectedComplaint.location && (
                      <div>
                        <p className="text-muted-foreground text-xs">Lieu</p>
                        <p>{selectedComplaint.location}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs">Commissariat</p>
                      <p>{selectedComplaint.commissariat?.name}</p>
                    </div>
                    {selectedComplaint.reviewedBy && (
                      <div>
                        <p className="text-muted-foreground text-xs">Réviseur</p>
                        <p>{selectedComplaint.reviewedBy.firstName} {selectedComplaint.reviewedBy.lastName}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-muted-foreground text-xs">Date</p>
                      <p className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(selectedComplaint.createdAt)}
                      </p>
                    </div>
                  </div>

                  {selectedComplaint.reviewNotes && (
                    <div>
                      <p className="text-muted-foreground text-xs">Notes de révision</p>
                      <p className="text-sm">{selectedComplaint.reviewNotes}</p>
                    </div>
                  )}

                  {/* Action buttons */}
                  {(selectedComplaint.status === 'soumise' || selectedComplaint.status === 'en_revision') && (
                    <div className="space-y-3 pt-2 border-t">
                      <Textarea
                        placeholder="Notes de révision..."
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        className="min-h-[80px]"
                      />
                      <div className="flex gap-2">
                        {selectedComplaint.status === 'soumise' && (
                          <Button onClick={() => updateComplaint(selectedComplaint.id, 'en_revision', reviewNotes)}>
                            Prendre en révision
                          </Button>
                        )}
                        {selectedComplaint.status === 'en_revision' && (
                          <>
                            <Button
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() => updateComplaint(selectedComplaint.id, 'approuvee', reviewNotes)}
                            >
                              <CheckCircle2 className="w-4 h-4 mr-1" />
                              Approuver
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => updateComplaint(selectedComplaint.id, 'rejetee', reviewNotes)}
                            >
                              <XCircle className="w-4 h-4 mr-1" />
                              Rejeter
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
}
