import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import Cookies from 'js-cookie';
import type { User } from '@/domain/entities/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      setAuth: (user, token) => {
        // Set both cookie and localStorage for redundancy
        Cookies.set('token', token, { expires: 7, path: '/' });
        localStorage.setItem('auth_token', token);
        
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true
        });
      },
      logout: () => {
        Cookies.remove('token', { path: '/' });
        localStorage.removeItem('auth_token');
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        });
      },
      setLoading: (loading) => set({ isLoading: loading }),
      setInitialized: (initialized) => set({ isInitialized: initialized }),
      initializeAuth: () => {
        // Only run on client side
        if (typeof window === 'undefined') return;
        
        const token = Cookies.get('token') || localStorage.getItem('auth_token');
        console.log('Auth initialization - token found:', !!token);
        
        if (token) {
          set({ 
            token, 
            isAuthenticated: true,
            isInitialized: true
          });
        } else {
          set({ 
            isInitialized: true 
          });
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);