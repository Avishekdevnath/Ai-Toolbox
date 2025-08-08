import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, getDatabase } from '@/lib/mongodb';
import { AuthService } from '@/lib/authService';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Analytics Performance API - Starting authentication check...');
    
    // Verify admin authentication using AuthService
    const user = await AuthService.getSession(request);
    
    console.log('🔍 Analytics Performance API - Auth result:', { 
      hasUser: !!user, 
      isAdmin: user?.isAdmin,
      email: user?.email 
    });
    
    if (!user || !user.isAdmin) {
      console.log('❌ Analytics Performance API - Unauthorized:', { user: !!user, isAdmin: user?.isAdmin });
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('✅ Analytics Performance API - Authentication successful');

    // Connect to database
    await connectToDatabase();
    const dbConnection = await getDatabase();
    const db = dbConnection.db;

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '7d';

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

    // Get performance metrics from toolusages collection
    const performanceMetrics = await db.collection('toolusages')
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
            avgResponseTime: { $avg: { $ifNull: ['$responseTime', 100] } }, // Default 100ms if not available
            successCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'success'] }, 1, 0]
              }
            }
          }
        },
        {
          $project: {
            toolSlug: '$_id',
            avgResponseTime: { $round: ['$avgResponseTime', 2] },
            successRate: {
              $round: [
                { $multiply: [{ $divide: ['$successCount', '$totalRequests'] }, 100] },
                2
              ]
            }
          }
        },
        {
          $sort: { avgResponseTime: 1 }
        }
      ]).toArray();

    // Calculate overall metrics
    const totalRequests = performanceMetrics.reduce((sum, metric) => sum + (metric.totalRequests || 0), 0);
    const avgResponseTime = performanceMetrics.length > 0 
      ? performanceMetrics.reduce((sum, metric) => sum + metric.avgResponseTime, 0) / performanceMetrics.length 
      : 0;
    const successRate = performanceMetrics.length > 0
      ? performanceMetrics.reduce((sum, metric) => sum + metric.successRate, 0) / performanceMetrics.length
      : 100;
    const errorRate = 100 - successRate;
    const uptime = 99.9; // Placeholder - in real system this would be calculated from logs

    const result = {
      avgResponseTime: Math.round(avgResponseTime * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      uptime,
      performanceMetrics
    };

    return NextResponse.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Performance analytics API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
} 