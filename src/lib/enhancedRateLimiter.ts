import { NextRequest, NextResponse } from 'next/server';

/**
 * Enhanced Rate Limiter with:
 * - Differentiated limits for authenticated vs anonymous users
 * - Burst protection with token bucket algorithm
 * - Per-endpoint rate limiting
 * - Sliding window rate limiting
 */

interface RateLimitConfig {
  anonymous: number;      // requests per minute for anonymous users
  authenticated: number;  // requests per minute for authenticated users
  burstSize?: number;    // maximum burst size
  windowMs?: number;     // time window in milliseconds
}

interface TokenBucket {
  tokens: number;
  lastRefill: number;
  maxTokens: number;
  refillRate: number; // tokens per millisecond
}

class EnhancedRateLimiter {
  private static instance: EnhancedRateLimiter;
  private tokenBuckets = new Map<string, TokenBucket>();
  private requestLog = new Map<string, number[]>();
  
  // Default configuration
  private defaultConfig: RateLimitConfig = {
    anonymous: 200,        // 200 requests per minute
    authenticated: 500,    // 500 requests per minute
    burstSize: 50,        // Allow bursts of 50 requests
    windowMs: 60000,      // 1 minute window
  };

  // Per-endpoint configurations
  private endpointConfigs = new Map<string, RateLimitConfig>([
    ['/api/ai', { anonymous: 50, authenticated: 200, burstSize: 20 }],
    ['/api/auth', { anonymous: 100, authenticated: 200, burstSize: 30 }],
    ['/api/url-shortener', { anonymous: 1000, authenticated: 2000, burstSize: 100 }],
    ['/api/forms', { anonymous: 100, authenticated: 500, burstSize: 50 }],
    ['/api/collaborate', { anonymous: 500, authenticated: 1000, burstSize: 100 }],
  ]);

  private constructor() {
    // Cleanup old entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  static getInstance(): EnhancedRateLimiter {
    if (!EnhancedRateLimiter.instance) {
      EnhancedRateLimiter.instance = new EnhancedRateLimiter();
    }
    return EnhancedRateLimiter.instance;
  }

  /**
   * Get rate limit configuration for an endpoint
   */
  private getConfig(endpoint: string): RateLimitConfig {
    // Check for exact match
    const exactMatch = this.endpointConfigs.get(endpoint);
    if (exactMatch) return exactMatch;

    // Check for prefix match
    for (const [pattern, config] of this.endpointConfigs) {
      if (endpoint.startsWith(pattern)) {
        return config;
      }
    }

    return this.defaultConfig;
  }

  /**
   * Get unique identifier for rate limiting
   */
  private getIdentifier(request: NextRequest, isAuthenticated: boolean): string {
    if (isAuthenticated) {
      const userId = request.headers.get('x-user-id') || 
                     request.cookies.get('user_session')?.value;
      return `auth:${userId}`;
    }

    // Use IP address for anonymous users
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] ||
               request.headers.get('x-real-ip') ||
               request.headers.get('x-client-ip') ||
               'unknown';
    
    return `anon:${ip}`;
  }

  /**
   * Token bucket algorithm for burst protection
   */
  private checkTokenBucket(
    identifier: string,
    maxTokens: number,
    refillRate: number
  ): { allowed: boolean; remainingTokens: number } {
    const now = Date.now();
    let bucket = this.tokenBuckets.get(identifier);

    if (!bucket) {
      bucket = {
        tokens: maxTokens,
        lastRefill: now,
        maxTokens,
        refillRate,
      };
      this.tokenBuckets.set(identifier, bucket);
    }

    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill;
    const tokensToAdd = timePassed * bucket.refillRate;
    bucket.tokens = Math.min(bucket.maxTokens, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;

    // Check if we have tokens available
    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { allowed: true, remainingTokens: Math.floor(bucket.tokens) };
    }

    return { allowed: false, remainingTokens: 0 };
  }

  /**
   * Sliding window rate limiting
   */
  private checkSlidingWindow(
    identifier: string,
    limit: number,
    windowMs: number
  ): { allowed: boolean; remainingRequests: number; resetTime: number } {
    const now = Date.now();
    const windowStart = now - windowMs;

    // Get or create request log
    let requests = this.requestLog.get(identifier) || [];
    
    // Remove old requests outside the window
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if limit exceeded
    const allowed = requests.length < limit;
    
    if (allowed) {
      requests.push(now);
      this.requestLog.set(identifier, requests);
    }

    const remainingRequests = Math.max(0, limit - requests.length);
    const oldestRequest = requests[0] || now;
    const resetTime = oldestRequest + windowMs;

    return { allowed, remainingRequests, resetTime };
  }

  /**
   * Check rate limit with both token bucket and sliding window
   */
  checkRateLimit(
    request: NextRequest,
    endpoint: string,
    isAuthenticated: boolean = false
  ): {
    allowed: boolean;
    remainingRequests: number;
    resetTime: number;
    limit: number;
    retryAfter?: number;
  } {
    const config = this.getConfig(endpoint);
    const identifier = `${endpoint}:${this.getIdentifier(request, isAuthenticated)}`;
    
    // Determine limit based on authentication status
    const limit = isAuthenticated ? config.authenticated : config.anonymous;
    const windowMs = config.windowMs || this.defaultConfig.windowMs!;
    const burstSize = config.burstSize || this.defaultConfig.burstSize!;

    // Check token bucket for burst protection
    const refillRate = burstSize / windowMs; // tokens per millisecond
    const burstCheck = this.checkTokenBucket(identifier + ':burst', burstSize, refillRate);

    if (!burstCheck.allowed) {
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: Date.now() + 1000, // Reset in 1 second
        limit,
        retryAfter: 1,
      };
    }

    // Check sliding window for rate limit
    const windowCheck = this.checkSlidingWindow(identifier, limit, windowMs);

    if (!windowCheck.allowed) {
      const retryAfter = Math.ceil((windowCheck.resetTime - Date.now()) / 1000);
      return {
        allowed: false,
        remainingRequests: 0,
        resetTime: windowCheck.resetTime,
        limit,
        retryAfter,
      };
    }

    return {
      allowed: true,
      remainingRequests: windowCheck.remainingRequests,
      resetTime: windowCheck.resetTime,
      limit,
    };
  }

  /**
   * Cleanup old entries
   */
  private cleanup(): void {
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10 minutes

    // Clean up old token buckets
    for (const [key, bucket] of this.tokenBuckets) {
      if (now - bucket.lastRefill > maxAge) {
        this.tokenBuckets.delete(key);
      }
    }

    // Clean up old request logs
    for (const [key, requests] of this.requestLog) {
      const recentRequests = requests.filter(timestamp => now - timestamp < maxAge);
      if (recentRequests.length === 0) {
        this.requestLog.delete(key);
      } else {
        this.requestLog.set(key, recentRequests);
      }
    }

    console.log(`🧹 Rate limiter cleanup: ${this.tokenBuckets.size} buckets, ${this.requestLog.size} logs`);
  }

  /**
   * Get rate limit stats
   */
  getStats(): {
    totalBuckets: number;
    totalLogs: number;
    memoryUsage: number;
  } {
    return {
      totalBuckets: this.tokenBuckets.size,
      totalLogs: this.requestLog.size,
      memoryUsage: Math.round((this.tokenBuckets.size + this.requestLog.size) * 100 / 1024), // KB
    };
  }
}

export const enhancedRateLimiter = EnhancedRateLimiter.getInstance();

/**
 * Rate limit middleware wrapper
 */
export function withRateLimit(
  request: NextRequest,
  endpoint: string,
  isAuthenticated: boolean = false
): NextResponse | null {
  const result = enhancedRateLimiter.checkRateLimit(request, endpoint, isAuthenticated);

  if (!result.allowed) {
    const response = NextResponse.json(
      {
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        limit: result.limit,
        retryAfter: result.retryAfter,
      },
      { status: 429 }
    );

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', result.limit.toString());
    response.headers.set('X-RateLimit-Remaining', '0');
    response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
    response.headers.set('Retry-After', (result.retryAfter || 60).toString());

    return response;
  }

  // Rate limit passed - will be added to response later
  return null;
}

/**
 * Add rate limit headers to a successful response
 */
export function addRateLimitHeaders(
  response: NextResponse,
  request: NextRequest,
  endpoint: string,
  isAuthenticated: boolean = false
): NextResponse {
  const result = enhancedRateLimiter.checkRateLimit(request, endpoint, isAuthenticated);

  response.headers.set('X-RateLimit-Limit', result.limit.toString());
  response.headers.set('X-RateLimit-Remaining', result.remainingRequests.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());

  return response;
}

