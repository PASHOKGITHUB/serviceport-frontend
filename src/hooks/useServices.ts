import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getServices,
  getService,
  createService,
  updateService,
  updateServiceAction,
  assignTechnician,
  updateServiceCost,
  deleteService,
  getServiceStats
} from '@/instance/services';
import type { 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ServiceFilters
} from '@/domain/entities/service';

// API Response type
interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  results?: number;
}

// Query Keys
export const serviceKeys = {
  all: ['services'] as const,
  lists: () => [...serviceKeys.all, 'list'] as const,
  list: (filters?: ServiceFilters) => [...serviceKeys.lists(), filters || 'all'] as const,
  details: () => [...serviceKeys.all, 'detail'] as const,
  detail: (id: string) => [...serviceKeys.details(), id] as const,
  stats: () => [...serviceKeys.all, 'stats'] as const,
};

// Customer Query Keys - Add this to match your customers hook
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  search: (query: string) => [...customerKeys.all, 'search', query] as const,
};

// Get all services
export const useServices = (filters?: ServiceFilters) => {
  return useQuery({
    queryKey: serviceKeys.list(filters),
    queryFn: () => getServices(filters),
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Get single service
export const useService = (id: string) => {
  return useQuery({
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
      // Also invalidate customers when a new service is created
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      toast.success('Service created successfully!');
    },
    onError: (error: ApiResponse<unknown>) => {
      const message = error?.message || 'Failed to create service';
      toast.error(message);
    },
  });
};

// Update service
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateServiceRequest }) => 
      updateService(id, data),
    onSuccess: (response: ApiResponse<{ service: { _id: string } }>) => {
      // Invalidate services cache
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      
      // Invalidate customers cache to reflect updated service details
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      // Also invalidate any search results
      queryClient.invalidateQueries({ 
        queryKey: customerKeys.all,
        predicate: (query) => {
          return query.queryKey[0] === 'customers' && query.queryKey[1] === 'search';
        }
      });
      
      if (response?.data?.service?._id) {
        queryClient.setQueryData(
          serviceKeys.detail(response.data.service._id), 
          response.data.service
        );
      }
      toast.success('Service updated successfully!');
    },
    onError: (error: ApiResponse<unknown>) => {
      const message = error?.message || 'Failed to update service';
      toast.error(message);
    },
  });
};

// Update service action/status
export const useUpdateServiceAction = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, action, cancellationReason }: { id: string; action: string; cancellationReason?: string }) =>
      updateServiceAction(id, { action, cancellationReason }),
    onSuccess: (response: ApiResponse<{ service: { _id: string } }>) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() })
      
      // Invalidate customers cache when service action/status changes
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      if (response?.data?.service?._id) {
        queryClient.setQueryData(serviceKeys.detail(response.data.service._id), response.data.service)
      }
      toast.success("Service status updated successfully!")
    },
    onError: (error: ApiResponse<unknown>) => {
      const message = error?.message || "Failed to update service status"
      toast.error(message)
    },
  })
}

// Assign technician
export const useAssignTechnician = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, technicianId }: { id: string; technicianId: string }) =>
      assignTechnician(id, { technicianId }),
    onSuccess: (response: ApiResponse<{ service: { _id: string } }>) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      
      // Invalidate customers cache when technician is assigned
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      if (response?.data?.service?._id) {
        queryClient.setQueryData(
          serviceKeys.detail(response.data.service._id), 
          response.data.service
        );
      }
      toast.success('Technician assigned successfully!');
    },
    onError: (error: ApiResponse<unknown>) => {
      const message = error?.message || 'Failed to assign technician';
      toast.error(message);
    },
  });
};

// Update service cost
export const useUpdateServiceCost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, serviceCost }: { id: string; serviceCost: number }) =>
      updateServiceCost(id, { serviceCost }),
    onSuccess: (response: ApiResponse<{ service: { _id: string } }>) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      
      // Invalidate customers cache when service cost is updated
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      if (response?.data?.service?._id) {
        queryClient.setQueryData(
          serviceKeys.detail(response.data.service._id), 
          response.data.service
        );
      }
      toast.success('Service cost updated successfully!');
    },
    onError: (error: ApiResponse<unknown>) => {
      const message = error?.message || 'Failed to update service cost';
      toast.error(message);
    },
  });
};

// Delete service
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteService(id),
    onSuccess: (_, deletedId: string) => {
      queryClient.invalidateQueries({ queryKey: serviceKeys.lists() });
      
      // Invalidate customers cache when service is deleted
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      queryClient.removeQueries({ queryKey: serviceKeys.detail(deletedId) });
      toast.success('Service deleted successfully!');
    },
    onError: (error: ApiResponse<unknown>) => {
      const message = error?.message || 'Failed to delete service';
      toast.error(message);
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