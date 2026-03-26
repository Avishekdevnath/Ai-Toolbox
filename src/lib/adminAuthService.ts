import { AuthUserModel, AuthUserDoc } from '@/models/AuthUserModel';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { signAccessToken, verifyAccessToken } from '@/lib/auth/jwt';

export type AdminRole = 'admin';
export type PermissionType =
  | 'manage_users' | 'manage_tools' | 'view_analytics' | 'manage_system'
  | 'manage_content' | 'view_audit_logs' | 'manage_admins' | 'view_dashboard' | 'manage_settings';

export interface AdminSession {
  id: string;
  email: string;
  role: AdminRole;
  permissions: PermissionType[];
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}

const ALL_ADMIN_PERMISSIONS: PermissionType[] = [
  'manage_users', 'manage_tools', 'view_analytics', 'manage_system',
  'manage_content', 'view_audit_logs', 'manage_admins', 'view_dashboard', 'manage_settings',
];

const SESSION_COOKIE_NAME = 'user_session';

export class AdminAuthService {
  /**
   * Authenticate admin user with email and password
   */
  static async authenticateAdmin(credentials: AdminLoginCredentials): Promise<{
    success: boolean;
    admin?: AdminSession;
    error?: string;
  }> {
    try {
      const { email, password } = credentials;

      const adminUser = await AuthUserModel.findByEmail(email);

      if (!adminUser) {
        return { success: false, error: 'Invalid email or password' };
      }

      if (adminUser.role !== 'admin') {
        return { success: false, error: 'Access denied: Admin privileges required' };
      }

      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);

      if (!isPasswordValid) {
        return { success: false, error: 'Invalid email or password' };
      }

      await AuthUserModel.updateLastLogin(adminUser._id.toString());

      const adminSession: AdminSession = {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: 'admin',
        permissions: ALL_ADMIN_PERMISSIONS,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isActive: true,
        lastLoginAt: new Date(),
      };

      return { success: true, admin: adminSession };
    } catch (error) {
      console.error('❌ Admin authentication error:', error);
      return { success: false, error: 'Authentication failed' };
    }
  }

  /**
   * Create JWT token for admin session (uses shared user_session format)
   */
  static createAdminToken(adminSession: AdminSession): string {
    return signAccessToken({
      id: adminSession.id,
      email: adminSession.email,
      username: adminSession.email.split('@')[0],
      name: `${adminSession.firstName ?? ''} ${adminSession.lastName ?? ''}`.trim(),
      role: 'admin',
    });
  }

  /**
   * Get current admin session from cookies
   */
  static async getAdminSession(request?: NextRequest): Promise<AdminSession | null> {
    try {
      let token: string | undefined;

      if (request) {
        token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
      } else {
        const cookieStore = await cookies();
        token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
      }

      if (!token) return null;

      const claims = verifyAccessToken(token);
      if (!claims || claims.role !== 'admin') return null;

      const adminUser = await AuthUserModel.findById(claims.id);
      if (!adminUser || adminUser.role !== 'admin') return null;

      return {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: 'admin',
        permissions: ALL_ADMIN_PERMISSIONS,
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isActive: true,
        lastLoginAt: new Date(),
      };
    } catch (error) {
      console.error('Error getting admin session:', error);
      return null;
    }
  }

  /**
   * Check if admin has specific permission (all admins have all permissions)
   */
  static async hasPermission(_adminId: string, _permission: PermissionType): Promise<boolean> {
    return true;
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(adminId: string): Promise<boolean> {
    try {
      const user = await AuthUserModel.findById(adminId);
      return user?.role === 'admin';
    } catch {
      return false;
    }
  }

  /**
   * Get all admin users
   */
  static async getAllAdminUsers(): Promise<AuthUserDoc[]> {
    try {
      const model = await import('@/models/AuthUserModel').then(m => m.getAuthUserModel());
      return await model.find({ role: 'admin' }).select('-passwordHash').sort({ createdAt: -1 });
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [];
    }
  }

  /**
   * Create new admin user
   */
  static async createAdminUser(adminData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthUserDoc | null> {
    try {
      return await AuthUserModel.create({
        email: adminData.email,
        username: adminData.username,
        password: adminData.password,
        firstName: adminData.firstName ?? '',
        lastName: adminData.lastName ?? '',
        role: 'admin',
      });
    } catch (error) {
      console.error('Error creating admin user:', error);
      return null;
    }
  }

  /**
   * Update admin user
   */
  static async updateAdminUser(
    adminId: string,
    updateData: Partial<{ email: string; firstName: string; lastName: string }>
  ): Promise<AuthUserDoc | null> {
    try {
      return await AuthUserModel.update(adminId, updateData);
    } catch (error) {
      console.error('Error updating admin user:', error);
      return null;
    }
  }

  /**
   * Delete admin user
   */
  static async deleteAdminUser(adminId: string): Promise<boolean> {
    try {
      const result = await AuthUserModel.delete(adminId);
      return !!result;
    } catch (error) {
      console.error('Error deleting admin user:', error);
      return false;
    }
  }

  /**
   * Get admin user by ID
   */
  static async getAdminUserById(adminId: string): Promise<AuthUserDoc | null> {
    try {
      return await AuthUserModel.findById(adminId);
    } catch (error) {
      console.error('Error getting admin user:', error);
      return null;
    }
  }

  /**
   * Get admin user by email
   */
  static async getAdminUserByEmail(email: string): Promise<AuthUserDoc | null> {
    try {
      return await AuthUserModel.findByEmail(email);
    } catch (error) {
      console.error('Error getting admin user by email:', error);
      return null;
    }
  }
}
