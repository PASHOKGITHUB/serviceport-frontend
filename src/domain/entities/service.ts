export interface ProductDetails {
  _id?: string;
  productName: string;
  serialNumber: string;
  brand: string;
  type: string;
  productIssue: string;
}

export interface Staff {
  _id: string;
  staffName: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  department?: string;
}

export interface Branch {
  _id: string;
  branchName: string;
  location: string;
  address?: string;
  contactNumber?: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
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

export interface Service {
  _id: string;
  serviceId: string;
  customerName: string;
  customerContactNumber: string;
  technician?: Staff;
  action: ServiceAction;
  address: string;
  location: string;
  serviceCost?: number;
  receivedDate: string | Date;
  deliveredDate?: string | Date;
  productDetails: ProductDetails[];
  branchId: string | Branch; // Can be either string or populated Branch object
  createdAt: string | Date;
  updatedAt: string | Date;
  createdBy?: User;
  updatedBy?: User;
  __v?: number;
}

export interface CreateServiceRequest {
  customerName: string;
  customerContactNumber: string;
  address: string;
  location: string;
  productDetails: Omit<ProductDetails, '_id'>[];
  branchId: string; // Required branch ID
  serviceCost?: number;
}

export interface UpdateServiceRequest {
  customerName?: string;
  customerContactNumber?: string;
  address?: string;
  location?: string;
  productDetails: ProductDetails[];
  serviceCost?: number;
  technician?: string;
  action?: ServiceAction;
  deliveredDate?: string | Date;
  branchId?: string; // Optional for updates
}

export interface ServiceFilters {
  status?: ServiceAction;
  technician?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  branchId?: string;
}

export interface ServiceStats {
  totalServices: number;
  pendingServices: number;
  completedServices: number;
  cancelledServices: number;
  inProgressServices: number;
  statusBreakdown: {
    [key in ServiceAction]: number;
  };
  branchStats: {
    branchName: string;
    count: number;
  }[];
  technicianStats: {
    technician: Staff;
    assignedServices: number;
    completedServices: number;
  }[];
  monthlyStats: {
    month: string;
    totalServices: number;
    completedServices: number;
    revenue: number;
  }[];
}

export interface ServiceReport {
  totalServices: number;
  totalRevenue: number;
  averageServiceCost: number;
  services: Service[];
  statusBreakdown: {
    [key in ServiceAction]: number;
  };
  technicianPerformance: {
    technician: Staff;
    servicesCompleted: number;
    averageCompletionTime: number;
    totalRevenue: number;
  }[];
}

// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  results?: number;
}

export interface ServicesResponse extends ApiResponse<{ services: Service[] }> {
  data: { services: Service[] };
}

export interface ServiceResponse extends ApiResponse<{ service: Service }> {
  data: { service: Service };
}

export interface ServiceStatsResponse extends ApiResponse<{ stats: ServiceStats }> {
  data: { stats: ServiceStats };
}

export interface ServiceReportResponse extends ApiResponse<{ report: ServiceReport }> {
  data: { report: ServiceReport };
}

// Helper function to get branch name from Service object
export const getBranchName = (service: Service): string => {
  if (typeof service.branchId === 'object' && service.branchId.branchName) {
    return service.branchId.branchName;
  }
  return 'Unknown Branch';
};

// Helper function to get branch location from Service object
export const getBranchLocation = (service: Service): string => {
  if (typeof service.branchId === 'object' && service.branchId.location) {
    return service.branchId.location;
  }
  return 'Unknown Location';
};