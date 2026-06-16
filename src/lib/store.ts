import { create } from 'zustand';

export type Section = 
  | 'dashboard' 
  | 'alerts' 
  | 'cases' 
  | 'criminals' 
  | 'complaints' 
  | 'services' 
  | 'stations';

interface AppStore {
  activeSection: Section;
  setActiveSection: (section: Section) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppStore>((set) => ({
  activeSection: 'dashboard',
  setActiveSection: (section) => set({ activeSection: section }),
  sidebarCollapsed: false,
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
}));
