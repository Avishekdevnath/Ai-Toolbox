import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';
import { User as UserModel, OAuthAccount, CreateUserRequest, UpdateUserRequest, defaultUserStats } from '@/schemas/userSchema';

export interface UserProfile {
  _id?: ObjectId;
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt?: Date;
  isActive: boolean;
  role: 'user' | 'admin';
  preferences: {
    theme: 'light' | 'dark' | 'system';
    notifications: boolean;
    emailUpdates: boolean;
  };
  stats: {
    totalToolsUsed: number;
    totalUrlsShortened: number;
    totalAnalyses: number;
    lastActivityAt?: Date;
  };
  metadata: Record<string, any>;
}

// Minimal Clerk-like interfaces to avoid depending on @clerk/nextjs
interface ExternalAccountLike {
  provider: string;
  id: string;
  emailAddress: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  providerUserId?: string;
}

interface ClerkEmailAddressLike {
  id: string;
  emailAddress: string;
  verification?: { status?: string };
}

interface ClerkUserLike {
  id: string;
  emailAddresses: ClerkEmailAddressLike[];
  primaryEmailAddressId?: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  externalAccounts?: ExternalAccountLike[];
}

export interface CreateUserData {
  clerkId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  emailVerified: boolean;
  provider: 'email' | 'google' | 'facebook' | 'github';
  providerAccountId?: string;
}

export interface UpdateUserData {
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
  emailVerified?: boolean;
  preferences?: Partial<UserProfile['preferences']>;
  metadata?: Record<string, any>;
  oauthAccounts?: OAuthAccount[];
  primaryProvider?: 'email' | 'google' | 'facebook' | 'github';
}

/**
 * User Service - Handles all user-related database operations
 */
export class UserService {
  private static instance: UserService;
  private collectionName = 'users';

  private constructor() {}

  public static getInstance(): UserService {
    if (!UserService.instance) {
      UserService.instance = new UserService();
    }
    return UserService.instance;
  }

  /**
   * Create a new user in MongoDB from Clerk user data
   */
  async createUser(userData: CreateUserData): Promise<UserModel> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const now = new Date();
      
      // Create OAuth account for the provider
      const oauthAccount: OAuthAccount = {
        provider: userData.provider,
        providerAccountId: userData.providerAccountId || userData.clerkId,
        email: userData.email,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim(),
        image: userData.imageUrl,
        createdAt: now,
        updatedAt: now,
        lastUsedAt: now
      };

      const user: UserModel = {
        clerkId: userData.clerkId,
        email: userData.email,
        name: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        image: userData.imageUrl,
        emailVerified: userData.emailVerified,
        oauthAccounts: [oauthAccount],
        primaryProvider: userData.provider,
        profile: {
          bio: '',
          location: '',
          website: '',
          avatar: userData.imageUrl || '',
          socialLinks: {}
        },
        preferences: {
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
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: now,
          passwordHistory: [],
          loginAttempts: 0,
          emailVerified: userData.emailVerified
        },
        activity: {
          lastLogin: now,
          lastActive: now,
          loginHistory: [],
          toolUsage: {}
        },
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: now,
          features: ['basic_tools', 'ai_analysis', 'url_shortener']
        },
        stats: {
          ...defaultUserStats,
          lastActivityAt: now
        },
        createdAt: now,
        updatedAt: now,
        isActive: true,
        role: 'user',
        permissions: [],
        metadata: {}
      };

      const result = await collection.insertOne(user);
      user._id = result.insertedId;

      console.log(`✅ User created in MongoDB: ${userData.email} (${userData.provider})`);
      return user;
    } catch (error: any) {
      console.error('❌ Error creating user:', error);
      throw new Error(`Failed to create user: ${error.message}`);
    }
  }

  /**
   * Get user by Clerk ID
   */
  async getUserByClerkId(clerkId: string): Promise<UserModel | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const user = await collection.findOne({ clerkId });
      return user as UserModel | null;
    } catch (error: any) {
      console.error('❌ Error getting user by Clerk ID:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<UserModel | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const user = await collection.findOne({ email: email.toLowerCase() });
      return user as UserModel | null;
    } catch (error: any) {
      console.error('❌ Error getting user by email:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Get user by OAuth provider
   */
  async getUserByOAuthProvider(provider: string, providerAccountId: string): Promise<UserModel | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const user = await collection.findOne({
        'oauthAccounts': {
          $elemMatch: {
            provider,
            providerAccountId
          }
        }
      });
      return user as UserModel | null;
    } catch (error: any) {
      console.error('❌ Error getting user by OAuth provider:', error);
      throw new Error(`Failed to get user: ${error.message}`);
    }
  }

  /**
   * Update user data
   */
  async updateUser(clerkId: string, updateData: UpdateUserData): Promise<UserModel | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const updateFields: any = {
        ...updateData,
        updatedAt: new Date(),
      };

      // Handle nested preferences update
      if (updateData.preferences) {
        updateFields['preferences'] = updateData.preferences;
      }

      // Handle metadata update
      if (updateData.metadata) {
        updateFields['metadata'] = updateData.metadata;
      }

      // Handle OAuth accounts update
      if (updateData.oauthAccounts) {
        updateFields['oauthAccounts'] = updateData.oauthAccounts;
      }

      const result = await collection.findOneAndUpdate(
        { clerkId },
        { $set: updateFields },
        { returnDocument: 'after' }
      );

      console.log(`✅ User updated: ${clerkId}`);
      return result as UserModel | null;
    } catch (error: any) {
      console.error('❌ Error updating user:', error);
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  /**
   * Add OAuth account to existing user
   */
  async addOAuthAccount(clerkId: string, oauthAccount: OAuthAccount): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const result = await collection.updateOne(
        { clerkId },
        ({
          $push: { oauthAccounts: oauthAccount },
          $set: {
            updatedAt: new Date(),
            primaryProvider: oauthAccount.provider
          }
        } as unknown) as any
      );

      console.log(`✅ OAuth account added for user: ${clerkId} (${oauthAccount.provider})`);
      return result.modifiedCount > 0;
    } catch (error: any) {
      console.error('❌ Error adding OAuth account:', error);
      throw new Error(`Failed to add OAuth account: ${error.message}`);
    }
  }

  /**
   * Update OAuth account
   */
  async updateOAuthAccount(clerkId: string, provider: string, providerAccountId: string, updates: Partial<OAuthAccount>): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      // First check if the OAuth account exists
      const existingUser = await collection.findOne({
        clerkId,
        'oauthAccounts.provider': provider,
        'oauthAccounts.providerAccountId': providerAccountId
      });

      if (!existingUser) {
        console.warn(`⚠️ OAuth account not found for user ${clerkId}, provider: ${provider}, accountId: ${providerAccountId}`);
        return false;
      }

      const result = await collection.updateOne(
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

      console.log(`✅ OAuth account updated for user: ${clerkId} (${provider})`);
      return result.modifiedCount > 0;
    } catch (error: any) {
      console.error('❌ Error updating OAuth account:', error);
      throw new Error(`Failed to update OAuth account: ${error.message}`);
    }
  }

  /**
   * Track user login with provider information
   */
  async trackLogin(clerkId: string, loginData: {
    ip: string;
    userAgent: string;
    provider: string;
    location?: string;
  }): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      await collection.updateOne(
        { clerkId },
        ({
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
            }
          },
          $inc: {
            'stats.loginCount': 1
          }
        } as unknown) as any
      );

      console.log(`✅ Login tracked for user: ${clerkId} (${loginData.provider})`);
    } catch (error: any) {
      console.error('❌ Error tracking login:', error);
      // Don't throw error for this operation as it's not critical
    }
  }

  /**
   * Update user's last sign-in time
   */
  async updateLastSignIn(clerkId: string): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      await collection.updateOne(
        { clerkId },
        { 
          $set: { 
            lastSignInAt: new Date(),
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ Last sign-in updated for user: ${clerkId}`);
    } catch (error: any) {
      console.error('❌ Error updating last sign-in:', error);
      // Don't throw error for this operation as it's not critical
    }
  }

  /**
   * Sync Clerk user with MongoDB (create if doesn't exist, update if exists)
   * Fixed version with proper provider detection and race condition handling
   */
  async syncUserFromClerk(clerkUser: ClerkUserLike): Promise<UserModel> {
    try {
      // Use upsert to handle race conditions
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const now = new Date();
      const primaryEmail = clerkUser.emailAddresses.find(email => email.id === clerkUser.primaryEmailAddressId);
      const actualProvider = 'email';

      // Create OAuth accounts for all providers
      const oauthAccounts: OAuthAccount[] = [];
      
      // Add email provider if verified
      if (primaryEmail?.verification?.status === 'verified') {
        oauthAccounts.push({
          provider: 'email',
          providerAccountId: clerkUser.id,
          email: primaryEmail.emailAddress,
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim(),
          image: clerkUser.imageUrl,
          createdAt: now,
          updatedAt: now,
          lastUsedAt: now
        });
      }

      // Add OAuth providers
      if (clerkUser.externalAccounts && clerkUser.externalAccounts.length > 0) {
        clerkUser.externalAccounts.forEach(account => {
          let provider: 'google' | 'facebook' | 'github';
          switch (account.provider) {
            case 'oauth_google':
              provider = 'google';
              break;
            case 'oauth_facebook':
              provider = 'facebook';
              break;
            case 'oauth_github':
              provider = 'github';
              break;
            default:
              return; // Skip unknown providers
          }

          oauthAccounts.push({
            provider,
            providerAccountId: account.id,
            providerUserId: account.providerUserId,
            email: account.emailAddress,
            name: account.firstName && account.lastName ? `${account.firstName} ${account.lastName}` : account.emailAddress,
            image: account.imageUrl,
            createdAt: now,
            updatedAt: now,
            lastUsedAt: now
          });
        });
      }

      // Prepare user data
      const userData = {
        clerkId: clerkUser.id,
        email: primaryEmail?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || primaryEmail?.emailAddress || '',
        firstName: clerkUser.firstName,
        lastName: clerkUser.lastName,
        username: clerkUser.username,
        image: clerkUser.imageUrl,
        emailVerified: primaryEmail?.verification?.status === 'verified' || false,
        oauthAccounts,
        primaryProvider: actualProvider,
        profile: {
          bio: '',
          location: '',
          website: '',
          avatar: clerkUser.imageUrl || '',
          socialLinks: {}
        },
        preferences: {
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
        },
        security: {
          twoFactorEnabled: false,
          lastPasswordChange: now,
          passwordHistory: [],
          loginAttempts: 0,
          emailVerified: primaryEmail?.verification?.status === 'verified' || false
        },
        activity: {
          lastLogin: now,
          lastActive: now,
          loginHistory: [],
          toolUsage: {}
        },
        subscription: {
          plan: 'free',
          status: 'active',
          startDate: now,
          features: ['basic_tools', 'ai_analysis', 'url_shortener']
        },
        stats: {
          ...defaultUserStats,
          lastActivityAt: now
        },
        createdAt: now,
        updatedAt: now,
        isActive: true,
        role: 'user',
        permissions: [],
        metadata: {}
      };

      // Use upsert to handle race conditions
      const result = await collection.findOneAndUpdate(
        { clerkId: clerkUser.id },
        { 
          $set: userData,
          $setOnInsert: { createdAt: now }
        },
        { 
          upsert: true, 
          returnDocument: 'after' 
        }
      );

      const user = result as UserModel;
      console.log(`✅ User synced from Clerk: ${userData.email} (${actualProvider})`);
      return user;
    } catch (error: any) {
      console.error('❌ Error syncing user from Clerk:', error);
      throw new Error(`Failed to sync user: ${error.message}`);
    }
  }

  /**
   * Increment user statistics
   */
  async incrementUserStats(userId: string, statType: keyof UserModel['stats']): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const updateField = `stats.${statType}`;
      const lastActivityField = 'stats.lastActivityAt';

      // Try to update by _id first (JWT user ID), then by clerkId as fallback
      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $inc: { [updateField]: 1 },
          $set: { 
            [lastActivityField]: new Date(),
            updatedAt: new Date()
          }
        }
      );

      // If no document found by _id, try clerkId
      if (result.matchedCount === 0) {
        await collection.updateOne(
          { clerkId: userId },
          { 
            $inc: { [updateField]: 1 },
            $set: { 
              [lastActivityField]: new Date(),
              updatedAt: new Date()
            }
          }
        );
      }

      console.log(`✅ User stats incremented: ${userId} - ${statType}`);
    } catch (error: any) {
      console.error('❌ Error incrementing user stats:', error);
      // Don't throw error for this operation as it's not critical
    }
  }

  /**
   * Increment tool usage for user
   */
  async incrementToolUsage(userId: string, toolName: string): Promise<void> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      // Try to update by _id first (JWT user ID), then by clerkId as fallback
      const result = await collection.updateOne(
        { _id: new ObjectId(userId) },
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

      // If no document found by _id, try clerkId
      if (result.matchedCount === 0) {
        await collection.updateOne(
          { clerkId: userId },
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
      }

      console.log(`✅ Tool usage incremented: ${userId} - ${toolName}`);
    } catch (error: any) {
      console.error('❌ Error incrementing tool usage:', error);
      // Don't throw error for this operation as it's not critical
    }
  }

  /**
   * Get user statistics
   */
  async getUserStats(userId: string): Promise<UserModel['stats'] | null> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      // Try to find by _id first (JWT user ID), then by clerkId as fallback
      let user = await collection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { stats: 1 } }
      );

      // If not found by _id, try clerkId
      if (!user) {
        user = await collection.findOne(
          { clerkId: userId },
          { projection: { stats: 1 } }
        );
      }

      return user?.stats || null;
    } catch (error: any) {
      console.error('❌ Error getting user stats:', error);
      return null;
    }
  }

  /**
   * Get all users (for admin purposes)
   */
  async getAllUsers(limit = 100, skip = 0): Promise<UserModel[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const users = await collection
        .find({})
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return users as UserModel[];
    } catch (error: any) {
      console.error('❌ Error getting all users:', error);
      throw new Error(`Failed to get users: ${error.message}`);
    }
  }

  /**
   * Get users count
   */
  async getUsersCount(): Promise<number> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      return await collection.countDocuments();
    } catch (error: any) {
      console.error('❌ Error getting users count:', error);
      return 0;
    }
  }

  /**
   * Get users by provider
   */
  async getUsersByProvider(provider: string): Promise<UserModel[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const users = await collection
        .find({
          'oauthAccounts.provider': provider
        })
        .sort({ createdAt: -1 })
        .toArray();

      return users as UserModel[];
    } catch (error: any) {
      console.error('❌ Error getting users by provider:', error);
      return [];
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(clerkId: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const result = await collection.updateOne(
        { clerkId },
        { 
          $set: { 
            isActive: false,
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ User soft deleted: ${clerkId}`);
      return result.modifiedCount > 0;
    } catch (error: any) {
      console.error('❌ Error deleting user:', error);
      throw new Error(`Failed to delete user: ${error.message}`);
    }
  }

  /**
   * Hard delete user (for GDPR compliance)
   */
  async hardDeleteUser(clerkId: string): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const result = await collection.deleteOne({ clerkId });

      console.log(`✅ User hard deleted: ${clerkId}`);
      return result.deletedCount > 0;
    } catch (error: any) {
      console.error('❌ Error hard deleting user:', error);
      throw new Error(`Failed to hard delete user: ${error.message}`);
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(clerkId: string, role: 'user' | 'admin'): Promise<boolean> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const result = await collection.updateOne(
        { clerkId },
        { 
          $set: { 
            role,
            updatedAt: new Date()
          }
        }
      );

      console.log(`✅ User role updated: ${clerkId} -> ${role}`);
      return result.modifiedCount > 0;
    } catch (error: any) {
      console.error('❌ Error updating user role:', error);
      throw new Error(`Failed to update user role: ${error.message}`);
    }
  }

  /**
   * Get user activity summary
   */
  async getUserActivitySummary(clerkId: string): Promise<{
    totalToolsUsed: number;
    totalUrlsShortened: number;
    totalAnalyses: number;
    lastActivityAt?: Date;
    toolsUsed: string[];
    loginCount: number;
    sessionCount: number;
    providers: string[];
  }> {
    try {
      const db = await getDatabase();
      
      // Get user stats
      const userStats = await this.getUserStats(clerkId);
      
      // Get user data for additional info
      const user = await this.getUserByClerkId(clerkId);
      
      // Get tools used (from tool usage collection)
      let toolsUsed: string[] = [];
      try {
        const toolUsageCollection = db.collection('toolUsage');
        const toolUsageDocs = await toolUsageCollection
          .find({ userId: clerkId })
          .toArray();
        toolsUsed = [...new Set(toolUsageDocs.map(doc => doc.toolSlug))];
      } catch (error) {
        console.error('❌ Error getting tools used:', error);
        toolsUsed = [];
      }

      return {
        totalToolsUsed: userStats?.totalToolsUsed || 0,
        totalUrlsShortened: userStats?.totalUrlsShortened || 0,
        totalAnalyses: userStats?.totalAnalyses || 0,
        lastActivityAt: userStats?.lastActivityAt,
        toolsUsed,
        loginCount: user?.stats?.loginCount || 0,
        sessionCount: user?.stats?.sessionCount || 0,
        providers: user?.oauthAccounts?.map(account => account.provider) || [],
      };
    } catch (error: any) {
      console.error('❌ Error getting user activity summary:', error);
      // Return default values instead of throwing
      return {
        totalToolsUsed: 0,
        totalUrlsShortened: 0,
        totalAnalyses: 0,
        toolsUsed: [],
        loginCount: 0,
        sessionCount: 0,
        providers: [],
      };
    }
  }

  /**
   * Get comprehensive user statistics for admin dashboard
   */
  async getAdminUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    verifiedUsers: number;
    usersByRole: { user: number; admin: number; moderator: number };
    usersByProvider: { email: number; google: number; facebook: number; github: number };
    recentSignups: number;
    averageSessionDuration: number;
  }> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      // Get basic counts
      const [totalUsers, activeUsers, verifiedUsers] = await Promise.all([
        collection.countDocuments(),
        collection.countDocuments({ isActive: true }),
        collection.countDocuments({ emailVerified: true })
      ]);

      // Get users by role
      const usersByRole = await collection.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } }
      ]).toArray();

      // Get users by provider
      const usersByProvider = await collection.aggregate([
        { $unwind: '$oauthAccounts' },
        { $group: { _id: '$oauthAccounts.provider', count: { $sum: 1 } } }
      ]).toArray();

      // Get recent signups (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentSignups = await collection.countDocuments({
        createdAt: { $gte: thirtyDaysAgo }
      });

      return {
        totalUsers,
        activeUsers,
        verifiedUsers,
        usersByRole: {
          user: usersByRole.find(r => r._id === 'user')?.count || 0,
          admin: usersByRole.find(r => r._id === 'admin')?.count || 0,
          moderator: usersByRole.find(r => r._id === 'moderator')?.count || 0,
        },
        usersByProvider: {
          email: usersByProvider.find(p => p._id === 'email')?.count || 0,
          google: usersByProvider.find(p => p._id === 'google')?.count || 0,
          facebook: usersByProvider.find(p => p._id === 'facebook')?.count || 0,
          github: usersByProvider.find(p => p._id === 'github')?.count || 0,
        },
        recentSignups,
        averageSessionDuration: 0, // TODO: Calculate from session data
      };
    } catch (error: any) {
      console.error('❌ Error getting admin user stats:', error);
      return {
        totalUsers: 0,
        activeUsers: 0,
        verifiedUsers: 0,
        usersByRole: { user: 0, admin: 0, moderator: 0 },
        usersByProvider: { email: 0, google: 0, facebook: 0, github: 0 },
        recentSignups: 0,
        averageSessionDuration: 0,
      };
    }
  }
}

// Export singleton instance
export const userService = UserService.getInstance(); 