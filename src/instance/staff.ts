import ApiClient from '@/lib/apiClient';
import type { 
  Staff, 
  CreateStaffRequest, 
  UpdateStaffRequest 
} from '@/domain/entities/staff';
import type { ApiResponse } from '@/domain/entities/common';

export const getStaff = async (): Promise<Staff[]> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ staff: Staff[] }>>('/staff');
    return response.data.data.staff;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch staff';
    throw new Error(message);
  }
};

export const getStaffMember = async (id: string): Promise<Staff> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ staff: Staff }>>(`/staff/${id}`);
    return response.data.data.staff;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch staff member';
    throw new Error(message);
  }
};

export const createStaff = async (data: CreateStaffRequest): Promise<Staff> => {
  try {
    const response = await ApiClient.post<ApiResponse<{ staff: Staff }>>('/staff', data);
    return response.data.data.staff;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create staff member';
    throw new Error(message);
  }
};

export const updateStaff = async (id: string, data: UpdateStaffRequest): Promise<Staff> => {
  try {
    const response = await ApiClient.patch<ApiResponse<{ staff: Staff }>>(`/staff/${id}`, data);
    return response.data.data.staff;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update staff member';
    throw new Error(message);
  }
};

export const deleteStaff = async (id: string): Promise<void> => {
  try {
    await ApiClient.delete(`/staff/${id}`);
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete staff member';
    throw new Error(message);
  }
};

export const getTechnicians = async (): Promise<Staff[]> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ technicians: Staff[] }>>('/staff/technicians');
    return response.data.data.technicians;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch technicians';
    throw new Error(message);
  }
};