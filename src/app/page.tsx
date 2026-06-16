'use client';

import { useAppStore } from '@/lib/store';
import { Sidebar } from '@/components/pnc/sidebar';
import { Header } from '@/components/pnc/header';
import { Dashboard } from '@/components/pnc/dashboard';
import { AlertsSection } from '@/components/pnc/alerts-section';
import { CasesSection } from '@/components/pnc/cases-section';
import { CriminalsSection } from '@/components/pnc/criminals-section';
import { ComplaintsSection } from '@/components/pnc/complaints-section';
import { ServicesSection } from '@/components/pnc/services-section';
import { StationsSection } from '@/components/pnc/stations-section';
import { cn } from '@/lib/utils';

const sections = {
  dashboard: Dashboard,
  alerts: AlertsSection,
  cases: CasesSection,
  criminals: CriminalsSection,
  complaints: ComplaintsSection,
  services: ServicesSection,
  stations: StationsSection,
};

export default function PNCCommandCenter() {
  const { activeSection, sidebarCollapsed } = useAppStore();
  const ActiveSection = sections[activeSection];

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div
        className={cn(
          'flex-1 flex flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-[68px]' : 'ml-[260px]'
        )}
      >
        <Header />
        <main className="flex-1 p-6">
          <ActiveSection />
        </main>
        <footer className="border-t px-6 py-3 mt-auto">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>© 2024 Police Nationale Congolaise — Centre de Commandement</span>
            <span>République Démocratique du Congo</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
