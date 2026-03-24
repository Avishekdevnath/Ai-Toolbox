import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getVisitorIdentityModel } from '@/models/VisitorIdentityModel';

export async function GET(request: NextRequest) {
  const session = await AdminAuthService.getAdminSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const VisitorIdentity = await getVisitorIdentityModel();
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, anonymousCount, newThisWeek, newThisMonth] = await Promise.all([
      VisitorIdentity.countDocuments(),
      VisitorIdentity.countDocuments({ userId: null }),
      VisitorIdentity.countDocuments({ firstSeenAt: { $gte: weekAgo } }),
      VisitorIdentity.countDocuments({ firstSeenAt: { $gte: monthAgo } }),
    ]);

    const loggedIn = total - anonymousCount;

    return NextResponse.json({
      success: true,
      data: { total, anonymous: anonymousCount, loggedIn, newThisWeek, newThisMonth },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
