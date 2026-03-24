import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getPageVisitModel } from '@/models/PageVisitModel';

export async function GET(request: NextRequest) {
  const session = await AdminAuthService.getAdminSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const PageVisit = await getPageVisitModel();
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const countDistinctUsers = async (since: Date) => {
      const result = await PageVisit.aggregate([
        { $match: { userId: { $ne: null }, createdAt: { $gte: since } } },
        { $group: { _id: '$userId' } },
        { $count: 'count' },
      ]);
      return result[0]?.count ?? 0;
    };

    const [dau, wau, mau] = await Promise.all([
      countDistinctUsers(todayStart),
      countDistinctUsers(weekAgo),
      countDistinctUsers(monthAgo),
    ]);

    return NextResponse.json({ success: true, data: { dau, wau, mau } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
