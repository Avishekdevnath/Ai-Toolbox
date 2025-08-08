'use client';

import { Suspense } from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
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