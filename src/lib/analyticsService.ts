// Server-side analytics service - DO NOT IMPORT IN CLIENT COMPONENTS
import { getDatabase } from './mongodb';
import { ToolUsage } from '@/models/ToolUsageModel';

export class AnalyticsService {
  static async trackEvent(eventData: {
    userId?: string;
    toolSlug: string;
    toolName: string;
    eventType: string;
    source?: string;
    category?: string;
    metadata?: Record<string, any>;
  }) {
    try {
      await getDatabase();
      
      const toolUsage = new ToolUsage({
        userId: eventData.userId || 'anonymous',
        toolSlug: eventData.toolSlug,
        toolName: eventData.toolName,
        eventType: eventData.eventType,
        source: eventData.source || 'unknown',
        category: eventData.category || 'general',
        metadata: eventData.metadata || {},
        timestamp: new Date()
      });

      await toolUsage.save();
      return { success: true, id: toolUsage._id };
    } catch (error) {
      console.error('Error tracking event:', error);
      return { success: false, error: error.message };
    }
  }

  static async getToolUsageStats(toolSlug?: string) {
    try {
      await getDatabase();
      
      const matchStage = toolSlug ? { toolSlug } : {};
      
      const stats = await ToolUsage.aggregate([
        { $match: matchStage },
        {
          $group: {
            _id: '$toolSlug',
            totalUsage: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            eventTypes: { $addToSet: '$eventType' },
            lastUsed: { $max: '$timestamp' }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            totalUsage: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            eventTypes: 1,
            lastUsed: 1
          }
        },
        { $sort: { totalUsage: -1 } }
      ]);

      return stats;
    } catch (error) {
      console.error('Error getting tool usage stats:', error);
      return [];
    }
  }

  static async getPopularTools(limit: number = 10) {
    try {
      await getDatabase();
      
      const popularTools = await ToolUsage.aggregate([
        {
          $group: {
            _id: '$toolSlug',
            toolName: { $first: '$toolName' },
            totalUsage: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            toolName: 1,
            totalUsage: 1,
            uniqueUsers: { $size: '$uniqueUsers' }
          }
        },
        { $sort: { totalUsage: -1 } },
        { $limit: limit }
      ]);

      return popularTools;
    } catch (error) {
      console.error('Error getting popular tools:', error);
      return [];
    }
  }

  static async getUserActivity(userId: string, days: number = 30) {
    try {
      await getDatabase();
      
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const userActivity = await ToolUsage.aggregate([
        {
          $match: {
            userId,
            timestamp: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              toolSlug: '$toolSlug',
              toolName: '$toolName',
              date: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }
            },
            usage: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: '$_id.toolSlug',
            toolName: { $first: '$_id.toolName' },
            dailyUsage: {
              $push: {
                date: '$_id.date',
                usage: '$usage'
              }
            },
            totalUsage: { $sum: '$usage' }
          }
        },
        { $sort: { totalUsage: -1 } }
      ]);

      return userActivity;
    } catch (error) {
      console.error('Error getting user activity:', error);
      return [];
    }
  }

  static async getSystemAnalytics() {
    try {
      await getDatabase();
      
      const totalUsage = await ToolUsage.countDocuments();
      const uniqueUsers = (await ToolUsage.distinct('userId')).length;
      const popularTools = await this.getPopularTools(5);
      const recentActivity = await ToolUsage.find({}, null, { sort: { createdAt: -1 }, limit: 10 });

      return {
        totalUsage,
        uniqueUsers,
        popularTools,
        recentActivity
      };
    } catch (error) {
      console.error('Error getting system analytics:', error);
      return {
        totalUsage: 0,
        uniqueUsers: 0,
        popularTools: [],
        recentActivity: []
      };
    }
  }
} 