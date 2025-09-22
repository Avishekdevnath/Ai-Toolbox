import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { UserSession } from '@/models/UserSessionModel';

export async function POST(req: NextRequest) {
  try {
    await getDatabase();

    const token = req.cookies.get('user_session')?.value;
    const claims = token ? verifyAccessToken(token) : null;
    const userId = claims?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const sessionType = body.sessionType || 'active';

    const doc = new UserSession({
      userId,
      sessionType,
      userAgent: req.headers.get('user-agent') || 'unknown',
      ipAddress: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown'
    });
    await doc.save();

    return NextResponse.json({ success: true, id: doc._id });
  } catch (error) {
    console.error('Auth track error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}


