import { BaseEntity } from './common';

export interface Staff extends BaseEntity {
  staffName: string;
  contactNumber: string;
  role: StaffRole;
  branch: {
    _id: string;
    branchName: string;
    location: string;
  };
  action: StaffStatus;
}

export type StaffRole = 'Technician' | 'Staff' | 'Manager';
export type StaffStatus = 'Active' | 'Inactive';

export interface CreateStaffRequest {
  staffName: string;
  contactNumber: string;
  role: StaffRole;
  branch: string;
  action?: StaffStatus;
}

export interface UpdateStaffRequest {
  staffName?: string;
  contactNumber?: string;
  role?: StaffRole;
  branch?: string;
  action?: StaffStatus;
}