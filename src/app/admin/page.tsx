'use client';

import { Suspense } from 'react';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">System overview and management</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      <Suspense fallback={<LoadingSpinner text="Loading admin dashboard..." />}>
        <AdminDashboard />
      </Suspense>
    </div>
  );
} 