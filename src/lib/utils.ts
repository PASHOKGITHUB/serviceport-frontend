// Add these functions to your existing src/lib/utils.ts file
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { ServiceAction } from '@/domain/entities/service';

/**
 * Utility function for combining Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get the appropriate color class for service status badges
 */
export const getStatusColor = (status: ServiceAction): string => {
  const statusColors: Record<ServiceAction, string> = {
    'Received': 'bg-blue-100 text-blue-800 border-blue-200',
    'Assigned to Technician': 'bg-purple-100 text-purple-800 border-purple-200',
    'Under Inspection': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Waiting for Customer Approval': 'bg-orange-100 text-orange-800 border-orange-200',
    'Approved': 'bg-green-100 text-green-800 border-green-200',
    'In Service': 'bg-indigo-100 text-indigo-800 border-indigo-200',
    'Finished': 'bg-teal-100 text-teal-800 border-teal-200',
    'Delivered': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Completed': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Cancelled': 'bg-red-100 text-red-800 border-red-200',
  };
  
  return statusColors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
};

/**
 * Format date to a readable string
 */
export const formatDate = (date: string | Date): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * Format date to a short readable string (date only)
 */
export const formatDateShort = (date: string | Date): string => {
  if (!date) return 'N/A';
  
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }
  
  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format currency amount
 */
export const formatCurrency = (amount: number | undefined): string => {
  if (amount === undefined || amount === null) return 'Not set';
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Get status description for better UX
 */
export const getStatusDescription = (status: ServiceAction): string => {
  const descriptions: Record<ServiceAction, string> = {
    'Received': 'Product received at branch or service center',
    'Assigned to Technician': 'Technician assigned to inspect and handle service',
    'Under Inspection': 'Technician is inspecting the issue with the product',
    'Waiting for Customer Approval': 'Estimate shared; waiting for customer to approve cost',
    'Approved': 'Customer approved; service work can begin',
    'In Service': 'Technician is performing the service work',
    'Finished': 'Work completed; ready for delivery to customer',
    'Delivered': 'Product delivered to customer',
    'Completed': 'Final status – service closed',
    'Cancelled': 'Service cancelled or abandoned',
  };
  
  return descriptions[status] || status;
};

/**
 * Get the status icon for each service status
 */
export const getStatusIcon = (status: ServiceAction): string => {
  const icons: Record<ServiceAction, string> = {
    'Received': '✅',
    'Assigned to Technician': '👨‍🔧',
    'Under Inspection': '🔍',
    'Waiting for Customer Approval': '⏳',
    'Approved': '👍',
    'In Service': '🔧',
    'Finished': '🛠',
    'Delivered': '📦',
    'Completed': '✅',
    'Cancelled': '❌',
  };
  
  return icons[status] || '📋';
};

/**
 * Check if a status transition is valid based on hierarchy
 */
export const isValidStatusTransition = (currentStatus: ServiceAction, newStatus: ServiceAction): boolean => {
  const statusHierarchy: ServiceAction[] = [
    'Received',
    'Assigned to Technician',
    'Under Inspection',
    'Waiting for Customer Approval',
    'Approved',
    'In Service',
    'Finished',
    'Delivered',
    'Completed',
    'Cancelled'
  ];
  
  const currentIndex = statusHierarchy.indexOf(currentStatus);
  const newIndex = statusHierarchy.indexOf(newStatus);
  
  // Can't move to invalid status
  if (currentIndex === -1 || newIndex === -1) return false;
  
  // Can always stay in current status
  if (currentStatus === newStatus) return true;
  
  // Can always move to cancelled (except from completed)
  if (newStatus === 'Cancelled' && currentStatus !== 'Completed') return true;
  
  // Can't move backwards (except to cancelled)
  if (newIndex < currentIndex) return false;
  
  // Can only move one step forward
  return newIndex <= currentIndex + 1;
};

/**
 * Get the next possible statuses from current status
 */
export const getNextPossibleStatuses = (currentStatus: ServiceAction): ServiceAction[] => {
  const statusHierarchy: ServiceAction[] = [
    'Received',
    'Assigned to Technician',
    'Under Inspection',
    'Waiting for Customer Approval',
    'Approved',
    'In Service',
    'Finished',
    'Delivered',
    'Completed',
    'Cancelled'
  ];
  
  const currentIndex = statusHierarchy.indexOf(currentStatus);
  if (currentIndex === -1) return statusHierarchy;
  
  const possibleStatuses: ServiceAction[] = [currentStatus];
  
  // Add next status if not at the end
  if (currentIndex < statusHierarchy.length - 2) { // -2 because we don't want to auto-add Cancelled
    possibleStatuses.push(statusHierarchy[currentIndex + 1]);
  }
  
  // Add cancelled if not already completed
  if (currentStatus !== 'Completed' && currentStatus !== 'Cancelled') {
    possibleStatuses.push('Cancelled');
  }
  
  return possibleStatuses;
};

/**
 * Calculate service duration in days
 */
export const calculateServiceDuration = (createdAt: string | Date, completedAt?: string | Date): number => {
  const startDate = new Date(createdAt);
  const endDate = completedAt ? new Date(completedAt) : new Date();
  
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Generate service ID (this would typically be done on the backend)
 */
export const generateServiceId = (count: number): string => {
  return `SRV${String(count + 1).padStart(6, '0')}`;
};

/**
 * Validate phone number format
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[6-9]\d{9}$/; // Indian mobile number format
  return phoneRegex.test(phone.replace(/\s+/g, ''));
};

/**
 * Format phone number for display
 */
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};