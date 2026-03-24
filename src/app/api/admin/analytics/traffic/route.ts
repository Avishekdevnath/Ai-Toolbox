import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getPageVisitModel } from '@/models/PageVisitModel';

export async function GET(request: NextRequest) {
  const session = await AdminAuthService.getAdminSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const PageVisit = await getPageVisitModel();
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [dailyViews, topPages] = await Promise.all([
      PageVisit.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          views: { $sum: 1 },
        }},
        { $sort: { _id: 1 } },
      ]),
      PageVisit.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: { _id: '$path', views: { $sum: 1 } } },
        { $sort: { views: -1 } },
        { $limit: 10 },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        dailyViews: dailyViews.map((d: any) => ({ date: d._id, views: d.views })),
        topPages: topPages.map((p: any) => ({ path: p._id, views: p.views })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
