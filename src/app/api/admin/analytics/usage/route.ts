import { NextRequest, NextResponse } from 'next/server';
import { AdminAuth } from '@/lib/adminAuth';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';

export async function GET(request: NextRequest) {
  try {
    // Verify admin authentication
    const adminSession = await AdminAuth.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if admin has analytics permission
    if (!AdminAuth.hasPermission(adminSession, 'view_analytics')) {
      return NextResponse.json(
        { success: false, error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default: // 7d
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Get tool usage analytics
    const toolUsage = await db.collection('toolusage')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$toolSlug',
            usageCount: { $sum: 1 },
            uniqueUsers: { $addToSet: '$userId' },
            successCount: {
              $sum: {
                $cond: [
                  { $eq: ['$metadata.result', 'success'] },
                  1,
                  0
                ]
              }
            },
            totalResponseTime: {
              $sum: { $ifNull: ['$metadata.duration', 0] }
            }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            usageCount: 1,
            uniqueUsers: { $size: '$uniqueUsers' },
            successRate: {
              $multiply: [
                { $divide: ['$successCount', '$usageCount'] },
                100
              ]
            },
            avgResponseTime: {
              $divide: ['$totalResponseTime', '$usageCount']
            }
          }
        },
        {
          $sort: { usageCount: -1 }
        }
      ]).toArray();

    // Get user growth data
    const userGrowth = await db.collection('users')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: {
              $dateToString: {
                format: '%Y-%m-%d',
                date: '$createdAt'
              }
            },
            newUsers: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 }
        }
      ]).toArray();

    // Get performance metrics
    const performanceMetrics = await db.collection('toolusage')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: null,
            totalRequests: { $sum: 1 },
            successCount: {
              $sum: {
                $cond: [
                  { $eq: ['$metadata.result', 'success'] },
                  1,
                  0
                ]
              }
            },
            totalResponseTime: {
              $sum: { $ifNull: ['$metadata.duration', 0] }
            }
          }
        },
        {
          $project: {
            totalRequests: 1,
            successRate: {
              $multiply: [
                { $divide: ['$successCount', '$totalRequests'] },
                100
              ]
            },
            avgResponseTime: {
              $divide: ['$totalResponseTime', '$totalRequests']
            },
            errorRate: {
              $multiply: [
                { $divide: [{ $subtract: ['$totalRequests', '$successCount'] }, '$totalRequests'] },
                100
              ]
            }
          }
        }
      ]).toArray();

    // Get recent activity
    const recentActivity = await db.collection('toolusage')
      .find({
        createdAt: { $gte: startDate }
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .toArray();

    // Format the data
    const analyticsData = {
      toolUsage: toolUsage.map(tool => ({
        toolName: tool.toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        usageCount: tool.usageCount,
        successRate: Math.round(tool.successRate * 100) / 100,
        avgResponseTime: Math.round(tool.avgResponseTime * 100) / 100,
        uniqueUsers: tool.uniqueUsers
      })),
      userGrowth: userGrowth.map(day => ({
        date: day._id,
        newUsers: day.newUsers,
        activeUsers: 0, // TODO: Calculate active users
        totalUsers: 0 // TODO: Calculate cumulative total
      })),
      performanceMetrics: performanceMetrics[0] ? {
        totalRequests: performanceMetrics[0].totalRequests,
        successRate: Math.round(performanceMetrics[0].successRate * 100) / 100,
        avgResponseTime: Math.round(performanceMetrics[0].avgResponseTime * 100) / 100,
        errorRate: Math.round(performanceMetrics[0].errorRate * 100) / 100,
        uptime: 99.9 // TODO: Calculate actual uptime
      } : {
        totalRequests: 0,
        successRate: 0,
        avgResponseTime: 0,
        errorRate: 0,
        uptime: 0
      },
      recentActivity: recentActivity.map(activity => ({
        id: activity._id.toString(),
        action: activity.action,
        toolName: activity.toolName,
        userId: activity.userId || 'anonymous',
        timestamp: new Date(activity.createdAt).toLocaleString(),
        status: activity.metadata?.result || 'success',
        responseTime: activity.metadata?.duration || 0
      }))
    };

    // Log analytics access
    await AdminAuth.logActivity(
      adminSession.id,
      'viewed',
      'analytics_dashboard',
      { range, dataPoints: analyticsData.toolUsage.length }
    );

    return NextResponse.json(analyticsData);

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
} 