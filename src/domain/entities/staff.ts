

import { BaseEntity } from './common';

export interface Staff extends BaseEntity {
  branchName?: string;
  address: string;
  staffName: string;
  contactNumber: string;
  role: StaffRole;
  branch?: {
    _id: string;
    branchName: string;
    location: string;
  };
  action: StaffStatus;
  // Additional UI fields
  specialization?: string;
  isActive?: boolean; // Computed from action
}

export type StaffRole = 'Technician' | 'Staff' | 'Manager';
export type StaffStatus = 'Active' | 'Inactive';

export interface CreateStaffRequest {
  staffName: string;
  contactNumber: string;
  password?: string;
  role: StaffRole;
  branch: string;
  action?: StaffStatus;
  address: string;
  specialization?: string;
}

export interface UpdateStaffRequest {
  staffName?: string;
  contactNumber?: string;
  password?: string;
  role?: StaffRole;
  branch?: string;
  action?: StaffStatus;
  address?: string;
  specialization?: string;
  isActive?: boolean;
}