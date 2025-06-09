import { BaseEntity } from './common';

export interface User extends BaseEntity {
  userName: string;
  role: 'admin' | 'manager' | 'staff'| 'Technician' | 'Staff' | 'Manager';
}

export interface LoginRequest {
  userName: string;
  password: string;
   userType: 'admin' | 'staff'| 'Technician' | 'Staff' | 'Manager';
}

export interface RegisterRequest {
  userName: string;
  password: string;
  role: 'admin' | 'manager' | 'staff'| 'Technician' | 'Staff' | 'Manager';
}

export interface AuthResponse {
  user: User;
  token: string;
}

