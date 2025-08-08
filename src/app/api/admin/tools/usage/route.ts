import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication using AuthService
    const user = await AuthService.getSession(request);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const toolSlug = searchParams.get('toolSlug') || 'all';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Build match condition
    const matchCondition: any = {
      createdAt: { $gte: startDate }
    };

    if (toolSlug !== 'all') {
      matchCondition.toolSlug = toolSlug;
    }

    // Get tool usage stats
    const toolUsageStats = await db.collection('toolusages')
      .aggregate([
        {
          $match: matchCondition
        },
        {
          $group: {
            _id: '$toolSlug',
            totalUsage: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            lastUsed: { $max: '$createdAt' },
            firstUsed: { $min: '$createdAt' }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            toolName: '$_id',
            totalUsage: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            lastUsed: 1,
            firstUsed: 1,
            avgUsagePerUser: {
              $divide: ['$totalUsage', { $size: '$uniqueUsers' }]
            }
          }
        },
        {
          $sort: { totalUsage: -1 }
        }
      ]).toArray();

    // Get overall stats
    const overallStats = await db.collection('toolusages')
      .aggregate([
        {
          $match: matchCondition
        },
        {
          $group: {
            _id: null,
            totalUsage: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            uniqueTools: { $addToSet: '$toolSlug' }
          }
        },
        {
          $project: {
            totalUsage: 1,
            totalUniqueUsers: { $size: '$uniqueUsers' },
            totalTools: { $size: '$uniqueTools' },
            averageUsagePerTool: {
              $divide: ['$totalUsage', { $size: '$uniqueTools' }]
            },
            averageUsagePerUser: {
              $divide: ['$totalUsage', { $size: '$uniqueUsers' }]
            }
          }
        }
      ]).toArray();

    // Get recent activity
    const recentActivity = await db.collection('toolusages')
      .find(matchCondition)
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    const result = {
      overallStats: overallStats[0] || {
        totalUsage: 0,
        totalUniqueUsers: 0,
        totalTools: 0,
        averageUsagePerTool: 0,
        averageUsagePerUser: 0
      },
      toolUsageStats,
      usageByType: [],
      dailyUsage: [],
      topTools: toolUsageStats.slice(0, 5),
      recentActivity: recentActivity.map(activity => ({
        _id: activity._id.toString(),
        userId: {
          firstName: 'User',
          lastName: '',
          email: activity.userId || 'anonymous'
        },
        toolSlug: activity.toolSlug,
        toolName: activity.toolSlug,
        usageType: 'usage',
        createdAt: activity.createdAt
      })),
      timeRange,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Tool usage API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 