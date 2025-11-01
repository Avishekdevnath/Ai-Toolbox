import { NextRequest, NextResponse } from 'next/server';
import { performanceTracker } from '@/middleware/performanceTracking';
import { enhancedRateLimiter } from '@/lib/enhancedRateLimiter';
import { queryProfiler } from '@/lib/queryProfiler';

/**
 * GET /api/metrics/performance
 * Get comprehensive performance metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get performance stats
    const performanceStats = performanceTracker.getStats();
    
    // Get rate limiter stats
    const rateLimiterStats = enhancedRateLimiter.getStats();
    
    // Get query profiler stats
    const queryStats = queryProfiler.getStats();
    
    // Get all metrics for detailed analysis
    const allMetrics = performanceTracker.getAllMetrics();
    
    // Calculate endpoint-specific metrics
    const endpointMetrics = new Map<string, {
      count: number;
      avgResponseTime: number;
      minResponseTime: number;
      maxResponseTime: number;
      errorRate: number;
      avgQueryCount: number;
    }>();

    allMetrics.forEach(metric => {
      const existing = endpointMetrics.get(metric.endpoint) || {
        count: 0,
        avgResponseTime: 0,
        minResponseTime: Infinity,
        maxResponseTime: 0,
        errorRate: 0,
        avgQueryCount: 0,
      };

      existing.count += 1;
      existing.avgResponseTime = 
        (existing.avgResponseTime * (existing.count - 1) + metric.responseTime) / existing.count;
      existing.minResponseTime = Math.min(existing.minResponseTime, metric.responseTime);
      existing.maxResponseTime = Math.max(existing.maxResponseTime, metric.responseTime);
      
      if (metric.statusCode >= 400) {
        existing.errorRate = ((existing.errorRate * (existing.count - 1)) + 100) / existing.count;
      } else {
        existing.errorRate = (existing.errorRate * (existing.count - 1)) / existing.count;
      }

      if (metric.queryCount) {
        existing.avgQueryCount = 
          (existing.avgQueryCount * (existing.count - 1) + metric.queryCount) / existing.count;
      }

      endpointMetrics.set(metric.endpoint, existing);
    });

    // Convert to array and sort by avg response time
    const endpointMetricsArray = Array.from(endpointMetrics.entries())
      .map(([endpoint, stats]) => ({
        endpoint,
        ...stats,
        avgResponseTime: Math.round(stats.avgResponseTime),
        avgQueryCount: Math.round(stats.avgQueryCount * 10) / 10,
        errorRate: Math.round(stats.errorRate * 10) / 10,
      }))
      .sort((a, b) => a.avgResponseTime - b.avgResponseTime);

    // Get top 10 fastest and slowest endpoints
    const fastestEndpoints = endpointMetricsArray.slice(0, 10);
    const slowestEndpoints = endpointMetricsArray.slice(-10).reverse();

    // Calculate throughput metrics
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const fiveMinutesAgo = now - 300000;
    const oneHourAgo = now - 3600000;

    const recentMetrics = {
      lastMinute: allMetrics.filter(m => new Date(m.timestamp).getTime() > oneMinuteAgo).length,
      lastFiveMinutes: allMetrics.filter(m => new Date(m.timestamp).getTime() > fiveMinutesAgo).length,
      lastHour: allMetrics.filter(m => new Date(m.timestamp).getTime() > oneHourAgo).length,
    };

    const throughput = {
      requestsPerSecond: Math.round(recentMetrics.lastMinute / 60),
      requestsPerMinute: recentMetrics.lastMinute,
      requestsPerHour: recentMetrics.lastHour,
    };

    // Query profiler recommendations
    const recommendations = queryProfiler.getRecommendations();

    // Calculate success rate
    const successfulRequests = allMetrics.filter(m => m.statusCode < 400).length;
    const successRate = allMetrics.length > 0 
      ? Math.round((successfulRequests / allMetrics.length) * 100 * 10) / 10
      : 0;

    return NextResponse.json({
      success: true,
      data: {
        summary: {
          totalRequests: performanceStats.totalRequests,
          averageResponseTime: performanceStats.averageResponseTime,
          p95ResponseTime: performanceStats.p95ResponseTime,
          p99ResponseTime: performanceStats.p99ResponseTime,
          successRate,
          errorRate: performanceStats.errorRate,
          ...throughput,
        },
        endpoints: {
          fastest: fastestEndpoints,
          slowest: slowestEndpoints,
          all: endpointMetricsArray,
        },
        database: {
          totalQueries: queryStats.totalQueries,
          averageQueriesPerRequest: queryStats.averageQueriesPerRequest,
          slowQueryCount: queryStats.slowQueryCount,
          queriesByCollection: queryStats.queriesByCollection,
          queriesByOperation: queryStats.queriesByOperation,
        },
        rateLimiter: rateLimiterStats,
        recommendations,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('❌ Failed to get performance metrics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve performance metrics' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/metrics/performance
 * Clear performance metrics or perform actions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'clear':
        performanceTracker.clearMetrics();
        queryProfiler.clearLogs();
        return NextResponse.json({
          success: true,
          message: 'Performance metrics cleared',
        });

      case 'enable-profiler':
        queryProfiler.enable();
        return NextResponse.json({
          success: true,
          message: 'Query profiler enabled',
        });

      case 'disable-profiler':
        queryProfiler.disable();
        return NextResponse.json({
          success: true,
          message: 'Query profiler disabled',
        });

      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid action',
            validActions: ['clear', 'enable-profiler', 'disable-profiler'],
          },
          { status: 400 }
        );
    }
  } catch (error: any) {
    console.error('❌ Failed to perform action:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to perform action' },
      { status: 500 }
    );
  }
}

