import { NextRequest, NextResponse } from 'next/server';
import { toolUsageService } from '@/lib/toolUsageService';
import { userService } from '@/lib/userService';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { determineProviderFromClaims } from '@/lib/utils/providerUtils';

function getClaims(request: NextRequest) {
	const token = request.cookies.get('user_session')?.value;
	return token ? verifyAccessToken(token) : null;
}

export async function POST(request: NextRequest) {
  try {
    const claims = getClaims(request);
    
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

    // Get client information
    const userAgent = request.headers.get('user-agent') || '';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     request.headers.get('x-client-ip') ||
                     'unknown';

    // Track usage with enhanced data
    const usageData = {
      userId: claims?.id || undefined,
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
        authenticated: !!claims?.id,
        provider: determineProviderFromClaims(claims),
        timestamp: new Date().toISOString()
      }
    };

    // Track usage
    const usage = await toolUsageService.trackUsage(usageData);

    // Update user statistics if authenticated
    if (claims?.id) {
      await userService.incrementUserStats(claims.id, 'totalToolsUsed');
      await userService.incrementToolUsage(claims.id, toolName);
      
      // Update specific tool usage based on action
      if (action === 'generate' || action === 'analyze') {
        await userService.incrementUserStats(claims.id, 'totalAnalyses');
      }
    }

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
        authenticated: !!claims?.id
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
    const claims = getClaims(request);
    const { searchParams } = new URL(request.url);
    
    const toolSlug = searchParams.get('toolSlug');
    const period = parseInt(searchParams.get('period') || '30');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!claims?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    let stats;
    
    if (toolSlug) {
      // Get specific tool stats
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - period);
      
      stats = await toolUsageService.getToolUsageStats(toolSlug, startDate);
    } else {
      // Get user's tool usage history
      const usage = await toolUsageService.getUserToolUsage(claims.id, limit);
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