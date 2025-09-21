import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const toolSlug = searchParams.get('toolSlug');
    const limit = parseInt(searchParams.get('limit') || '10');

    let analytics;
    if (toolSlug) {
      analytics = await AnalyticsService.getToolUsageStats(toolSlug);
    } else {
      analytics = await AnalyticsService.getPopularTools(limit);
    }

    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching tool analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch tool analytics' },
      { status: 500 }
    );
  }
} 