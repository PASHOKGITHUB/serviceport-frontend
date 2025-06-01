import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { 
  loginUser, 
  registerUser, 
  getCurrentUser, 
  getAllUsers 
} from '@/instance/auth';
import type { LoginRequest, RegisterRequest } from '@/domain/entities/auth';

// Query Keys
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  users: () => [...authKeys.all, 'users'] as const,
};

// Get current user
export const useCurrentUser = () => {
  const { token } = useAuthStore();
  
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: getCurrentUser,
    enabled: !!token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });
};

// Login mutation
export const useLogin = () => {
  const { setAuth, setLoading } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: LoginRequest) => {
      setLoading(true);
      return loginUser(data);
    },
    onSuccess: (data) => {
      setAuth(data.user, data.token);
      queryClient.setQueryData(authKeys.user(), data.user);
      toast.success('Login successful!');
    },
    onError: (error: Error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });
};

// Register mutation
export const useRegister = () => {
  const { setLoading } = useAuthStore();
  
  return useMutation({
    mutationFn: (data: RegisterRequest) => {
      setLoading(true);
      return registerUser(data);
    },
    onSuccess: () => {
      setLoading(false);
      toast.success('Registration successful! Please login.');
    },
    onError: (error: Error) => {
      setLoading(false);
      toast.error(error.message);
    },
  });
};

// Logout mutation
export const useLogout = () => {
  const { logout } = useAuthStore();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // Could call logout endpoint here if needed
      return Promise.resolve();
    },
    onSuccess: () => {
      logout();
      queryClient.clear();
      toast.success('Logged out successfully');
    },
  });
};

// Get all users (admin only)
export const useAllUsers = () => {
  return useQuery({
    queryKey: authKeys.users(),
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};