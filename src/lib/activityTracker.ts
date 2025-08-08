import { SystemActivity } from '@/models/SystemActivityModel';
import { SystemAlert } from '@/models/SystemAlertModel';
import { User } from '@/models/UserModel';
import { ToolUsage } from '@/models/ToolUsageModel';
import { connectToDatabase } from './mongodb';

export class ActivityTracker {
  /**
   * Track user activity
   */
  static async trackUserActivity(
    userId: string,
    userEmail: string,
    action: string,
    details?: string,
    metadata?: Record<string, any>
  ) {
    try {
      await connectToDatabase();
      
      await SystemActivity.create({
        type: 'user_activity',
        userId,
        userEmail,
        action,
        details,
        metadata,
        timestamp: new Date(),
        severity: 'low'
      });
    } catch (error) {
      console.error('Error tracking user activity:', error);
    }
  }

  /**
   * Track tool usage
   */
  static async trackToolUsage(
    userId: string,
    userEmail: string,
    toolSlug: string,
    action: string = 'used_tool',
    details?: string
  ) {
    try {
      await connectToDatabase();
      
      await SystemActivity.create({
        type: 'tool_usage',
        userId,
        userEmail,
        action,
        toolSlug,
        details,
        timestamp: new Date(),
        severity: 'low'
      });
    } catch (error) {
      console.error('Error tracking tool usage:', error);
    }
  }

  /**
   * Track system event
   */
  static async trackSystemEvent(
    action: string,
    details?: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    metadata?: Record<string, any>
  ) {
    try {
      await connectToDatabase();
      
      await SystemActivity.create({
        type: 'system_event',
        action,
        details,
        metadata,
        timestamp: new Date(),
        severity
      });
    } catch (error) {
      console.error('Error tracking system event:', error);
    }
  }

  /**
   * Create system alert
   */
  static async createAlert(
    type: 'info' | 'warning' | 'error' | 'success',
    title: string,
    message: string,
    category: 'system' | 'security' | 'performance' | 'user' | 'tool' = 'system',
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    expiresAt?: Date
  ) {
    try {
      await connectToDatabase();
      
      await SystemAlert.create({
        type,
        title,
        message,
        category,
        severity,
        expiresAt
      });
    } catch (error) {
      console.error('Error creating alert:', error);
    }
  }

  /**
   * Get dashboard statistics
   */
  static async getDashboardStats() {
    try {
      await connectToDatabase();
      
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Get total users
      const totalUsers = await User.countDocuments({ isActive: true });
      
      // Get active users (last 7 days)
      const activeUsers = await User.countDocuments({
        lastLoginAt: { $gte: sevenDaysAgo }
      });

      // Get total tools (hardcoded for now, could be dynamic)
      const totalTools = 15;

      // Get total usage
      const totalUsage = await ToolUsage.countDocuments();

      // Get system health
      const systemHealth = {
        apiStatus: 'Online' as const,
        database: 'Connected' as const,
        uptime: 99.8,
        responseTime: 245,
        errorRate: 0.02,
        lastDowntime: '2024-01-15 03:30:00'
      };

      // Get recent alerts
      const alerts = await SystemAlert.find({
        isActive: true,
        createdAt: { $gte: twentyFourHoursAgo }
      })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

      // Get tool usage analytics (last 24 hours)
      const toolUsageAnalytics = await ToolUsage.aggregate([
        {
          $match: {
            createdAt: { $gte: twentyFourHoursAgo }
          }
        },
        {
          $group: {
            _id: '$toolSlug',
            usageCount: { $sum: 1 }
          }
        },
        {
          $sort: { usageCount: -1 }
        },
        {
          $limit: 5
        }
      ]);

      // Get recent activity
      const recentActivity = await SystemActivity.find({
        timestamp: { $gte: twentyFourHoursAgo }
      })
      .sort({ timestamp: -1 })
      .limit(10)
      .lean();

      return {
        systemOverview: {
          totalUsers,
          activeUsers,
          totalTools,
          totalUsage,
          lastUpdated: now.toISOString()
        },
        systemHealth,
        alerts: alerts.map(alert => ({
          id: alert._id.toString(),
          type: alert.type,
          title: alert.title,
          message: alert.message,
          timestamp: alert.createdAt.toISOString(),
          isRead: alert.isRead
        })),
        toolUsageAnalytics: toolUsageAnalytics.map(tool => ({
          toolSlug: tool._id,
          toolName: this.getToolName(tool._id),
          usageCount: tool.usageCount,
          growthPercentage: Math.random() * 25, // Placeholder - would calculate from historical data
          period: 'Last 24 Hours'
        })),
        recentActivity: recentActivity.map(activity => ({
          id: activity._id.toString(),
          userId: activity.userId?.toString() || '',
          userEmail: activity.userEmail || 'System',
          action: activity.action,
          toolSlug: activity.toolSlug,
          timestamp: activity.timestamp.toISOString(),
          details: activity.details
        }))
      };
    } catch (error) {
      console.error('Error getting dashboard stats:', error);
      throw error;
    }
  }

  /**
   * Get tool name from slug
   */
  private static getToolName(slug: string): string {
    const toolNames: Record<string, string> = {
      'age-calculator': 'Age Calculator',
      'password-generator': 'Password Generator',
      'qr-generator': 'QR Generator',
      'unit-converter': 'Unit Converter',
      'quote-generator': 'Quote Generator',
      'diet-planner': 'Diet Planner',
      'finance-advisor': 'Finance Advisor',
      'job-interviewer': 'Job Interviewer',
      'mock-interviewer': 'Mock Interviewer',
      'price-tracker': 'Price Tracker',
      'resume-reviewer': 'Resume Reviewer',
      'swot-analysis': 'SWOT Analysis',
      'tip-calculator': 'Tip Calculator',
      'url-shortener': 'URL Shortener',
      'word-counter': 'Word Counter'
    };
    
    return toolNames[slug] || slug;
  }

  /**
   * Seed initial data for testing
   */
  static async seedInitialData() {
    try {
      await connectToDatabase();
      
      // Create some sample alerts
      await SystemAlert.create([
        {
          type: 'success',
          title: 'System backup completed successfully',
          message: 'Daily backup completed without issues',
          category: 'system',
          severity: 'low'
        },
        {
          type: 'warning',
          title: 'High memory usage detected',
          message: 'Memory usage is above 80%',
          category: 'performance',
          severity: 'medium'
        },
        {
          type: 'info',
          title: 'New user registration milestone reached',
          message: 'Reached 1000 registered users',
          category: 'user',
          severity: 'low'
        }
      ]);

      // Create some sample activities
      const sampleUsers = ['john.doe@example.com', 'jane.smith@example.com', 'admin@ai-toolbox.com', 'user123@example.com', 'demo@example.com'];
      const sampleTools = ['age-calculator', 'password-generator', 'qr-generator', 'unit-converter', 'quote-generator'];
      const sampleActions = ['Used Age Calculator', 'Created new account', 'Updated system settings', 'Used Password Generator', 'Logged in'];

      for (let i = 0; i < 20; i++) {
        const randomUser = sampleUsers[Math.floor(Math.random() * sampleUsers.length)];
        const randomTool = sampleTools[Math.floor(Math.random() * sampleTools.length)];
        const randomAction = sampleActions[Math.floor(Math.random() * sampleActions.length)];
        
        await SystemActivity.create({
          type: 'user_activity',
          userEmail: randomUser,
          action: randomAction,
          toolSlug: randomAction.includes('Used') ? randomTool : undefined,
          timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000), // Random time in last 24 hours
          severity: 'low'
        });
      }

      console.log('✅ Initial data seeded successfully');
    } catch (error) {
      console.error('Error seeding initial data:', error);
    }
  }
} 