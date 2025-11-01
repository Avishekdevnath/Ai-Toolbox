import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { performanceTracker } from '@/middleware/performanceTracking';
import { enhancedRateLimiter } from '@/lib/enhancedRateLimiter';
import { queryProfiler } from '@/lib/queryProfiler';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  
  try {
    // Database health check
    const db = await getDatabase();
    const collections = await db.db.listCollections().toArray();
    const collectionNames = collections.map(col => col.name);
    
    // Get database stats
    const dbStats = await db.db.stats();
    const dbHealthCheckTime = Date.now() - startTime;

    // Performance metrics
    const perfStats = performanceTracker.getStats();
    
    // Rate limiter stats
    const rateLimitStats = enhancedRateLimiter.getStats();
    
    // Query profiler stats
    const queryStats = queryProfiler.getStats();
    
    // Memory usage
    const memoryUsage = process.memoryUsage();
    const memoryStats = {
      rss: Math.round(memoryUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memoryUsage.external / 1024 / 1024), // MB
      heapUsagePercent: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
    };

    // System uptime
    const uptime = process.uptime();
    const uptimeFormatted = {
      seconds: Math.floor(uptime),
      minutes: Math.floor(uptime / 60),
      hours: Math.floor(uptime / 3600),
      days: Math.floor(uptime / 86400),
      formatted: `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
    };

    // Environment info
    const environment = {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      env: process.env.NODE_ENV || 'development',
    };

    // Calculate overall health score (0-100)
    let healthScore = 100;
    
    // Deduct points for issues
    if (perfStats.averageResponseTime > 100) healthScore -= 10;
    if (perfStats.averageResponseTime > 200) healthScore -= 10;
    if (perfStats.errorRate > 1) healthScore -= 10;
    if (perfStats.errorRate > 5) healthScore -= 10;
    if (queryStats.averageQueriesPerRequest > 5) healthScore -= 10;
    if (queryStats.averageQueriesPerRequest > 10) healthScore -= 10;
    if (memoryStats.heapUsagePercent > 80) healthScore -= 10;
    if (memoryStats.heapUsagePercent > 90) healthScore -= 10;
    if (dbHealthCheckTime > 100) healthScore -= 5;

    const healthStatus = healthScore >= 90 ? 'excellent' : 
                        healthScore >= 70 ? 'good' :
                        healthScore >= 50 ? 'fair' : 'poor';

    return NextResponse.json({
      success: true,
      status: 'healthy',
      healthScore,
      healthStatus,
      timestamp: new Date().toISOString(),
      
      database: {
        status: 'connected',
        responseTime: dbHealthCheckTime,
        collections: collectionNames,
        collectionCount: collectionNames.length,
        dataSize: Math.round(dbStats.dataSize / 1024 / 1024), // MB
        indexSize: Math.round(dbStats.indexSize / 1024 / 1024), // MB
        storageSize: Math.round(dbStats.storageSize / 1024 / 1024), // MB
      },
      
      performance: {
        totalRequests: perfStats.totalRequests,
        averageResponseTime: perfStats.averageResponseTime,
        p95ResponseTime: perfStats.p95ResponseTime,
        p99ResponseTime: perfStats.p99ResponseTime,
        requestsPerSecond: perfStats.requestsPerSecond,
        errorRate: perfStats.errorRate,
        fastestEndpoint: perfStats.fastestEndpoint,
        slowestEndpoint: perfStats.slowestEndpoint,
      },
      
      queries: {
        totalQueries: queryStats.totalQueries,
        averageQueriesPerRequest: queryStats.averageQueriesPerRequest,
        slowQueryCount: queryStats.slowQueryCount,
      },
      
      rateLimiter: {
        activeBuckets: rateLimitStats.totalBuckets,
        activeLogs: rateLimitStats.totalLogs,
        memoryUsage: rateLimitStats.memoryUsage,
      },
      
      system: {
        uptime: uptimeFormatted,
        memory: memoryStats,
        environment,
      },
      
      checks: {
        database: dbHealthCheckTime < 100 ? 'pass' : 'slow',
        responseTime: perfStats.averageResponseTime < 100 ? 'pass' : 'slow',
        errorRate: perfStats.errorRate < 1 ? 'pass' : 'high',
        queryCount: queryStats.averageQueriesPerRequest < 5 ? 'pass' : 'high',
        memory: memoryStats.heapUsagePercent < 80 ? 'pass' : 'high',
      },
    });
  } catch (error: any) {
    console.error('❌ Health check failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        status: 'unhealthy',
        healthScore: 0,
        healthStatus: 'critical',
        error: error.message,
        timestamp: new Date().toISOString(),
        checks: {
          database: 'fail',
          responseTime: 'unknown',
          errorRate: 'unknown',
          queryCount: 'unknown',
          memory: 'unknown',
        },
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/system/health
 * Trigger system maintenance tasks
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'cleanup':
        // Import cleanup function
        const { cleanupOldData } = await import('@/lib/databaseInit');
        const cleanupResult = await cleanupOldData();
        
        return NextResponse.json({
          success: true,
          message: 'Data cleanup completed',
          data: cleanupResult,
        });

      case 'sync':
        // Trigger user sync (this would typically be done by middleware)
        return NextResponse.json({
          success: true,
          message: 'User sync is handled automatically by middleware',
        });

      case 'stats':
        // Refresh statistics
        const stats = await getFullStats();
        
        return NextResponse.json({
          success: true,
          message: 'Statistics refreshed',
          data: stats,
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action',
          validActions: ['cleanup', 'sync', 'stats'],
        }, { status: 400 });
    }

  } catch (error: any) {
    console.error('❌ System maintenance failed:', error);
    
    return NextResponse.json({
      success: false,
      error: 'System maintenance failed',
      details: error.message,
    }, { status: 500 });
  }
} 