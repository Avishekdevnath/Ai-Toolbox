import { auth, currentUser } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { userService } from './userService';
import { toolUsageService } from './toolUsageService';
import { determineProvider } from './utils/providerUtils';

/**
 * Middleware to sync user data and track activity
 */
export async function authMiddleware(request: NextRequest) {
  try {
    // Get user from Clerk
    const { userId } = await auth();
    const user = await currentUser();

    if (userId && user) {
      // Sync user with MongoDB
      try {
        await userService.syncUserFromClerk(user);
        
        // Track login with provider information
        const provider = determineProvider(user);
        const ipAddress = getClientIP(request);
        const userAgent = request.headers.get('user-agent') || '';
        
        await userService.trackLogin(userId, {
          ip: ipAddress,
          userAgent,
          provider,
          location: undefined // TODO: Add geolocation service
        });
        
        console.log(`✅ User synced and login tracked: ${user.emailAddresses[0]?.emailAddress} (${provider})`);
      } catch (error) {
        console.error('❌ Error syncing user in middleware:', error);
        // Don't block the request if sync fails
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error('❌ Error in auth middleware:', error);
    return NextResponse.next();
  }
}

/**
 * Get client IP address from request
 */
function getClientIP(request: NextRequest): string {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         request.headers.get('x-client-ip') ||
         request.ip ||
         'unknown';
}

/**
 * Track tool usage middleware
 */
export async function trackToolUsage(
  request: NextRequest,
  toolSlug: string,
  toolName: string,
  action: string,
  inputData?: any,
  outputData?: any,
  processingTime?: number,
  success = true,
  errorMessage?: string
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = getClientIP(request);

    // Track usage
    await toolUsageService.trackUsage({
      userId: userId || undefined,
      toolSlug,
      toolName,
      action,
      inputData,
      outputData,
      processingTime,
      success,
      errorMessage,
      userAgent,
      ipAddress,
    });

    // Increment user stats if authenticated
    if (userId) {
      await userService.incrementUserStats(userId, 'totalToolsUsed');
      await userService.incrementToolUsage(userId, toolName);
    }

    console.log(`✅ Tool usage tracked: ${toolSlug} - ${action} (${userId ? 'authenticated' : 'anonymous'})`);
  } catch (error) {
    console.error('❌ Error tracking tool usage:', error);
    // Don't throw error for usage tracking as it's not critical
  }
}

/**
 * Get user from request with MongoDB sync
 */
export async function getAuthenticatedUser() {
  try {
    const { userId } = await auth();
    const clerkUser = await currentUser();

    if (!userId || !clerkUser) {
      return null;
    }

    // Get user from MongoDB
    const user = await userService.getUserByClerkId(userId);
    
    if (!user) {
      // Sync user if not found in MongoDB
      return await userService.syncUserFromClerk(clerkUser);
    }

    return user;
  } catch (error) {
    console.error('❌ Error getting authenticated user:', error);
    return null;
  }
}

/**
 * Check if user is admin
 */
export async function isAdmin(): Promise<boolean> {
  try {
    const user = await getAuthenticatedUser();
    return user?.role === 'admin';
  } catch (error) {
    console.error('❌ Error checking admin status:', error);
    return false;
  }
}

/**
 * Get user activity summary
 */
export async function getUserActivitySummary(userId: string) {
  try {
    return await userService.getUserActivitySummary(userId);
  } catch (error) {
    console.error('❌ Error getting user activity summary:', error);
    return {
      totalToolsUsed: 0,
      totalUrlsShortened: 0,
      totalAnalyses: 0,
      toolsUsed: [],
      loginCount: 0,
      sessionCount: 0,
      providers: [],
    };
  }
}

/**
 * Track API request
 */
export async function trackApiRequest(
  request: NextRequest,
  endpoint: string,
  method: string,
  processingTime?: number,
  success = true,
  errorMessage?: string
) {
  try {
    const { userId } = await auth();
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = getClientIP(request);

    // Track API usage
    await toolUsageService.trackUsage({
      userId: userId || undefined,
      toolSlug: 'api',
      toolName: 'API',
      action: `${method} ${endpoint}`,
      inputData: { endpoint, method },
      processingTime,
      success,
      errorMessage,
      userAgent,
      ipAddress,
      metadata: {
        type: 'api_request',
        endpoint,
        method,
      },
    });

    console.log(`✅ API request tracked: ${method} ${endpoint} (${userId ? 'authenticated' : 'anonymous'})`);
  } catch (error) {
    console.error('❌ Error tracking API request:', error);
  }
}

/**
 * Track user session start
 */
export async function trackSessionStart(request: NextRequest) {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (userId && user) {
      const provider = determineProvider(user);
      const ipAddress = getClientIP(request);
      const userAgent = request.headers.get('user-agent') || '';

      // Track session start
      await userService.trackLogin(userId, {
        ip: ipAddress,
        userAgent,
        provider,
        location: undefined
      });

      // Increment session count
      await userService.incrementUserStats(userId, 'sessionCount');

      console.log(`✅ Session start tracked: ${userId} (${provider})`);
    }
  } catch (error) {
    console.error('❌ Error tracking session start:', error);
  }
}

/**
 * Track user activity (page views, tool usage, etc.)
 */
export async function trackUserActivity(
  request: NextRequest,
  activity: {
    type: 'page_view' | 'tool_view' | 'tool_use' | 'api_call';
    resource: string;
    metadata?: Record<string, any>;
  }
) {
  try {
    const { userId } = await auth();
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = getClientIP(request);

    // Track activity
    await toolUsageService.trackUsage({
      userId: userId || undefined,
      toolSlug: 'activity',
      toolName: 'User Activity',
      action: activity.type,
      inputData: {
        resource: activity.resource,
        ...activity.metadata
      },
      success: true,
      userAgent,
      ipAddress,
      metadata: {
        type: 'user_activity',
        activityType: activity.type,
        resource: activity.resource,
        ...activity.metadata
      },
    });

    // Update user's last activity if authenticated
    if (userId) {
      await userService.incrementUserStats(userId, 'totalToolsUsed');
    }

    console.log(`✅ User activity tracked: ${activity.type} - ${activity.resource} (${userId ? 'authenticated' : 'anonymous'})`);
  } catch (error) {
    console.error('❌ Error tracking user activity:', error);
  }
} 