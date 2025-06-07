// src/instance/services.ts
import ApiClient from '@/lib/apiClient';
import type { 
  CreateServiceRequest, 
  UpdateServiceRequest, 
  ServiceFilters
} from '@/domain/entities/service';

// Define report filters interface
interface ReportFilters {
  startDate?: string;
  endDate?: string;
  status?: string;
  technician?: string;
  branchId?: string; // Added branchId filter
}

// Get all services
export const getServices = async (filters?: ServiceFilters) => {
  const params = new URLSearchParams();
  
  if (filters?.status) params.append('status', filters.status);
  if (filters?.technician) params.append('technician', filters.technician);
  if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters?.dateTo) params.append('dateTo', filters.dateTo);
  if (filters?.search) params.append('search', filters.search);
  if (filters?.branchId) params.append('branchId', filters.branchId);
  
  const queryString = params.toString();
  const url = queryString ? `/services?${queryString}` : '/services';
  
  const response = await ApiClient.get(url);
  return response.data;
};

// Get single service
export const getService = async (id: string) => {
  const response = await ApiClient.get(`/services/${id}`);
  return response.data.data.service;
};

// Create service
export const createService = async (data: CreateServiceRequest) => {
  const response = await ApiClient.post('/services', data);
  return response.data;
};

// Update service
export const updateService = async (id: string, data: UpdateServiceRequest) => {
  const response = await ApiClient.patch(`/services/${id}`, data);
  return response.data;
};

// Update service action/status
export const updateServiceAction = async (id: string, data: { action: string; cancellationReason?: string }) => {
  const response = await ApiClient.patch(`/services/${id}/action`, data)
  return response.data
}

// Assign technician to service
export const assignTechnician = async (id: string, data: { technicianId: string }) => {
  const response = await ApiClient.patch(`/services/${id}/assign-technician`, data);
  return response.data;
};

// Update service cost
export const updateServiceCost = async (id: string, data: { serviceCost: number }) => {
  const response = await ApiClient.patch(`/services/${id}/cost`, data);
  return response.data;
};

// Delete service
export const deleteService = async (id: string) => {
  const response = await ApiClient.delete(`/services/${id}`);
  return response.data;
};

// Get service statistics
export const getServiceStats = async () => {
  const response = await ApiClient.get('/services/stats');
  return response.data.data.stats;
};

// Get services by status
export const getServicesByStatus = async (status: string) => {
  const response = await ApiClient.get(`/services/status/${status}`);
  return response.data.data.services;
};

// Get services by technician
export const getServicesByTechnician = async (technicianId: string) => {
  const response = await ApiClient.get(`/services/technician/${technicianId}`);
  return response.data.data.services;
};

// Get services by branch - NEW FUNCTION
export const getServicesByBranch = async (branchId: string) => {
  const response = await ApiClient.get(`/services/branch/${branchId}`);
  return response.data.data.services;
};

// Get services report
export const getServicesReport = async (filters?: ReportFilters) => {
  const params = new URLSearchParams();
  
  if (filters?.startDate) params.append('startDate', filters.startDate);
  if (filters?.endDate) params.append('endDate', filters.endDate);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.technician) params.append('technician', filters.technician);
  if (filters?.branchId) params.append('branchId', filters.branchId);
  
  const queryString = params.toString();
  const url = queryString ? `/services/report?${queryString}` : '/services/report';
  
  const response = await ApiClient.get(url);
  return response.data.data.report;
};

// Bulk update services
export const bulkUpdateServices = async (data: { 
  serviceIds: string[]; 
  updateData: { action?: string; serviceCost?: number } 
}) => {
  const response = await ApiClient.patch('/services/bulk-update', data);
  return response.data;
};