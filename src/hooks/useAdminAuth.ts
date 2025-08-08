'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface AdminUser {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  firstName?: string;
  lastName?: string;
}

export interface AdminAuthState {
  isAuthenticated: boolean;
  isSuperAdmin: boolean;
  admin: AdminUser | null;
  isLoading: boolean;
  error: string | null;
}

export function useAdminAuth() {
  const [authState, setAuthState] = useState<AdminAuthState>({
    isAuthenticated: false,
    isSuperAdmin: false,
    admin: null,
    isLoading: true,
    error: null
  });
  
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = useCallback(async () => {
    try {
      console.log('🔍 Checking auth status...');
      const token = localStorage.getItem('adminToken');
      const adminInfo = localStorage.getItem('adminInfo');

      console.log('🔍 Auth check - localStorage:', {
        hasToken: !!token,
        hasAdminInfo: !!adminInfo,
        tokenLength: token?.length || 0
      });

      if (!token || !adminInfo) {
        console.log('❌ No token or admin info found');
        setAuthState({
          isAuthenticated: false,
          isSuperAdmin: false,
          admin: null,
          isLoading: false,
          error: null
        });
        return;
      }

      // Verify token with server
      console.log('🔍 Verifying token with server...');
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('🔍 Verify response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Token verification successful:', data);
        const admin = JSON.parse(adminInfo);
        
        setAuthState({
          isAuthenticated: true,
          isSuperAdmin: admin.role === 'super_admin',
          admin: admin,
          isLoading: false,
          error: null
        });
      } else {
        console.log('❌ Token verification failed:', response.status);
        // Token is invalid, clear storage
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminInfo');
        
        setAuthState({
          isAuthenticated: false,
          isSuperAdmin: false,
          admin: null,
          isLoading: false,
          error: 'Session expired'
        });
      }
    } catch (error) {
      console.error('❌ Auth check error:', error);
      setAuthState({
        isAuthenticated: false,
        isSuperAdmin: false,
        admin: null,
        isLoading: false,
        error: 'Authentication check failed'
      });
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('adminToken', data.token);
        localStorage.setItem('adminInfo', JSON.stringify(data.admin));
        
        setAuthState({
          isAuthenticated: true,
          isSuperAdmin: data.admin.role === 'super_admin',
          admin: data.admin,
          isLoading: false,
          error: null
        });

        return { success: true };
      } else {
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: data.error || 'Login failed'
        }));
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error('Login error:', error);
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Network error'
      }));
      return { success: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      if (token) {
        // Call logout API
        await fetch('/api/admin/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local storage
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      
      setAuthState({
        isAuthenticated: false,
        isSuperAdmin: false,
        admin: null,
        isLoading: false,
        error: null
      });
      
      router.push('/admin-login');
    }
  }, [router]);

  const hasPermission = useCallback((permission: string) => {
    return authState.admin?.permissions.includes(permission) || false;
  }, [authState.admin]);

  return {
    ...authState,
    login,
    logout,
    hasPermission,
    checkAuthStatus,
    token: typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  };
} 