'use client';

import { useAppStore, type Section } from '@/lib/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Bell,
  FolderOpen,
  Users,
  FileText,
  Globe,
  Building2,
  Shield,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Image from 'next/image';

const menuItems: { id: Section; label: string; icon: React.ElementType }[] = [
  { id: 'dashboard', label: 'Tableau de Bord', icon: LayoutDashboard },
  { id: 'alerts', label: 'Alertes', icon: Bell },
  { id: 'cases', label: 'Dossiers', icon: FolderOpen },
  { id: 'criminals', label: 'Base Criminelle', icon: Users },
  { id: 'complaints', label: 'Plaintes', icon: FileText },
  { id: 'services', label: 'Intégrations', icon: Globe },
  { id: 'stations', label: 'Commissariats', icon: Building2 },
];

export function Sidebar() {
  const { activeSection, setActiveSection, sidebarCollapsed, toggleSidebar } = useAppStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-sidebar text-sidebar-foreground transition-all duration-300 flex flex-col',
        sidebarCollapsed ? 'w-[68px]' : 'w-[260px]'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-sidebar-border">
        <div className="relative w-10 h-10 flex-shrink-0">
          <Image
            src="/pnc-icon.png"
            alt="PNC"
            width={40}
            height={40}
            className="rounded"
          />
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-sidebar-primary leading-tight">PNC</h1>
            <p className="text-[10px] text-sidebar-foreground/70 leading-tight">Centre de Commandement</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3 px-2 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
              )}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-sidebar-primary')} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={toggleSidebar}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sidebar-foreground/60 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground transition-colors"
        >
          {sidebarCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="text-xs">Réduire</span>
            </>
          )}
        </button>
      </div>

      {/* Footer badge */}
      {!sidebarCollapsed && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-sidebar-accent/30">
            <Shield className="w-4 h-4 text-sidebar-primary" />
            <div className="text-[10px] text-sidebar-foreground/60">
              <div>Police Nationale</div>
              <div className="font-medium text-sidebar-foreground/80">Rép. Dém. du Congo</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
