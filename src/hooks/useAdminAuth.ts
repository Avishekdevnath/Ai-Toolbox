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

  // Single auth check on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const adminInfo = localStorage.getItem('adminInfo');

        if (!token || !adminInfo) {
          setAuthState({
            isAuthenticated: false,
            isSuperAdmin: false,
            admin: null,
            isLoading: false,
            error: null
          });
          return;
        }

        // Verify token
        const response = await fetch('/api/admin/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const admin = JSON.parse(adminInfo);
          setAuthState({
            isAuthenticated: true,
            isSuperAdmin: admin.role === 'super_admin',
            admin: admin,
            isLoading: false,
            error: null
          });
        } else {
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
        setAuthState({
          isAuthenticated: false,
          isSuperAdmin: false,
          admin: null,
          isLoading: false,
          error: 'Authentication check failed'
        });
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
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
        return { success: false, error: data.error };
      }
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (token) {
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
    token: typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  };
} 