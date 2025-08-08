'use client';

import { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import { useEffect, useState } from 'react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [hasRedirected, setHasRedirected] = useState(false);
  const router = useRouter();

  useEffect(() => {
    console.log('🔍 Admin Layout Debug:', {
      isAuthenticated,
      isLoading,
      hasToken: typeof window !== 'undefined' ? !!localStorage.getItem('adminToken') : false,
      hasAdminInfo: typeof window !== 'undefined' ? !!localStorage.getItem('adminInfo') : false
    });

    if (!isLoading && !isAuthenticated && !hasRedirected) {
      console.log('❌ Redirecting to login - not authenticated');
      setHasRedirected(true);
      router.push('/admin-login');
    }
  }, [isAuthenticated, isLoading, router, hasRedirected]);

  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner text="Checking authentication..." />
      </div>
    );
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Fixed Admin Header */}
      <div className="flex-shrink-0">
        <AdminHeader />
      </div>
      
      {/* Main Content Area with Sidebar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Fixed Admin Sidebar */}
        <div className="flex-shrink-0">
          <AdminSidebar />
        </div>
        
        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Suspense fallback={<LoadingSpinner text="Loading admin panel..." />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
} 