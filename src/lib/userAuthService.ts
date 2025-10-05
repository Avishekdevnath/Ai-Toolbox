import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { AuthUserModel } from '@/models/AuthUserModel';
import { getDatabase } from '@/lib/mongodb';

export interface UserLoginCredentials {
  email?: string;
  username?: string;
  password: string;
}

export interface UserSession {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  name: string;
  role: string;
  isActive: boolean;
  permissions: string[];
  lastLoginAt?: Date;
}

export interface UserRegistrationData {
  email: string;
  username?: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
}

export class UserAuthService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  private static readonly SESSION_COOKIE_NAME = 'user_session';
  private static readonly SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Ensure MongoDB connection is established
   */
  private static async ensureConnection() {
    const { connectToDatabase } = await import('@/lib/mongodb');
    await connectToDatabase();
  }

  /**
   * Authenticate user with email/username and password
   */
  static async authenticateUser(credentials: UserLoginCredentials): Promise<{
    success: boolean;
    user?: UserSession;
    error?: string;
  }> {
    try {
      await this.ensureConnection();
      
      const { email, username, password } = credentials;
      
      if ((!email && !username) || !password) {
        return {
          success: false,
          error: 'Email/username and password are required'
        };
      }

      // Get user from database using email or username
      const user = email 
        ? await AuthUserModel.findByEmail(email.toLowerCase())
        : await AuthUserModel.findByUsername(username!.toLowerCase());
      
      if (!user) {
        return {
          success: false,
          error: 'Invalid email/username or password'
        };
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      
      if (!isPasswordValid) {
        return {
          success: false,
          error: 'Invalid email/username or password'
        };
      }

      // Update last login
      await AuthUserModel.updateLastLogin(user._id.toString());

      // Create user session
      const userSession: UserSession = {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role || 'user',
        isActive: true,
        permissions: ['basic_access'],
        lastLoginAt: new Date()
      };

      return {
        success: true,
        user: userSession
      };

    } catch (error: any) {
      console.error('User authentication error:', error);
      return {
        success: false,
        error: 'Authentication failed'
      };
    }
  }

  /**
   * Register a new user
   */
  static async registerUser(userData: UserRegistrationData): Promise<{
    success: boolean;
    user?: UserSession;
    error?: string;
  }> {
    try {
      await this.ensureConnection();
      
      const { email, username, password, name, firstName, lastName } = userData;
      
      if (!email || !password || !name) {
        return {
          success: false,
          error: 'Email, password, and name are required'
        };
      }

      // Check if user already exists by email
      const existingUserByEmail = await AuthUserModel.findByEmail(email.toLowerCase());
      if (existingUserByEmail) {
        return {
          success: false,
          error: 'User already exists with this email'
        };
      }

      // Check if username is provided and already exists
      if (username) {
        const existingUserByUsername = await AuthUserModel.findByUsername(username.toLowerCase());
        if (existingUserByUsername) {
          return {
            success: false,
            error: 'Username is already taken'
          };
        }
      }

      // Validate password strength
      if (password.length < 6) {
        return {
          success: false,
          error: 'Password must be at least 6 characters long'
        };
      }

      // Create user
      const newUser = await AuthUserModel.create({
        email: email.toLowerCase(),
        username: username?.toLowerCase(),
        password: password,
        firstName: firstName || name.split(' ')[0],
        lastName: lastName || name.split(' ').slice(1).join(' ') || '',
        phoneNumber: undefined
      });

      // Create user session
      const userSession: UserSession = {
        id: newUser._id.toString(),
        email: newUser.email,
        username: newUser.username,
        name: `${newUser.firstName} ${newUser.lastName}`.trim(),
        role: newUser.role || 'user',
        isActive: true,
        permissions: ['basic_access'],
        lastLoginAt: new Date()
      };

      return {
        success: true,
        user: userSession
      };

    } catch (error: any) {
      console.error('User registration error:', error);
      return {
        success: false,
        error: 'Registration failed'
      };
    }
  }

  /**
   * Create JWT token for user
   */
  static createUserToken(userSession: UserSession): string {
    const payload = {
      id: userSession.id,
      email: userSession.email,
      username: userSession.username,
      name: userSession.name,
      role: userSession.role,
      iat: Math.floor(Date.now() / 1000)
    };

    return jwt.sign(
      payload,
      this.JWT_SECRET,
      { expiresIn: '24h' }
    );
  }

  /**
   * Verify JWT token and return user session
   */
  static verifyUserToken(token: string): UserSession | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      
      return {
        id: decoded.id,
        email: decoded.email,
        username: decoded.username,
        name: decoded.name,
        role: decoded.role,
        isActive: true,
        permissions: ['basic_access']
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get current user session from cookies
   */
  static async getUserSession(request?: NextRequest): Promise<UserSession | null> {
    try {
      let token: string | undefined;
      
      if (request) {
        // Server-side: get token from request cookies
        token = request.cookies.get(this.SESSION_COOKIE_NAME)?.value;
      } else {
        // Server-side: get token from cookies() function
        try {
          const cookieStore = await cookies();
          token = cookieStore.get(this.SESSION_COOKIE_NAME)?.value;
        } catch (error) {
          // If cookies() fails (e.g., in client context), return null
          console.log('🔐 No server-side cookie access available');
          return null;
        }
      }
      
      if (!token) {
        return null;
      }
      
      // Verify token first (fast, no DB). Only hit DB if valid
      const decoded = this.verifyUserToken(token);
      if (!decoded) {
        return null;
      }
      
      // Connect to DB only when we need fresh user data
      await this.ensureConnection();

      // Get fresh user data from database
      const user = await AuthUserModel.findById(decoded.id);
      
      if (!user) {
        return null;
      }
      
      return {
        id: user._id.toString(),
        email: user.email,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        name: `${user.firstName} ${user.lastName}`.trim(),
        role: user.role || 'user',
        isActive: true,
        permissions: ['basic_access'],
        lastLoginAt: new Date()
      };
      
    } catch (error) {
      console.error('Error getting user session:', error);
      return null;
    }
  }

  /**
   * Check if user has specific permission
   */
  static async hasPermission(userId: string, permission: string): Promise<boolean> {
    try {
      const user = await AuthUserModel.findById(userId);
      if (!user) return false;
      
      return ['basic_access'].includes(permission);
    } catch (error) {
      console.error('Error checking user permission:', error);
      return false;
    }
  }

  /**
   * Update user password
   */
  static async updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      await this.ensureConnection();
      
      const user = await AuthUserModel.findById(userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      // Verify current password
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return {
          success: false,
          error: 'Current password is incorrect'
        };
      }

      // Validate new password
      if (newPassword.length < 6) {
        return {
          success: false,
          error: 'New password must be at least 6 characters long'
        };
      }

      // Hash new password
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await AuthUserModel.updatePassword(userId, hashedNewPassword);

      return {
        success: true
      };

    } catch (error: any) {
      console.error('Error updating password:', error);
      return {
        success: false,
        error: 'Failed to update password'
      };
    }
  }

  /**
   * Logout user (invalidate session)
   */
  static async logoutUser(): Promise<void> {
    try {
      const cookieStore = await cookies();
      cookieStore.delete(this.SESSION_COOKIE_NAME);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  }
}
