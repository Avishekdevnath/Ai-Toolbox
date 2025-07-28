import { ObjectId } from 'mongodb';
import { getDatabase } from '@/lib/mongodb';

export interface UserProfile {
  bio?: string;
  location?: string;
  website?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja' | 'ko';
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    showEmail: boolean;
    showActivity: boolean;
  };
}

export interface UserSecurity {
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  lastPasswordChange: Date;
  passwordHistory: string[];
  loginAttempts: number;
  lockedUntil?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
}

export interface UserActivity {
  lastLogin: Date;
  lastActive: Date;
  loginHistory: {
    timestamp: Date;
    ip: string;
    userAgent: string;
    location?: string;
  }[];
  toolUsage: {
    [toolName: string]: {
      count: number;
      lastUsed: Date;
    };
  };
}

export interface UserSubscription {
  plan: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'inactive' | 'cancelled' | 'expired';
  startDate: Date;
  endDate?: Date;
  features: string[];
  billingCycle?: 'monthly' | 'yearly';
}

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  password?: string; // Only for email/password auth
  image?: string; // For OAuth providers
  
  // Authentication
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  // OAuth Accounts
  accounts?: {
    provider: string;
    providerAccountId: string;
    refresh_token?: string;
    access_token?: string;
    expires_at?: number;
    token_type?: string;
    scope?: string;
    id_token?: string;
    session_state?: string;
  }[];
  
  // Profile Information
  profile: UserProfile;
  
  // Preferences
  preferences: UserPreferences;
  
  // Security
  security: UserSecurity;
  
  // Activity Tracking
  activity: UserActivity;
  
  // Subscription
  subscription: UserSubscription;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
  isActive: boolean;
  
  // Role and Permissions
  role: 'user' | 'admin' | 'moderator';
  permissions: string[];
  
  // Additional Fields
  timezone?: string;
  locale?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface CreateUserRequest {
  email: string;
  name: string;
  password?: string;
  image?: string;
  provider?: string;
  providerAccountId?: string;
}

export interface UpdateUserRequest {
  name?: string;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
  image?: string;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  verifiedUsers: number;
  usersByRole: {
    user: number;
    admin: number;
    moderator: number;
  };
  usersByPlan: {
    free: number;
    basic: number;
    premium: number;
    enterprise: number;
  };
  recentSignups: number;
  averageSessionDuration: number;
}

// Validation schemas
export const userValidationSchema = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address'
  },
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
    message: 'Name must be between 2 and 50 characters'
  },
  password: {
    required: false, // Not required for OAuth
    minLength: 8,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character'
  }
};

// Default user preferences
export const defaultUserPreferences: UserPreferences = {
  theme: 'system',
  language: 'en',
  notifications: {
    email: true,
    push: false,
    marketing: false
  },
  privacy: {
    profileVisibility: 'public',
    showEmail: false,
    showActivity: true
  }
};

// Default user profile
export const defaultUserProfile: UserProfile = {
  bio: '',
  location: '',
  website: '',
  avatar: '',
  socialLinks: {}
};

// Default user security
export const defaultUserSecurity: UserSecurity = {
  twoFactorEnabled: false,
  lastPasswordChange: new Date(),
  passwordHistory: [],
  loginAttempts: 0,
  emailVerified: false
};

// Default user activity
export const defaultUserActivity: UserActivity = {
  lastLogin: new Date(),
  lastActive: new Date(),
  loginHistory: [],
  toolUsage: {}
};

// Default user subscription
export const defaultUserSubscription: UserSubscription = {
  plan: 'free',
  status: 'active',
  startDate: new Date(),
  features: ['basic_tools', 'ai_analysis', 'url_shortener']
};

// Basic Database Operations (Simple CRUD)
export class UserSchema {
  private static collectionName = 'users';

  static async findByEmail(email: string): Promise<User | null> {
    const db = await getDatabase();
    return db.collection(this.collectionName).findOne({ 
      email: email.toLowerCase() 
    }) as Promise<User | null>;
  }

  static async findByVerificationToken(token: string): Promise<User | null> {
    const db = await getDatabase();
    return db.collection(this.collectionName).findOne({
      'security.emailVerificationToken': token,
      'security.emailVerificationExpires': { $gt: new Date() }
    }) as Promise<User | null>;
  }

  static async verifyEmail(id: string): Promise<boolean> {
    const db = await getDatabase();
    const { ObjectId } = await import('mongodb');
    
    const result = await db.collection(this.collectionName).updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          emailVerified: true,
          'security.emailVerified': true,
          updatedAt: new Date()
        },
        $unset: {
          'security.emailVerificationToken': '',
          'security.emailVerificationExpires': ''
        }
      }
    );

    return result.modifiedCount > 0;
  }
} 