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
      redirect('/');
    }
  } catch (error) {
    // If there's an error (like no session), redirect to login
    redirect('/');
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-50">
      <AdminSidebar />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Suspense fallback={<LoadingSpinner text="Loading admin panel..." />}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
} 