import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getBranches,
  getBranch,
  createBranch,
  updateBranch,
  deleteBranch
} from '@/instance/branches';
import type { 
  CreateBranchRequest, 
  UpdateBranchRequest 
} from '@/domain/entities/branch';

// Query Keys
export const branchKeys = {
  all: ['branches'] as const,
  lists: () => [...branchKeys.all, 'list'] as const,
  details: () => [...branchKeys.all, 'detail'] as const,
  detail: (id: string) => [...branchKeys.details(), id] as const,
};

// Get all branches
export const useBranches = () => {
  return useQuery({
    queryKey: branchKeys.lists(),
    queryFn: getBranches,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get single branch
export const useBranch = (id: string) => {
  return useQuery({
    queryKey: branchKeys.detail(id),
    queryFn: () => getBranch(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Create branch
export const useCreateBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateBranchRequest) => createBranch(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success('Branch created successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Update branch
export const useUpdateBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBranchRequest }) => 
      updateBranch(id, data),
    onSuccess: (updatedBranch) => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      queryClient.setQueryData(
        branchKeys.detail(updatedBranch._id), 
        updatedBranch
      );
      toast.success('Branch updated successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};

// Delete branch
export const useDeleteBranch = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => deleteBranch(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: branchKeys.lists() });
      toast.success('Branch deleted successfully!');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
};