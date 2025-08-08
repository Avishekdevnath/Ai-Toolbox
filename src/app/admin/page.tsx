'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from '@/components/admin/AdminDashboard';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function AdminPage() {
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
    console.log('🎯 Admin Page Loaded!');
    console.log('🔐 Auth State:', { user, isAuthenticated, isAdmin, isLoading });
    
    // If we have a user but isAuthenticated is false, try to refresh the session
    if (user && !isAuthenticated) {
      console.log('🔄 User exists but not authenticated, refreshing session...');
      // This will be handled by the useAuth hook
    }
  }, [user, isAuthenticated, isAdmin, isLoading]);

  // Fetch last updated time from dashboard stats
  useEffect(() => {
    if (isAuthenticated && isAdmin) {
      fetch('/api/admin/dashboard/stats')
        .then(res => res.json())
        .then(data => {
          if (data.success && data.data?.systemOverview?.lastUpdated) {
            setLastUpdated(new Date(data.data.systemOverview.lastUpdated).toLocaleString());
          }
        })
        .catch(() => {
          setLastUpdated(new Date().toLocaleString());
        });
    }
  }, [isAuthenticated, isAdmin]);
  
  // Show loading while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }
  
  // Redirect if not authenticated or not admin
  if (!isAuthenticated || !isAdmin) {
    console.log('❌ Access denied - redirecting to admin login');
    console.log('🔍 Current state:', { user, isAuthenticated, isAdmin, isLoading });
    
    // Add a small delay to prevent immediate redirect
    setTimeout(() => {
      window.location.href = '/admin-login';
    }, 100);
    
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="mt-4">Redirecting to admin login...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {user?.name || user?.email}! Here's what's happening with your system.
          </p>
        </div>
        {lastUpdated && (
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated}
          </div>
        )}
      </div>
      
      <AdminDashboard />
    </div>
  );
} 