import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getVisitorIdentityModel } from '@/models/VisitorIdentityModel';
import { getPageVisitModel } from '@/models/PageVisitModel';
import { ToolUsage } from '@/models/ToolUsageModel';
import { getFeedbackModel } from '@/models/FeedbackModel';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await AdminAuthService.getAdminSession(request);
  if (!session) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

  try {
    const { id: userId } = await params;

    // Find visitorId for this user (may be null if they never visited before logging in)
    const VisitorIdentity = await getVisitorIdentityModel();
    const identity = await VisitorIdentity.findOne({ userId }).lean();
    const visitorId = identity?.visitorId ?? null;
    const lastSeenAt = identity?.lastSeenAt ?? null;

    // Build query that covers both logged-in and pre-login (anonymous) activity
    const visitQuery = visitorId
      ? { $or: [{ userId }, { visitorId, userId: null }] }
      : { userId };
    const toolQuery = visitorId
      ? { $or: [{ userId }, { visitorId }] }
      : { userId };

    const PageVisit = await getPageVisitModel();
    const Feedback = await getFeedbackModel();

    const [totalVisits, recentPages, toolsUsed, feedbackCount] = await Promise.all([
      PageVisit.countDocuments(visitQuery),
      PageVisit.find(visitQuery).sort({ createdAt: -1 }).limit(20).lean(),
      ToolUsage.aggregate([
        { $match: toolQuery },
        { $group: { _id: '$toolSlug', toolName: { $first: '$toolName' }, count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 20 },
      ]),
      Feedback.countDocuments({ userId }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        lastSeenAt,
        totalVisits,
        recentPages: recentPages.map((p: any) => ({ path: p.path, createdAt: p.createdAt })),
        toolsUsed: toolsUsed.map((t: any) => ({ slug: t._id, name: t.toolName, count: t.count })),
        feedbackCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
