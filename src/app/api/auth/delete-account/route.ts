import { NextRequest, NextResponse } from 'next/server';
import { getAuthCookie } from '@/lib/auth/cookies';
import { verifyAccessToken } from '@/lib/auth/jwt';
import { getDatabase } from '@/lib/mongodb';

export async function DELETE(request: NextRequest) {
  try {
    const token = await getAuthCookie();
    const claims = token ? verifyAccessToken(token) : null;
    if (!claims) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabase();

    // Delete user auth record
    await db.collection('authusers').deleteOne({ _id: (await import('mongodb')).ObjectId.createFromHexString(claims.id) });

    // Cleanup related collections (best-effort, ignore missing collections)
    try { await db.collection('urls').deleteMany({ userId: claims.id }); } catch {}
    try { await db.collection('toolUsage').deleteMany({ userId: claims.id }); } catch {}

    return NextResponse.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 