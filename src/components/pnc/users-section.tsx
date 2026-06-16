'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import {
  Search, Filter, UserPlus, Shield, Clock, CheckCircle2, XCircle,
  Mail, Phone, Building2,
} from 'lucide-react';
import { toast } from 'sonner';

interface UserData {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  phone: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  officerId: string | null;
  createdAt: string;
  updatedAt: string;
  officer: {
    id: string;
    matricule: string;
    rank: string;
    commissariat: { id: string; name: string; code: string };
  } | null;
}

const roleConfig: Record<string, { label: string; color: string }> = {
  admin: { label: 'Administrateur', color: 'bg-red-500 text-white' },
  commissaire: { label: 'Commissaire', color: 'bg-purple-500 text-white' },
  inspecteur: { label: 'Inspecteur', color: 'bg-blue-500 text-white' },
  agent: { label: 'Agent', color: 'bg-gray-500 text-white' },
};

function formatTimeAgo(dateStr: string | null) {
  if (!dateStr) return 'Jamais';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export function UsersSection() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);

  // New user form
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'agent',
    phone: '',
  });

  const fetchUsers = async () => {
    try {
      const params = new URLSearchParams();
      if (filterRole !== 'all') params.set('role', filterRole);
      const res = await fetch(`/api/users?${params.toString()}`);
      const data = await res.json();
      setUsers(data);
    } catch {
      toast.error('Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const filteredUsers = users.filter((u) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      u.firstName.toLowerCase().includes(term) ||
      u.lastName.toLowerCase().includes(term) ||
      u.username.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term)
    );
  });

  const toggleUserStatus = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });
      toast.success(isActive ? 'Utilisateur désactivé' : 'Utilisateur activé');
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const changeRole = async (id: string, role: string) => {
    try {
      await fetch(`/api/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      toast.success('Rôle mis à jour');
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'Erreur');
        return;
      }
      toast.success('Utilisateur créé avec succès');
      setShowAddDialog(false);
      setNewUser({ username: '', email: '', password: '', firstName: '', lastName: '', role: 'agent', phone: '' });
      fetchUsers();
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  const activeCount = users.filter((u) => u.isActive).length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/10 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{users.length}</p>
              <p className="text-xs text-muted-foreground">Utilisateurs total</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{activeCount}</p>
              <p className="text-xs text-muted-foreground">Utilisateurs actifs</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-3 rounded-full bg-red-100 text-red-600">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{adminCount}</p>
              <p className="text-xs text-muted-foreground">Administrateurs</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Add button */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un utilisateur..."
                className="pl-9 h-9 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Filter className="w-4 h-4 text-muted-foreground" />
            <Select value={filterRole} onValueChange={setFilterRole}>
              <SelectTrigger className="w-44 h-9 text-sm">
                <SelectValue placeholder="Rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les rôles</SelectItem>
                <SelectItem value="admin">Administrateur</SelectItem>
                <SelectItem value="commissaire">Commissaire</SelectItem>
                <SelectItem value="inspecteur">Inspecteur</SelectItem>
                <SelectItem value="agent">Agent</SelectItem>
              </SelectContent>
            </Select>
            <Badge variant="outline">{filteredUsers.length} utilisateur(s)</Badge>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button size="sm" className="ml-auto">
                  <UserPlus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateUser} className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={newUser.firstName}
                        onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={newUser.lastName}
                        onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="username">Nom d&apos;utilisateur *</Label>
                    <Input
                      id="username"
                      value={newUser.username}
                      onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="password">Mot de passe *</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="role">Rôle *</Label>
                      <Select
                        value={newUser.role}
                        onValueChange={(value) => setNewUser({ ...newUser, role: value })}
                      >
                        <SelectTrigger id="role">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Administrateur</SelectItem>
                          <SelectItem value="commissaire">Commissaire</SelectItem>
                          <SelectItem value="inspecteur">Inspecteur</SelectItem>
                          <SelectItem value="agent">Agent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={newUser.phone}
                        onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">Créer</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Utilisateur</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Téléphone</TableHead>
                  <TableHead>Commissariat</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Dernière connexion</TableHead>
                  <TableHead className="w-32">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Chargement...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      Aucun utilisateur trouvé
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((u) => {
                    const roleCfg = roleConfig[u.role] || roleConfig.agent;
                    return (
                      <TableRow key={u.id} className="hover:bg-muted/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold">
                                {u.firstName[0]}{u.lastName[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium">{u.firstName} {u.lastName}</p>
                              <p className="text-xs text-muted-foreground font-mono">@{u.username}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-xs">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-muted-foreground" />
                            {u.email}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={u.role}
                            onValueChange={(value) => changeRole(u.id, value)}
                          >
                            <SelectTrigger className="h-7 w-36 text-xs">
                              <Badge className={`text-[10px] ${roleCfg.color}`}>
                                {roleCfg.label}
                              </Badge>
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="admin">Administrateur</SelectItem>
                              <SelectItem value="commissaire">Commissaire</SelectItem>
                              <SelectItem value="inspecteur">Inspecteur</SelectItem>
                              <SelectItem value="agent">Agent</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell className="text-xs">
                          {u.phone ? (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-muted-foreground" />
                              {u.phone}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell className="text-xs">
                          {u.officer ? (
                            <span className="flex items-center gap-1">
                              <Building2 className="w-3 h-3 text-muted-foreground" />
                              {u.officer.commissariat.name}
                            </span>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Badge
                            className={`text-xs ${u.isActive ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}
                          >
                            {u.isActive ? '✓ Actif' : '✕ Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTimeAgo(u.lastLoginAt)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant={u.isActive ? 'outline' : 'default'}
                            className={`h-7 text-xs ${!u.isActive ? 'bg-green-600 hover:bg-green-700' : ''}`}
                            onClick={() => toggleUserStatus(u.id, u.isActive)}
                          >
                            {u.isActive ? (
                              <>
                                <XCircle className="w-3 h-3 mr-1" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Activer
                              </>
                            )}
                          </Button>
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
    </div>
  );
}
