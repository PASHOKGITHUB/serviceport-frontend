import { useQuery } from '@tanstack/react-query';
import {
  getCustomers,
  getCustomer,
  searchCustomers
} from '@/instance/customers';

// Query Keys
export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: string) => [...customerKeys.details(), id] as const,
  search: (query: string) => [...customerKeys.all, 'search', query] as const,
};

// Get all customers
export const useCustomers = () => {
  return useQuery({
    queryKey: customerKeys.lists(),
    queryFn: getCustomers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get single customer
export const useCustomer = (id: string) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => getCustomer(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Search customers
export const useSearchCustomers = (query: string) => {
  return useQuery({
    queryKey: customerKeys.search(query),
    queryFn: () => searchCustomers(query),
    enabled: !!query && query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};