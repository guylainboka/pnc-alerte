'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Smartphone,
  Server,
  Database,
  Cloud,
  Wifi,
  Copy,
  Check,
  ExternalLink,
  Shield,
  Radio,
  Upload,
  FileCode,
  ArrowRight,
  CircleAlert,
  CircleCheck,
  Loader2,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { toast } from 'sonner';

interface BackendStatus {
  mode: 'supabase' | 'local';
  configured: boolean;
  supabaseUrl: string | null;
}

interface MobileEndpoint {
  method: string;
  path: string;
  description: string;
  auth: boolean;
}

const endpoints: MobileEndpoint[] = [
  {
    method: 'GET',
    path: '/api/mobile/status',
    description: 'Vérifie la disponibilité du backend',
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/mobile/auth/register',
    description: 'Inscription d\'un citoyen (crée le compte)',
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/mobile/auth/login',
    description: 'Connexion d\'un citoyen (retourne un jeton)',
    auth: false,
  },
  {
    method: 'GET',
    path: '/api/mobile/auth/me',
    description: 'Profil du citoyen connecté',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/mobile/alerts',
    description: 'Envoie une alerte SOS au Centre de Commandement',
    auth: false,
  },
  {
    method: 'GET',
    path: '/api/mobile/alerts',
    description: 'Liste les alertes du citoyen',
    auth: true,
  },
  {
    method: 'POST',
    path: '/api/mobile/complaints',
    description: 'Dépose une plainte',
    auth: false,
  },
  {
    method: 'GET',
    path: '/api/mobile/complaints',
    description: 'Liste les plaintes du citoyen',
    auth: true,
  },
  {
    method: 'GET',
    path: '/api/mobile/commissariats',
    description: 'Liste publique des commissariats',
    auth: false,
  },
  {
    method: 'GET',
    path: '/api/mobile/criminals/wanted',
    description: 'Liste publique des criminels recherchés',
    auth: false,
  },
  {
    method: 'POST',
    path: '/api/mobile/upload',
    description: 'Téléverse un fichier (preuve/photo)',
    auth: true,
  },
];

export function IntegrationSection() {
  const [status, setStatus] = useState<BackendStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/mobile/status');
      const data = await res.json();
      setStatus({
        mode: data.backend,
        configured: data.supabase,
        supabaseUrl: data.supabaseUrl,
      });
    } catch {
      setStatus({ mode: 'local', configured: false, supabaseUrl: null });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const testEndpoint = async (path: string, method: string) => {
    setTesting(path);
    try {
      const res = await fetch(path, { method: method === 'GET' ? 'GET' : 'POST' });
      const ok = res.ok || res.status === 400 || res.status === 401;
      const data = await res.json().catch(() => ({}));
      toast[ok ? 'success' : 'error'](
        ok
          ? `${method} ${path} → ${res.status} OK`
          : `${method} ${path} → ${res.status} erreur`,
        { description: ok ? 'Endpoint fonctionnel' : JSON.stringify(data).slice(0, 100) }
      );
    } catch (e: any) {
      toast.error(`Erreur: ${e.message}`);
    } finally {
      setTesting(null);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
    toast.success('Copié dans le presse-papier');
  };

  const isSupabase = status?.mode === 'supabase';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-primary" />
          Backend & Application Mobile
        </h2>
        <p className="text-muted-foreground mt-1">
          Connexion entre le Centre de Commandement, Supabase et l'application mobile citoyenne
        </p>
      </div>

      {/* Architecture diagram */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="w-5 h-5 text-primary" />
            Architecture du Système
          </CardTitle>
          <CardDescription>
            Les trois composants partagent le même backend Supabase
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
            {/* Mobile */}
            <div className="rounded-lg border-2 border-dashed border-primary/30 p-4 text-center bg-primary/5">
              <Smartphone className="w-10 h-10 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Application Mobile</h3>
              <p className="text-xs text-muted-foreground mt-1">Citoyens (React Native / Flutter)</p>
              <div className="mt-3 space-y-1 text-[11px] text-left">
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Envoi d'alertes SOS</div>
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Dépôt de plaintes</div>
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Géolocalisation</div>
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Avis de recherche</div>
              </div>
            </div>

            {/* Supabase - center */}
            <div className="rounded-lg border-2 border-primary bg-primary/10 p-4 text-center relative">
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 hidden md:flex items-center">
                <ArrowRight className="w-5 h-5 text-primary rotate-180" />
              </div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
              <Database className="w-10 h-10 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Supabase Backend</h3>
              <p className="text-xs text-muted-foreground mt-1">PostgreSQL partagé</p>
              <div className="mt-3 space-y-1 text-[11px] text-left">
                <div className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-primary" /> Auth (citoyens + PNC)</div>
                <div className="flex items-center gap-1.5"><Database className="w-3 h-3 text-primary" /> Base PostgreSQL</div>
                <div className="flex items-center gap-1.5"><Radio className="w-3 h-3 text-primary" /> Realtime (live)</div>
                <div className="flex items-center gap-1.5"><Upload className="w-3 h-3 text-primary" /> Storage (preuves)</div>
              </div>
            </div>

            {/* Web */}
            <div className="rounded-lg border-2 border-dashed border-primary/30 p-4 text-center bg-primary/5">
              <Server className="w-10 h-10 mx-auto mb-2 text-primary" />
              <h3 className="font-semibold">Centre de Commandement</h3>
              <p className="text-xs text-muted-foreground mt-1">Application Web PNC (Next.js)</p>
              <div className="mt-3 space-y-1 text-[11px] text-left">
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Réception alertes</div>
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Traitement plaintes</div>
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Base criminelle</div>
                <div className="flex items-center gap-1.5"><CircleCheck className="w-3 h-3 text-green-600" /> Gestion dossiers</div>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center text-xs text-muted-foreground">
            <Wifi className="w-3 h-3 inline mr-1" />
            Synchronisation temps réel : alertes et plaintes apparaissent instantanément dans le Centre de Commandement
          </div>
        </CardContent>
      </Card>

      {/* Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Mode backend</p>
                <p className="text-2xl font-bold mt-1">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isSupabase ? 'Supabase' : 'Local (SQLite)'}
                </p>
              </div>
              {isSupabase ? (
                <Cloud className="w-8 h-8 text-green-600" />
              ) : (
                <Database className="w-8 h-8 text-amber-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isSupabase
                ? 'Backend partagé production — mobile et web connectés'
                : 'Mode démo local — configurez Supabase pour le mobile'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Supabase</p>
                <p className="text-2xl font-bold mt-1">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : status?.configured ? 'Configuré' : 'Non configuré'}
                </p>
              </div>
              {status?.configured ? (
                <CircleCheck className="w-8 h-8 text-green-600" />
              ) : (
                <CircleAlert className="w-8 h-8 text-amber-600" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              {status?.supabaseUrl || 'Variables NEXT_PUBLIC_SUPABASE_URL non définies'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Realtime</p>
                <p className="text-2xl font-bold mt-1">
                  {isSupabase ? 'Actif' : 'Polling'}
                </p>
              </div>
              <Radio className={`w-8 h-8 ${isSupabase ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {isSupabase
                ? 'Alertes live via Supabase Realtime'
                : 'Rafraîchissement toutes les 15s (fallback)'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs: Configuration / Endpoints / Realtime / Code examples */}
      <Tabs defaultValue="endpoints">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="endpoints">API Mobile</TabsTrigger>
          <TabsTrigger value="config">Configuration Supabase</TabsTrigger>
          <TabsTrigger value="realtime">Temps Réel</TabsTrigger>
          <TabsTrigger value="code">Exemples Code</TabsTrigger>
        </TabsList>

        {/* Endpoints tab */}
        <TabsContent value="endpoints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                Endpoints API pour l'Application Mobile
              </CardTitle>
              <CardDescription>
                L'application mobile appelle ces endpoints. Tous retournent du JSON.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {endpoints.map((ep) => (
                  <div
                    key={`${ep.method}-${ep.path}`}
                    className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-3 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <Badge
                      variant={ep.method === 'GET' ? 'secondary' : 'default'}
                      className="font-mono text-[10px] w-fit"
                    >
                      {ep.method}
                    </Badge>
                    <code className="text-sm font-mono flex-1 break-all">{ep.path}</code>
                    {ep.auth && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <Shield className="w-3 h-3" /> Auth
                      </Badge>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => testEndpoint(ep.path, ep.method)}
                      disabled={testing === ep.path}
                    >
                      {testing === ep.path ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        'Tester'
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
                <CircleAlert className="w-4 h-4 inline mr-1" />
                Base URL : utilisez l'URL de déploiement (ex: <code className="font-mono">https://votre-app.vercel.app</code>).
                En développement local, l'application mobile et le serveur web doivent pouvoir communiquer (même réseau ou tunnel ngrok).
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Config tab */}
        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cloud className="w-5 h-5 text-primary" />
                Configuration Supabase (3 étapes)
              </CardTitle>
              <CardDescription>
                Connectez le Centre de Commandement et l'application mobile au même backend Supabase
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible defaultValue="step1">
                <AccordionItem value="step1">
                  <AccordionTrigger className="text-sm font-semibold">
                    1. Créer un projet Supabase
                  </AccordionTrigger>
                  <AccordionContent className="space-y-2 text-sm">
                    <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                      <li>Rendez-vous sur <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">supabase.com <ExternalLink className="w-3 h-3" /></a></li>
                      <li>Cliquez sur "New project" et choisissez un nom (ex: "PNC-Backend")</li>
                      <li>Sélectionnez une région proche de la RDC (ex: Frankfurt eu-central-1)</li>
                      <li>Attendez ~2 minutes que le projet soit provisionné</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step2">
                  <AccordionTrigger className="text-sm font-semibold">
                    2. Exécuter le schéma SQL
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      Dans Supabase Dashboard → <strong>SQL Editor</strong> → New query, collez et exécutez le schéma complet :
                    </p>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-48 font-mono">
{`-- Fichier: supabase/migrations/0001_init_pnc_schema.sql
-- Crée toutes les tables + RLS + Realtime
-- Puis exécutez 0002_seed_data.sql pour les données démo`}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-7"
                        onClick={() => copyToClipboard('supabase/migrations/0001_init_pnc_schema.sql', 'sql1')}
                      >
                        {copied === 'sql1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-muted-foreground">
                      Créez aussi le bucket de stockage : <strong>Storage</strong> → New bucket → nom: <code className="font-mono">pnc-evidence</code> (public).
                    </p>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="step3">
                  <AccordionTrigger className="text-sm font-semibold">
                    3. Configurer les variables d'environnement
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3 text-sm">
                    <p className="text-muted-foreground">
                      Dans Supabase Dashboard → <strong>Project Settings</strong> → API, copiez ces valeurs.
                      Puis créez un fichier <code className="font-mono">.env</code> à la racine du projet web :
                    </p>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto font-mono">
{`# .env (Centre de Commandement Web)
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...   # Secret serveur !
SUPABASE_EVIDENCE_BUCKET=pnc-evidence
PNC_BACKEND_MODE=auto`}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-7"
                        onClick={() => copyToClipboard(`NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co\nNEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...\nSUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...\nSUPABASE_EVIDENCE_BUCKET=pnc-evidence\nPNC_BACKEND_MODE=auto`, 'env1')}
                      >
                        {copied === 'env1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs dark:bg-red-950/30 dark:border-red-900 dark:text-red-200">
                      <Shield className="w-4 h-4 inline mr-1" />
                      <strong>Jamais</strong> exposez <code>SUPABASE_SERVICE_ROLE_KEY</code> dans l'application mobile.
                      Le mobile utilise uniquement <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (protégée par RLS).
                    </div>
                    <p className="text-muted-foreground">
                      Dans l'application mobile, configurez les <strong>mêmes</strong> variables publiques :
                    </p>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto font-mono">
{`# .env (Application Mobile)
EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
                      </pre>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="absolute top-1 right-1 h-7"
                        onClick={() => copyToClipboard(`EXPO_PUBLIC_SUPABASE_URL=https://xyz.supabase.co\nEXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`, 'env2')}
                      >
                        {copied === 'env2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                    <p className="text-muted-foreground">
                      Redémarrez le serveur : <code className="font-mono">bun run dev</code>. Le statut passera à "Supabase Configuré".
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Realtime tab */}
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-primary" />
                Synchronisation Temps Réel
              </CardTitle>
              <CardDescription>
                Comment les alertes circulent du mobile vers le Centre de Commandement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <div className="text-sm">
                    <p className="font-medium">Le citoyen appuie sur "SOS" dans l'application mobile</p>
                    <p className="text-muted-foreground text-xs mt-0.5">L'app envoie <code className="font-mono">POST /api/mobile/alerts</code> avec le type, la position GPS et la description</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <div className="text-sm">
                    <p className="font-medium">Le serveur crée l'alerte dans Supabase</p>
                    <p className="text-muted-foreground text-xs mt-0.5">La table <code className="font-mono">alerts</code> reçoit une nouvelle ligne avec statut "recue"</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <div className="text-sm">
                    <p className="font-medium">Supabase Realtime diffuse l'événement INSERT</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Tous les clients abonnés au canal <code className="font-mono">alerts</code> sont notifiés</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                  <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">4</div>
                  <div className="text-sm">
                    <p className="font-medium">Le Centre de Commandement reçoit l'alerte instantanément</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Le hook <code className="font-mono">useLiveAlerts</code> déclenche un toast + rafraîchit la liste</p>
                  </div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs">
                <p className="font-medium mb-1">Tables diffusées en Realtime :</p>
                <ul className="space-y-0.5 text-muted-foreground">
                  <li>• <code className="font-mono">alerts</code> — nouvelles alertes citoyennes</li>
                  <li>• <code className="font-mono">complaints</code> — nouvelles plaintes</li>
                  <li>• <code className="font-mono">citizens</code> — mises à jour de localisation</li>
                  <li>• <code className="font-mono">cases</code> — changements de statut des dossiers</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code examples tab */}
        <TabsContent value="code" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-primary" />
                Exemples de code pour l'Application Mobile
              </CardTitle>
              <CardDescription>
                Snippets prêts à l'emploi (React Native / JavaScript)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="alert">
                  <AccordionTrigger className="text-sm">Envoyer une alerte SOS (React Native)</AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-80 font-mono">
{`// Envoie une alerte SOS au Centre de Commandement PNC
async function sendAlert(type, description, location, coords) {
  const res = await fetch('https://votre-app.vercel.app/api/mobile/alerts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': \`Bearer \${userToken}\`, // optionnel
    },
    body: JSON.stringify({
      type,           // 'vol' | 'agression' | 'accident' | 'incendie' | 'autre'
      description,
      location,       // texte: "Marché Central, Gombe"
      latitude: coords.latitude,
      longitude: coords.longitude,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error);
  console.log('Alerte reçue par la PNC:', data.alert.reference);
}`}
                      </pre>
                      <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-7" onClick={() => copyToClipboard(`async function sendAlert(type, description, location, coords) {\n  const res = await fetch('https://votre-app.vercel.app/api/mobile/alerts', {\n    method: 'POST',\n    headers: {\n      'Content-Type': 'application/json',\n      'Authorization': \`Bearer \${userToken}\`,\n    },\n    body: JSON.stringify({\n      type,\n      description,\n      location,\n      latitude: coords.latitude,\n      longitude: coords.longitude,\n    }),\n  });\n  const data = await res.json();\n  if (!res.ok) throw new Error(data.error);\n  console.log('Alerte reçue par la PNC:', data.alert.reference);\n}`, 'code-alert')}>
                        {copied === 'code-alert' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="register">
                  <AccordionTrigger className="text-sm">Inscription d'un citoyen</AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-80 font-mono">
{`async function registerCitizen(data) {
  const res = await fetch('/api/mobile/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,        // +243...
      email: data.email,        // optionnel
      password: data.password,  // min 6 caractères
      gender: data.gender,      // 'M' | 'F'
      city: data.city,
      commune: data.commune,
      address: data.address,
    }),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error);
  // Stocker result.accessToken pour les requêtes futures
  return result;
}`}
                      </pre>
                      <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-7" onClick={() => copyToClipboard(`async function registerCitizen(data) {\n  const res = await fetch('/api/mobile/auth/register', {\n    method: 'POST',\n    headers: { 'Content-Type': 'application/json' },\n    body: JSON.stringify({\n      firstName: data.firstName,\n      lastName: data.lastName,\n      phone: data.phone,\n      email: data.email,\n      password: data.password,\n      gender: data.gender,\n      city: data.city,\n      commune: data.commune,\n      address: data.address,\n    }),\n  });\n  const result = await res.json();\n  if (!res.ok) throw new Error(result.error);\n  return result;\n}`, 'code-reg')}>
                        {copied === 'code-reg' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="realtime">
                  <AccordionTrigger className="text-sm">Écouter les avis de recherche (Realtime direct)</AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-80 font-mono">
{`// L'app mobile peut aussi écouter Supabase Realtime directement
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
);

// Écouter les nouveaux criminels recherchés
supabase
  .channel('wanted-criminals')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'criminals', filter: 'status=eq.recherche' },
    (payload) => {
      const newCriminal = payload.new;
      // Afficher une notification push au citoyen
      showNotification('Avis de recherche', newCriminal.first_name + ' ' + newCriminal.last_name);
    }
  )
  .subscribe();`}
                      </pre>
                      <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-7" onClick={() => copyToClipboard(`import { createClient } from '@supabase/supabase-js';\n\nconst supabase = createClient(\n  process.env.EXPO_PUBLIC_SUPABASE_URL,\n  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,\n);\n\nsupabase\n  .channel('wanted-criminals')\n  .on('postgres_changes',\n    { event: 'INSERT', schema: 'public', table: 'criminals', filter: 'status=eq.recherche' },\n    (payload) => {\n      const newCriminal = payload.new;\n      showNotification('Avis de recherche', newCriminal.first_name + ' ' + newCriminal.last_name);\n    }\n  )\n  .subscribe();`, 'code-rt')}>
                        {copied === 'code-rt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="upload">
                  <AccordionTrigger className="text-sm">Téléverser une preuve (photo)</AccordionTrigger>
                  <AccordionContent>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto max-h-80 font-mono">
{`async function uploadEvidence(uri, type = 'photo') {
  const formData = new FormData();
  formData.append('file', {
    uri,              // file://... (React Native)
    type: 'image/jpeg',
    name: 'evidence.jpg',
  });
  formData.append('type', type);

  const res = await fetch('/api/mobile/upload', {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${userToken}\`,
    },
    body: formData,
  });
  const data = await res.json();
  return data.fileUrl; // URL publique du fichier
}`}
                      </pre>
                      <Button size="sm" variant="ghost" className="absolute top-1 right-1 h-7" onClick={() => copyToClipboard(`async function uploadEvidence(uri, type = 'photo') {\n  const formData = new FormData();\n  formData.append('file', {\n    uri,\n    type: 'image/jpeg',\n    name: 'evidence.jpg',\n  });\n  formData.append('type', type);\n\n  const res = await fetch('/api/mobile/upload', {\n    method: 'POST',\n    headers: { 'Authorization': \`Bearer \${userToken}\` },\n    body: formData,\n  });\n  const data = await res.json();\n  return data.fileUrl;\n}`, 'code-up')}>
                        {copied === 'code-up' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Files reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCode className="w-5 h-5 text-primary" />
            Fichiers créés pour l'intégration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {[
              { f: 'src/lib/supabase.ts', d: 'Client Supabase (server + browser)' },
              { f: 'src/lib/repositories.ts', d: 'Couche d\'accès dual (Supabase/Prisma)' },
              { f: 'src/lib/use-realtime.ts', d: 'Hook Realtime pour le web' },
              { f: 'supabase/migrations/0001_init_pnc_schema.sql', d: 'Schéma PostgreSQL + RLS' },
              { f: 'supabase/migrations/0002_seed_data.sql', d: 'Données de démonstration' },
              { f: '.env.example', d: 'Template de configuration' },
              { f: 'MOBILE_INTEGRATION.md', d: 'Guide complet d\'intégration mobile' },
              { f: 'src/app/api/mobile/*', d: '11 endpoints API pour le mobile' },
            ].map((item) => (
              <div key={item.f} className="flex items-start gap-2 p-2 rounded border bg-card">
                <FileCode className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                <div>
                  <code className="font-mono text-[11px] break-all">{item.f}</code>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{item.d}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
