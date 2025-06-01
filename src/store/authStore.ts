import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { User } from '@/domain/entities/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      setAuth: (user, token) => {
        // Set both cookie and localStorage for redundancy
        Cookies.set('token', token, { expires: 7, path: '/' });
        localStorage.setItem('auth_token', token);
        
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false 
        });
      },
      logout: () => {
        Cookies.remove('token', { path: '/' });
        localStorage.removeItem('auth_token');
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false 
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
    }
  )
);

// Initialize auth state from cookies/localStorage on app start
if (typeof window !== 'undefined') {
  const token = Cookies.get('token') || localStorage.getItem('auth_token');
  if (token) {
    useAuthStore.setState({ 
      token, 
      isAuthenticated: true 
    });
  }
}

// Initialize auth state from cookies/localStorage on app start
if (typeof window !== 'undefined') {
  // Add a small delay to ensure cookies are loaded
  setTimeout(() => {
    const token = Cookies.get('token') || localStorage.getItem('auth_token');
    console.log('Auth initialization - token found:', !!token); // Debug log
    
    if (token) {
      useAuthStore.setState({ 
        token, 
        isAuthenticated: true 
      });
    }
  }, 100);
}