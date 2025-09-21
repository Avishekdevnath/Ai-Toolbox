import { useAuth } from '@/components/AuthProvider';
import { useState, useEffect } from 'react';

// Admin role types
export type AdminRole = 'super_admin' | 'admin' | 'moderator';

// Admin permissions
export interface AdminPermissions {
  canManageUsers: boolean;
  canManageTools: boolean;
  canViewAnalytics: boolean;
  canManageSystem: boolean;
  canManageContent: boolean;
  canViewAuditLogs: boolean;
  canManageAdmins: boolean;
}

// Admin user interface
export interface AdminUser {
  id: string;
  email: string;
  role: AdminRole;
  permissions: AdminPermissions;
  isActive: boolean;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Hook to get admin user data from database
 */
export function useAdminUser(): AdminUser | null {
  const { user, loading } = useAuth();
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAdminUser() {
      if (loading || !user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/admin/user-role');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.userRole) {
            setAdminUser(data.userRole);
          }
        }
      } catch (error) {
        console.error('Error fetching admin user:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchAdminUser();
  }, [user, loading]);

  if (isLoading) {
    return null; // Return null while loading
  }

  return adminUser;
}

/**
 * Check if current user is admin
 */
export function useIsAdmin(): boolean {
  const adminUser = useAdminUser();
  return adminUser?.isActive || false;
}

/**
 * Get admin role for current user
 */
export function useAdminRole(): AdminRole | null {
  const adminUser = useAdminUser();
  return adminUser?.role || null;
}

/**
 * Check if user has specific admin permission
 */
export function hasAdminPermission(
  userPermissions: AdminPermissions,
  permission: keyof AdminPermissions
): boolean {
  return userPermissions[permission] || false;
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