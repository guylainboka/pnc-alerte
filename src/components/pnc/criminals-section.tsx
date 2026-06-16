'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
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
  ShieldAlert,
  UserX,
  UserCheck,
  Eye,
  Clock,
  Camera,
  FileText,
  Video,
  Upload,
  Ruler,
  Weight,
  Eye as EyeIcon,
  Sparkles,
  Users2,
  FileWarning,
  Scale,
  StickyNote,
} from 'lucide-react';
import { toast } from 'sonner';

interface EvidenceData {
  id: string;
  type: string;
  title: string;
  description: string | null;
  fileUrl: string;
  fileName: string | null;
  fileSize: number | null;
  collectedAt: string | null;
  collectedBy: string | null;
  createdAt: string;
}

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
  height: string | null;
  weight: string | null;
  eyeColor: string | null;
  hairColor: string | null;
  scars: string | null;
  tattoos: string | null;
  status: string;
  dangerLevel: string;
  lastKnownAddr: string | null;
  lastLatitude: number | null;
  lastLongitude: number | null;
  lastSeenAt: string | null;
  lastSeenLocation: string | null;
  criminalHistory: string | null;
  knownAssociates: string | null;
  modusOperandi: string | null;
  warrantStatus: string | null;
  warrantIssuedAt: string | null;
  notes: string | null;
  cases: Array<{
    case: { id: string; reference: string; title: string; status: string; type: string };
    role: string;
  }>;
  evidence: EvidenceData[];
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

const evidenceTypeConfig: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  photo: { label: 'Photo', icon: Camera, color: 'text-blue-500' },
  video: { label: 'Vidéo', icon: Video, color: 'text-purple-500' },
  document: { label: 'Document', icon: FileText, color: 'text-green-500' },
  temoignage: { label: 'Témoignage', icon: FileWarning, color: 'text-orange-500' },
  autre: { label: 'Autre', icon: FileText, color: 'text-gray-500' },
};

const warrantLabels: Record<string, string> = {
  actif: 'Mandat actif',
  expire: 'Mandat expiré',
  aucun: 'Aucun mandat',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('fr-FR');
}

function formatFileSize(bytes: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CriminalsSection() {
  const [criminals, setCriminals] = useState<CriminalData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDanger, setFilterDanger] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCriminal, setSelectedCriminal] = useState<CriminalData | null>(null);
  const [activeTab, setActiveTab] = useState<'info' | 'evidence' | 'location' | 'history'>('info');

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
                placeholder="Rechercher par nom, alias, référence, n° d'identité..."
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
                onClick={() => {
                  setSelectedCriminal(criminal);
                  setActiveTab('info');
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
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
                      {criminal.lastSeenLocation && (
                        <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-red-500" />
                          <span className="line-clamp-1">{criminal.lastSeenLocation}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                        {criminal.evidence.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            {criminal.evidence.length} preuve(s)
                          </span>
                        )}
                        {criminal.cases.length > 0 && (
                          <span>{criminal.cases.length} dossier(s)</span>
                        )}
                        {criminal.warrantStatus === 'actif' && (
                          <Badge className="text-[9px] bg-red-600 text-white">MANDAT ACTIF</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Criminal Detail Dialog with Tabs */}
      <Dialog open={!!selectedCriminal} onOpenChange={() => setSelectedCriminal(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
          {selectedCriminal && (() => {
            const stConfig = statusConfig[selectedCriminal.status] || statusConfig.libre;
            const StatusIcon = stConfig.icon;
            return (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-primary" />
                    Fiche Criminelle — {selectedCriminal.reference}
                    {selectedCriminal.warrantStatus === 'actif' && (
                      <Badge className="bg-red-600 text-white text-xs animate-pulse-urgent">
                        MANDAT D&apos;ARRÊT ACTIF
                      </Badge>
                    )}
                  </DialogTitle>
                </DialogHeader>

                {/* Header info */}
                <div className="flex items-start gap-4 pb-3 border-b">
                  <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {selectedCriminal.photo ? (
                      <img src={selectedCriminal.photo} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span className="text-2xl font-bold text-muted-foreground">
                        {selectedCriminal.firstName[0]}{selectedCriminal.lastName[0]}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">
                      {selectedCriminal.firstName} {selectedCriminal.lastName}
                    </h3>
                    {selectedCriminal.alias && (
                      <p className="text-sm text-muted-foreground">Alias: &quot;{selectedCriminal.alias}&quot;</p>
                    )}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={stConfig.color}>
                        <StatusIcon className="w-3 h-3 mr-1" />
                        {stConfig.label}
                      </Badge>
                      <Badge variant="outline">
                        Danger: {dangerLabels[selectedCriminal.dangerLevel]}
                      </Badge>
                      {selectedCriminal.warrantStatus && (
                        <Badge variant={selectedCriminal.warrantStatus === 'actif' ? 'destructive' : 'outline'}>
                          <Scale className="w-3 h-3 mr-1" />
                          {warrantLabels[selectedCriminal.warrantStatus]}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-1 border-b">
                  {[
                    { id: 'info', label: 'Informations', icon: UserCheck },
                    { id: 'evidence', label: `Preuves (${selectedCriminal.evidence.length})`, icon: Camera },
                    { id: 'location', label: 'Localisation', icon: MapPin },
                    { id: 'history', label: 'Historique', icon: FileText },
                  ].map((tab) => {
                    const TabIcon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
                          activeTab === tab.id
                            ? 'border-primary text-primary'
                            : 'border-transparent text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <TabIcon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>

                {/* Tab content */}
                <div className="flex-1 overflow-y-auto p-1">
                  {/* Info Tab */}
                  {activeTab === 'info' && (
                    <div className="space-y-4 pt-2">
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
                            <p className="font-mono">{selectedCriminal.idNumber}</p>
                          </div>
                        )}
                      </div>

                      {/* Physical description */}
                      <div>
                        <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                          <Ruler className="w-4 h-4" />
                          Description physique
                        </h4>
                        {selectedCriminal.physicalDesc && (
                          <p className="text-sm mb-2 p-2 rounded bg-muted/50">{selectedCriminal.physicalDesc}</p>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                          {selectedCriminal.height && (
                            <div className="flex items-center gap-2 p-2 rounded border">
                              <Ruler className="w-3 h-3 text-muted-foreground" />
                              <span>Taille: <strong>{selectedCriminal.height}</strong></span>
                            </div>
                          )}
                          {selectedCriminal.weight && (
                            <div className="flex items-center gap-2 p-2 rounded border">
                              <Weight className="w-3 h-3 text-muted-foreground" />
                              <span>Poids: <strong>{selectedCriminal.weight}</strong></span>
                            </div>
                          )}
                          {selectedCriminal.eyeColor && (
                            <div className="flex items-center gap-2 p-2 rounded border">
                              <EyeIcon className="w-3 h-3 text-muted-foreground" />
                              <span>Yeux: <strong>{selectedCriminal.eyeColor}</strong></span>
                            </div>
                          )}
                          {selectedCriminal.hairColor && (
                            <div className="flex items-center gap-2 p-2 rounded border">
                              <Sparkles className="w-3 h-3 text-muted-foreground" />
                              <span>Cheveux: <strong>{selectedCriminal.hairColor}</strong></span>
                            </div>
                          )}
                        </div>
                        {(selectedCriminal.scars || selectedCriminal.tattoos) && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mt-2">
                            {selectedCriminal.scars && (
                              <div className="p-2 rounded border">
                                <p className="text-muted-foreground mb-0.5">Cicatrices</p>
                                <p>{selectedCriminal.scars}</p>
                              </div>
                            )}
                            {selectedCriminal.tattoos && (
                              <div className="p-2 rounded border">
                                <p className="text-muted-foreground mb-0.5">Tatouages</p>
                                <p>{selectedCriminal.tattoos}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Known associates */}
                      {selectedCriminal.knownAssociates && (
                        <div>
                          <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                            <Users2 className="w-4 h-4" />
                            Complices connus
                          </h4>
                          <p className="text-sm p-2 rounded bg-muted/50">{selectedCriminal.knownAssociates}</p>
                        </div>
                      )}

                      {/* Modus operandi */}
                      {selectedCriminal.modusOperandi && (
                        <div>
                          <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                            <FileWarning className="w-4 h-4" />
                            Mode opératoire
                          </h4>
                          <p className="text-sm p-2 rounded bg-muted/50">{selectedCriminal.modusOperandi}</p>
                        </div>
                      )}

                      {/* Internal notes */}
                      {selectedCriminal.notes && (
                        <div>
                          <h4 className="font-medium text-sm mb-1 flex items-center gap-2">
                            <StickyNote className="w-4 h-4" />
                            Notes internes
                          </h4>
                          <p className="text-sm p-2 rounded bg-yellow-50 border border-yellow-200">{selectedCriminal.notes}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Evidence Tab */}
                  {activeTab === 'evidence' && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm flex items-center gap-2">
                          <Camera className="w-4 h-4" />
                          Preuves et pièces à conviction ({selectedCriminal.evidence.length})
                        </h4>
                        <Button size="sm" variant="outline" className="h-8 text-xs">
                          <Upload className="w-3 h-3 mr-1" />
                          Ajouter une preuve
                        </Button>
                      </div>
                      {selectedCriminal.evidence.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucune preuve enregistrée
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {selectedCriminal.evidence.map((ev) => {
                            const evCfg = evidenceTypeConfig[ev.type] || evidenceTypeConfig.autre;
                            const EvIcon = evCfg.icon;
                            return (
                              <div key={ev.id} className="border rounded-lg overflow-hidden hover:shadow-sm transition-shadow">
                                {/* Preview */}
                                {ev.type === 'photo' && ev.fileUrl && ev.fileUrl.startsWith('http') ? (
                                  <div className="aspect-video bg-muted">
                                    <img src={ev.fileUrl} alt={ev.title} className="w-full h-full object-cover" />
                                  </div>
                                ) : (
                                  <div className="aspect-video bg-muted flex items-center justify-center">
                                    <EvIcon className={`w-10 h-10 ${evCfg.color}`} />
                                  </div>
                                )}
                                <div className="p-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <EvIcon className={`w-4 h-4 ${evCfg.color}`} />
                                    <span className="text-xs font-medium">{evCfg.label}</span>
                                  </div>
                                  <p className="text-sm font-medium line-clamp-1">{ev.title}</p>
                                  {ev.description && (
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{ev.description}</p>
                                  )}
                                  <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                                    {ev.collectedAt && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(ev.collectedAt)}
                                      </span>
                                    )}
                                    {ev.fileSize && (
                                      <span>{formatFileSize(ev.fileSize)}</span>
                                    )}
                                  </div>
                                  {ev.collectedBy && (
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Collecté par: {ev.collectedBy}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Location Tab */}
                  {activeTab === 'location' && (
                    <div className="space-y-4 pt-2">
                      <h4 className="font-medium text-sm flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-red-500" />
                        Localisation et déplacements
                      </h4>

                      {/* Last known location */}
                      {selectedCriminal.lastSeenLocation && (
                        <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                          <p className="text-xs font-medium text-red-700 mb-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            Dernière localisation connue
                          </p>
                          <p className="text-base font-semibold">{selectedCriminal.lastSeenLocation}</p>
                          {selectedCriminal.lastLatitude && selectedCriminal.lastLongitude && (
                            <p className="text-xs text-red-600 mt-1 font-mono">
                              Coordonnées: {selectedCriminal.lastLatitude.toFixed(4)}, {selectedCriminal.lastLongitude.toFixed(4)}
                            </p>
                          )}
                          {selectedCriminal.lastSeenAt && (
                            <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Vu pour la dernière fois: {formatDate(selectedCriminal.lastSeenAt)}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Address */}
                      {selectedCriminal.lastKnownAddr && (
                        <div className="p-3 rounded-lg border">
                          <p className="text-xs text-muted-foreground mb-1">Dernière adresse connue</p>
                          <p className="text-sm flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            {selectedCriminal.lastKnownAddr}
                          </p>
                        </div>
                      )}

                      {/* Map placeholder */}
                      {selectedCriminal.lastLatitude && selectedCriminal.lastLongitude && (
                        <div className="border rounded-lg overflow-hidden">
                          <div className="bg-muted aspect-video flex items-center justify-center relative">
                            {/* Simple visual representation of location */}
                            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-blue-50" />
                            <div className="relative text-center">
                              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center mx-auto mb-2 animate-pulse-urgent">
                                <MapPin className="w-6 h-6 text-white" />
                              </div>
                              <p className="text-xs font-medium">
                                {selectedCriminal.lastLatitude.toFixed(4)}, {selectedCriminal.lastLongitude.toFixed(4)}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Carte de localisation
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {!selectedCriminal.lastSeenLocation && !selectedCriminal.lastKnownAddr && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucune localisation connue
                        </p>
                      )}
                    </div>
                  )}

                  {/* History Tab */}
                  {activeTab === 'history' && (
                    <div className="space-y-4 pt-2">
                      {/* Criminal history */}
                      {selectedCriminal.criminalHistory && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Historique criminel
                          </h4>
                          <p className="text-sm p-3 rounded bg-muted/50 whitespace-pre-line">
                            {selectedCriminal.criminalHistory}
                          </p>
                        </div>
                      )}

                      {/* Warrant info */}
                      {selectedCriminal.warrantStatus && selectedCriminal.warrantStatus !== 'aucun' && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Scale className="w-4 h-4" />
                            Mandat d&apos;arrêt
                          </h4>
                          <div className="p-3 rounded border">
                            <Badge variant={selectedCriminal.warrantStatus === 'actif' ? 'destructive' : 'outline'}>
                              {warrantLabels[selectedCriminal.warrantStatus]}
                            </Badge>
                            {selectedCriminal.warrantIssuedAt && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Émis le: {formatDate(selectedCriminal.warrantIssuedAt)}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Linked cases */}
                      {selectedCriminal.cases.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Dossiers liés ({selectedCriminal.cases.length})
                          </h4>
                          <div className="space-y-2">
                            {selectedCriminal.cases.map((cc, i) => (
                              <div key={i} className="flex items-center justify-between p-3 rounded-lg border">
                                <div>
                                  <p className="text-sm font-medium">{cc.case.title}</p>
                                  <p className="text-xs text-muted-foreground font-mono">{cc.case.reference}</p>
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {roleLabels[cc.role] || cc.role}
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {!selectedCriminal.criminalHistory && selectedCriminal.cases.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-8">
                          Aucun historique disponible
                        </p>
                      )}
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
