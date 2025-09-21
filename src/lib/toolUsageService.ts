import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

export interface ToolUsage {
  _id?: ObjectId;
  userId?: string; // Clerk user ID (optional for anonymous users)
  anonymousUserId?: string; // For anonymous users
  toolSlug: string;
  toolName: string;
  action: string; // 'view', 'use', 'generate', 'analyze', etc.
  inputData?: any; // Input data (sanitized)
  outputData?: any; // Output data (sanitized)
  processingTime?: number; // Time taken in milliseconds
  success: boolean;
  errorMessage?: string;
  userAgent?: string;
  ipAddress?: string;
  createdAt: Date;
  metadata?: Record<string, any>;
}

export interface ToolUsageStats {
  totalUsage: number;
  uniqueUsers: number;
  successRate: number;
  averageProcessingTime: number;
  usageByAction: Record<string, number>;
  usageByDay: Array<{
    date: string;
    count: number;
  }>;
  topUsers: Array<{
    userId: string;
    usage: number;
  }>;
}

export interface CreateToolUsageData {
  userId?: string;
  anonymousUserId?: string;
  toolSlug: string;
  toolName: string;
  action: string;
  inputData?: any;
  outputData?: any;
  processingTime?: number;
  success: boolean;
  errorMessage?: string;
  userAgent?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

/**
 * Tool Usage Service - Handles all tool usage tracking and analytics
 */
export class ToolUsageService {
  private static instance: ToolUsageService;
  private collectionName = 'toolusages'; // Fixed collection name

  private constructor() {}

  public static getInstance(): ToolUsageService {
    if (!ToolUsageService.instance) {
      ToolUsageService.instance = new ToolUsageService();
    }
    return ToolUsageService.instance;
  }

  /**
   * Track tool usage
   */
  async trackUsage(usageData: CreateToolUsageData): Promise<ToolUsage> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      // Validate data size to prevent memory issues
      const maxDataSize = 1024 * 1024; // 1MB limit
      
      if (usageData.inputData && JSON.stringify(usageData.inputData).length > maxDataSize) {
        console.warn(`⚠️ Input data too large for user ${usageData.userId}, truncating`);
        usageData.inputData = { 
          truncated: true, 
          originalSize: JSON.stringify(usageData.inputData).length,
          message: 'Data truncated due to size limit'
        };
      }

      if (usageData.outputData && JSON.stringify(usageData.outputData).length > maxDataSize) {
        console.warn(`⚠️ Output data too large for user ${usageData.userId}, truncating`);
        usageData.outputData = { 
          truncated: true, 
          originalSize: JSON.stringify(usageData.outputData).length,
          message: 'Data truncated due to size limit'
        };
      }

      const usage: ToolUsage = {
        ...usageData,
        createdAt: new Date(),
      };

      // Sanitize sensitive data
      if (usage.inputData) {
        usage.inputData = this.sanitizeData(usage.inputData);
      }
      if (usage.outputData) {
        usage.outputData = this.sanitizeData(usage.outputData);
      }

      const result = await collection.insertOne(usage);
      usage._id = result.insertedId;

      console.log(`✅ Tool usage tracked: ${usageData.toolSlug} - ${usageData.action}`);
      return usage;
    } catch (error: any) {
      console.error('❌ Error tracking tool usage:', error);
      // Don't throw error for usage tracking as it's not critical
      throw new Error(`Failed to track usage: ${error.message}`);
    }
  }

  /**
   * Get tool usage statistics
   */
  async getToolUsageStats(
    toolSlug?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<ToolUsageStats> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      // Build query
      const query: any = {};
      if (toolSlug) {
        query.toolSlug = toolSlug;
      }
      if (startDate || endDate) {
        query.createdAt = {};
        if (startDate) query.createdAt.$gte = startDate;
        if (endDate) query.createdAt.$lte = endDate;
      }

      // Get total usage
      const totalUsage = await collection.countDocuments(query);

      // Get unique users
      const uniqueUsers = await collection.distinct('userId', query);

      // Get success rate
      const successCount = await collection.countDocuments({
        ...query,
        success: true,
      });
      const successRate = totalUsage > 0 ? (successCount / totalUsage) * 100 : 0;

      // Get average processing time
      const avgProcessingTime = await collection
        .aggregate([
          { $match: query },
          { $group: { _id: null, avg: { $avg: '$processingTime' } } },
        ])
        .toArray();
      const averageProcessingTime = avgProcessingTime[0]?.avg || 0;

      // Get usage by action
      const usageByAction = await collection
        .aggregate([
          { $match: query },
          { $group: { _id: '$action', count: { $sum: 1 } } },
          { $sort: { count: -1 } },
        ])
        .toArray();

      // Get usage by day (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const usageByDay = await collection
        .aggregate([
          {
            $match: {
              ...query,
              createdAt: { $gte: thirtyDaysAgo },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      // Get top users
      const topUsers = await collection
        .aggregate([
          { $match: { ...query, userId: { $exists: true, $ne: null } } },
          { $group: { _id: '$userId', usage: { $sum: 1 } } },
          { $sort: { usage: -1 } },
          { $limit: 10 },
        ])
        .toArray();

      return {
        totalUsage,
        uniqueUsers: uniqueUsers.length,
        successRate,
        averageProcessingTime,
        usageByAction: usageByAction.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {} as Record<string, number>),
        usageByDay: usageByDay.map((item) => ({
          date: item._id,
          count: item.count,
        })),
        topUsers: topUsers.map((item) => ({
          userId: item._id,
          usage: item.usage,
        })),
      };
    } catch (error: any) {
      console.error('❌ Error getting tool usage stats:', error);
      return {
        totalUsage: 0,
        uniqueUsers: 0,
        successRate: 0,
        averageProcessingTime: 0,
        usageByAction: {},
        usageByDay: [],
        topUsers: [],
      };
    }
  }

  /**
   * Get user's tool usage history
   */
  async getUserToolUsage(
    userId: string,
    limit = 50,
    skip = 0
  ): Promise<ToolUsage[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const usage = await collection
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return usage as ToolUsage[];
    } catch (error: any) {
      console.error('❌ Error getting user tool usage:', error);
      return [];
    }
  }

  /**
   * Get a specific user's usage filtered by tool slug
   */
  async getUserToolUsageBySlug(
    userId: string,
    toolSlug: string,
    limit = 50,
    skip = 0
  ): Promise<ToolUsage[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const usage = await collection
        .find({ userId, toolSlug })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return usage as ToolUsage[];
    } catch (error: any) {
      console.error('❌ Error getting user tool usage by slug:', error);
      return [];
    }
  }

  /**
   * Get tool usage by tool slug
   */
  async getToolUsageBySlug(
    toolSlug: string,
    limit = 100,
    skip = 0
  ): Promise<ToolUsage[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const usage = await collection
        .find({ toolSlug })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray();

      return usage as ToolUsage[];
    } catch (error: any) {
      console.error('❌ Error getting tool usage by slug:', error);
      return [];
    }
  }

  /**
   * Get popular tools (most used)
   */
  async getPopularTools(limit = 10): Promise<Array<{
    toolSlug: string;
    toolName: string;
    usageCount: number;
    uniqueUsers: number;
  }>> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const popularTools = await collection
        .aggregate([
          {
            $group: {
              _id: '$toolSlug',
              toolName: { $first: '$toolName' },
              usageCount: { $sum: 1 },
              uniqueUsers: { $addToSet: '$userId' },
            },
          },
          {
            $project: {
              toolSlug: '$_id',
              toolName: 1,
              usageCount: 1,
              uniqueUsers: { $size: '$uniqueUsers' },
            },
          },
          { $sort: { usageCount: -1 } },
          { $limit: limit },
        ])
        .toArray();

      return popularTools;
    } catch (error: any) {
      console.error('❌ Error getting popular tools:', error);
      return [];
    }
  }

  /**
   * Get recent tool usage
   */
  async getRecentUsage(limit = 20): Promise<ToolUsage[]> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const recentUsage = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return recentUsage as ToolUsage[];
    } catch (error: any) {
      console.error('❌ Error getting recent usage:', error);
      return [];
    }
  }

  /**
   * Get usage analytics for admin dashboard
   */
  async getAdminAnalytics(): Promise<{
    totalUsage: number;
    totalUsers: number;
    popularTools: Array<{
      toolSlug: string;
      toolName: string;
      usageCount: number;
    }>;
    recentActivity: ToolUsage[];
    dailyUsage: Array<{
      date: string;
      count: number;
    }>;
  }> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      // Get total usage
      const totalUsage = await collection.countDocuments();

      // Get total unique users
      const totalUsers = await collection.distinct('userId');

      // Get popular tools
      const popularTools = await collection
        .aggregate([
          {
            $group: {
              _id: '$toolSlug',
              toolName: { $first: '$toolName' },
              usageCount: { $sum: 1 },
            },
          },
          { $sort: { usageCount: -1 } },
          { $limit: 5 },
        ])
        .toArray();

      // Get recent activity
      const recentActivity = await collection
        .find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();

      // Get daily usage (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

      const dailyUsage = await collection
        .aggregate([
          {
            $match: {
              createdAt: { $gte: sevenDaysAgo },
            },
          },
          {
            $group: {
              _id: {
                $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
              },
              count: { $sum: 1 },
            },
          },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      return {
        totalUsage,
        totalUsers: totalUsers.length,
        popularTools: popularTools.map((tool) => ({
          toolSlug: tool._id,
          toolName: tool.toolName,
          usageCount: tool.usageCount,
        })),
        recentActivity: recentActivity as ToolUsage[],
        dailyUsage: dailyUsage.map((day) => ({
          date: day._id,
          count: day.count,
        })),
      };
    } catch (error: any) {
      console.error('❌ Error getting admin analytics:', error);
      return {
        totalUsage: 0,
        totalUsers: 0,
        popularTools: [],
        recentActivity: [],
        dailyUsage: [],
      };
    }
  }

  /**
   * Clean up old usage data (for GDPR compliance)
   */
  async cleanupOldUsage(daysToKeep = 365): Promise<number> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      const result = await collection.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      console.log(`✅ Cleaned up ${result.deletedCount} old usage records`);
      return result.deletedCount;
    } catch (error: any) {
      console.error('❌ Error cleaning up old usage:', error);
      return 0;
    }
  }

  /**
   * Delete user's usage data (for GDPR compliance)
   */
  async deleteUserUsage(userId: string): Promise<number> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const result = await collection.deleteMany({ userId });

      console.log(`✅ Deleted ${result.deletedCount} usage records for user: ${userId}`);
      return result.deletedCount;
    } catch (error: any) {
      console.error('❌ Error deleting user usage:', error);
      return 0;
    }
  }

  /**
   * Sanitize sensitive data before storing
   */
  private sanitizeData(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'token',
      'apiKey',
      'secret',
      'key',
      'authorization',
      'cookie',
      'session',
    ];

    const sanitized = { ...data };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    // Recursively sanitize nested objects
    for (const key in sanitized) {
      if (typeof sanitized[key] === 'object' && sanitized[key] !== null) {
        sanitized[key] = this.sanitizeData(sanitized[key]);
      }
    }

    return sanitized;
  }

  /**
   * Get usage summary for a specific tool
   */
  async getToolSummary(toolSlug: string): Promise<{
    totalUsage: number;
    uniqueUsers: number;
    successRate: number;
    averageProcessingTime: number;
    lastUsed: Date | null;
  }> {
    try {
      const db = await getDatabase();
      const collection = db.collection(this.collectionName);

      const [stats, lastUsage] = await Promise.all([
        collection
          .aggregate([
            { $match: { toolSlug } },
            {
              $group: {
                _id: null,
                totalUsage: { $sum: 1 },
                uniqueUsers: { $addToSet: '$userId' },
                successCount: {
                  $sum: { $cond: ['$success', 1, 0] },
                },
                avgProcessingTime: { $avg: '$processingTime' },
              },
            },
          ])
          .toArray(),
        collection
          .find({ toolSlug })
          .sort({ createdAt: -1 })
          .limit(1)
          .toArray(),
      ]);

      const stat = stats[0];
      if (!stat) {
        return {
          totalUsage: 0,
          uniqueUsers: 0,
          successRate: 0,
          averageProcessingTime: 0,
          lastUsed: null,
        };
      }

      return {
        totalUsage: stat.totalUsage,
        uniqueUsers: stat.uniqueUsers.length,
        successRate: (stat.successCount / stat.totalUsage) * 100,
        averageProcessingTime: stat.avgProcessingTime || 0,
        lastUsed: lastUsage[0]?.createdAt || null,
      };
    } catch (error: any) {
      console.error('❌ Error getting tool summary:', error);
      return {
        totalUsage: 0,
        uniqueUsers: 0,
        successRate: 0,
        averageProcessingTime: 0,
        lastUsed: null,
      };
    }
  }
}

// Export singleton instance
export const toolUsageService = ToolUsageService.getInstance(); 