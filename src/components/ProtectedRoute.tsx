'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export default function ProtectedRoute({
  children,
  requireAuth = true,
  requireAdmin = false,
  redirectTo = '/sign-in'
}: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      // If authentication is required but user is not authenticated
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // If admin privileges are required but user is not admin
      if (requireAdmin && !isAdmin) {
        router.push('/admin-login');
        return;
      }
    }
  }, [isLoading, isAuthenticated, isAdmin, requireAuth, requireAdmin, redirectTo, router]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  // If authentication is required but user is not authenticated, don't render children
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // If admin privileges are required but user is not admin, don't render children
  if (requireAdmin && !isAdmin) {
    return null;
  }

  // Render children if all conditions are met
  return <>{children}</>;
} 