'use client';

import { useState, useEffect } from 'react';

interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
}

export const useAdminAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [admin, setAdmin] = useState<AdminUser | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setIsAuthenticated(false);
        setAdmin(null);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsAuthenticated(true);
        setAdmin(data.admin);
      } else {
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        setAdmin(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setAdmin(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (data.success && data.token) {
        localStorage.setItem('adminToken', data.token);
        setIsAuthenticated(true);
        setAdmin(data.admin);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/admin/auth/logout', {
        method: 'POST'
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('adminToken');
      setIsAuthenticated(false);
      setAdmin(null);
    }
  };

  const hasPermission = (permission: string) => {
    return admin?.permissions?.includes(permission) || false;
  };

  return {
    isAuthenticated,
    isLoading,
    admin,
    login,
    logout,
    hasPermission,
    checkAuthStatus,
    token: typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null
  };
};

/**
 * Check if current user is admin
 */
export function useIsAdmin(): boolean {
  const { isAuthenticated } = useAdminAuth();
  return isAuthenticated || false;
}

/**
 * Get admin role for current user
 */
export function useAdminRole(): string | null {
  const { admin } = useAdminAuth();
  return admin?.role || null;
}

/**
 * Check if user has specific admin permission
 */
export function hasAdminPermission(
  userPermissions: string[],
  permission: string
): boolean {
  return userPermissions.includes(permission) || false;
}

/**
 * Log admin activity (client-side)
 */
export async function logAdminActivity(
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    // TODO: Implement admin activity logging via API
    console.log(`Admin Activity: ${userId} - ${action}`, details);
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
} 