import mongoose from 'mongoose';
import { AuthUserModel, AuthUserDoc } from '@/models/AuthUserModel';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export type AdminRole = 'admin' | 'user';
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

export class AdminAuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'admin-secret-key-change-in-production';
  private static readonly SESSION_COOKIE_NAME = 'admin_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Ensure MongoDB connection is established
   */
  private static async ensureConnection() {
    if (mongoose.connection.readyState !== 1) {
      try {
        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('✅ MongoDB connected via Mongoose');
      } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        throw new Error('Database connection failed');
      }
    }
  }

  /**
   * Authenticate admin user with email and password
   */
  static async authenticateAdmin(credentials: AdminLoginCredentials): Promise<{
    success: boolean;
    admin?: AdminSession;
    error?: string;
  }> {
    try {
      await this.ensureConnection();
      
      const { email, password } = credentials;
      
      console.log('🔍 Attempting to authenticate admin:', email);
      
      // Find admin user by email
      const adminUser = await AuthUserModel.findByEmail(email);
      
      if (!adminUser) {
        console.log('❌ Admin user not found:', email);
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
      
      // Check if user has admin role
      if (adminUser.role !== 'admin') {
        console.log('❌ User is not an admin:', email, 'Role:', adminUser.role);
        return {
          success: false,
          error: 'Access denied: Admin privileges required'
        };
      }
      
      console.log('✅ Admin user found:', adminUser.email, 'Role:', adminUser.role);
      
      // Verify password
      console.log('🔐 Verifying password for:', email);
      const bcrypt = require('bcryptjs');
      const isPasswordValid = await bcrypt.compare(password, adminUser.passwordHash);
      
      if (!isPasswordValid) {
        console.log('❌ Invalid password for:', email);
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }
      
      console.log('✅ Password verified for:', email);
      
      // Update last login
      await AuthUserModel.updateLastLogin(adminUser._id.toString());
      
      // Create admin session
      const adminSession: AdminSession = {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        permissions: ['manage_users', 'manage_tools', 'view_analytics', 'manage_system', 'manage_content', 'view_audit_logs', 'view_dashboard', 'manage_settings'],
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isActive: true,
        lastLoginAt: new Date(),
      };
      
      console.log('✅ Admin session created for:', email);
      
      return {
        success: true,
        admin: adminSession
      };
      
    } catch (error) {
      console.error('❌ Admin authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Create JWT token for admin session
   */
  static createAdminToken(adminSession: AdminSession): string {
    return jwt.sign(
      { 
        id: adminSession.id,
        email: adminSession.email,
        role: adminSession.role,
        type: 'admin'
      },
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT token and return admin session
   */
  static verifyAdminToken(token: string): AdminSession | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      if (decoded.type !== 'admin') {
        return null;
      }
      
      return {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        permissions: [],
        isActive: true
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current admin session from cookies
   */
  static async getAdminSession(request?: NextRequest): Promise<AdminSession | null> {
    try {
      await this.ensureConnection();
      
      let token: string | undefined;
      
      if (request) {
        token = request.cookies.get(this.SESSION_COOKIE_NAME)?.value;
      } else {
        const cookieStore = await cookies();
        token = cookieStore.get(this.SESSION_COOKIE_NAME)?.value;
      }
      
      if (!token) {
        return null;
      }
      
      const decoded = this.verifyAdminToken(token);
      if (!decoded) {
        return null;
      }
      
      // Get fresh admin data from database
      const adminUser = await AuthUserModel.findById(decoded.id);
      
      if (!adminUser || adminUser.role !== 'admin') {
        return null;
      }
      
      return {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        permissions: ['manage_users', 'manage_tools', 'view_analytics', 'manage_system', 'manage_content', 'view_audit_logs', 'view_dashboard', 'manage_settings'],
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
   * Check if admin has specific permission
   */
  static async hasPermission(adminId: string, permission: PermissionType): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const adminUser = await AdminUser.findById(adminId).select('permissions isActive').exec();
      
      if (!adminUser || !adminUser.isActive) {
        return false;
      }
      
      return adminUser.permissions.includes(permission);
    } catch (error) {
      console.error('Error checking permission:', error);
      return false;
    }
  }

  /**
   * Check if user is admin
   */
  static async isAdmin(adminId: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      
      const adminUser = await AdminUser.findById(adminId).select('role isActive').exec();
      
      if (!adminUser || !adminUser.isActive) {
        return false;
      }
      
      return adminUser.role === 'admin' || adminUser.role === 'super_admin';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  /**
   * Get all admin users
   */
  static async getAllAdminUsers(): Promise<IAdminUser[]> {
    try {
      await this.ensureConnection();
      const adminUsers = await AdminUser.find({ isActive: true }).select('-password').sort({ createdAt: -1 }).exec();
      return adminUsers;
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
    password: string;
    role: AdminRole;
    firstName?: string;
    lastName?: string;
  }): Promise<IAdminUser | null> {
    try {
      await this.ensureConnection();
      const adminUser = new AdminUser(adminData);
      await adminUser.save();
      return adminUser;
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
    updateData: Partial<{
      email: string;
      password: string;
      role: AdminRole;
      firstName: string;
      lastName: string;
      isActive: boolean;
      permissions: PermissionType[];
    }>
  ): Promise<IAdminUser | null> {
    try {
      await this.ensureConnection();
      const adminUser = await AdminUser.findByIdAndUpdate(
        adminId,
        updateData,
        { new: true, runValidators: true }
      ).select('-password').exec();
      return adminUser;
    } catch (error) {
      console.error('Error updating admin user:', error);
      return null;
    }
  }

  /**
   * Delete admin user (soft delete)
   */
  static async deleteAdminUser(adminId: string): Promise<boolean> {
    try {
      await this.ensureConnection();
      const result = await AdminUser.findByIdAndUpdate(
        adminId,
        { isActive: false },
        { new: true }
      ).exec();
      return !!result;
    } catch (error) {
      console.error('Error deleting admin user:', error);
      return false;
    }
  }

  /**
   * Get admin user by ID
   */
  static async getAdminUserById(adminId: string): Promise<IAdminUser | null> {
    try {
      await this.ensureConnection();
      const adminUser = await AdminUser.findById(adminId).select('-password').exec();
      return adminUser;
    } catch (error) {
      console.error('Error getting admin user:', error);
      return null;
    }
  }

  /**
   * Get admin user by email
   */
  static async getAdminUserByEmail(email: string): Promise<IAdminUser | null> {
    try {
      await this.ensureConnection();
      const adminUser = await AdminUser.findOne({ email: email.toLowerCase() }).select('-password').exec();
      return adminUser;
    } catch (error) {
      console.error('Error getting admin user by email:', error);
      return null;
    }
  }
} 