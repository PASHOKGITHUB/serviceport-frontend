
import { BaseEntity } from './common';
import { Staff } from './staff';

export interface Branch extends BaseEntity {
  branchName: string;
  phoneNumber: string;
  location: string;
  staffName: Staff[];
  status: BranchStatus;
  address: string;
  // Additional fields for UI
  contactNumber?: string; // Alias for phoneNumber
  manager?: string; // Optional manager name
  isActive?: boolean; // Computed from status
}

export type BranchStatus = 'Active' | 'Inactive';

export interface CreateBranchRequest {
  branchName: string;
  phoneNumber: string;
  location: string;
  address: string;
  status?: BranchStatus;
}

export interface UpdateBranchRequest {
  branchName?: string;
  phoneNumber?: string;
  location?: string;
  address?: string;
  status?: BranchStatus;
  contactNumber?: string;
  manager?: string;
  isActive?: boolean;
}

export interface UpdateBranchStatusRequest {
  status: BranchStatus;
}