import { NextRequest, NextResponse } from 'next/server';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { toolUsageService } from '@/lib/toolUsageService';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims?.id) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const toolSlug = searchParams.get('toolSlug');
    if (!toolSlug) {
      return NextResponse.json({ success: false, error: 'toolSlug is required' }, { status: 400 });
    }

    const summary = await toolUsageService.getToolSummary(toolSlug);
    return NextResponse.json({ success: true, data: summary });
  } catch (error: any) {
    console.error('Error fetching tool usage summary:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch summary' }, { status: 500 });
  }
}


