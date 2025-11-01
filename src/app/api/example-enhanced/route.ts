import { NextRequest, NextResponse } from 'next/server';
import { withPerformanceTracking } from '@/middleware/performanceTracking';
import { withRateLimit, addRateLimitHeaders } from '@/lib/enhancedRateLimiter';
import { measureQuery } from '@/lib/queryProfiler';

/**
 * Example API route showing how to use:
 * - Performance tracking
 * - Enhanced rate limiting
 * - Query profiling
 */

export async function GET(request: NextRequest) {
  return withPerformanceTracking(request, '/api/example-enhanced', async () => {
    // Check rate limit first
    const rateLimitResponse = withRateLimit(request, '/api/example-enhanced', false);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    try {
      // Simulate some database work with query profiling
      const { result, duration, queryCount } = await measureQuery(
        'fetch-example-data',
        async () => {
          // Simulate async operation
          await new Promise(resolve => setTimeout(resolve, 10));
          return { data: 'example', timestamp: Date.now() };
        }
      );

      const response = NextResponse.json({
        success: true,
        data: result,
        _meta: {
          queryCount,
          processingTime: duration,
        },
      });

      // Add rate limit headers
      return addRateLimitHeaders(response, request, '/api/example-enhanced', false);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  });
}

export async function POST(request: NextRequest) {
  return withPerformanceTracking(request, '/api/example-enhanced', async () => {
    // Check rate limit with authenticated status
    const isAuthenticated = !!request.headers.get('x-user-id');
    const rateLimitResponse = withRateLimit(request, '/api/example-enhanced', isAuthenticated);
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    try {
      const body = await request.json();

      // Process the request
      const { result, duration, queryCount } = await measureQuery(
        'create-example-data',
        async () => {
          // Your database operations here
          await new Promise(resolve => setTimeout(resolve, 20));
          return { created: true, id: crypto.randomUUID() };
        }
      );

      const response = NextResponse.json({
        success: true,
        data: result,
        _meta: {
          queryCount,
          processingTime: duration,
        },
      });

      return addRateLimitHeaders(response, request, '/api/example-enhanced', isAuthenticated);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }
  });
}

