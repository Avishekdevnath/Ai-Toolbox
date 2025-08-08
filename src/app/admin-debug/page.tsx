'use client';

import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useEffect } from 'react';

export default function AdminDebugPage() {
  const { 
    isAuthenticated, 
    isSuperAdmin, 
    admin, 
    isLoading, 
    error 
  } = useAdminAuth();

  useEffect(() => {
    console.log('🔍 Debug Page - Auth State:', {
      isAuthenticated,
      isSuperAdmin,
      admin: admin?.email,
      isLoading,
      error
    });

    // Check localStorage
    const token = localStorage.getItem('adminToken');
    const adminInfo = localStorage.getItem('adminInfo');
    console.log('🔍 Debug Page - localStorage:', {
      hasToken: !!token,
      hasAdminInfo: !!adminInfo,
      adminInfo: adminInfo ? JSON.parse(adminInfo) : null
    });
  }, [isAuthenticated, isSuperAdmin, admin, isLoading, error]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Authentication Debug</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {isLoading ? 'Yes' : 'No'}</p>
            <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
            <p><strong>Super Admin:</strong> {isSuperAdmin ? 'Yes' : 'No'}</p>
            <p><strong>Admin Email:</strong> {admin?.email || 'None'}</p>
            <p><strong>Error:</strong> {error || 'None'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">localStorage</h2>
          <div className="space-y-2">
            <p><strong>Token:</strong> {typeof window !== 'undefined' && localStorage.getItem('adminToken') ? 'Present' : 'Missing'}</p>
            <p><strong>Admin Info:</strong> {typeof window !== 'undefined' && localStorage.getItem('adminInfo') ? 'Present' : 'Missing'}</p>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {typeof window !== 'undefined' ? JSON.stringify({
                token: localStorage.getItem('adminToken')?.substring(0, 50) + '...',
                adminInfo: localStorage.getItem('adminInfo') ? JSON.parse(localStorage.getItem('adminInfo')!) : null
              }, null, 2) : 'Unavailable on server render'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
} 