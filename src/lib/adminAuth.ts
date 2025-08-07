import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AdminUser {
  _id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  lastLoginAt?: Date;
  loginAttempts: number;
  lockUntil?: Date;
}

export interface AdminSession {
  id: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  firstName?: string;
  lastName?: string;
  isActive: boolean;
}

export class AdminAuth {
  /**
   * Authenticate admin user
   */
  static async authenticateAdmin(email: string, password: string): Promise<{
    success: boolean;
    admin?: AdminSession;
    error?: string;
  }> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      // Find admin user
      const adminUser = await db.collection('adminusers').findOne({
        email: email.toLowerCase(),
        isActive: true
      });

      if (!adminUser) {
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Check if account is locked
      if (adminUser.lockUntil && new Date() < new Date(adminUser.lockUntil)) {
        return {
          success: false,
          error: 'Account is temporarily locked due to too many failed login attempts'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, adminUser.password);
      
      if (!isPasswordValid) {
        // Increment failed login attempts
        await this.incrementLoginAttempts(adminUser._id.toString());
        
        return {
          success: false,
          error: 'Invalid email or password'
        };
      }

      // Reset login attempts on successful login
      await this.resetLoginAttempts(adminUser._id.toString());

      // Create admin session
      const adminSession: AdminSession = {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions || [],
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isActive: adminUser.isActive
      };

      return {
        success: true,
        admin: adminSession
      };

    } catch (error) {
      console.error('Admin authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Create JWT token for admin
   */
  static createToken(admin: AdminSession): string {
    return jwt.sign(
      {
        id: admin.id,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions,
        isAdmin: true
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT token
   */
  static verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      return null;
    }
  }

  /**
   * Get admin session from request
   */
  static async getAdminSession(request: NextRequest): Promise<AdminSession | null> {
    try {
      const authHeader = request.headers.get('authorization');
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return null;
      }

      const token = authHeader.substring(7);
      const decoded = this.verifyToken(token);
      
      if (!decoded || !decoded.isAdmin) {
        return null;
      }

      // Verify admin still exists and is active
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      const adminUser = await db.collection('adminusers').findOne({
        _id: decoded.id,
        isActive: true
      });

      if (!adminUser) {
        return null;
      }

      return {
        id: adminUser._id.toString(),
        email: adminUser.email,
        role: adminUser.role,
        permissions: adminUser.permissions || [],
        firstName: adminUser.firstName,
        lastName: adminUser.lastName,
        isActive: adminUser.isActive
      };

    } catch (error) {
      console.error('Error getting admin session:', error);
      return null;
    }
  }

  /**
   * Check if admin has permission
   */
  static hasPermission(admin: AdminSession, permission: string): boolean {
    return admin.permissions.includes(permission);
  }

  /**
   * Check if admin is super admin
   */
  static isSuperAdmin(admin: AdminSession): boolean {
    return admin.role === 'super_admin';
  }

  /**
   * Increment login attempts
   */
  private static async incrementLoginAttempts(adminId: string): Promise<void> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      const adminUser = await db.collection('adminusers').findOne({ _id: adminId });
      
      if (!adminUser) return;

      const newLoginAttempts = (adminUser.loginAttempts || 0) + 1;
      const updates: any = { loginAttempts: newLoginAttempts };

      // Lock account after 5 failed attempts for 2 hours
      if (newLoginAttempts >= 5) {
        updates.lockUntil = new Date(Date.now() + 2 * 60 * 60 * 1000);
      }

      await db.collection('adminusers').updateOne(
        { _id: adminId },
        { $set: updates }
      );
    } catch (error) {
      console.error('Error incrementing login attempts:', error);
    }
  }

  /**
   * Reset login attempts
   */
  private static async resetLoginAttempts(adminId: string): Promise<void> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      await db.collection('adminusers').updateOne(
        { _id: adminId },
        {
          $unset: { loginAttempts: 1, lockUntil: 1 },
          $set: { lastLoginAt: new Date() }
        }
      );
    } catch (error) {
      console.error('Error resetting login attempts:', error);
    }
  }

  /**
   * Log admin activity
   */
  static async logActivity(adminId: string, action: string, resource: string, details?: any): Promise<void> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      const adminUser = await db.collection('adminusers').findOne({ _id: adminId });
      
      if (!adminUser) return;

      await db.collection('adminactivities').insertOne({
        adminId: adminId,
        adminEmail: adminUser.email,
        adminRole: adminUser.role,
        action,
        resource,
        details,
        status: 'success',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    } catch (error) {
      console.error('Error logging admin activity:', error);
    }
  }
} 