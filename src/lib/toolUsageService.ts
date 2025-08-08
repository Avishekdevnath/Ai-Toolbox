import mongoose from 'mongoose';
import { ToolUsage as ToolUsageModel } from '@/models/ToolUsageModel';
import { createHash } from 'crypto';

export interface TrackUsageRequest {
  toolSlug: string;
  toolName: string;
  usageType: 'view' | 'generate' | 'download' | 'share';
  metadata?: any;
  userId?: string; // Optional user ID for anonymous users
}

export interface ToolUsageStats {
  totalUsage: number;
  uniqueUsers: number;
  usageByType: {
    view: number;
    generate: number;
    download: number;
    share: number;
  };
  recentUsage: number;
  popularTools: Array<{
    toolSlug: string;
    toolName: string;
    usage: number;
  }>;
  userEngagement: {
    averageUsagePerUser: number;
    mostActiveUsers: Array<{
      userId: string;
      usage: number;
    }>;
  };
}

export interface ToolUsageRecord {
  _id: string;
  userId: string;
  toolSlug: string;
  toolName: string;
  usageType: 'view' | 'generate' | 'download' | 'share';
  metadata: any;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

export class ToolUsageService {
  private static instance: ToolUsageService;

  private constructor() {}

  public static getInstance(): ToolUsageService {
    if (!ToolUsageService.instance) {
      ToolUsageService.instance = new ToolUsageService();
    }
    return ToolUsageService.instance;
  }

  /**
   * Generate a unique user ID for anonymous users
   */
  private generateAnonymousUserId(ipAddress: string, userAgent: string): string {
    const hash = createHash('sha256')
      .update(`${ipAddress}-${userAgent}`)
      .digest('hex');
    return `anon_${hash.substring(0, 16)}`;
  }

  /**
   * Track tool usage
   */
  public async trackUsage(request: TrackUsageRequest, ipAddress?: string, userAgent?: string): Promise<void> {
    try {
      let userId = request.userId;

      // Generate anonymous user ID if no user ID provided
      if (!userId && ipAddress && userAgent) {
        userId = this.generateAnonymousUserId(ipAddress, userAgent);
      } else if (!userId) {
        userId = 'unknown_user';
      }

      const usageRecord = new ToolUsageModel({
        userId,
        toolSlug: request.toolSlug,
        toolName: request.toolName,
        usageType: request.usageType,
        metadata: request.metadata || {},
        timestamp: new Date()
      });

      await usageRecord.save();
    } catch (error) {
      console.error('Error tracking tool usage:', error);
    }
  }

  /**
   * Get usage statistics for all tools
   */
  public async getUsageStats(timeRange?: { start: Date; end: Date }): Promise<ToolUsageStats> {
    try {
      const matchStage: any = {};
      
      if (timeRange) {
        matchStage.timestamp = {
          $gte: timeRange.start,
          $lte: timeRange.end
        };
      }

      const pipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            totalUsage: 1,
            uniqueUsers: { $size: '$uniqueUsers' }
          }
        }
      ];

      const overallStats = await ToolUsageModel.aggregate(pipeline);
      const stats = overallStats[0] || { totalUsage: 0, uniqueUsers: 0 };

      // Get usage by type
      const usageByTypePipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$usageType',
            count: { $sum: 1 }
          }
        }
      ];

      const usageByTypeResult = await ToolUsageModel.aggregate(usageByTypePipeline);
      const usageByType = {
        view: 0,
        generate: 0,
        download: 0,
        share: 0
      };

      usageByTypeResult.forEach(item => {
        usageByType[item._id as keyof typeof usageByType] = item.count;
      });

      // Get recent usage (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsage = await ToolUsageModel.countDocuments({
        timestamp: { $gte: sevenDaysAgo }
      });

      // Get popular tools
      const popularToolsPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$toolSlug',
            toolName: { $first: '$toolName' },
            usage: { $sum: 1 }
          }
        },
        { $sort: { usage: -1 } },
        { $limit: 10 }
      ];

      const popularTools = await ToolUsageModel.aggregate(popularToolsPipeline);

      // Get user engagement
      const userEngagementPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$userId',
            usage: { $sum: 1 }
          }
        },
        { $sort: { usage: -1 } },
        { $limit: 10 }
      ];

      const mostActiveUsers = await ToolUsageModel.aggregate(userEngagementPipeline);

      const averageUsagePerUser = stats.totalUsage > 0 && stats.uniqueUsers > 0 
        ? stats.totalUsage / stats.uniqueUsers 
        : 0;

      return {
        totalUsage: stats.totalUsage,
        uniqueUsers: stats.uniqueUsers,
        usageByType,
        recentUsage,
        popularTools: popularTools.map(tool => ({
          toolSlug: tool._id,
          toolName: tool.toolName,
          usage: tool.usage
        })),
        userEngagement: {
          averageUsagePerUser,
          mostActiveUsers: mostActiveUsers.map(user => ({
            userId: user._id,
            usage: user.usage
          }))
        }
      };
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {
        totalUsage: 0,
        uniqueUsers: 0,
        usageByType: { view: 0, generate: 0, download: 0, share: 0 },
        recentUsage: 0,
        popularTools: [],
        userEngagement: {
          averageUsagePerUser: 0,
          mostActiveUsers: []
        }
      };
    }
  }

  /**
   * Get usage statistics for a specific tool
   */
  public async getToolUsageStats(toolSlug: string, timeRange?: { start: Date; end: Date }): Promise<{
    toolSlug: string;
    toolName: string;
    totalUsage: number;
    uniqueUsers: number;
    usageByType: {
      view: number;
      generate: number;
      download: number;
      share: number;
    };
    recentUsage: number;
    usageTrend: Array<{
      date: string;
      usage: number;
    }>;
  }> {
    try {
      const matchStage: any = { toolSlug };
      
      if (timeRange) {
        matchStage.timestamp = {
          $gte: timeRange.start,
          $lte: timeRange.end
        };
      }

      // Get basic stats
      const basicStatsPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            toolName: { $first: '$toolName' }
          }
        },
        {
          $project: {
            totalUsage: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            toolName: 1
          }
        }
      ];

      const basicStats = await ToolUsageModel.aggregate(basicStatsPipeline);
      const stats = basicStats[0] || { totalUsage: 0, uniqueUsers: 0, toolName: toolSlug };

      // Get usage by type
      const usageByTypePipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$usageType',
            count: { $sum: 1 }
          }
        }
      ];

      const usageByTypeResult = await ToolUsageModel.aggregate(usageByTypePipeline);
      const usageByType = {
        view: 0,
        generate: 0,
        download: 0,
        share: 0
      };

      usageByTypeResult.forEach(item => {
        usageByType[item._id as keyof typeof usageByType] = item.count;
      });

      // Get recent usage (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentUsage = await ToolUsageModel.countDocuments({
        toolSlug,
        timestamp: { $gte: sevenDaysAgo }
      });

      // Get usage trend (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const trendPipeline = [
        {
          $match: {
            toolSlug,
            timestamp: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$timestamp'
              }
            },
            usage: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ];

      const usageTrend = await ToolUsageModel.aggregate(trendPipeline);

      return {
        toolSlug,
        toolName: stats.toolName,
        totalUsage: stats.totalUsage,
        uniqueUsers: stats.uniqueUsers,
        usageByType,
        recentUsage,
        usageTrend: usageTrend.map(item => ({
          date: item._id,
          usage: item.usage
        }))
      };
    } catch (error) {
      console.error('Error getting tool usage stats:', error);
      return {
        toolSlug,
        toolName: toolSlug,
        totalUsage: 0,
        uniqueUsers: 0,
        usageByType: { view: 0, generate: 0, download: 0, share: 0 },
        recentUsage: 0,
        usageTrend: []
      };
    }
  }

  /**
   * Get user's tool usage
   */
  public async getUserToolUsage(userId: string, timeRange?: { start: Date; end: Date }): Promise<{
    totalUsage: number;
    toolsUsed: number;
    usageByTool: Array<{
      toolSlug: string;
      toolName: string;
      usage: number;
      lastUsed: Date;
    }>;
    usageByType: {
      view: number;
      generate: number;
      download: number;
      share: number;
    };
  }> {
    try {
      const matchStage: any = { userId };
      
      if (timeRange) {
        matchStage.timestamp = {
          $gte: timeRange.start,
          $lte: timeRange.end
        };
      }

      // Get basic stats
      const basicStatsPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: 1 },
            toolsUsed: { $addToSet: '$toolSlug' }
          }
        },
        {
          $project: {
            totalUsage: 1,
            toolsUsed: { $size: '$toolsUsed' }
          }
        }
      ];

      const basicStats = await ToolUsageModel.aggregate(basicStatsPipeline);
      const stats = basicStats[0] || { totalUsage: 0, toolsUsed: 0 };

      // Get usage by tool
      const usageByToolPipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$toolSlug',
            toolName: { $first: '$toolName' },
            usage: { $sum: 1 },
            lastUsed: { $max: '$timestamp' }
          }
        },
        { $sort: { usage: -1 } }
      ];

      const usageByTool = await ToolUsageModel.aggregate(usageByToolPipeline);

      // Get usage by type
      const usageByTypePipeline = [
        { $match: matchStage },
        {
          $group: {
            _id: '$usageType',
            count: { $sum: 1 }
          }
        }
      ];

      const usageByTypeResult = await ToolUsageModel.aggregate(usageByTypePipeline);
      const usageByType = {
        view: 0,
        generate: 0,
        download: 0,
        share: 0
      };

      usageByTypeResult.forEach(item => {
        usageByType[item._id as keyof typeof usageByType] = item.count;
      });

      return {
        totalUsage: stats.totalUsage,
        toolsUsed: stats.toolsUsed,
        usageByTool: usageByTool.map(tool => ({
          toolSlug: tool._id,
          toolName: tool.toolName,
          usage: tool.usage,
          lastUsed: tool.lastUsed
        })),
        usageByType
      };
    } catch (error) {
      console.error('Error getting user tool usage:', error);
      return {
        totalUsage: 0,
        toolsUsed: 0,
        usageByTool: [],
        usageByType: { view: 0, generate: 0, download: 0, share: 0 }
      };
    }
  }

  /**
   * Get all usage records with pagination
   */
  public async getUsageRecords(page: number = 1, limit: number = 50, filters?: {
    toolSlug?: string;
    userId?: string;
    usageType?: string;
    startDate?: Date;
    endDate?: Date;
  }): Promise<{
    records: ToolUsageRecord[];
    total: number;
    page: number;
    pages: number;
  }> {
    try {
      const skip = (page - 1) * limit;
      const matchStage: any = {};

      if (filters) {
        if (filters.toolSlug) matchStage.toolSlug = filters.toolSlug;
        if (filters.userId) matchStage.userId = filters.userId;
        if (filters.usageType) matchStage.usageType = filters.usageType;
        if (filters.startDate || filters.endDate) {
          matchStage.timestamp = {};
          if (filters.startDate) matchStage.timestamp.$gte = filters.startDate;
          if (filters.endDate) matchStage.timestamp.$lte = filters.endDate;
        }
      }

      const [records, total] = await Promise.all([
        ToolUsageModel.find(matchStage)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(limit),
        ToolUsageModel.countDocuments(matchStage)
      ]);

      return {
        records,
        total,
        page,
        pages: Math.ceil(total / limit)
      };
    } catch (error) {
      console.error('Error getting usage records:', error);
      return {
        records: [],
        total: 0,
        page,
        pages: 0
      };
    }
  }

  /**
   * Delete old usage records
   */
  public async deleteOldRecords(daysOld: number = 90): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const result = await ToolUsageModel.deleteMany({
        timestamp: { $lt: cutoffDate }
      });

      return result.deletedCount;
    } catch (error) {
      console.error('Error deleting old usage records:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const toolUsageService = ToolUsageService.getInstance(); 