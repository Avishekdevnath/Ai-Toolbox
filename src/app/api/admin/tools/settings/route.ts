import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth/jwt';

/**
 * GET /api/admin/tools/settings
 * Returns all tool_settings records so admin can see which are active/inactive.
 */
export async function GET(req: NextRequest) {
  const token = req.cookies.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  if (!claims || (claims.role !== 'admin' && claims.role !== 'super_admin')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const db = await getDatabase();
    const settings = await db.collection('tool_settings').find({}).toArray();
    return NextResponse.json({ settings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
