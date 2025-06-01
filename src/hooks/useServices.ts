import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getServices,
  getService,
  createService,
  updateService,
  updateServiceAction,
  assignTechnician,
  deleteService,
  getServiceStats
} from '@/instance/services';
import type { 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ServiceFilters,
  Service
} from '@/domain/entities/service';

// Query Keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters: ServiceFilters) => [...serviceKeys.lists(), filters] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  stats: () => [...serviceKeys.all, 'stats'] as const,
};

// Get all services
export const useServices = (filters?: ServiceFilters) => {
  return useQuery<Service[]>({
    queryKey: serviceKeys.list(filters || {}),
    queryFn: () => getServices(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get single service
export const useService = (id: string) => {
  return useQuery<Service>({
    queryKey: serviceKeys.detail(id),
    queryFn: () => getService(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Create service
export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateServiceRequest) => createService(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      toast.success('Service created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update service
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) => 
      updateService(id, data),
    onSuccess: (updatedService: Service) => {
      // React Query automatically updates the cache
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.setQueryData(
        serviceKeys.detail(updatedService._id), 
        updatedService
      );
      toast.success('Service updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update service action
export const useUpdateServiceAction = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: string }) =>
      updateServiceAction(id, action),
    onSuccess: (updatedService: Service) => {
      // Let React Query handle the cache updates
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.setQueryData(
        serviceKeys.detail(updatedService._id), 
        updatedService
      );
      toast.success('Service status updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Assign technician
export const useAssignTechnician = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) =>
      assignTechnician(id, technicianId),
    onSuccess: (updatedService: Service) => {
      // React Query handles cache updates automatically
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.setQueryData(
        serviceKeys.detail(updatedService._id), 
        updatedService
      );
      toast.success('Technician assigned successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: (_, deletedId: string) => {
      // Remove from React Query cache
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      queryClient.removeQueries({ queryKey: serviceKeys.detail(deletedId) });
      toast.success('Service deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Get service statistics
export const useServiceStats = () => {
  return useQuery({
    queryKey: serviceKeys.stats(),
    queryFn: getServiceStats,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchInterval: 1000 * 60 * 10, // Refetch every 10 minutes
  });
};