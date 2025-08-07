import { NextRequest, NextResponse } from 'next/server';
import { toolUsageService } from '@/lib/toolUsageService';
import { createHash } from 'crypto';

// Generate anonymous user ID
function generateAnonymousUserId(ipAddress: string, userAgent: string): string {
  const hash = createHash('sha256')
    .update(`${ipAddress}-${userAgent}`)
    .digest('hex');
  return `anon_${hash.substring(0, 16)}`;
}

export async function POST(request: NextRequest) {
  try {
    // Generate anonymous user ID for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('x-client-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const userId = generateAnonymousUserId(ipAddress, userAgent);
    
    const body = await request.json();
    const {
      toolSlug,
      toolName,
      action,
      inputData,
      outputData,
      processingTime,
      success = true,
      errorMessage,
      metadata
    } = body;

    // Validate required fields
    if (!toolSlug || !toolName || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: toolSlug, toolName, action' },
        { status: 400 }
      );
    }

    // Track usage with enhanced data
    const usageData = {
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
      metadata: {
        ...metadata,
        authenticated: false, // Always false since we're not using authentication
        provider: 'anonymous',
        timestamp: new Date().toISOString()
      }
    };

    // Track usage
    const usage = await toolUsageService.trackUsage(usageData);

    // Return success response
    return NextResponse.json({
      success: true,
      usageId: usage._id,
      message: 'Usage tracked successfully',
      data: {
        toolSlug,
        toolName,
        action,
        success,
        timestamp: usage.createdAt,
        authenticated: false
      }
    });

  } catch (error: any) {
    console.error('❌ Error tracking tool usage:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to track usage',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Generate anonymous user ID for tracking
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('x-client-ip') ||
                     'unknown';
    const userAgent = request.headers.get('user-agent') || '';
    const userId = generateAnonymousUserId(ipAddress, userAgent);
    
    const { searchParams } = new URL(request.url);
    
    const toolSlug = searchParams.get('toolSlug');
    const period = parseInt(searchParams.get('period') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');

    let stats;
    
    if (toolSlug) {
      // Get specific tool stats
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      stats = await toolUsageService.getToolUsageStats(toolSlug, startDate);
    } else {
      // Get user's tool usage history
      const usage = await toolUsageService.getUserToolUsage(userId, limit);
      stats = {
        userUsage: usage,
        totalUsage: usage.length
      };
    }

    return NextResponse.json({
      success: true,
      data: stats
    });

  } catch (error: any) {
    console.error('❌ Error getting usage stats:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to get usage statistics',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
} 