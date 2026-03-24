import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { ToolUsage } from '@/models/ToolUsageModel';

export async function GET(request: NextRequest) {
  const session = await AdminAuthService.getAdminSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [topTools, dailyTrend] = await Promise.all([
      ToolUsage.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: { _id: '$toolSlug', toolName: { $first: '$toolName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
      ]),
      ToolUsage.aggregate([
        { $match: { createdAt: { $gte: monthAgo } } },
        { $group: {
          _id: { date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, slug: '$toolSlug' },
          count: { $sum: 1 },
        }},
        { $sort: { '_id.date': 1 } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        topTools: topTools.map((t: any) => ({ slug: t._id, name: t.toolName, count: t.count })),
        dailyTrend: dailyTrend.map((d: any) => ({ date: d._id.date, slug: d._id.slug, count: d.count })),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
