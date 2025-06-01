import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getStaff,
  getStaffMember,
  createStaff,
  updateStaff,
  deleteStaff,
  getTechnicians
} from '@/instance/staff';
import type { 
  CreateStaffRequest, 
  UpdateStaffRequest 
} from '@/domain/entities/staff';

// Query Keys
export const staffKeys = {
  all: ['staff'] as const,
  lists: () => [...staffKeys.all, 'list'] as const,
  details: () => [...staffKeys.all, 'detail'] as const,
  detail: (id: string) => [...staffKeys.details(), id] as const,
  technicians: () => [...staffKeys.all, 'technicians'] as const,
};

// Get all staff
export const useStaff = () => {
  return useQuery({
    queryKey: staffKeys.lists(),
    queryFn: getStaff,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get single staff member
export const useStaffMember = (id: string) => {
  return useQuery({
    queryKey: staffKeys.detail(id),
    queryFn: () => getStaffMember(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create staff
export const useCreateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateStaffRequest) => createStaff(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.technicians() });
      toast.success('Staff member created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update staff
export const useUpdateStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateStaffRequest }) => 
      updateStaff(id, data),
    onSuccess: (updatedStaff) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.technicians() });
      queryClient.setQueryData(
        staffKeys.detail(updatedStaff._id), 
        updatedStaff
      );
      toast.success('Staff member updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete staff
export const useDeleteStaff = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteStaff(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
      queryClient.invalidateQueries({ queryKey: staffKeys.technicians() });
      toast.success('Staff member deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Get technicians only
export const useTechnicians = () => {
  return useQuery({
    queryKey: staffKeys.technicians(),
    queryFn: getTechnicians,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};