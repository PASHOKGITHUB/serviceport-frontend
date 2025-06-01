'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useCurrentUser } from '@/hooks/useAuth';
import type { User } from '@/domain/entities/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: User['role'][];
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  allowedRoles = ['admin', 'manager', 'staff'],
  redirectTo = '/auth/login'
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, token, user, isInitialized, initializeAuth } = useAuthStore();
  const { data: currentUser, isLoading, error } = useCurrentUser();
  const [isMounted, setIsMounted] = useState(false);

  // Prevent hydration mismatch by ensuring component only renders after mount
  useEffect(() => {
    setIsMounted(true);
    // Initialize auth after component mounts
    initializeAuth();
  }, [initializeAuth]);

  console.log('ProtectedRoute - token:', !!token, 'isAuthenticated:', isAuthenticated, 'isInitialized:', isInitialized, 'isLoading:', isLoading, 'isMounted:', isMounted);

  useEffect(() => {
    // Don't do anything until component is mounted and auth store is initialized
    if (!isMounted || !isInitialized) {
      console.log('ProtectedRoute: Waiting for mount or auth initialization');
      return;
    }

    // If no token, redirect to login
    if (!token) {
      console.log('ProtectedRoute: No token, redirecting to login');
      router.push(redirectTo);
      return;
    }

    // If there's an auth error, redirect to login
    if (error) {
      console.log('ProtectedRoute: Auth error, redirecting to login');
      router.push(redirectTo);
      return;
    }

    // Only check roles if we have completed loading and have user data
    if (!isLoading && (currentUser || user)) {
      const userToCheck = currentUser || user;
      if (userToCheck && !allowedRoles.includes(userToCheck.role)) {
        console.log('ProtectedRoute: Role not allowed, redirecting to dashboard');
        router.push('/dashboard');
        return;
      }
    }
  }, [token, currentUser, user, allowedRoles, redirectTo, router, error, isLoading, isInitialized, isMounted]);

  // Show loading skeleton until component is mounted and auth is initialized
  if (!isMounted || !isInitialized) {
    console.log('ProtectedRoute: Not mounted or auth initializing');
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show loading skeleton while checking auth or fetching user data
  if (isLoading || (!currentUser && !user && token)) {
    console.log('ProtectedRoute: Loading user data');
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated || !token) {
    console.log('ProtectedRoute: Not authenticated');
    return null;
  }

  // Don't render if we're still waiting for user data
  if (!currentUser && !user) {
    console.log('ProtectedRoute: Waiting for user data');
    return (
      <div className="min-h-screen bg-gray-50 p-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
}