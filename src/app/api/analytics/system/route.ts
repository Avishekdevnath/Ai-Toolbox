import { NextRequest, NextResponse } from 'next/server';
import { AnalyticsService } from '@/lib/analyticsService';

export async function GET(request: NextRequest) {
  try {
    const analytics = await AnalyticsService.getSystemAnalytics();
    
    return NextResponse.json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.error('Error fetching system analytics:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch system analytics' },
      { status: 500 }
    );
  }
} 