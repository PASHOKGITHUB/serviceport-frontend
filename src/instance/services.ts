import ApiClient from '@/lib/apiClient';
import type { 
  Service, 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ServiceFilters 
} from '@/domain/entities/service';
import type { ApiResponse } from '@/domain/entities/common';

export const getServices = async (filters?: ServiceFilters): Promise<Service[]> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ services: Service[] }>>('/services', {
      params: filters
    });
    return response.data.data.services;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch services';
    throw new Error(message);
  }
};

export const getService = async (id: string): Promise<Service> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ service: Service }>>(`/services/${id}`);
    return response.data.data.service;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch service';
    throw new Error(message);
  }
};

export const createService = async (data: CreateServiceRequest): Promise<Service> => {
  try {
    const response = await ApiClient.post<ApiResponse<{ service: Service }>>('/services', data);
    return response.data.data.service;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to create service';
    throw new Error(message);
  }
};

export const updateService = async (id: string, data: UpdateServiceRequest): Promise<Service> => {
  try {
    const response = await ApiClient.patch<ApiResponse<{ service: Service }>>(`/services/${id}`, data);
    return response.data.data.service;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update service';
    throw new Error(message);
  }
};

export const updateServiceAction = async (id: string, action: string): Promise<Service> => {
  try {
    const response = await ApiClient.patch<ApiResponse<{ service: Service }>>(`/services/${id}/action`, { action });
    return response.data.data.service;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to update service action';
    throw new Error(message);
  }
};

export const assignTechnician = async (id: string, technicianId: string): Promise<Service> => {
  try {
    const response = await ApiClient.patch<ApiResponse<{ service: Service }>>(`/services/${id}/assign-technician`, { technicianId });
    return response.data.data.service;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to assign technician';
    throw new Error(message);
  }
};

export const deleteService = async (id: string): Promise<void> => {
  try {
    await ApiClient.delete(`/services/${id}`);
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to delete service';
    throw new Error(message);
  }
};

export const getServiceStats = async (): Promise<unknown> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ stats: unknown }>>('/services/stats');
    return response.data.data.stats;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch service stats';
    throw new Error(message);
  }
};