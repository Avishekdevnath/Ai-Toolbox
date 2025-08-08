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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Simple auth check
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminToken');
      const adminInfo = localStorage.getItem('adminInfo');

      if (!token || !adminInfo) {
        setIsAuthenticated(false);
        setIsLoading(false);
        router.push('/admin-login');
        return;
      }

      try {
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('adminInfo');
          setIsAuthenticated(false);
          router.push('/admin-login');
        }
      } catch (error) {
        setIsAuthenticated(false);
        router.push('/admin-login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

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