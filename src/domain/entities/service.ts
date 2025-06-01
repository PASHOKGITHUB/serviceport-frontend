import { BaseEntity } from './common';

export interface ProductDetails {
  productName: string;
  serialNumber: string;
  brand: string;
  type: string;
  productIssue: string;
}

export interface Service extends BaseEntity {
  serviceId: string;
  customerName: string;
  customerContactNumber: string;
  technician?: {
    _id: string;
    staffName: string;
    contactNumber: string;
  };
  action: ServiceAction;
  address: string;
  location: string;
  serviceCost?: number;
  receivedDate: string;
  deliveredDate?: string;
  productDetails: ProductDetails[];
}

export type ServiceAction = 
  | 'Received' 
  | 'Assigned to Technician' 
  | 'Under Inspection' 
  | 'Waiting for Customer Approval' 
  | 'Approved' 
  | 'In Service' 
  | 'Finished' 
  | 'Delivered' 
  | 'Completed' 
  | 'Cancelled';

export interface CreateServiceRequest {
  customerName: string;
  customerContactNumber: string;
  address: string;
  location: string;
  serviceCost?: number;
  productDetails: ProductDetails[];
  branchId: string;
}

export interface UpdateServiceRequest {
  technician?: string;
  action?: ServiceAction;
  serviceCost?: number;
  deliveredDate?: string;
}

export interface ServiceFilters {
  status?: string;
  branch?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}