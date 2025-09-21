import { cookies } from 'next/headers';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { redirect } from 'next/navigation';
import { PermissionType, RoleService } from './roleService';

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
 * Convert database permissions to admin permissions interface
 */
function convertPermissions(dbPermissions: PermissionType[]): AdminPermissions {
  return {
    canManageUsers: dbPermissions.includes('manage_users'),
    canManageTools: dbPermissions.includes('manage_tools'),
    canViewAnalytics: dbPermissions.includes('view_analytics'),
    canManageSystem: dbPermissions.includes('manage_system'),
    canManageContent: dbPermissions.includes('manage_content'),
    canViewAuditLogs: dbPermissions.includes('view_audit_logs'),
    canManageAdmins: dbPermissions.includes('manage_admins'),
  };
}

/**
 * Validate admin access - redirects if not admin
 */
export async function validateAdminAccess(): Promise<AdminUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims) redirect('/sign-in');

  try {
    // Check role from JWT claims
    if (claims!.role !== 'admin') {
      redirect('/admin/access-denied');
    }

    return {
      id: claims!.id,
      email: claims!.email,
      role: 'admin',
      permissions: convertPermissions(['manage_users','manage_tools','view_analytics','manage_system','manage_content','view_audit_logs','manage_admins','view_dashboard','manage_settings']),
      isActive: true,
      lastLoginAt: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  } catch (error) {
    console.error('Error validating admin access:', error);
    redirect('/admin/access-denied');
  }
}

/**
 * Check if user is admin (without redirect)
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) return false;
    return claims.role === 'admin';
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * Get admin role for user
 */
export async function getAdminRole(): Promise<AdminRole | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) return null;
    return claims.role === 'admin' ? 'admin' : null;
  } catch (error) {
    console.error('Error getting admin role:', error);
    return null;
  }
}

/**
 * Check if user has specific permission
 */
export async function hasPermission(userId: string, permission: PermissionType): Promise<boolean> {
  return await RoleService.hasPermission(userId, permission);
}

/**
 * Log admin activity
 */
export async function logAdminActivity(
  userId: string,
  action: string,
  details?: Record<string, any>
): Promise<void> {
  try {
    // TODO: Implement admin activity logging to database
    console.log(`Admin Activity: ${userId} - ${action}`, details);
  } catch (error) {
    console.error('Error logging admin activity:', error);
  }
}

/**
 * Admin middleware for API routes
 */
export function withAdminAuth(handler: Function) {
  return async (request: Request) => {
    try {
      const cookieHeader = (request.headers as any).get?.('cookie') as string | undefined;
      const token = cookieHeader?.split(';').find((c) => c.trim().startsWith('user_session='))?.split('=')[1];
      const claims = token ? verifyAccessToken(token) : null;
      if (!claims) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { 'Content-Type': 'application/json' } }
        );
      }

      // Check if user is admin by JWT claims
      const isUserAdmin = claims.role === 'admin';
      if (!isUserAdmin) {
        return new Response(
          JSON.stringify({ error: 'Admin access required' }),
          { status: 403, headers: { 'Content-Type': 'application/json' } }
        );
      }
      
      return handler(request);
    } catch (error) {
      console.error('Admin auth error:', error);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
  };
} 