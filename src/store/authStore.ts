// src/store/authStore.ts
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
  initializeAuth: () => void;
  validateToken: () => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      isInitialized: false,
      
      setAuth: (user, token) => {
        console.log('🔐 Setting auth for user:', user.userName);
        
        // Set token in both cookie and localStorage with security flags
        Cookies.set('token', token, { 
          expires: 7, 
          path: '/',
          secure: process.env.NODE_ENV === 'production',
          sameSite: 'strict', // Prevent CSRF
          httpOnly: false // We need access from JS
        });
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
        console.log('🚪 Logging out user');
        
        // Clear all auth data
        Cookies.remove('token', { path: '/' });
        localStorage.removeItem('auth_token');
        sessionStorage.clear();
        
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true
        });

        // Force redirect to login
        if (typeof window !== 'undefined') {
          setTimeout(() => {
            window.location.href = '/login';
          }, 100);
        }
      },
      
      setLoading: (loading) => set({ isLoading: loading }),
      
      validateToken: () => {
        if (typeof window === 'undefined') return false;
        
        const cookieToken = Cookies.get('token');
        const storageToken = localStorage.getItem('auth_token');
        const storeToken = get().token;
        
        // All sources should have the same token
        const tokensMatch = cookieToken === storageToken && storageToken === storeToken;
        const hasToken = !!(cookieToken && storageToken && storeToken);
        
        console.log('🔍 Token validation:', {
          hasToken,
          tokensMatch,
          cookie: !!cookieToken,
          storage: !!storageToken,
          store: !!storeToken
        });
        
        if (!hasToken || !tokensMatch) {
          console.log('🚫 Token validation failed');
          get().logout();
          return false;
        }
        
        return true;
      },
      
      initializeAuth: () => {
        // Only run on client side
        if (typeof window === 'undefined') {
          console.log('🔒 Auth initialization skipped - server side');
          return;
        }
        
        const currentState = get();
        
        // Don't initialize if already initialized
        if (currentState.isInitialized) {
          console.log('🔒 Auth already initialized');
          // Validate existing token
          currentState.validateToken();
          return;
        }
        
        console.log('🔒 Starting auth initialization...');
        
        try {
          // Get token from cookie (primary source, matches middleware)
          const cookieToken = Cookies.get('token');
          const storageToken = localStorage.getItem('auth_token');
          
          console.log('🔍 Tokens found:', {
            cookie: !!cookieToken,
            storage: !!storageToken
          });
          
          // Use cookie token as primary source (matches middleware behavior)
          const token = cookieToken;
          
          if (token) {
            // Sync token to localStorage if missing
            if (!storageToken) {
              localStorage.setItem('auth_token', token);
            }
            // Verify tokens match
            else if (storageToken !== token) {
              console.log('🚫 Token mismatch, using cookie token');
              localStorage.setItem('auth_token', token);
            }
            
            set({ 
              token, 
              isAuthenticated: true,
              isInitialized: true
            });
            console.log('✅ Auth initialized with token');
          } else {
            // Clean up any stale storage token
            if (storageToken) {
              localStorage.removeItem('auth_token');
            }
            
            set({ 
              token: null,
              isAuthenticated: false,
              isInitialized: true,
              user: null
            });
            console.log('✅ Auth initialized without token');
          }
        } catch (error) {
          console.error('❌ Error during auth initialization:', error);
          // Clean up on error
          Cookies.remove('token', { path: '/' });
          localStorage.removeItem('auth_token');
          
          set({ 
            token: null,
            isAuthenticated: false,
            isInitialized: true,
            user: null
          });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        // Don't persist token in Zustand, rely on cookie/localStorage
      }),
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Auth store rehydrated');
        if (state && typeof window !== 'undefined') {
          // Initialize auth after rehydration
          setTimeout(() => {
            state.initializeAuth();
          }, 50);
        }
      },
    }
  )
);