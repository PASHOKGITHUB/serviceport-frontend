'use client';

import { useEffect } from 'react';
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
  const { isAuthenticated, token, user } = useAuthStore();
  const { data: currentUser, isLoading, error } = useCurrentUser();

  console.log('ProtectedRoute - token:', !!token, 'isAuthenticated:', isAuthenticated); // Debug log

  useEffect(() => {
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

    // If we have user data and role check fails, redirect
    const userToCheck = currentUser || user;
    if (userToCheck && !allowedRoles.includes(userToCheck.role)) {
      console.log('ProtectedRoute: Role not allowed, redirecting to dashboard');
      router.push('/dashboard');
      return;
    }
  }, [token, currentUser, user, allowedRoles, redirectTo, router, error]);

  // Show loading skeleton while checking auth
  if (isLoading || (!currentUser && !user && token)) {
    console.log('ProtectedRoute: Loading state');
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

  console.log('ProtectedRoute: Rendering children');
  return <>{children}</>;
}