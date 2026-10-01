'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  UserX, Search, MapPin, Phone, Clock, Plus, Filter, Eye,
  CheckCircle2, FileCheck, User as UserIcon, Calendar, Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRealtime } from '@/lib/use-realtime';

interface DisparuData {
  id: string;
  reference: string;
  nomComplet: string;
  age: number | null;
  sexe: string | null;
  description: string | null;
  derniereVueLieu: string | null;
  derniereVueDate: string | null;
  photoUrl: string | null;
  contactTelephone: string | null;
  status: string;
  declarantName: string | null;
  createdAt: string;
  updatedAt: string;
}

const statusConfig: Record<string, { label: string; color: string }> = {
  recherche: { label: 'Recherche active', color: 'bg-orange-500 text-white' },
  retrouve: { label: 'Retrouvé', color: 'bg-green-600 text-white' },
  clture: { label: 'Clôturé', color: 'bg-gray-400 text-white' },
};

const sexeLabels: Record<string, string> = {
  M: 'Masculin',
  F: 'Féminin',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  return `il y a ${Math.floor(hours / 24)}j`;
}

export function DisparusSection() {
  const [disparus, setDisparus] = useState<DisparuData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected] = useState<DisparuData | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  // Form state for new signalement
  const [form, setForm] = useState({
    nomComplet: '',
    age: '',
    sexe: 'M',
    description: '',
    derniereVueLieu: '',
    derniereVueDate: '',
    contactTelephone: '',
  });

  const fetchDisparus = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const res = await fetch(`/api/disparus?${params.toString()}`);
      const data = await res.json();
      setDisparus(data);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [filterStatus]);

  useEffect(() => {
    fetchDisparus();
  }, [fetchDisparus]);

  // Realtime : se rafraîchir quand la table change (nouveau signalement depuis mobile)
  useRealtime({
    table: 'personnes_disparues',
    event: '*',
    onUpdate: () => fetchDisparus(),
    pollInterval: 30000,
    onPoll: fetchDisparus,
  });

  const filtered = disparus.filter((d) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      d.nomComplet.toLowerCase().includes(term) ||
      d.reference.toLowerCase().includes(term) ||
      (d.derniereVueLieu ?? '').toLowerCase().includes(term) ||
      (d.declarantName ?? '').toLowerCase().includes(term)
    );
  });

  const counts = {
    recherche: disparus.filter((d) => d.status === 'recherche').length,
    retrouve: disparus.filter((d) => d.status === 'retrouve').length,
    clture: disparus.filter((d) => d.status === 'clture').length,
    total: disparus.length,
  };

  const handleUpdateStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/disparus/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Échec');
      toast.success(
        status === 'retrouve'
          ? 'Personne marquée comme retrouvée'
          : 'Signalement clôturé'
      );
      setSelected(null);
      fetchDisparus();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCreate = async () => {
    if (!form.nomComplet.trim()) {
      toast.error('Le nom complet est requis');
      return;
    }
    try {
      const res = await fetch('/api/disparus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomComplet: form.nomComplet,
          age: form.age ? parseInt(form.age, 10) : null,
          sexe: form.sexe,
          description: form.description || null,
          derniereVueLieu: form.derniereVueLieu || null,
          derniereVueDate: form.derniereVueDate || null,
          contactTelephone: form.contactTelephone || null,
        }),
      });
      if (!res.ok) throw new Error('Échec');
      toast.success('Signalement créé');
      setCreateOpen(false);
      setForm({
        nomComplet: '',
        age: '',
        sexe: 'M',
        description: '',
        derniereVueLieu: '',
        derniereVueDate: '',
        contactTelephone: '',
      });
      fetchDisparus();
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Personnes Disparues</h2>
          <p className="text-sm text-muted-foreground">
            Signalements citoyens reçus via l&apos;application mobile PNC Alerte
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="bg-primary hover:bg-primary/90">
          <Plus className="w-4 h-4 mr-2" />
          Nouveau signalement
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <UserX className="w-5 h-5 text-orange-500" />
            <div>
              <p className="text-lg font-semibold">{counts.recherche}</p>
              <p className="text-xs text-muted-foreground">Recherche active</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-lg font-semibold">{counts.retrouve}</p>
              <p className="text-xs text-muted-foreground">Retrouvées</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <FileCheck className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-lg font-semibold">{counts.clture}</p>
              <p className="text-xs text-muted-foreground">Clôturés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Activity className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{counts.total}</p>
              <p className="text-xs text-muted-foreground">Total signalements</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, référence, lieu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="recherche">Recherche active</SelectItem>
                <SelectItem value="retrouve">Retrouvé</SelectItem>
                <SelectItem value="clture">Clôturé</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tableau */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UserX className="w-12 h-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">Aucun signalement</p>
            </div>
          ) : (
            <div className="max-h-[60vh] overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Référence</TableHead>
                    <TableHead>Nom complet</TableHead>
                    <TableHead>Âge / Sexe</TableHead>
                    <TableHead>Dernière vue</TableHead>
                    <TableHead>Déclarant</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Temps</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-mono text-xs font-semibold">
                        {d.reference}
                      </TableCell>
                      <TableCell className="font-medium">{d.nomComplet}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {d.age ?? '—'} {d.age ? 'ans' : ''}
                        </span>
                        {d.sexe && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            {sexeLabels[d.sexe] ?? d.sexe}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {d.derniereVueLieu ? (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-muted-foreground" />
                            {d.derniereVueLieu}
                          </span>
                        ) : (
                          '—'
                        )}
                        {d.derniereVueDate && (
                          <span className="text-xs text-muted-foreground block">
                            {formatDate(d.derniereVueDate)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {d.declarantName ?? '—'}
                        {d.contactTelephone && (
                          <span className="text-xs text-muted-foreground block flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {d.contactTelephone}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={statusConfig[d.status]?.color || 'bg-gray-400'}>
                          {statusConfig[d.status]?.label || d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatTimeAgo(d.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelected(d)}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialogue de détail */}
      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserX className="w-5 h-5 text-orange-500" />
              Détails du signalement — {selected?.reference}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-24 h-24 rounded-lg bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {selected.photoUrl ? (
                    <img
                      src={selected.photoUrl}
                      alt={selected.nomComplet}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <h3 className="text-lg font-semibold">{selected.nomComplet}</h3>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {selected.age != null && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {selected.age} ans
                      </span>
                    )}
                    {selected.sexe && (
                      <Badge variant="outline" className="text-[10px]">
                        {sexeLabels[selected.sexe] ?? selected.sexe}
                      </Badge>
                    )}
                    <Badge className={statusConfig[selected.status]?.color}>
                      {statusConfig[selected.status]?.label}
                    </Badge>
                  </div>
                </div>
              </div>

              {selected.description && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Description</p>
                  <p className="text-sm">{selected.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    Dernière vue à
                  </p>
                  <p className="text-sm font-medium">{selected.derniereVueLieu ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(selected.derniereVueDate)}
                  </p>
                </div>
                <div className="p-3 rounded-lg border">
                  <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    Contact
                  </p>
                  <p className="text-sm font-medium">{selected.contactTelephone ?? '—'}</p>
                  <p className="text-xs text-muted-foreground">
                    Déclarant : {selected.declarantName ?? '—'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Signalé {formatTimeAgo(selected.createdAt)}
                </span>
                <span>Dernière MAJ : {formatDate(selected.updatedAt)}</span>
              </div>

              {selected.status === 'recherche' && (
                <DialogFooter>
                  <Button
                    variant="outline"
                    className="border-green-600 text-green-700 hover:bg-green-50"
                    onClick={() => handleUpdateStatus(selected.id, 'retrouve')}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Marquer comme retrouvé
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleUpdateStatus(selected.id, 'clture')}
                  >
                    <FileCheck className="w-4 h-4 mr-2" />
                    Clôturer
                  </Button>
                </DialogFooter>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialogue de création */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Nouveau signalement de personne disparue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="nom">Nom complet *</Label>
                <Input
                  id="nom"
                  value={form.nomComplet}
                  onChange={(e) => setForm({ ...form, nomComplet: e.target.value })}
                  placeholder="Ex : Junior Mbumba"
                />
              </div>
              <div>
                <Label htmlFor="age">Âge</Label>
                <Input
                  id="age"
                  type="number"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder="Ex : 12"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="sexe">Sexe</Label>
                <Select value={form.sexe} onValueChange={(v) => setForm({ ...form, sexe: v })}>
                  <SelectTrigger id="sexe">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tel">Téléphone de contact</Label>
                <Input
                  id="tel"
                  value={form.contactTelephone}
                  onChange={(e) => setForm({ ...form, contactTelephone: e.target.value })}
                  placeholder="+243..."
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <Label htmlFor="lieu">Dernier lieu vu</Label>
                <Input
                  id="lieu"
                  value={form.derniereVueLieu}
                  onChange={(e) => setForm({ ...form, derniereVueLieu: e.target.value })}
                  placeholder="Ex : Marché Central, Gombe"
                />
              </div>
              <div>
                <Label htmlFor="date">Date dernière vue</Label>
                <Input
                  id="date"
                  type="date"
                  value={form.derniereVueDate}
                  onChange={(e) => setForm({ ...form, derniereVueDate: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="desc">Description physique / circonstances</Label>
              <Textarea
                id="desc"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Vêtements, taille, particularités, contexte..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreate} className="bg-primary hover:bg-primary/90">
              Créer le signalement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
