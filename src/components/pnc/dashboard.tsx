'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  FolderOpen,
  Users,
  FileText,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Building2,
  Shield,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

interface DashboardData {
  alertCounts: { recue: number; en_cours: number; traitee: number; cloturee: number; total: number };
  caseCounts: { ouvert: number; en_enquete: number; en_instruction: number; jugement: number; cloture: number; total: number };
  criminalCounts: { recherche: number; incarcere: number; libre: number; sous_surveillance: number; total: number };
  complaintCounts: { soumise: number; en_revision: number; approuvee: number; rejetee: number; traitee: number; total: number };
  recentAlerts: Array<{
    id: string; reference: string; type: string; priority: string; status: string;
    description: string; location: string; createdAt: string;
    commissariat: { name: string }; assignedTo: { firstName: string; lastName: string } | null;
  }>;
  recentCases: Array<{
    id: string; reference: string; title: string; type: string; status: string; priority: string;
    createdAt: string;
    commissariat: { name: string }; assignedTo: { firstName: string; lastName: string } | null;
  }>;
  stationCount: number;
  officerCount: number;
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
  ouvert: 'bg-blue-500 text-white',
  en_enquete: 'bg-yellow-600 text-white',
  en_instruction: 'bg-orange-500 text-white',
  jugement: 'bg-purple-500 text-white',
  cloture: 'bg-green-600 text-white',
};

const PIE_COLORS = ['#1a5632', '#c8a415', '#3b82f6', '#ef4444', '#8b5cf6'];

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `il y a ${mins} min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `il y a ${days}j`;
}

export function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !data) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-20 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const alertPieData = [
    { name: 'Reçues', value: data.alertCounts.recue },
    { name: 'En cours', value: data.alertCounts.en_cours },
    { name: 'Traitées', value: data.alertCounts.traitee },
    { name: 'Clôturées', value: data.alertCounts.cloturee },
  ].filter((d) => d.value > 0);

  const caseBarData = [
    { name: 'Ouvert', count: data.caseCounts.ouvert },
    { name: 'Enquête', count: data.caseCounts.en_enquete },
    { name: 'Instruction', count: data.caseCounts.en_instruction },
    { name: 'Jugement', count: data.caseCounts.jugement },
    { name: 'Clôturé', count: data.caseCounts.cloture },
  ];

  const complaintPieData = [
    { name: 'Soumises', value: data.complaintCounts.soumise },
    { name: 'En révision', value: data.complaintCounts.en_revision },
    { name: 'Approuvées', value: data.complaintCounts.approuvee },
    { name: 'Rejetées', value: data.complaintCounts.rejetee },
    { name: 'Traitées', value: data.complaintCounts.traitee },
  ].filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Alertes Actives</p>
                <p className="text-2xl font-bold">{data.alertCounts.recue + data.alertCounts.en_cours}</p>
                <p className="text-xs text-red-500 font-medium">{data.alertCounts.en_cours} en cours</p>
              </div>
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <Bell className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-yellow-600">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dossiers Ouverts</p>
                <p className="text-2xl font-bold">{data.caseCounts.total}</p>
                <p className="text-xs text-yellow-600 font-medium">{data.caseCounts.en_enquete} en enquête</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <FolderOpen className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Criminels Recherchés</p>
                <p className="text-2xl font-bold">{data.criminalCounts.recherche}</p>
                <p className="text-xs text-primary font-medium">{data.criminalCounts.sous_surveillance} sous surveillance</p>
              </div>
              <div className="p-3 rounded-full bg-primary/10 text-primary">
                <Users className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Plaintes en Attente</p>
                <p className="text-2xl font-bold">{data.complaintCounts.soumise + data.complaintCounts.en_revision}</p>
                <p className="text-xs text-blue-500 font-medium">{data.complaintCounts.en_revision} en révision</p>
              </div>
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{data.stationCount}</p>
              <p className="text-xs text-muted-foreground">Commissariats</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <Shield className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{data.officerCount}</p>
              <p className="text-xs text-muted-foreground">Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <XCircle className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{data.criminalCounts.incarcere}</p>
              <p className="text-xs text-muted-foreground">Incarcérés</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-lg font-semibold">{data.alertCounts.traitee + data.alertCounts.cloturee}</p>
              <p className="text-xs text-muted-foreground">Alertes Résolues</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alert Status Pie */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Répartition des Alertes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={alertPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {alertPieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Case Status Bar */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Statut des Dossiers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={caseBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#1a5632" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Alerts & Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Alerts */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                Alertes Récentes
              </CardTitle>
              <Badge variant="outline" className="text-xs">{data.recentAlerts.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {data.recentAlerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="mt-0.5">
                  {alert.priority === 'urgente' ? (
                    <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse-urgent" />
                  ) : (
                    <Bell className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-muted-foreground">{alert.reference}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 ${priorityColors[alert.priority] || ''}`}>
                      {alert.priority}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[alert.status] || ''}`}>
                      {alert.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm line-clamp-2">{alert.description}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(alert.createdAt)}
                    </span>
                    <span>{alert.commissariat?.name}</span>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Cases */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FolderOpen className="w-4 h-4 text-primary" />
                Dossiers Récents
              </CardTitle>
              <Badge variant="outline" className="text-xs">{data.recentCases.length}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 max-h-96 overflow-y-auto">
            {data.recentCases.map((c) => (
              <div
                key={c.id}
                className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <FolderOpen className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-xs font-mono text-muted-foreground">{c.reference}</span>
                    <Badge className={`text-[10px] px-1.5 py-0 ${priorityColors[c.priority] || ''}`}>
                      {c.priority}
                    </Badge>
                    <Badge className={`text-[10px] px-1.5 py-0 ${statusColors[c.status] || ''}`}>
                      {c.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium line-clamp-1">{c.title}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(c.createdAt)}
                    </span>
                    {c.assignedTo && (
                      <span>{c.assignedTo.firstName} {c.assignedTo.lastName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Complaint Pie */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Statut des Plaintes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {complaintPieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
