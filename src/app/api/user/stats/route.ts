import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { UserAnalysisHistory } from '@/models/UserAnalysisHistoryModel';

export async function GET(request: NextRequest) {
  try {
    await getDatabase();
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user stats with timeout protection
    const stats = await Promise.race([
      UserAnalysisHistory.getUserStats(userId),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Database timeout')), 5000)
      )
    ]);

    return NextResponse.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    
    // Return sample data on error
    return NextResponse.json({
      success: true,
      data: {
        totalAnalyses: 0,
        recentActivity: [],
        popularTools: [],
        averageTime: 0
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