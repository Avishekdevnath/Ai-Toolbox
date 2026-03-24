import { NextRequest, NextResponse } from 'next/server';
import { AdminAuthService } from '@/lib/adminAuthService';
import { getFeedbackModel } from '@/models/FeedbackModel';

export async function GET(request: NextRequest) {
  try {
    const adminSession = await AdminAuthService.getAdminSession(request);
    if (!adminSession) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const skip = parseInt(searchParams.get('skip') || '0');

    const Feedback = await getFeedbackModel();

    const filter: Record<string, string> = {};
    if (type && ['bug', 'feature'].includes(type)) filter.type = type;
    if (status && ['new', 'in_review', 'planned', 'resolved', 'closed'].includes(status)) filter.status = status;

    const [feedback, total] = await Promise.all([
      Feedback.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Feedback.countDocuments(filter),
    ]);

    return NextResponse.json({ feedback, total });
  } catch (error: any) {
    console.error('admin feedback list error:', error);
    return NextResponse.json({ error: 'Failed to fetch feedback' }, { status: 500 });
  }
}
