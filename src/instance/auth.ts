import ApiClient from '@/lib/apiClient';
import type { LoginRequest, RegisterRequest, AuthResponse, User } from '@/domain/entities/auth';
import type { ApiResponse } from '@/domain/entities/common';

export const loginUser = async (data: LoginRequest): Promise<AuthResponse> => {
  try {
    const response = await ApiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
    return response.data.data;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Login failed';
    throw new Error(message);
  }
};

export const registerUser = async (data: RegisterRequest): Promise<AuthResponse> => {
  try {
    const response = await ApiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    return response.data.data;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Registration failed';
    throw new Error(message);
  }
};

export const getCurrentUser = async (): Promise<User> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ user: User }>>('/auth/me');
    return response.data.data.user;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch user data';
    throw new Error(message);
  }
};

export const getAllUsers = async (): Promise<User[]> => {
  try {
    const response = await ApiClient.get<ApiResponse<{ users: User[] }>>('/auth');
    return response.data.data.users;
  } catch (error: unknown) {
    const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Failed to fetch users';
    throw new Error(message);
  }
};