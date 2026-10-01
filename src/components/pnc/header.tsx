'use client';

import { useState, useEffect } from 'react';
import { useAppStore, type Section } from '@/lib/store';
import { Bell, User, LogOut, Database, Server } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

/**
 * Badge de connexion — ping le backend NestJS (port 3001 via le gateway
 * Caddy) au montage, puis toutes les 30 s. Affiche "Connecté" si le
 * backend répond sur /api/health, sinon "Hors ligne".
 *
 * (Remplace l'ancien badge basé sur la config Supabase.)
 */
function ConnectionBadge() {
  const [online, setOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const check = async () => {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const res = await fetch('/api/health?XTransformPort=3001', {
          signal: controller.signal,
        });
        clearTimeout(timeout);
        if (!active) return;
        setOnline(res.ok);
      } catch {
        if (active) setOnline(false);
      }
    };

    check();
    const id = setInterval(check, 30000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const Icon = online ? Server : Database;
  const label = online ? 'Connecté' : 'Hors ligne';
  const tooltip = online
    ? 'Backend NestJS connecté — temps réel actif'
    : 'Backend NestJS injoignable — vérifiez que le service tourne sur le port 3001';

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-muted/60 border">
            <span
              className={`relative flex h-2 w-2 ${
                online ? '' : 'animate-pulse'
              }`}
            >
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  online ? 'bg-green-500 animate-ping' : 'bg-amber-500'
                }`}
              />
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  online ? 'bg-green-600' : 'bg-amber-600'
                }`}
              />
            </span>
            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">
              {label}
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="text-xs max-w-xs">
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Header() {
  const { activeSection, user, logout } = useAppStore();

  // Aucune notification en dur. Quand l'endpoint /api/notifications existera
  // côté NestJS, on pourra hydrater ce tableau via un fetch + interval.
  const notifications: { id: string; title: string; subtitle: string }[] = [];

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
          {/* Connection status (backend NestJS) */}
          <ConnectionBadge />

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] bg-red-500 text-white rounded-full">
                    {notifications.length}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="px-3 py-2 border-b">
                <p className="text-sm font-semibold">Notifications</p>
              </div>
              {notifications.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  Aucune notification
                </div>
              ) : (
                notifications.map((n) => (
                  <DropdownMenuItem key={n.id} className="py-2.5">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium">{n.title}</span>
                      <span className="text-xs text-muted-foreground">{n.subtitle}</span>
                    </div>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* User */}
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user.firstName?.[0] ?? '?'}{user.lastName?.[0] ?? ''}
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
