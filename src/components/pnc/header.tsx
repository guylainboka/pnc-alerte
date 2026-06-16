'use client';

import { useAppStore, type Section } from '@/lib/store';
import { Bell, Search, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const sectionTitles: Record<Section, string> = {
  dashboard: 'Tableau de Bord',
  alerts: 'Centre d\'Alertes',
  cases: 'Gestion des Dossiers',
  criminals: 'Base de Données Criminelle',
  complaints: 'Gestion des Plaintes',
  services: 'Intégrations Externes',
  stations: 'Commissariats & Juridictions',
};

export function Header() {
  const { activeSection } = useAppStore();

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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    CP
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium leading-tight">Comm. Mukendi</p>
                  <p className="text-[10px] text-muted-foreground">Commissaire Principal</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <User className="mr-2 h-4 w-4" />
                Profil
              </DropdownMenuItem>
              <DropdownMenuItem>Paramètres</DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">Déconnexion</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
