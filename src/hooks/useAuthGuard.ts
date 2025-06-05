// src/hooks/useAuthGuard.ts
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

/**
 * Additional security hook that can be used in individual pages
 * for extra protection against URL manipulation
 */
export function useAuthGuard() {
  const router = useRouter();
  const { token, logout } = useAuthStore();

  useEffect(() => {
    // Client-side security check
    const checkAuth = () => {
      if (typeof window === 'undefined') return;

      // Check multiple sources for token
      const cookieToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('token='))
        ?.split('=')[1];
      
      const storageToken = localStorage.getItem('auth_token');
      const storeToken = token;

      console.log('🔍 Auth Guard Check:', {
        cookie: !!cookieToken,
        storage: !!storageToken,
        store: !!storeToken
      });

      // If no token in any location, force logout
      if (!cookieToken && !storageToken && !storeToken) {
        console.log('🚫 Auth Guard: No token found anywhere, forcing logout');
        logout();
        router.replace('/login');
        return;
      }

      // If tokens don't match, there might be an issue
      if (storeToken && cookieToken && storeToken !== cookieToken) {
        console.log('🚫 Auth Guard: Token mismatch detected, forcing logout');
        logout();
        router.replace('/login');
        return;
      }
    };

    checkAuth();

    // Periodic security check (every 30 seconds)
    const interval = setInterval(checkAuth, 30000);

    // Listen for storage changes (token manipulation detection)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'auth_token' && !e.newValue) {
        console.log('🚫 Auth Guard: Token removed from storage, forcing logout');
        logout();
        router.replace('/login');
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [token, logout, router]);

  return { isAuthenticated: !!token };
}

// Usage in your dashboard page:
// import { useAuthGuard } from '@/hooks/useAuthGuard';
// 
// export default function DashboardPage() {
//   useAuthGuard(); // Add this line for extra security
//   
//   return (
//     <div>Your dashboard content</div>
//   );
// }