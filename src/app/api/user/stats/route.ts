import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';
import { ToolUsage } from '@/models/ToolUsageModel';
import { UserSession } from '@/models/UserSessionModel';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    
    const { searchParams } = new URL(request.url);
    let userId = searchParams.get('userId');

    // Fallback to JWT if userId not provided
    if (!userId) {
      const token = request.cookies.get('user_session')?.value;
      const claims = token ? verifyAccessToken(token) : null;
      if (claims?.id) {
        userId = claims.id;
      }
    }

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch stats and recent activity concurrently with timeout protection
    const [stats, analysisActivity, distinctTools, toolActivity, sessionCounts] = await Promise.all([
      Promise.race([
        (UserAnalysisHistory as any).getUserStats(userId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
      ]),
      Promise.race([
        (UserAnalysisHistory as any).getRecentActivity(userId, 5),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
      ]),
      Promise.race([
        ToolUsage.distinct('toolSlug', { userId }),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
      ]),
      Promise.race([
        (ToolUsage as any).find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
      ]),
      Promise.race([
        (async () => {
          const [logins, sessions] = await Promise.all([
            UserSession.countDocuments({ userId, sessionType: 'login' }),
            UserSession.countDocuments({ userId })
          ]);
          return { logins, sessions };
        })(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Database timeout')), 5000))
      ])
    ]);

    const recentFromAnalyses = Array.isArray(analysisActivity)
      ? analysisActivity.map((a: any) => ({
          id: String(a._id || ''),
          action: a.result?.message || `Used ${a.toolName || a.toolSlug || 'tool'}`,
          tool: a.toolName || a.toolSlug,
          timestamp: (a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt)).toISOString(),
        }))
      : [];

    const recentFromToolUsage = Array.isArray(toolActivity)
      ? toolActivity.map((t: any) => ({
          id: String(t._id || ''),
          action: `Activity: ${t.usageType || 'view'}`,
          tool: t.toolName || t.toolSlug,
          timestamp: (t.createdAt instanceof Date ? t.createdAt : new Date(t.createdAt)).toISOString(),
        }))
      : [];

    // Merge and sort recent activity, dedupe by id
    const mergedActivity = [...recentFromAnalyses, ...recentFromToolUsage]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    const seen = new Set<string>();
    const recentActivity = mergedActivity.filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    }).slice(0, 5);

    return NextResponse.json({
      success: true,
      data: {
        userStats: {
          totalAnalyses: (stats as any)?.totalAnalyses ?? 0,
          totalToolsUsed: Array.isArray(distinctTools) ? distinctTools.length : ((stats as any)?.uniqueTools ?? 0),
          sessionCount: (sessionCounts as any)?.sessions ?? 0,
          loginCount: (sessionCounts as any)?.logins ?? 0,
          providers: [],
          lastActivityAt: (stats as any)?.lastActivityAt ?? null,
          toolsUsed: [],
        },
        recentActivity
      }
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // Return empty data on error - no mock data to avoid showing same data for all users
    return NextResponse.json({
      success: true,
      data: {
        userStats: {
          totalAnalyses: 0,
          totalToolsUsed: 0,
          sessionCount: 0,
          loginCount: 0,
          providers: [],
          lastActivityAt: null,
          toolsUsed: [],
        },
        recentActivity: []
      }
    });
  }
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'Just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} min ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
} 