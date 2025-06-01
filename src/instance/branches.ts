import ApiClient from '@/lib/apiClient';
import type { 
  Branch, 
  CreateBranchRequest, 
  UpdateBranchRequest 
} from '@/domain/entities/branch';
import type { ApiResponse } from '@/domain/entities/common';

export const getBranches = async (): Promise<Branch[]> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ branches: Branch[] }>>('/branches');
    return response.data.data.branches;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch branches';
    throw new Error(message);
  }
};

export const getBranch = async (id: string): Promise<Branch> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ branch: Branch }>>(`/branches/${id}`);
    return response.data.data.branch;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch branch';
    throw new Error(message);
  }
};

export const createBranch = async (data: CreateBranchRequest): Promise<Branch> => {
  try {
    const response = await ApiClient.post<ApiResponse<{ branch: Branch }>>('/branches', data);
    return response.data.data.branch;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create branch';
    throw new Error(message);
  }
};

export const updateBranch = async (id: string, data: UpdateBranchRequest): Promise<Branch> => {
  try {
    const response = await ApiClient.patch<ApiResponse<{ branch: Branch }>>(`/branches/${id}`, data);
    return response.data.data.branch;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update branch';
    throw new Error(message);
  }
};

export const deleteBranch = async (id: string): Promise<void> => {
  try {
    await ApiClient.delete(`/branches/${id}`);
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete branch';
    throw new Error(message);
  }
};