import { NextRequest, NextResponse } from 'next/server';
import { AuthService } from '@/lib/authService';
import mongoose from 'mongoose';
import { DashboardResponseSchema } from '@/schemas/dashboardSchema';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const user = await AuthService.getSession(request);
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database using mongoose
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }
    
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Get real data from database using mongoose models
    const totalUsers = await mongoose.connection.db.collection('users').countDocuments({ isActive: true });
    const activeUsers = await mongoose.connection.db.collection('users').countDocuments({
      lastLoginAt: { $gte: sevenDaysAgo }
    });
    const totalTools = 15; // Hardcoded for now
    const totalUsage = await mongoose.connection.db.collection('toolusages').countDocuments();

    // Get system health (mock for now, could be real in production)
    const systemHealth = {
      apiStatus: 'Online' as const,
      database: 'Connected' as const,
      uptime: 99.8,
      responseTime: 245,
      errorRate: 0.02,
      lastDowntime: '2024-01-15 03:30:00'
    };

    // Get recent alerts (mock for now)
    const alerts = [
      {
        id: '1',
        type: 'success' as const,
        title: 'System backup completed successfully',
        message: 'Daily backup completed without issues',
        timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        isRead: false
      },
      {
        id: '2',
        type: 'warning' as const,
        title: 'High memory usage detected',
        message: 'Memory usage is above 80%',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        isRead: false
      },
      {
        id: '3',
        type: 'info' as const,
        title: 'New user registration milestone reached',
        message: 'Reached 1000 registered users',
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        isRead: false
      }
    ];

    // Get tool usage analytics (last 24 hours)
    const toolUsageAnalytics = await mongoose.connection.db.collection('toolusages')
      .aggregate([
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
      ]).toArray();

    // Get recent activity (mock for now)
    const recentActivity = [
      {
        id: '1',
        userId: '',
        userEmail: 'john.doe@example.com',
        action: 'Used Age Calculator',
        toolSlug: 'age-calculator',
        timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
        details: undefined
      },
      {
        id: '2',
        userId: '',
        userEmail: 'jane.smith@example.com',
        action: 'Created new account',
        toolSlug: undefined,
        timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
        details: undefined
      },
      {
        id: '3',
        userId: '',
        userEmail: 'admin@ai-toolbox.com',
        action: 'Updated system settings',
        toolSlug: undefined,
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
        details: undefined
      },
      {
        id: '4',
        userId: '',
        userEmail: 'user123@example.com',
        action: 'Used Password Generator',
        toolSlug: 'password-generator',
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
        details: undefined
      },
      {
        id: '5',
        userId: '',
        userEmail: 'demo@example.com',
        action: 'Logged in',
        toolSlug: undefined,
        timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
        details: undefined
      }
    ];

    const dashboardStats = {
      systemOverview: {
        totalUsers,
        activeUsers,
        totalTools,
        totalUsage,
        lastUpdated: now.toISOString()
      },
      systemHealth,
      alerts,
      toolUsageAnalytics: toolUsageAnalytics.map(tool => ({
        toolSlug: tool._id,
        toolName: getToolName(tool._id),
        usageCount: tool.usageCount,
        growthPercentage: Math.random() * 25, // Placeholder
        period: 'Last 24 Hours'
      })),
      recentActivity
    };

    // Validate response with schema
    const validatedResponse = DashboardResponseSchema.parse({
      success: true,
      data: dashboardStats
    });

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getToolName(slug: string): string {
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