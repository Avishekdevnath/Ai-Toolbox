import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getFeedbackModel } from '@/models/FeedbackModel';

export async function GET(request: NextRequest) {
  try {
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const Feedback = await getFeedbackModel();

    const [total, bugs, features, newCount, lastWeek] = await Promise.all([
      Feedback.countDocuments(),
      Feedback.countDocuments({ type: 'bug' }),
      Feedback.countDocuments({ type: 'feature' }),
      Feedback.countDocuments({ status: 'new' }),
      Feedback.countDocuments({ createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } }),
    ]);

    return NextResponse.json({ total, bugs, features, new: newCount, lastWeek });
  } catch (error: any) {
    console.error('admin feedback stats error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback stats' }, { status: 500 });
  }
}
