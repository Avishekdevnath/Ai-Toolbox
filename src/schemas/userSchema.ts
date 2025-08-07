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
    facebook?: string;
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
    provider: string; // 'email', 'google', 'facebook', 'github'
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

export interface OAuthAccount {
  provider: 'google' | 'facebook' | 'github' | 'email';
  providerAccountId: string;
  providerUserId?: string; // For OAuth providers
  email?: string;
  name?: string;
  image?: string;
  refresh_token?: string;
  access_token?: string;
  expires_at?: number;
  token_type?: string;
  scope?: string;
  id_token?: string;
  session_state?: string;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date;
}

export interface User {
  _id?: ObjectId;
  clerkId: string; // Clerk user ID
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  image?: string;
  
  // Authentication
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  
  // OAuth Accounts - Support multiple providers
  oauthAccounts: OAuthAccount[];
  primaryProvider: 'email' | 'google' | 'facebook' | 'github';
  
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
  
  // Statistics
  stats: {
    totalToolsUsed: number;
    totalUrlsShortened: number;
    totalAnalyses: number;
    lastActivityAt?: Date;
    loginCount: number;
    sessionCount: number;
  };
  
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
  metadata: Record<string, any>;
}

export interface CreateUserRequest {
  clerkId: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  image?: string;
  provider: 'email' | 'google' | 'facebook' | 'github';
  providerAccountId?: string;
  emailVerified?: boolean;
}

export interface UpdateUserRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  image?: string;
  profile?: Partial<UserProfile>;
  preferences?: Partial<UserPreferences>;
  oauthAccounts?: OAuthAccount[];
  primaryProvider?: 'email' | 'google' | 'facebook' | 'github';
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
  usersByProvider: {
    email: number;
    google: number;
    facebook: number;
    github: number;
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

// Default user stats
export const defaultUserStats = {
  totalToolsUsed: 0,
  totalUrlsShortened: 0,
  totalAnalyses: 0,
  loginCount: 0,
  sessionCount: 0
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

  static async findByClerkId(clerkId: string): Promise<User | null> {
    const db = await getDatabase();
    return db.collection(this.collectionName).findOne({ 
      clerkId 
    }) as Promise<User | null>;
  }

  static async findByOAuthProvider(provider: string, providerAccountId: string): Promise<User | null> {
    const db = await getDatabase();
    return db.collection(this.collectionName).findOne({
      'oauthAccounts': {
        $elemMatch: {
          provider,
          providerAccountId
        }
      }
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

  static async addOAuthAccount(clerkId: string, oauthAccount: OAuthAccount): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).updateOne(
      { clerkId },
      {
        $push: { oauthAccounts: oauthAccount as any },
        $set: { 
          updatedAt: new Date(),
          primaryProvider: oauthAccount.provider
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async updateOAuthAccount(clerkId: string, provider: string, providerAccountId: string, updates: Partial<OAuthAccount>): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).updateOne(
      { 
        clerkId,
        'oauthAccounts.provider': provider,
        'oauthAccounts.providerAccountId': providerAccountId
      },
      {
        $set: {
          'oauthAccounts.$.updatedAt': new Date(),
          ...Object.fromEntries(
            Object.entries(updates).map(([key, value]) => [`oauthAccounts.$.${key}`, value])
          ),
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async trackLogin(clerkId: string, loginData: {
    ip: string;
    userAgent: string;
    provider: string;
    location?: string;
  }): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).updateOne(
      { clerkId },
      {
        $set: {
          'activity.lastLogin': new Date(),
          'activity.lastActive': new Date(),
          updatedAt: new Date()
        },
        $push: {
          'activity.loginHistory': {
            timestamp: new Date(),
            ip: loginData.ip,
            userAgent: loginData.userAgent,
            provider: loginData.provider,
            location: loginData.location
          } as any
        },
        $inc: {
          'stats.loginCount': 1
        }
      }
    );

    return result.modifiedCount > 0;
  }

  static async incrementToolUsage(clerkId: string, toolName: string): Promise<boolean> {
    const db = await getDatabase();
    
    const result = await db.collection(this.collectionName).updateOne(
      { clerkId },
      {
        $inc: {
          'stats.totalToolsUsed': 1,
          [`activity.toolUsage.${toolName}.count`]: 1
        },
        $set: {
          [`activity.toolUsage.${toolName}.lastUsed`]: new Date(),
          'stats.lastActivityAt': new Date(),
          'activity.lastActive': new Date(),
          updatedAt: new Date()
        }
      }
    );

    return result.modifiedCount > 0;
  }
} 