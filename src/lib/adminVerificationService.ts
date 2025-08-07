import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { AdminUser, IAdminUser } from '@/models/AdminUserModel';
import { connectToDatabase } from '@/lib/mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

export interface AdminSession {
  id: string;
  email: string;
  role: string;
  permissions: string[];
  isAdmin: boolean;
  isSuperAdmin: boolean;
}

export interface VerificationResult {
  success: boolean;
  session?: AdminSession;
  error?: string;
  admin?: IAdminUser;
}

export class AdminVerificationService {
  /**
   * Create JWT token for admin user
   */
  static createToken(admin: IAdminUser): string {
    const payload = {
      id: admin._id.toString(),
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      isAdmin: true
    };

    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  /**
   * Verify JWT token and return admin session
   */
  static async verifyToken(token: string): Promise<VerificationResult> {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      if (!decoded || !decoded.isAdmin) {
        return {
          success: false,
          error: 'Invalid token'
        };
      }

      // Connect to database
      await connectToDatabase();

      // Find admin user
      const admin = await AdminUser.findById(decoded.id).select('-password');
      
      if (!admin) {
        return {
          success: false,
          error: 'Admin user not found'
        };
      }

      if (!admin.isActive) {
        return {
          success: false,
          error: 'Admin account is inactive'
        };
      }

      if (admin.isAccountLocked()) {
        return {
          success: false,
          error: 'Admin account is locked'
        };
      }

      // Create session
      const session: AdminSession = {
        id: admin._id.toString(),
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isAdmin: true,
        isSuperAdmin: admin.role === 'super_admin'
      };

      return {
        success: true,
        session,
        admin
      };

    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          success: false,
          error: 'Token expired'
        };
      }
      
      return {
        success: false,
        error: 'Token verification failed'
      };
    }
  }

  /**
   * Get admin session from request headers
   */
  static async getAdminSession(request: NextRequest): Promise<VerificationResult> {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return {
          success: false,
          error: 'No authorization header'
        };
      }

      const token = authHeader.substring(7);
      return await this.verifyToken(token);

    } catch (error) {
      return {
        success: false,
        error: 'Failed to get admin session'
      };
    }
  }

  /**
   * Check if admin has specific permission
   */
  static hasPermission(session: AdminSession, permission: string): boolean {
    return session.permissions.includes(permission);
  }

  /**
   * Check if admin has any of the specified permissions
   */
  static hasAnyPermission(session: AdminSession, permissions: string[]): boolean {
    return permissions.some(permission => session.permissions.includes(permission));
  }

  /**
   * Check if admin has all specified permissions
   */
  static hasAllPermissions(session: AdminSession, permissions: string[]): boolean {
    return permissions.every(permission => session.permissions.includes(permission));
  }

  /**
   * Check if admin can manage other admins
   */
  static canManageAdmins(session: AdminSession): boolean {
    return session.isSuperAdmin || this.hasPermission(session, 'manage_admins');
  }

  /**
   * Check if admin can manage users
   */
  static canManageUsers(session: AdminSession): boolean {
    return this.hasPermission(session, 'manage_users');
  }

  /**
   * Check if admin can manage tools
   */
  static canManageTools(session: AdminSession): boolean {
    return this.hasPermission(session, 'manage_tools');
  }

  /**
   * Check if admin can view analytics
   */
  static canViewAnalytics(session: AdminSession): boolean {
    return this.hasPermission(session, 'view_analytics');
  }

  /**
   * Check if admin can manage system settings
   */
  static canManageSystem(session: AdminSession): boolean {
    return this.hasPermission(session, 'manage_system');
  }

  /**
   * Check if admin can view audit logs
   */
  static canViewAuditLogs(session: AdminSession): boolean {
    return this.hasPermission(session, 'view_audit_logs');
  }

  /**
   * Check if admin can view dashboard
   */
  static canViewDashboard(session: AdminSession): boolean {
    return this.hasPermission(session, 'view_dashboard');
  }

  /**
   * Check if admin can manage settings
   */
  static canManageSettings(session: AdminSession): boolean {
    return this.hasPermission(session, 'manage_settings');
  }

  /**
   * Validate admin permissions for specific action
   */
  static validatePermissions(session: AdminSession, requiredPermissions: string[], requireAll: boolean = false): boolean {
    if (session.isSuperAdmin) return true;
    
    if (requireAll) {
      return this.hasAllPermissions(session, requiredPermissions);
    } else {
      return this.hasAnyPermission(session, requiredPermissions);
    }
  }

  /**
   * Get admin permissions by role
   */
  static getPermissionsByRole(role: string): string[] {
    const rolePermissions = {
      super_admin: [
        'manage_users',
        'manage_tools',
        'view_analytics',
        'manage_system',
        'manage_content',
        'view_audit_logs',
        'manage_admins',
        'view_dashboard',
        'manage_settings'
      ],
      admin: [
        'manage_users',
        'manage_tools',
        'view_analytics',
        'manage_content',
        'view_audit_logs',
        'view_dashboard',
        'manage_settings'
      ],
      moderator: [
        'view_analytics',
        'view_dashboard'
      ]
    };

    return rolePermissions[role as keyof typeof rolePermissions] || [];
  }

  /**
   * Refresh admin token
   */
  static async refreshToken(token: string): Promise<VerificationResult> {
    const verification = await this.verifyToken(token);
    
    if (!verification.success || !verification.admin) {
      return verification;
    }

    const newToken = this.createToken(verification.admin);
    
    return {
      success: true,
      session: verification.session,
      admin: verification.admin
    };
  }

  /**
   * Log admin activity
   */
  static async logActivity(adminId: string, action: string, details?: any): Promise<void> {
    try {
      await connectToDatabase();
      
      // You can implement activity logging here
      // For example, save to AdminActivity collection
      console.log(`Admin Activity: ${adminId} - ${action}`, details);
      
    } catch (error) {
      console.error('Failed to log admin activity:', error);
    }
  }
}

export default AdminVerificationService; 