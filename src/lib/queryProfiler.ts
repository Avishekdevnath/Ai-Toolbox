import mongoose from 'mongoose';

/**
 * Database Query Profiler
 * Tracks and monitors database queries for performance optimization
 */

export interface QueryLog {
  collection: string;
  operation: string;
  query: any;
  duration: number;
  timestamp: string;
  requestId?: string;
}

class QueryProfiler {
  private static instance: QueryProfiler;
  private queryLogs: QueryLog[] = [];
  private readonly MAX_LOGS = 5000;
  private requestQueryCounts = new Map<string, number>();
  private enabled = false;

  private constructor() {}

  static getInstance(): QueryProfiler {
    if (!QueryProfiler.instance) {
      QueryProfiler.instance = new QueryProfiler();
    }
    return QueryProfiler.instance;
  }

  /**
   * Enable query profiling
   */
  enable(): void {
    if (this.enabled) return;

    this.enabled = true;

    // Enable mongoose debug mode
    mongoose.set('debug', (collectionName: string, methodName: string, ...args: any[]) => {
      const log: QueryLog = {
        collection: collectionName,
        operation: methodName,
        query: args[0] || {},
        duration: 0, // Will be updated if we can measure
        timestamp: new Date().toISOString(),
      };

      this.logQuery(log);
    });

    console.log('✅ Query profiler enabled');
  }

  /**
   * Disable query profiling
   */
  disable(): void {
    this.enabled = false;
    mongoose.set('debug', false);
    console.log('🔇 Query profiler disabled');
  }

  /**
   * Log a query
   */
  private logQuery(log: QueryLog): void {
    this.queryLogs.push(log);

    // Keep only last MAX_LOGS entries
    if (this.queryLogs.length > this.MAX_LOGS) {
      this.queryLogs = this.queryLogs.slice(-this.MAX_LOGS);
    }

    // Track query count per request
    if (log.requestId) {
      const count = this.requestQueryCounts.get(log.requestId) || 0;
      this.requestQueryCounts.set(log.requestId, count + 1);
    }
  }

  /**
   * Start tracking queries for a request
   */
  startRequest(requestId: string): void {
    this.requestQueryCounts.set(requestId, 0);
  }

  /**
   * Get query count for a request
   */
  getRequestQueryCount(requestId: string): number {
    return this.requestQueryCounts.get(requestId) || 0;
  }

  /**
   * End tracking for a request
   */
  endRequest(requestId: string): number {
    const count = this.requestQueryCounts.get(requestId) || 0;
    this.requestQueryCounts.delete(requestId);
    
    // Log if query count is high
    if (count > 5) {
      console.warn(`⚠️ High query count: ${count} queries in request ${requestId}`);
    }
    
    return count;
  }

  /**
   * Get all query logs
   */
  getAllLogs(): QueryLog[] {
    return [...this.queryLogs];
  }

  /**
   * Get query logs for a specific collection
   */
  getLogsByCollection(collection: string): QueryLog[] {
    return this.queryLogs.filter(log => log.collection === collection);
  }

  /**
   * Get slow queries (duration > threshold)
   */
  getSlowQueries(thresholdMs: number = 100): QueryLog[] {
    return this.queryLogs.filter(log => log.duration > thresholdMs);
  }

  /**
   * Get query statistics
   */
  getStats(): {
    totalQueries: number;
    queriesByCollection: Record<string, number>;
    queriesByOperation: Record<string, number>;
    averageQueriesPerRequest: number;
    slowQueryCount: number;
  } {
    const queriesByCollection: Record<string, number> = {};
    const queriesByOperation: Record<string, number> = {};
    let slowQueryCount = 0;

    this.queryLogs.forEach(log => {
      // Count by collection
      queriesByCollection[log.collection] = (queriesByCollection[log.collection] || 0) + 1;
      
      // Count by operation
      queriesByOperation[log.operation] = (queriesByOperation[log.operation] || 0) + 1;
      
      // Count slow queries
      if (log.duration > 100) {
        slowQueryCount++;
      }
    });

    // Calculate average queries per request
    const requestCounts = Array.from(this.requestQueryCounts.values());
    const averageQueriesPerRequest = requestCounts.length > 0
      ? Math.round((requestCounts.reduce((a, b) => a + b, 0) / requestCounts.length) * 10) / 10
      : 0;

    return {
      totalQueries: this.queryLogs.length,
      queriesByCollection,
      queriesByOperation,
      averageQueriesPerRequest,
      slowQueryCount,
    };
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.queryLogs = [];
    this.requestQueryCounts.clear();
  }

  /**
   * Get query recommendations
   */
  getRecommendations(): string[] {
    const stats = this.getStats();
    const recommendations: string[] = [];

    // Check for high query count
    if (stats.averageQueriesPerRequest > 5) {
      recommendations.push(
        `⚠️ Average ${stats.averageQueriesPerRequest} queries per request. Consider using aggregation or fewer lookups.`
      );
    }

    // Check for slow queries
    if (stats.slowQueryCount > 0) {
      recommendations.push(
        `⚠️ ${stats.slowQueryCount} slow queries detected. Consider adding indexes or optimizing queries.`
      );
    }

    // Check for common N+1 patterns
    const findOperations = stats.queriesByOperation['find'] || 0;
    const findOneOperations = stats.queriesByOperation['findOne'] || 0;
    
    if (findOperations + findOneOperations > stats.totalQueries * 0.8) {
      recommendations.push(
        '⚠️ High ratio of find operations. Consider using $lookup or populate with lean() for better performance.'
      );
    }

    if (recommendations.length === 0) {
      recommendations.push('✅ No major performance issues detected!');
    }

    return recommendations;
  }
}

export const queryProfiler = QueryProfiler.getInstance();

/**
 * Measure query execution time
 */
export async function measureQuery<T>(
  operation: string,
  queryFunc: () => Promise<T>
): Promise<{ result: T; duration: number; queryCount: number }> {
  const requestId = crypto.randomUUID();
  queryProfiler.startRequest(requestId);
  
  const start = Date.now();
  const result = await queryFunc();
  const duration = Date.now() - start;
  
  const queryCount = queryProfiler.endRequest(requestId);

  if (duration > 100) {
    console.warn(`⚠️ Slow ${operation}: ${duration}ms, ${queryCount} queries`);
  }

  return { result, duration, queryCount };
}

