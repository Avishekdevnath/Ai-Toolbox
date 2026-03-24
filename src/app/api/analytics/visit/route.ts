import { NextRequest, NextResponse } from 'next/server';
import { getPageVisitModel } from '@/models/PageVisitModel';
import { getVisitorIdentityModel } from '@/models/VisitorIdentityModel';
import { getVisitorIdFromRequest } from '@/lib/visitorId';
import { verifyAccessToken } from '@/lib/auth/jwt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { path, referrer, userAgent } = body;

    if (!path) {
      return NextResponse.json({ success: false, error: 'path is required' }, { status: 400 });
    }

    const visitorId = getVisitorIdFromRequest(request);
    if (!visitorId) {
      // No cookie yet — middleware hasn't run or cookie was blocked. Skip tracking.
      return NextResponse.json({ success: true });
    }

    // Resolve userId from session cookie if present
    let userId: string | null = null;
    try {
      const sessionToken = request.cookies.get('user_session')?.value;
      if (sessionToken) {
        const payload = verifyAccessToken(sessionToken);
        userId = payload?.id ?? null;
      }
    } catch {
      // Token invalid or expired — treat as anonymous
    }

    const now = new Date();
    const [PageVisit, VisitorIdentity] = await Promise.all([
      getPageVisitModel(),
      getVisitorIdentityModel(),
    ]);

    await Promise.all([
      PageVisit.create({ visitorId, userId, path, referrer: referrer ?? null, userAgent: userAgent ?? '' }),
      VisitorIdentity.findOneAndUpdate(
        { visitorId },
        { $set: { lastSeenAt: now }, $setOnInsert: { firstSeenAt: now, userId } },
        { upsert: true }
      ),
    ]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('visit tracking error:', error);
    return NextResponse.json({ success: true }); // Never fail the client for analytics
  }
}
