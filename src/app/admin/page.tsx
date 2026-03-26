'use client';

import { Suspense } from 'react';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminPage() {
  return (
    <>
      <AdminPageHeader />

      <Suspense fallback={<LoadingSpinner text="Loading admin dashboard..." />}>
        <AdminDashboard />
      </Suspense>
    </>
  );
} 