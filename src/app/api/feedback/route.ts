import { NextRequest, NextResponse } from 'next/server';
import { getFeedbackModel } from '@/models/FeedbackModel';
import { getVisitorIdFromRequest } from '@/lib/visitorId';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { rateLimit } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  // Rate limit: 5 submissions per 15 minutes per IP
  // (v1: IP-keyed; visitorId-keyed limiting is a future improvement)
  const limited = rateLimit(request, 5, 15 * 60 * 1000);
  if (limited) return limited;

  try {
    const body = await request.json();
    const { type, title, description, url, userAgent } = body;

    if (!type || !['bug', 'feature'].includes(type)) {
      return NextResponse.json({ error: 'type must be bug or feature' }, { status: 400 });
    }
    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'title is required' }, { status: 400 });
    }
    if (!description || typeof description !== 'string' || !description.trim()) {
      return NextResponse.json({ error: 'description is required' }, { status: 400 });
    }

    const visitorId = getVisitorIdFromRequest(request);

    let userId: string | null = null;
    try {
      const sessionToken = request.cookies.get('user_session')?.value;
      if (sessionToken) {
        const payload = verifyAccessToken(sessionToken);
        userId = payload?.id ?? null;
      }
    } catch {
      // anonymous
    }

    const Feedback = await getFeedbackModel();
    await Feedback.create({
      visitorId: visitorId ?? null,
      userId,
      type,
      title: title.trim().slice(0, 120),
      description: description.trim().slice(0, 1000),
      url: url ?? null,
      userAgent: userAgent ?? null,
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('feedback submit error:', error);
    return NextResponse.json({ error: 'Failed to submit feedback' }, { status: 500 });
  }
}
