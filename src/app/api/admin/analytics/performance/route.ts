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

    // Get performance metrics from tool usage
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
            },
            avgResponseTime: {
              $avg: { $ifNull: ['$metadata.duration', 0] }
            },
            maxResponseTime: {
              $max: { $ifNull: ['$metadata.duration', 0] }
            },
            minResponseTime: {
              $min: { $ifNull: ['$metadata.duration', 0] }
            }
          }
        }
      ]).toArray();

    // Get performance by tool
    const performanceByTool = await db.collection('toolusage')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$toolSlug',
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
            },
            avgResponseTime: {
              $avg: { $ifNull: ['$metadata.duration', 0] }
            },
            maxResponseTime: {
              $max: { $ifNull: ['$metadata.duration', 0] }
            },
            minResponseTime: {
              $min: { $ifNull: ['$metadata.duration', 0] }
            }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            totalRequests: 1,
            successCount: 1,
            successRate: {
              $multiply: [
                { $divide: ['$successCount', '$totalRequests'] },
                100
              ]
            },
            avgResponseTime: 1,
            maxResponseTime: 1,
            minResponseTime: 1
          }
        },
        {
          $sort: { totalRequests: -1 }
        }
      ]).toArray();

    // Get performance trends over time
    const performanceTrends = await db.collection('toolusage')
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
            avgResponseTime: {
              $avg: { $ifNull: ['$metadata.duration', 0] }
            }
          }
        },
        {
          $project: {
            date: '$_id',
            totalRequests: 1,
            successRate: {
              $multiply: [
                { $divide: ['$successCount', '$totalRequests'] },
                100
              ]
            },
            avgResponseTime: 1
          }
        },
        {
          $sort: { date: 1 }
        }
      ]).toArray();

    // Get error analysis
    const errorAnalysis = await db.collection('toolusage')
      .aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            'metadata.result': { $ne: 'success' }
          }
        },
        {
          $group: {
            _id: '$toolSlug',
            errorCount: { $sum: 1 },
            errorTypes: { $addToSet: '$metadata.error' }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            errorCount: 1,
            errorTypes: 1,
            uniqueErrorTypes: { $size: '$errorTypes' }
          }
        },
        {
          $sort: { errorCount: -1 }
        }
      ]).toArray();

    // Calculate overall metrics
    const overallMetrics = performanceMetrics[0] ? {
      totalRequests: performanceMetrics[0].totalRequests,
      successRate: Math.round((performanceMetrics[0].successCount / performanceMetrics[0].totalRequests) * 100 * 100) / 100,
      avgResponseTime: Math.round(performanceMetrics[0].avgResponseTime * 100) / 100,
      maxResponseTime: Math.round(performanceMetrics[0].maxResponseTime * 100) / 100,
      minResponseTime: Math.round(performanceMetrics[0].minResponseTime * 100) / 100,
      errorRate: Math.round(((performanceMetrics[0].totalRequests - performanceMetrics[0].successCount) / performanceMetrics[0].totalRequests) * 100 * 100) / 100,
      uptime: 99.9 // TODO: Calculate actual uptime from system logs
    } : {
      totalRequests: 0,
      successRate: 0,
      avgResponseTime: 0,
      maxResponseTime: 0,
      minResponseTime: 0,
      errorRate: 0,
      uptime: 0
    };

    // Format the data
    const performanceData = {
      overallMetrics,
      performanceByTool: performanceByTool.map(tool => ({
        toolName: tool.toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        totalRequests: tool.totalRequests,
        successRate: Math.round(tool.successRate * 100) / 100,
        avgResponseTime: Math.round(tool.avgResponseTime * 100) / 100,
        maxResponseTime: Math.round(tool.maxResponseTime * 100) / 100,
        minResponseTime: Math.round(tool.minResponseTime * 100) / 100
      })),
      performanceTrends: performanceTrends.map(trend => ({
        date: trend.date,
        totalRequests: trend.totalRequests,
        successRate: Math.round(trend.successRate * 100) / 100,
        avgResponseTime: Math.round(trend.avgResponseTime * 100) / 100
      })),
      errorAnalysis: errorAnalysis.map(error => ({
        toolName: error.toolSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        errorCount: error.errorCount,
        uniqueErrorTypes: error.uniqueErrorTypes,
        errorTypes: error.errorTypes.filter((type: string) => type && type !== 'null')
      }))
    };

    // Log analytics access
    await AdminAuth.logActivity(
      adminSession.id,
      'viewed',
      'performance_analytics',
      { range, totalRequests: overallMetrics.totalRequests }
    );

    return NextResponse.json(performanceData);

  } catch (error) {
    console.error('Performance analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch performance analytics data' },
      { status: 500 }
    );
  }
} 