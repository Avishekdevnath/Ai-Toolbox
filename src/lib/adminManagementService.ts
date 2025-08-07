import { connectToDatabase } from '@/lib/mongodb';
import { AdminUser, IAdminUser } from '@/models/AdminUserModel';
import { AdminVerificationService, AdminSession } from './adminVerificationService';
import bcrypt from 'bcryptjs';

export interface AdminCreateData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions?: string[];
}

export interface AdminUpdateData {
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: 'super_admin' | 'admin' | 'moderator';
  permissions?: string[];
  isActive?: boolean;
}

export interface AdminSearchParams {
  search?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface AdminSearchResult {
  admins: IAdminUser[];
  pagination: {
    page: number;
    limit: number;
    totalAdmins: number;
    totalPages: number;
  };
}

export class AdminManagementService {
  /**
   * Create a new admin user
   */
  static async createAdmin(data: AdminCreateData, currentAdmin: AdminSession): Promise<{ success: boolean; admin?: IAdminUser; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canManageAdmins(currentAdmin)) {
        return {
          success: false,
          error: 'Insufficient permissions to create admin users'
        };
      }

      // Check if email already exists
      const existingAdmin = await AdminUser.findOne({ email: data.email.toLowerCase() });
      if (existingAdmin) {
        return {
          success: false,
          error: 'Admin with this email already exists'
        };
      }

      // Set permissions based on role if not provided
      if (!data.permissions) {
        data.permissions = AdminVerificationService.getPermissionsByRole(data.role);
      }

      // Create admin user
      const admin = new AdminUser({
        email: data.email.toLowerCase(),
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        role: data.role,
        permissions: data.permissions
      });

      await admin.save();

      // Log activity
      await AdminVerificationService.logActivity(currentAdmin.id, 'create_admin', {
        createdAdminId: admin._id,
        email: admin.email,
        role: admin.role
      });

      return {
        success: true,
        admin
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to create admin user'
      };
    }
  }

  /**
   * Update admin user
   */
  static async updateAdmin(adminId: string, data: AdminUpdateData, currentAdmin: AdminSession): Promise<{ success: boolean; admin?: IAdminUser; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canManageAdmins(currentAdmin)) {
        return {
          success: false,
          error: 'Insufficient permissions to update admin users'
        };
      }

      // Find admin to update
      const admin = await AdminUser.findById(adminId);
      if (!admin) {
        return {
          success: false,
          error: 'Admin user not found'
        };
      }

      // Prevent non-super-admin from modifying super-admin
      if (admin.role === 'super_admin' && !currentAdmin.isSuperAdmin) {
        return {
          success: false,
          error: 'Only super admins can modify super admin users'
        };
      }

      // Prevent self-modification for critical fields
      if (admin._id.toString() === currentAdmin.id) {
        delete data.isActive; // Prevent self-deactivation
        delete data.role; // Prevent self-role-change
      }

      // Check email uniqueness if changing email
      if (data.email && data.email !== admin.email) {
        const existingAdmin = await AdminUser.findOne({ email: data.email.toLowerCase() });
        if (existingAdmin) {
          return {
            success: false,
            error: 'Admin with this email already exists'
          };
        }
      }

      // Update admin
      Object.assign(admin, data);
      await admin.save();

      // Log activity
      await AdminVerificationService.logActivity(currentAdmin.id, 'update_admin', {
        updatedAdminId: admin._id,
        changes: data
      });

      return {
        success: true,
        admin
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to update admin user'
      };
    }
  }

  /**
   * Delete admin user
   */
  static async deleteAdmin(adminId: string, currentAdmin: AdminSession): Promise<{ success: boolean; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canManageAdmins(currentAdmin)) {
        return {
          success: false,
          error: 'Insufficient permissions to delete admin users'
        };
      }

      // Find admin to delete
      const admin = await AdminUser.findById(adminId);
      if (!admin) {
        return {
          success: false,
          error: 'Admin user not found'
        };
      }

      // Prevent self-deletion
      if (admin._id.toString() === currentAdmin.id) {
        return {
          success: false,
          error: 'Cannot delete your own account'
        };
      }

      // Prevent deletion of super-admin by non-super-admin
      if (admin.role === 'super_admin' && !currentAdmin.isSuperAdmin) {
        return {
          success: false,
          error: 'Only super admins can delete super admin users'
        };
      }

      // Delete admin
      await AdminUser.findByIdAndDelete(adminId);

      // Log activity
      await AdminVerificationService.logActivity(currentAdmin.id, 'delete_admin', {
        deletedAdminId: admin._id,
        email: admin.email,
        role: admin.role
      });

      return {
        success: true
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to delete admin user'
      };
    }
  }

  /**
   * Search and paginate admin users
   */
  static async searchAdmins(params: AdminSearchParams, currentAdmin: AdminSession): Promise<{ success: boolean; result?: AdminSearchResult; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canManageAdmins(currentAdmin)) {
        return {
          success: false,
          error: 'Insufficient permissions to view admin users'
        };
      }

      const {
        search = '',
        role = 'all',
        status = 'all',
        page = 1,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = params;

      // Build query
      const query: any = {};

      if (search) {
        query.$or = [
          { email: { $regex: search, $options: 'i' } },
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } }
        ];
      }

      if (role !== 'all') {
        query.role = role;
      }

      if (status !== 'all') {
        query.isActive = status === 'active';
      }

      // Get total count
      const totalAdmins = await AdminUser.countDocuments(query);
      const totalPages = Math.ceil(totalAdmins / limit);

      // Get admins with pagination
      const admins = await AdminUser.find(query)
        .select('-password')
        .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const result: AdminSearchResult = {
        admins,
        pagination: {
          page,
          limit,
          totalAdmins,
          totalPages
        }
      };

      return {
        success: true,
        result
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to search admin users'
      };
    }
  }

  /**
   * Get admin by ID
   */
  static async getAdminById(adminId: string, currentAdmin: AdminSession): Promise<{ success: boolean; admin?: IAdminUser; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canManageAdmins(currentAdmin)) {
        return {
          success: false,
          error: 'Insufficient permissions to view admin users'
        };
      }

      const admin = await AdminUser.findById(adminId).select('-password');
      if (!admin) {
        return {
          success: false,
          error: 'Admin user not found'
        };
      }

      return {
        success: true,
        admin
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get admin user'
      };
    }
  }

  /**
   * Bulk operations on admin users
   */
  static async bulkOperation(adminIds: string[], operation: string, data: any, currentAdmin: AdminSession): Promise<{ success: boolean; affectedCount: number; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canManageAdmins(currentAdmin)) {
        return {
          success: false,
          affectedCount: 0,
          error: 'Insufficient permissions for bulk operations'
        };
      }

      let affectedCount = 0;

      switch (operation) {
        case 'activate':
          const activateResult = await AdminUser.updateMany(
            { _id: { $in: adminIds } },
            { $set: { isActive: true, lockUntil: null, loginAttempts: 0 } }
          );
          affectedCount = activateResult.modifiedCount;
          break;

        case 'deactivate':
          const deactivateResult = await AdminUser.updateMany(
            { _id: { $in: adminIds } },
            { $set: { isActive: false } }
          );
          affectedCount = deactivateResult.modifiedCount;
          break;

        case 'delete':
          const deleteResult = await AdminUser.deleteMany({ _id: { $in: adminIds } });
          affectedCount = deleteResult.deletedCount;
          break;

        case 'update_role':
          if (data.role) {
            const updateRoleResult = await AdminUser.updateMany(
              { _id: { $in: adminIds } },
              { 
                $set: { 
                  role: data.role,
                  permissions: AdminVerificationService.getPermissionsByRole(data.role)
                } 
              }
            );
            affectedCount = updateRoleResult.modifiedCount;
          }
          break;

        default:
          return {
            success: false,
            affectedCount: 0,
            error: 'Invalid operation'
          };
      }

      // Log activity
      await AdminVerificationService.logActivity(currentAdmin.id, 'bulk_admin_operation', {
        operation,
        adminIds,
        affectedCount,
        data
      });

      return {
        success: true,
        affectedCount
      };

    } catch (error: any) {
      return {
        success: false,
        affectedCount: 0,
        error: error.message || 'Failed to perform bulk operation'
      };
    }
  }

  /**
   * Reset admin password
   */
  static async resetPassword(adminId: string, newPassword: string, currentAdmin: AdminSession): Promise<{ success: boolean; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canManageAdmins(currentAdmin)) {
        return {
          success: false,
          error: 'Insufficient permissions to reset admin passwords'
        };
      }

      const admin = await AdminUser.findById(adminId);
      if (!admin) {
        return {
          success: false,
          error: 'Admin user not found'
        };
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      admin.password = await bcrypt.hash(newPassword, salt);
      await admin.save();

      // Log activity
      await AdminVerificationService.logActivity(currentAdmin.id, 'reset_admin_password', {
        adminId: admin._id,
        email: admin.email
      });

      return {
        success: true
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to reset password'
      };
    }
  }

  /**
   * Get admin statistics
   */
  static async getAdminStats(currentAdmin: AdminSession): Promise<{ success: boolean; stats?: any; error?: string }> {
    try {
      await connectToDatabase();

      // Check permissions
      if (!AdminVerificationService.canViewAnalytics(currentAdmin)) {
        return {
          success: false,
          error: 'Insufficient permissions to view admin statistics'
        };
      }

      const stats = await AdminUser.aggregate([
        {
          $group: {
            _id: null,
            totalAdmins: { $sum: 1 },
            activeAdmins: { $sum: { $cond: ['$isActive', 1, 0] } },
            inactiveAdmins: { $sum: { $cond: ['$isActive', 0, 1] } },
            superAdmins: { $sum: { $cond: [{ $eq: ['$role', 'super_admin'] }, 1, 0] } },
            admins: { $sum: { $cond: [{ $eq: ['$role', 'admin'] }, 1, 0] } },
            moderators: { $sum: { $cond: [{ $eq: ['$role', 'moderator'] }, 1, 0] } }
          }
        }
      ]);

      return {
        success: true,
        stats: stats[0] || {}
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get admin statistics'
      };
    }
  }
}

export default AdminManagementService; 