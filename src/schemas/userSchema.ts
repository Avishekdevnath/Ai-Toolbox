import { z } from 'zod';
import mongoose, { Schema, Document } from 'mongoose';

// User interface
export interface User extends Document {
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  image?: string;
  avatar?: string;
  password?: string; // Added password field for local auth
  provider?: string; // Made optional for local auth
  providerAccountId?: string; // Made optional for local auth
  oauthAccounts?: OAuthAccount[]; // Made optional
  stats: UserStats;
  preferences: UserPreferences;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
  isActive: boolean;
  role: 'user' | 'admin';
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  loginHistory: LoginRecord[];
  toolUsage: ToolUsageRecord[];
  favorites: string[];
  settings: UserSettings;
  // Added fields for better user management
  loginAttempts?: number;
  lockUntil?: Date;
  lastLoginAt?: Date;
  permissions?: string[];
}

// OAuth Account interface
export interface OAuthAccount {
  provider: string;
  providerAccountId: string;
  accessToken?: string;
  refreshToken?: string;
  expiresAt?: number;
  scope?: string;
  tokenType?: string;
  createdAt: Date;
  updatedAt: Date;
}

// User Stats interface
export interface UserStats {
  totalLogins: number;
  lastLoginAt?: Date;
  toolsUsed: number;
  totalAnalyses: number;
  favoriteTools: number;
  accountAge: number;
  activityStreak: number;
  premiumFeatures: number;
}

// User Preferences interface
export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  accessibility: AccessibilitySettings;
}

// Notification Settings interface
export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  marketing: boolean;
  updates: boolean;
  security: boolean;
}

// Privacy Settings interface
export interface PrivacySettings {
  profileVisibility: 'public' | 'private' | 'friends';
  dataSharing: boolean;
  analytics: boolean;
  thirdParty: boolean;
}

// Accessibility Settings interface
export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  reducedMotion: boolean;
}

// Login Record interface
export interface LoginRecord {
  timestamp: Date;
  ipAddress: string;
  userAgent: string;
  location?: string;
  device?: string;
  success: boolean;
  provider: string;
}

// Tool Usage Record interface
export interface ToolUsageRecord {
  toolName: string;
  toolSlug: string;
  usageCount: number;
  lastUsed: Date;
  totalTime: number;
  favorite: boolean;
}

// User Settings interface
export interface UserSettings {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private';
    dataSharing: boolean;
  };
}

// Zod schemas for validation
export const UserSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required'),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  username: z.string().optional(),
  image: z.string().url().optional(),
  avatar: z.string().url().optional(),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(), // Added password validation
  provider: z.string().optional(), // Made optional
  providerAccountId: z.string().optional(), // Made optional
  oauthAccounts: z.array(z.object({
    provider: z.string(),
    providerAccountId: z.string(),
    accessToken: z.string().optional(),
    refreshToken: z.string().optional(),
    expiresAt: z.number().optional(),
    scope: z.string().optional(),
    tokenType: z.string().optional(),
    createdAt: z.date(),
    updatedAt: z.date()
  })).optional(),
  stats: z.object({
    totalLogins: z.number().default(0),
    lastLoginAt: z.date().optional(),
    toolsUsed: z.number().default(0),
    totalAnalyses: z.number().default(0),
    favoriteTools: z.number().default(0),
    accountAge: z.number().default(0),
    activityStreak: z.number().default(0),
    premiumFeatures: z.number().default(0)
  }).optional(),
  preferences: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      sms: z.boolean().default(false),
      marketing: z.boolean().default(false),
      updates: z.boolean().default(true),
      security: z.boolean().default(true)
    }).optional(),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private', 'friends']).default('public'),
      dataSharing: z.boolean().default(false),
      analytics: z.boolean().default(true),
      thirdParty: z.boolean().default(false)
    }).optional(),
    accessibility: z.object({
      highContrast: z.boolean().default(false),
      largeText: z.boolean().default(false),
      screenReader: z.boolean().default(false),
      reducedMotion: z.boolean().default(false)
    }).optional()
  }).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
  lastSignInAt: z.date().optional(),
  isActive: z.boolean().default(true),
  role: z.enum(['user', 'admin']).default('user'),
  emailVerified: z.boolean().default(false),
  twoFactorEnabled: z.boolean().default(false),
  loginHistory: z.array(z.object({
    timestamp: z.date(),
    ipAddress: z.string(),
    userAgent: z.string(),
    location: z.string().optional(),
    device: z.string().optional(),
    success: z.boolean(),
    provider: z.string()
  })).optional(),
  toolUsage: z.array(z.object({
    toolName: z.string(),
    toolSlug: z.string(),
    usageCount: z.number(),
    lastUsed: z.date(),
    totalTime: z.number(),
    favorite: z.boolean()
  })).optional(),
  favorites: z.array(z.string()).optional(),
  settings: z.object({
    theme: z.enum(['light', 'dark', 'auto']).default('auto'),
    language: z.string().default('en'),
    timezone: z.string().default('UTC'),
    notifications: z.object({
      email: z.boolean().default(true),
      push: z.boolean().default(true),
      marketing: z.boolean().default(false)
    }).optional(),
    privacy: z.object({
      profileVisibility: z.enum(['public', 'private']).default('public'),
      dataSharing: z.boolean().default(false)
    }).optional()
  }).optional(),
  // Added new fields
  loginAttempts: z.number().default(0).optional(),
  lockUntil: z.date().optional(),
  lastLoginAt: z.date().optional(),
  permissions: z.array(z.string()).default(['basic_access']).optional()
});

// Mongoose schema
const userSchema = new Schema<User>({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  firstName: { type: String },
  lastName: { type: String },
  username: { type: String, unique: true, sparse: true },
  image: { type: String },
  avatar: { type: String },
  password: { type: String }, // Added password field
  provider: { type: String }, // Made optional
  providerAccountId: { type: String }, // Made optional
  oauthAccounts: [{
    provider: { type: String, required: true },
    providerAccountId: { type: String, required: true },
    accessToken: { type: String },
    refreshToken: { type: String },
    expiresAt: { type: Number },
    scope: { type: String },
    tokenType: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  }],
  stats: {
    totalLogins: { type: Number, default: 0 },
    lastLoginAt: { type: Date },
    toolsUsed: { type: Number, default: 0 },
    totalAnalyses: { type: Number, default: 0 },
    favoriteTools: { type: Number, default: 0 },
    accountAge: { type: Number, default: 0 },
    activityStreak: { type: Number, default: 0 },
    premiumFeatures: { type: Number, default: 0 }
  },
  preferences: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false },
      marketing: { type: Boolean, default: false },
      updates: { type: Boolean, default: true },
      security: { type: Boolean, default: true }
    },
    privacy: {
      profileVisibility: { type: String, enum: ['public', 'private', 'friends'], default: 'public' },
      dataSharing: { type: Boolean, default: false },
      analytics: { type: Boolean, default: true },
      thirdParty: { type: Boolean, default: false }
    },
    accessibility: {
      highContrast: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false },
      screenReader: { type: Boolean, default: false },
      reducedMotion: { type: Boolean, default: false }
    }
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  lastSignInAt: { type: Date },
  isActive: { type: Boolean, default: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  emailVerified: { type: Boolean, default: false },
  twoFactorEnabled: { type: Boolean, default: false },
  loginHistory: [{
    timestamp: { type: Date, required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    location: { type: String },
    device: { type: String },
    success: { type: Boolean, required: true },
    provider: { type: String, required: true }
  }],
  toolUsage: [{
    toolName: { type: String, required: true },
    toolSlug: { type: String, required: true },
    usageCount: { type: Number, default: 0 },
    lastUsed: { type: Date, default: Date.now },
    totalTime: { type: Number, default: 0 },
    favorite: { type: Boolean, default: false }
  }],
  favorites: [{ type: String }],
  settings: {
    theme: { type: String, enum: ['light', 'dark', 'auto'], default: 'auto' },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
  notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      marketing: { type: Boolean, default: false }
  },
  privacy: {
      profileVisibility: { type: String, enum: ['public', 'private'], default: 'public' },
      dataSharing: { type: Boolean, default: false }
    }
  },
  // Added new fields for security
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  lastLoginAt: { type: Date },
  permissions: { type: [String], default: ['basic_access'] }
}, {
  timestamps: true,
  collection: 'users'
});

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ provider: 1, providerAccountId: 1 });
userSchema.index({ username: 1 });
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });
userSchema.index({ createdAt: 1 });

// Static methods
userSchema.statics = {
  // Find user by email
  async findByEmail(email: string): Promise<User | null> {
    return await this.findOne({ email });
  },

  // Find user by provider and provider account ID
  async findByProvider(provider: string, providerAccountId: string): Promise<User | null> {
    return await this.findOne({ provider, providerAccountId });
  },

  // Find user by username
  async findByUsername(username: string): Promise<User | null> {
    return await this.findOne({ username });
  },

  // Find users by role
  async findByRole(role: 'user' | 'admin'): Promise<User[]> {
    return await this.find({ role });
  },

  // Find active users
  async findActiveUsers(): Promise<User[]> {
    return await this.find({ isActive: true });
  },

  // Get user statistics
  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    verifiedUsers: number;
  }> {
    const totalUsers = await this.countDocuments();
    const activeUsers = await this.countDocuments({ isActive: true });
    const adminUsers = await this.countDocuments({ role: 'admin' });
    const verifiedUsers = await this.countDocuments({ emailVerified: true });

    return {
      totalUsers,
      activeUsers,
      adminUsers,
      verifiedUsers
    };
  }
};

// Instance methods
userSchema.methods = {
  // Update user stats
  async updateStats(updates: Partial<UserStats>): Promise<void> {
    this.stats = { ...this.stats, ...updates };
    await this.save();
  },

  // Add login record
  async addLoginRecord(record: Omit<LoginRecord, 'timestamp'>): Promise<void> {
    this.loginHistory.push({
      ...record,
      timestamp: new Date()
    });
    this.stats.totalLogins += 1;
    this.lastSignInAt = new Date();
    await this.save();
  },

  // Add tool usage
  async addToolUsage(toolName: string, toolSlug: string): Promise<void> {
    const existingUsage = this.toolUsage.find(usage => usage.toolSlug === toolSlug);
    if (existingUsage) {
      existingUsage.usageCount += 1;
      existingUsage.lastUsed = new Date();
    } else {
      this.toolUsage.push({
        toolName,
        toolSlug,
        usageCount: 1,
        lastUsed: new Date(),
        totalTime: 0,
        favorite: false
      });
    }
    this.stats.toolsUsed = this.toolUsage.length;
    await this.save();
  },

  // Toggle favorite tool
  async toggleFavorite(toolSlug: string): Promise<void> {
    const usage = this.toolUsage.find(u => u.toolSlug === toolSlug);
    if (usage) {
      usage.favorite = !usage.favorite;
      this.stats.favoriteTools = this.toolUsage.filter(u => u.favorite).length;
      await this.save();
    }
  },

  // Update preferences
  async updatePreferences(preferences: Partial<UserPreferences>): Promise<void> {
    this.preferences = { ...this.preferences, ...preferences };
    await this.save();
  },

  // Update settings
  async updateSettings(settings: Partial<UserSettings>): Promise<void> {
    this.settings = { ...this.settings, ...settings };
    await this.save();
  }
};

// Export the model
export const UserModel = mongoose.models.User || mongoose.model<User>('User', userSchema); 