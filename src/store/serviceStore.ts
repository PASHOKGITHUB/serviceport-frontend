import { create } from 'zustand';
import type { ServiceFilters } from '@/domain/entities/service';

interface ServiceState {
  filters: ServiceFilters;
  updateFilters: (filters: Partial<ServiceFilters>) => void;
}

export const useServiceStore = create<ServiceState>((set) => ({
  filters: {
    status: undefined, // Keep undefined for API
    branch: '', // Keep empty for API
    search: '',
  },
  
  updateFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    })),
}));