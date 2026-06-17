'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Section } from '@/lib/store';
import { Bell, Search, User, LogOut, Cloud, Database } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const sectionTitles: Record<Section, string> = {
  dashboard: 'Tableau de Bord',
  alerts: 'Centre d\'Alertes',
  cases: 'Gestion des Dossiers',
  criminals: 'Base de Données Criminelle',
  complaints: 'Gestion des Plaintes',
  citizens: 'Citoyens Inscrits',
  users: 'Gestion des Utilisateurs PNC',
  services: 'Intégrations Externes',
  stations: 'Commissariats & Juridictions',
};

function ConnectionBadge() {
  const [status, setStatus] = useState<{
    mode: 'supabase' | 'local';
    configured: boolean;
  } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/mobile/status')
      .then((r) => r.json())
      .then((d) => {
        if (active) {
          setStatus({ mode: d.backend, configured: d.supabase });
        }
      })
      .catch(() => active && setStatus({ mode: 'local', configured: false }));
    return () => {
      active = false;
    };
  }, []);

  const isSupabase = status?.mode === 'supabase';
  const Icon = isSupabase ? Cloud : Database;
  const label = isSupabase
    ? 'Backend Supabase connecté — application mobile synchronisée'
    : status?.configured
    ? 'Supabase détecté'
    : 'Mode local — configurez Supabase pour l\'application mobile';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border">
            <span
              className={`relative flex h-2 w-2 ${
                isSupabase ? '' : 'animate-pulse'
              }`}
            >
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isSupabase
                    ? 'bg-green-500 animate-ping'
                    : 'bg-amber-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isSupabase ? 'bg-green-600' : 'bg-amber-600'
                }`}
              />
            </span>
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">
              {isSupabase ? 'Mobile connecté' : 'Mode démo'}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-xs">
          {label}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Header() {
  const { activeSection, user, logout } = useAppStore();

  return (
    <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-md border-b px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{sectionTitles[activeSection]}</h2>
          <p className="text-xs text-muted-foreground">
            Police Nationale Congolaise — Centre de Commandement
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Connection status (mobile/Supabase) */}
          <ConnectionBadge />

          {/* Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              className="pl-9 w-64 h-9 text-sm"
            />
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white">
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              <DropdownMenuItem className="py-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Alerte urgente — Vol à main armée</span>
                  <span className="text-xs text-muted-foreground">Gombe, il y a 15 min</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">Nouvelle plainte déposée</span>
                  <span className="text-xs text-muted-foreground">Barumbu, il y a 30 min</span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="py-2.5">
                <div className="flex flex-col gap-1">
                  <span className="text-sm font-medium">INTERPOL — Notice rouge reçue</span>
                  <span className="text-xs text-muted-foreground">il y a 2 heures</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.firstName[0]}{user.lastName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium leading-tight">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[10px] text-muted-foreground capitalize">{user.role}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <div className="px-3 py-2 border-b">
                  <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                  {user.officer && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {user.officer.rank} • {user.officer.commissariat.name}
                    </p>
                  )}
                </div>
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profil
                </DropdownMenuItem>
                <DropdownMenuItem>Paramètres</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </header>
  );
}
