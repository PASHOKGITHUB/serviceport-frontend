// src/components/Common/ProtectedRoute.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import type { User } from '@/domain/entities/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
}

export default function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'manager', 'staff'],
}: ProtectedRouteProps) {
  const router = useRouter();
  const { token, user, initializeAuth, logout } = useAuthStore();
  const { data: currentUser, isLoading, error } = useCurrentUser();
  const [isMounted, setIsMounted] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [hasRedirected, setHasRedirected] = useState(false);

  console.log('🛡️ ProtectedRoute render:', {
    token: !!token,
    user: !!user,
    currentUser: !!currentUser,
    isLoading,
    error: !!error,
    isMounted,
    hasRedirected
  });

  // Initialize on mount
  useEffect(() => {
    setIsMounted(true);
    initializeAuth();
  }, [initializeAuth]);

  // Authentication check
  useEffect(() => {
    if (!isMounted || hasRedirected) return;

    const performAuthCheck = async () => {
      console.log('🔍 Performing auth check...', { token: !!token, error: !!error });

      // If no token after initialization, redirect to login
      if (!token) {
        console.log('❌ No token found, redirecting to login');
        setHasRedirected(true);
        logout();
        router.replace('/login');
        return;
      }

      // If auth error (invalid token), redirect to login
      if (error) {
        console.log('❌ Auth error, redirecting to login');
        setHasRedirected(true);
        logout();
        router.replace('/login');
        return;
      }

      // If we have a token and no errors, validation is complete
      setIsValidating(false);
      console.log('✅ Auth validation complete');
    };

    // Small delay to allow auth store to initialize
    const timeoutId = setTimeout(performAuthCheck, 100);
    return () => clearTimeout(timeoutId);
  }, [token, error, isMounted, logout, router, hasRedirected]);

  // Role-based access control
  useEffect(() => {
    if (!isMounted || isValidating || isLoading || hasRedirected) return;

    const userToCheck = currentUser || user;
    
    if (userToCheck && !allowedRoles.includes(userToCheck.role)) {
      console.log('🚫 Insufficient permissions, redirecting to safe page');
      setHasRedirected(true);
      router.replace('/dashboard'); // Redirect to a safe page
      return;
    }
  }, [currentUser, user, allowedRoles, router, isMounted, isValidating, isLoading, hasRedirected]);

  // Security timeout
  useEffect(() => {
    if (!isMounted || hasRedirected) return;

    const securityTimeout = setTimeout(() => {
      if (isValidating || (isLoading && !currentUser && !user)) {
        console.log('🚫 Security timeout, redirecting to login');
        setHasRedirected(true);
        logout();
        router.replace('/login');
      }
    }, 10000); // 10 second timeout

    return () => clearTimeout(securityTimeout);
  }, [isMounted, isValidating, isLoading, currentUser, user, logout, router, hasRedirected]);

  // Prevent rendering during redirect
  if (hasRedirected) {
    return <LoadingSpinner message="Redirecting..." />;
  }

  // Loading states
  if (!isMounted) {
    return <LoadingSpinner message="Starting application..." />;
  }

  if (isValidating) {
    return <LoadingSpinner message="Validating authentication..." />;
  }

  if (!token) {
    return <LoadingSpinner message="No authentication found, redirecting..." />;
  }

  if (error) {
    return <LoadingSpinner message="Authentication error, redirecting..." />;
  }

  if (isLoading && !currentUser && !user) {
    return <LoadingSpinner message="Loading user data..." />;
  }

  // Role check
  const userToCheck = currentUser || user;
  if (userToCheck && !allowedRoles.includes(userToCheck.role)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Access Denied</div>
          <p className="text-gray-600 mb-4">You don&apos;t have permission to access this page.</p>
          <button 
            onClick={() => {
              setHasRedirected(true);
              router.push('/dashboard');
            }}
            className="bg-amber-700 text-white px-4 py-2 rounded hover:bg-amber-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // All security checks passed
  console.log('✅ ProtectedRoute: All checks passed, rendering children');
  return <>{children}</>;
}

// Secure loading component
function LoadingSpinner({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
}