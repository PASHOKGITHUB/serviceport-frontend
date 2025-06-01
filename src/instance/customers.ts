import ApiClient from '@/lib/apiClient';
import type { Customer } from '@/domain/entities/customer';
import type { ApiResponse } from '@/domain/entities/common';

export const getCustomers = async (): Promise<Customer[]> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ customers: Customer[] }>>('/customers');
    return response.data.data.customers;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch customers';
    throw new Error(message);
  }
};

export const getCustomer = async (id: string): Promise<Customer> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ customer: Customer }>>(`/customers/${id}`);
    return response.data.data.customer;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch customer';
    throw new Error(message);
  }
};

export const searchCustomers = async (query: string): Promise<Customer[]> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ customers: Customer[] }>>(`/customers/search?q=${query}`);
    return response.data.data.customers;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to search customers';
    throw new Error(message);
  }
};