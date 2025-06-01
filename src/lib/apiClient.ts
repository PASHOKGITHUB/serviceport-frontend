import axios, { AxiosError, AxiosResponse } from "axios";
import Cookies from "js-cookie";

const baseURL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:5000/api/v1';

// Get token from storage (cookie first, localStorage fallback)
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const cookieToken = Cookies.get('token');
  const localToken = localStorage.getItem('auth_token');
  
  return cookieToken || localToken;
};

const ApiClient = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request interceptor - Add auth token
ApiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle auth errors
ApiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    
    // Clear tokens on 401 (except for auth endpoints)
    if (status === 401) {
      const isAuthRequest = url?.includes('/auth/login') || url?.includes('/auth/register');
      
      if (!isAuthRequest) {
        Cookies.remove('token', { path: '/' });
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default ApiClient;