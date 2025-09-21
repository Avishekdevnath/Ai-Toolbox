import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { ToolUsageService } from '@/lib/toolUsageService';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Get user information if authenticated
    let userId: string | null = null;
    const token = request.cookies.get('user_session')?.value;
    if (token) {
      const claims = verifyAccessToken(token);
      if (claims?.id) {
        userId = claims.id;
      }
    }

    // Track general tool usage
    await db.collection('tool_usage').updateOne(
      { toolName: 'swot-analysis' },
      {
        $inc: { usageCount: 1 },
        $set: { lastUsed: new Date() }
      },
      { upsert: true }
    );

    // Track user-specific usage if authenticated
    if (userId) {
      try {
        const toolUsageService = ToolUsageService.getInstance();
        await toolUsageService.trackUsage({
          userId,
          toolSlug: 'swot-analysis',
          toolName: 'SWOT Analysis',
          action: 'generate',
          success: true,
          userAgent: request.headers.get('user-agent') || 'Unknown',
          ipAddress: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                    request.headers.get('x-real-ip') || 'Unknown',
          metadata: {
            timestamp: new Date().toISOString(),
            source: 'api'
          }
        });
      } catch (userTrackingError) {
        // Don't fail the request if user tracking fails
        console.error('User usage tracking failed:', userTrackingError);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
} 