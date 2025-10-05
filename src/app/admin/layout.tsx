import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { AdminAuthService } from '@/lib/adminAuthService';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import LoadingSpinner from '@/components/common/LoadingSpinner';

// Force dynamic rendering for admin routes that use cookies
export const dynamic = 'force-dynamic';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
  try {
    // Check if user is authenticated
    const adminSession = await AdminAuthService.getAdminSession();
    
    if (!adminSession) {
      redirect('/admin-login');
    }
  } catch (error) {
    // If there's an error (like no session), redirect to login
    redirect('/admin-login');
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