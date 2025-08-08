import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '24h';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'user' | 'admin' | 'super_admin' | 'moderator';
  permissions: string[];
  isAdmin: boolean;
  isActive: boolean;
  lastLoginAt?: Date;
}

export interface AuthSession {
  user: AuthUser;
  token: string;
  expiresAt: Date;
}

export interface AuthResult {
  success: boolean;
  session?: AuthSession;
  error?: string;
}

export class AuthService {
  /**
   * Authenticate user (admin or regular user)
   */
  static async authenticate(email: string, password: string): Promise<AuthResult> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      // Check admin users first
      const adminUser = await db.collection('adminusers').findOne({
        email: email.toLowerCase(),
        isActive: true
      });

      if (adminUser) {
        return await this.authenticateAdmin(adminUser, password);
      }

      // Check regular users
      const regularUser = await db.collection('users').findOne({
        email: email.toLowerCase(),
        isActive: true
      });

      if (regularUser) {
        return await this.authenticateUser(regularUser, password);
      }

      return {
        success: false,
        error: 'Invalid email or password'
      };

    } catch (error) {
      console.error('Authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Authenticate admin user
   */
  private static async authenticateAdmin(adminUser: any, password: string): Promise<AuthResult> {
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
      await this.incrementLoginAttempts('adminusers', adminUser._id.toString());
      
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts('adminusers', adminUser._id.toString());

    // Create auth user
    const authUser: AuthUser = {
      id: adminUser._id.toString(),
      email: adminUser.email,
      name: `${adminUser.firstName} ${adminUser.lastName}`,
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      role: adminUser.role,
      permissions: adminUser.permissions || [],
      isAdmin: true,
      isActive: adminUser.isActive,
      lastLoginAt: adminUser.lastLoginAt
    };

    // Create JWT token
    const token = this.createToken(authUser);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      success: true,
      session: {
      user: authUser,
        token,
        expiresAt
      }
    };
  }

  /**
   * Authenticate regular user
   */
  private static async authenticateUser(user: any, password: string): Promise<AuthResult> {
    // Check if account is locked
    if (user.lockUntil && new Date() < new Date(user.lockUntil)) {
      return {
        success: false,
        error: 'Account is temporarily locked due to too many failed login attempts'
      };
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment failed login attempts
      await this.incrementLoginAttempts('users', user._id.toString());
      
      return {
        success: false,
        error: 'Invalid email or password'
      };
    }

    // Reset login attempts on successful login
    await this.resetLoginAttempts('users', user._id.toString());

    // Create auth user
    const authUser: AuthUser = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role || 'user',
      permissions: user.permissions || ['basic_access'],
      isAdmin: false,
      isActive: user.isActive,
      lastLoginAt: user.lastLoginAt
    };

    // Create JWT token
    const token = this.createToken(authUser);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    return {
      success: true,
      session: {
      user: authUser,
        token,
        expiresAt
      }
    };
  }

  /**
   * Create JWT token
   */
  static createToken(user: AuthUser): string {
    return jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
        permissions: user.permissions,
        isAdmin: user.isAdmin
      },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
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
   * Get user session from request
   */
  static async getSession(request: NextRequest): Promise<AuthUser | null> {
    try {
      console.log('🔍 AuthService.getSession - Starting session check...');
      
      const authHeader = request.headers.get('authorization');
      const token = request.cookies.get('authToken')?.value;
      
      console.log('🔍 AuthService.getSession - Tokens found:', {
        hasAuthHeader: !!authHeader,
        hasCookieToken: !!token,
        authHeaderLength: authHeader?.length,
        cookieTokenLength: token?.length
      });
      
      let jwtToken = '';
      
      if (authHeader && authHeader.startsWith('Bearer ')) {
        jwtToken = authHeader.substring(7);
      } else if (token) {
        jwtToken = token;
      }

      if (!jwtToken) {
        console.log('❌ AuthService.getSession - No JWT token found');
        return null;
      }

      console.log('🔍 AuthService.getSession - Verifying token...');
      const decoded = this.verifyToken(jwtToken);
      if (!decoded) {
        console.log('❌ AuthService.getSession - Token verification failed');
        return null;
      }

      console.log('🔍 AuthService.getSession - Token decoded:', {
        id: decoded.id,
        email: decoded.email,
        isAdmin: decoded.isAdmin
      });

      // Verify user still exists and is active
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      // Check admin users first
      let user = await db.collection('adminusers').findOne({
        _id: new ObjectId(decoded.id),
        isActive: true
      });

      console.log('🔍 AuthService.getSession - Admin user lookup:', {
        found: !!user,
        email: user?.email,
        role: user?.role
      });

      if (user) {
        const authUser = {
          id: user._id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          permissions: user.permissions || [],
          isAdmin: true,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt
        };
        console.log('✅ AuthService.getSession - Admin user found:', authUser);
        return authUser;
      }

      // Check regular users
      user = await db.collection('users').findOne({
        _id: new ObjectId(decoded.id),
        isActive: true
      });

      console.log('🔍 AuthService.getSession - Regular user lookup:', {
        found: !!user,
        email: user?.email,
        role: user?.role
      });

      if (user) {
        const authUser = {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role || 'user',
          permissions: user.permissions || ['basic_access'],
          isAdmin: false,
          isActive: user.isActive,
          lastLoginAt: user.lastLoginAt
        };
        console.log('✅ AuthService.getSession - Regular user found:', authUser);
        return authUser;
      }

      console.log('❌ AuthService.getSession - No user found in database');
      return null;

    } catch (error) {
      console.error('❌ AuthService.getSession - Error:', error);
      return null;
    }
  }

  /**
   * Create new user account
   */
  static async createUser(userData: {
    email: string;
    password: string;
    name: string;
    firstName?: string;
    lastName?: string;
  }): Promise<AuthResult> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      // Check if user already exists
      const existingUser = await db.collection('users').findOne({
        email: userData.email.toLowerCase()
      });

      if (existingUser) {
        return {
          success: false,
          error: 'User with this email already exists'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(userData.password, 12);

      // Create new user
      const newUser = {
        email: userData.email.toLowerCase(),
        password: hashedPassword,
        name: userData.name,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'user',
        isActive: true,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
        loginAttempts: 0,
        permissions: ['basic_access'],
        stats: {
          totalLogins: 0,
          toolsUsed: 0,
          totalAnalyses: 0,
          favoriteTools: 0,
          accountAge: 0,
          activityStreak: 0,
          premiumFeatures: 0
        },
        preferences: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            dataSharing: false
          }
        },
        settings: {
          theme: 'auto',
          language: 'en',
          timezone: 'UTC',
          notifications: {
            email: true,
            push: true,
            marketing: false
          },
          privacy: {
            profileVisibility: 'public',
            dataSharing: false
          }
        },
        loginHistory: [],
        toolUsage: [],
        favorites: []
      };

      const result = await db.collection('users').insertOne(newUser);
      const createdUser = { ...newUser, _id: result.insertedId };

      // Create auth user
      const authUser: AuthUser = {
        id: createdUser._id.toString(),
        email: createdUser.email,
        name: createdUser.name,
        firstName: createdUser.firstName,
        lastName: createdUser.lastName,
        role: createdUser.role,
        permissions: createdUser.permissions,
        isAdmin: false,
        isActive: createdUser.isActive,
        lastLoginAt: createdUser.lastLoginAt
      };

      // Create JWT token
      const token = this.createToken(authUser);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      return {
        success: true,
        session: {
          user: authUser,
          token,
          expiresAt
        }
      };

    } catch (error) {
      console.error('User creation error:', error);
      return {
        success: false,
        error: 'Failed to create user account'
      };
    }
  }

  /**
   * Increment login attempts
   */
  private static async incrementLoginAttempts(collection: string, userId: string): Promise<void> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      const user = await db.collection(collection).findOne({ _id: new ObjectId(userId) });
      if (!user) return;

      const newLoginAttempts = (user.loginAttempts || 0) + 1;
      let lockUntil = null;

      // Lock account after 5 failed attempts for 15 minutes
      if (newLoginAttempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
      }

      await db.collection(collection).updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            loginAttempts: newLoginAttempts,
            lockUntil,
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('Error incrementing login attempts:', error);
    }
  }

  /**
   * Reset login attempts
   */
  private static async resetLoginAttempts(collection: string, userId: string): Promise<void> {
    try {
      await connectToDatabase();
      const dbConnection = await getDatabase();
      const db = dbConnection.db;

      await db.collection(collection).updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            loginAttempts: 0,
            lockUntil: null,
            lastLoginAt: new Date(),
            updatedAt: new Date()
          }
        }
      );
    } catch (error) {
      console.error('Error resetting login attempts:', error);
    }
  }
} 