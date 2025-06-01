import { BaseEntity } from './common';

export interface User extends BaseEntity {
  userName: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  password: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface AuthResponse {
  user: User;
  token: string;
}