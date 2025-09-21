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
    const toolSlug = searchParams.get('toolSlug') || undefined;
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '50')));
    const offset = Math.max(0, parseInt(searchParams.get('offset') || '0'));

    const data = toolSlug
      ? await toolUsageService.getUserToolUsageBySlug(claims.id, toolSlug, limit, offset)
      : await toolUsageService.getUserToolUsage(claims.id, limit, offset);

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error fetching user tool usage:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch usage' }, { status: 500 });
  }
}
