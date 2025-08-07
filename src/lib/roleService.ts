import { getDatabase } from './mongodb';
import { UserRole, IUserRole } from '@/models/UserRoleModel';

export type UserRoleType = 'super_admin' | 'admin' | 'moderator' | 'user';
export type PermissionType = 
  | 'manage_users'
  | 'manage_tools' 
  | 'view_analytics'
  | 'manage_system'
  | 'manage_content'
  | 'view_audit_logs'
  | 'manage_admins'
  | 'view_dashboard'
  | 'manage_settings';

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<UserRoleType, PermissionType[]> = {
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
  ],
  user: [
    'view_dashboard'
  ]
};

export class RoleService {
  /**
   * Get user role from database
   */
  static async getUserRole(userId: string): Promise<IUserRole | null> {
    try {
      await getDatabase();
      const userRole = await UserRole.findOne({ userId, isActive: true });
      return userRole;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  }

  /**
   * Create or update user role
   */
  static async createOrUpdateUserRole(
    userId: string, 
    email: string, 
    role: UserRoleType = 'user'
  ): Promise<IUserRole> {
    try {
      await getDatabase();
      
      const userRole = await UserRole.findOneAndUpdate(
        { userId },
        {
          email,
          role,
          permissions: ROLE_PERMISSIONS[role],
          lastLoginAt: new Date(),
          isActive: true
        },
        { upsert: true, new: true }
      );
      
      return userRole;
    } catch (error) {
      console.error('Error creating/updating user role:', error);
      throw error;
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permission: PermissionType): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole || !userRole.isActive) {
        return false;
      }
      
      return userRole.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(userId: string): Promise<boolean> {
    try {
      const userRole = await this.getUserRole(userId);
      if (!userRole || !userRole.isActive) {
        return false;
      }
      
      return userRole.role === 'admin' || userRole.role === 'super_admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get all admin users
   */
  static async getAdminUsers(): Promise<IUserRole[]> {
    try {
      await getDatabase();
      const adminUsers = await UserRole.find({
        role: { $in: ['admin', 'super_admin'] },
        isActive: true
      }).sort({ createdAt: -1 });
      
      return adminUsers;
    } catch (error) {
      console.error('Error getting admin users:', error);
      return [];
    }
  }

  /**
   * Get all users with roles
   */
  static async getAllUsers(): Promise<IUserRole[]> {
    try {
      await getDatabase();
      const users = await UserRole.find({ isActive: true }).sort({ createdAt: -1 });
      return users;
    } catch (error) {
      console.error('Error getting all users:', error);
      return [];
    }
  }

  /**
   * Update user role
   */
  static async updateUserRole(
    userId: string, 
    role: UserRoleType, 
    permissions?: PermissionType[]
  ): Promise<IUserRole | null> {
    try {
      await getDatabase();
      
      const updateData: any = {
        role,
        permissions: permissions || ROLE_PERMISSIONS[role],
        updatedAt: new Date()
      };
      
      const userRole = await UserRole.findOneAndUpdate(
        { userId },
        updateData,
        { new: true }
      );
      
      return userRole;
    } catch (error) {
      console.error('Error updating user role:', error);
      return null;
    }
  }

  /**
   * Deactivate user
   */
  static async deactivateUser(userId: string): Promise<boolean> {
    try {
      await getDatabase();
      
      const result = await UserRole.findOneAndUpdate(
        { userId },
        { isActive: false, updatedAt: new Date() }
      );
      
      return !!result;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  }

  /**
   * Get role statistics
   */
  static async getRoleStats(): Promise<{
    total: number;
    admins: number;
    moderators: number;
    users: number;
  }> {
    try {
      await getDatabase();
      
      const [total, admins, moderators, users] = await Promise.all([
        UserRole.countDocuments({ isActive: true }),
        UserRole.countDocuments({ role: { $in: ['admin', 'super_admin'] }, isActive: true }),
        UserRole.countDocuments({ role: 'moderator', isActive: true }),
        UserRole.countDocuments({ role: 'user', isActive: true })
      ]);
      
      return { total, admins, moderators, users };
    } catch (error) {
      console.error('Error getting role stats:', error);
      return { total: 0, admins: 0, moderators: 0, users: 0 };
    }
  }

  /**
   * Get permissions for a role
   */
  static getRolePermissions(role: UserRoleType): PermissionType[] {
    return ROLE_PERMISSIONS[role] || [];
  }

  /**
   * Get all available permissions
   */
  static getAllPermissions(): PermissionType[] {
    return [
      'manage_users',
      'manage_tools',
      'view_analytics',
      'manage_system',
      'manage_content',
      'view_audit_logs',
      'manage_admins',
      'view_dashboard',
      'manage_settings'
    ];
  }
} 