import { NextRequest, NextResponse } from 'next/server';

/**
 * Performance Tracking Middleware
 * Tracks response times, query counts, and other metrics for all API endpoints
 */

export interface PerformanceMetrics {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: string;
  userId?: string;
  queryCount?: number;
  payloadSize?: number;
  compressionRatio?: number;
}

class PerformanceTracker {
  private static instance: PerformanceTracker;
  private metrics: PerformanceMetrics[] = [];
  private readonly MAX_METRICS = 10000; // Store last 10k requests
  private queryCountMap = new Map<string, number>();

  private constructor() {}

  static getInstance(): PerformanceTracker {
    if (!PerformanceTracker.instance) {
      PerformanceTracker.instance = new PerformanceTracker();
    }
    return PerformanceTracker.instance;
  }

  /**
   * Track a request/response performance
   */
  trackRequest(metric: PerformanceMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last MAX_METRICS entries
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS);
    }

    // Log slow requests (>100ms)
    if (metric.responseTime > 100) {
      console.warn(`⚠️ Slow request: ${metric.method} ${metric.endpoint} took ${metric.responseTime}ms`);
    }
  }

  /**
   * Track database query count for a request
   */
  trackQueryCount(requestId: string, count: number): void {
    this.queryCountMap.set(requestId, count);
  }

  /**
   * Get query count for a request
   */
  getQueryCount(requestId: string): number {
    return this.queryCountMap.get(requestId) || 0;
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific endpoint
   */
  getMetricsByEndpoint(endpoint: string): PerformanceMetrics[] {
    return this.metrics.filter(m => m.endpoint === endpoint);
  }

  /**
   * Calculate average response time for an endpoint
   */
  getAverageResponseTime(endpoint?: string): number {
    const filteredMetrics = endpoint 
      ? this.getMetricsByEndpoint(endpoint)
      : this.metrics;

    if (filteredMetrics.length === 0) return 0;

    const sum = filteredMetrics.reduce((acc, m) => acc + m.responseTime, 0);
    return Math.round(sum / filteredMetrics.length);
  }

  /**
   * Get performance statistics
   */
  getStats(): {
    totalRequests: number;
    averageResponseTime: number;
    p95ResponseTime: number;
    p99ResponseTime: number;
    slowestEndpoint: { endpoint: string; avgTime: number } | null;
    fastestEndpoint: { endpoint: string; avgTime: number } | null;
    requestsPerSecond: number;
    errorRate: number;
  } {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        averageResponseTime: 0,
        p95ResponseTime: 0,
        p99ResponseTime: 0,
        slowestEndpoint: null,
        fastestEndpoint: null,
        requestsPerSecond: 0,
        errorRate: 0,
      };
    }

    // Calculate average
    const avgResponseTime = this.getAverageResponseTime();

    // Calculate percentiles
    const sortedTimes = [...this.metrics].sort((a, b) => a.responseTime - b.responseTime);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);
    const p95ResponseTime = sortedTimes[p95Index]?.responseTime || 0;
    const p99ResponseTime = sortedTimes[p99Index]?.responseTime || 0;

    // Group by endpoint
    const endpointStats = new Map<string, { total: number; count: number }>();
    this.metrics.forEach(m => {
      const stats = endpointStats.get(m.endpoint) || { total: 0, count: 0 };
      stats.total += m.responseTime;
      stats.count += 1;
      endpointStats.set(m.endpoint, stats);
    });

    // Find slowest and fastest
    let slowest: { endpoint: string; avgTime: number } | null = null;
    let fastest: { endpoint: string; avgTime: number } | null = null;

    endpointStats.forEach((stats, endpoint) => {
      const avgTime = stats.total / stats.count;
      if (!slowest || avgTime > slowest.avgTime) {
        slowest = { endpoint, avgTime: Math.round(avgTime) };
      }
      if (!fastest || avgTime < fastest.avgTime) {
        fastest = { endpoint, avgTime: Math.round(avgTime) };
      }
    });

    // Calculate requests per second (based on last minute)
    const oneMinuteAgo = Date.now() - 60000;
    const recentRequests = this.metrics.filter(
      m => new Date(m.timestamp).getTime() > oneMinuteAgo
    );
    const requestsPerSecond = Math.round(recentRequests.length / 60);

    // Calculate error rate
    const errorCount = this.metrics.filter(m => m.statusCode >= 400).length;
    const errorRate = Math.round((errorCount / this.metrics.length) * 100 * 10) / 10;

    return {
      totalRequests: this.metrics.length,
      averageResponseTime: avgResponseTime,
      p95ResponseTime,
      p99ResponseTime,
      slowestEndpoint: slowest,
      fastestEndpoint: fastest,
      requestsPerSecond,
      errorRate,
    };
  }

  /**
   * Clear all metrics
   */
  clearMetrics(): void {
    this.metrics = [];
    this.queryCountMap.clear();
  }
}

export const performanceTracker = PerformanceTracker.getInstance();

/**
 * Middleware wrapper for tracking performance
 */
export async function withPerformanceTracking(
  request: NextRequest,
  endpoint: string,
  handler: () => Promise<NextResponse>
): Promise<NextResponse> {
  const startTime = Date.now();
  const requestId = crypto.randomUUID();

  try {
    // Execute the actual handler
    const response = await handler();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Get response size (approximate)
    const responseText = await response.clone().text();
    const payloadSize = new Blob([responseText]).size;

    // Track the metric
    performanceTracker.trackRequest({
      endpoint,
      method: request.method,
      statusCode: response.status,
      responseTime,
      timestamp: new Date().toISOString(),
      userId: request.headers.get('x-user-id') || undefined,
      queryCount: performanceTracker.getQueryCount(requestId),
      payloadSize,
    });

    // Add performance headers
    response.headers.set('X-Response-Time', `${responseTime}ms`);
    response.headers.set('X-Request-Id', requestId);

    return response;
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Track failed request
    performanceTracker.trackRequest({
      endpoint,
      method: request.method,
      statusCode: 500,
      responseTime,
      timestamp: new Date().toISOString(),
      userId: request.headers.get('x-user-id') || undefined,
      queryCount: performanceTracker.getQueryCount(requestId),
    });

    throw error;
  }
}

/**
 * Utility to measure async operations
 */
export async function measureOperation<T>(
  operationName: string,
  operation: () => Promise<T>
): Promise<{ result: T; duration: number }> {
  const start = Date.now();
  const result = await operation();
  const duration = Date.now() - start;

  if (duration > 50) {
    console.warn(`⚠️ Slow operation: ${operationName} took ${duration}ms`);
  }

  return { result, duration };
}

