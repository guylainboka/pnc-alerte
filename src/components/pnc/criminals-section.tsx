'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Search,
  Filter,
  MapPin,
  AlertTriangle,
  Eye,
  ShieldAlert,
  UserX,
  UserCheck,
  EyeOff,
} from 'lucide-react';
import { toast } from 'sonner';

interface CriminalData {
  id: string;
  reference: string;
  firstName: string;
  lastName: string;
  alias: string | null;
  dateOfBirth: string | null;
  gender: string | null;
  nationality: string | null;
  idNumber: string | null;
  photo: string | null;
  physicalDesc: string | null;
  status: string;
  dangerLevel: string;
  lastKnownAddr: string | null;
  cases: Array<{
    case: { id: string; reference: string; title: string; status: string; type: string };
    role: string;
  }>;
}

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  recherche: { label: 'Recherché', color: 'bg-red-500 text-white', icon: ShieldAlert },
  incarcere: { label: 'Incarcéré', color: 'bg-gray-600 text-white', icon: UserX },
  libre: { label: 'Libre', color: 'bg-green-500 text-white', icon: UserCheck },
  sous_surveillance: { label: 'Sous surveillance', color: 'bg-yellow-500 text-black', icon: Eye },
};

const dangerColors: Record<string, string> = {
  eleve: 'border-red-500 bg-red-50',
  moyen: 'border-yellow-500 bg-yellow-50',
  faible: 'border-green-500 bg-green-50',
};

const dangerLabels: Record<string, string> = {
  eleve: 'Élevé',
  moyen: 'Moyen',
  faible: 'Faible',
};

const roleLabels: Record<string, string> = {
  suspect: 'Suspect',
  temoin: 'Témoin',
  victime: 'Victime',
  accuse: 'Accusé',
};

export function CriminalsSection() {
  const [criminals, setCriminals] = useState<CriminalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDanger, setFilterDanger] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCriminal, setSelectedCriminal] = useState<CriminalData | null>(null);

  const fetchCriminals = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (filterDanger !== 'all') params.set('dangerLevel', filterDanger);
      const res = await fetch(`/api/criminals?${params.toString()}`);
      const data = await res.json();
      setCriminals(data);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCriminals();
  }, [filterStatus, filterDanger]);

  const filteredCriminals = criminals.filter((c) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(term) ||
      c.lastName.toLowerCase().includes(term) ||
      (c.alias && c.alias.toLowerCase().includes(term)) ||
      c.reference.toLowerCase().includes(term) ||
      (c.idNumber && c.idNumber.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, alias, référence..."
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous statuts</SelectItem>
                <SelectItem value="recherche">Recherché</SelectItem>
                <SelectItem value="incarcere">Incarcéré</SelectItem>
                <SelectItem value="libre">Libre</SelectItem>
                <SelectItem value="sous_surveillance">Sous surveillance</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterDanger} onValueChange={setFilterDanger}>
              <SelectTrigger className="w-40 h-9 text-sm">
                <SelectValue placeholder="Danger" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous niveaux</SelectItem>
                <SelectItem value="eleve">Élevé</SelectItem>
                <SelectItem value="moyen">Moyen</SelectItem>
                <SelectItem value="faible">Faible</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">{filteredCriminals.length} fiche(s)</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Criminal Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredCriminals.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            Aucune fiche criminelle trouvée
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCriminals.map((criminal) => {
            const stConfig = statusConfig[criminal.status] || statusConfig.libre;
            const StatusIcon = stConfig.icon;
            return (
              <Card
                key={criminal.id}
                className={`border-l-4 cursor-pointer hover:shadow-md transition-shadow ${dangerColors[criminal.dangerLevel]}`}
                onClick={() => setSelectedCriminal(criminal)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar placeholder */}
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      {criminal.photo ? (
                        <img src={criminal.photo} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-lg font-bold text-muted-foreground">
                          {criminal.firstName[0]}{criminal.lastName[0]}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">
                          {criminal.firstName} {criminal.lastName}
                        </h3>
                        {criminal.alias && (
                          <span className="text-xs text-muted-foreground">&quot;{criminal.alias}&quot;</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-mono">{criminal.reference}</p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={`text-[10px] ${stConfig.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {stConfig.label}
                        </Badge>
                        <Badge variant="outline" className="text-[10px]">
                          Danger: {dangerLabels[criminal.dangerLevel]}
                        </Badge>
                      </div>
                      {criminal.lastKnownAddr && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="line-clamp-1">{criminal.lastKnownAddr}</span>
                        </p>
                      )}
                      {criminal.cases.length > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {criminal.cases.length} dossier(s) lié(s)
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Criminal Detail Dialog */}
      <Dialog open={!!selectedCriminal} onOpenChange={() => setSelectedCriminal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedCriminal && (() => {
            const stConfig = statusConfig[selectedCriminal.status] || statusConfig.libre;
            const StatusIcon = stConfig.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    Fiche Criminelle — {selectedCriminal.reference}
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl font-bold text-muted-foreground">
                        {selectedCriminal.firstName[0]}{selectedCriminal.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {selectedCriminal.firstName} {selectedCriminal.lastName}
                      </h3>
                      {selectedCriminal.alias && (
                        <p className="text-sm text-muted-foreground">Alias: &quot;{selectedCriminal.alias}&quot;</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={stConfig.color}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {stConfig.label}
                        </Badge>
                        <Badge variant="outline">
                          Danger: {dangerLabels[selectedCriminal.dangerLevel]}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {selectedCriminal.dateOfBirth && (
                      <div>
                        <p className="text-muted-foreground text-xs">Date de naissance</p>
                        <p>{new Date(selectedCriminal.dateOfBirth).toLocaleDateString('fr-FR')}</p>
                      </div>
                    )}
                    {selectedCriminal.gender && (
                      <div>
                        <p className="text-muted-foreground text-xs">Sexe</p>
                        <p>{selectedCriminal.gender === 'M' ? 'Masculin' : 'Féminin'}</p>
                      </div>
                    )}
                    {selectedCriminal.nationality && (
                      <div>
                        <p className="text-muted-foreground text-xs">Nationalité</p>
                        <p>{selectedCriminal.nationality}</p>
                      </div>
                    )}
                    {selectedCriminal.idNumber && (
                      <div>
                        <p className="text-muted-foreground text-xs">N° d&apos;identité</p>
                        <p>{selectedCriminal.idNumber}</p>
                      </div>
                    )}
                  </div>

                  {selectedCriminal.physicalDesc && (
                    <div>
                      <p className="text-muted-foreground text-xs">Signes particuliers</p>
                      <p className="text-sm">{selectedCriminal.physicalDesc}</p>
                    </div>
                  )}

                  {selectedCriminal.lastKnownAddr && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedCriminal.lastKnownAddr}</span>
                    </div>
                  )}

                  {/* Linked Cases */}
                  {selectedCriminal.cases.length > 0 && (
                    <div>
                      <h4 className="font-medium text-sm mb-2">Dossiers liés</h4>
                      <div className="space-y-2">
                        {selectedCriminal.cases.map((cc, i) => (
                          <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                            <div>
                              <p className="text-sm font-medium">{cc.case.title}</p>
                              <p className="text-xs text-muted-foreground">{cc.case.reference}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {roleLabels[cc.role] || cc.role}
                            </Badge>
                          </div>
                        ))}
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
