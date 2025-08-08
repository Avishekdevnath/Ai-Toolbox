import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { AdminVerificationService } from '@/lib/adminVerificationService';
import { ToolUsage } from '@/models/ToolUsageModel';
import { tools } from '@/data/tools';

export async function GET(request: NextRequest) {
  try {
    console.log('📊 Tool usage analytics API called');

    // Verify admin session
    const session = await AdminVerificationService.getAdminSession(request);
    if (!session.success || !session.session) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    console.log('✅ Admin session verified:', session.session.email);

    // Check permissions
    if (!AdminVerificationService.canViewAnalytics(session.session)) {
      console.log('❌ Insufficient permissions');
      return NextResponse.json({ success: false, error: 'Insufficient permissions' }, { status: 403 });
    }

    await connectToDatabase();
    console.log('✅ Database connected');

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d'; // 1d, 7d, 30d, 90d, all
    const toolSlug = searchParams.get('toolSlug') || 'all';

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (timeRange) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(0); // All time
    }

    // Build match conditions
    const matchConditions: any = {
      createdAt: { $gte: startDate }
    };

    if (toolSlug !== 'all') {
      matchConditions.toolSlug = toolSlug;
    }

    // Get comprehensive tool usage statistics
    const toolUsageStats = await ToolUsage.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$toolSlug',
          toolName: { $first: '$toolName' },
          totalUsage: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          usageByType: {
            $push: {
              type: '$usageType',
              count: 1
            }
          },
          lastUsed: { $max: '$createdAt' },
          firstUsed: { $min: '$createdAt' }
        }
      },
      {
        $project: {
          toolSlug: '$_id',
          toolName: 1,
          totalUsage: 1,
          uniqueUsers: { $size: '$uniqueUsers' },
          usageByType: 1,
          lastUsed: 1,
          firstUsed: 1,
          avgUsagePerUser: {
            $cond: [
              { $gt: [{ $size: '$uniqueUsers' }, 0] },
              { $divide: ['$totalUsage', { $size: '$uniqueUsers' }] },
              0
            ]
          }
        }
      },
      { $sort: { totalUsage: -1 } }
    ]);

    // Get usage by type breakdown
    const usageByType = await ToolUsage.aggregate([
      { $match: matchConditions },
      {
        $group: {
          _id: '$usageType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Get daily usage trends for the last 30 days
    const dailyUsage = await ToolUsage.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }
        }
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            toolSlug: '$toolSlug'
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.date',
          tools: {
            $push: {
              toolSlug: '$_id.toolSlug',
              count: '$count'
            }
          },
          totalCount: { $sum: '$count' }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 30 }
    ]);

    // Get top performing tools
    const topTools = toolUsageStats.slice(0, 5);

    // Get recent activity
    const recentActivity = await ToolUsage.find(matchConditions)
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('userId', 'firstName lastName email')
      .lean();

    // Calculate overall statistics
    const totalUsage = toolUsageStats.reduce((sum, tool) => sum + tool.totalUsage, 0);
    const totalUniqueUsers = new Set(
      toolUsageStats.flatMap(tool => tool.uniqueUsers)
    ).size;

    const overallStats = {
      totalUsage,
      totalUniqueUsers,
      totalTools: toolUsageStats.length,
      averageUsagePerTool: totalUsage / toolUsageStats.length || 0,
      averageUsagePerUser: totalUsage / totalUniqueUsers || 0
    };

    console.log('✅ Tool usage analytics generated successfully');
    console.log('📊 Stats summary:', {
      totalUsage,
      totalUniqueUsers,
      totalTools: toolUsageStats.length,
      timeRange
    });

    return NextResponse.json({
      success: true,
      data: {
        overallStats,
        toolUsageStats,
        usageByType,
        dailyUsage,
        topTools,
        recentActivity,
        timeRange,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error: any) {
    console.error('❌ Error fetching tool usage analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tool usage analytics' },
      { status: 500 }
    );
  }
} 