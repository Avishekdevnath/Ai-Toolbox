import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { verifyAccessToken } from '@/lib/auth/jwt';

function isAdmin(req: NextRequest) {
  const token = req.cookies.get('user_session')?.value;
  const claims = token ? verifyAccessToken(token) : null;
  return claims?.role === 'admin' || claims?.role === 'super_admin' ? claims : null;
}

/**
 * PATCH /api/admin/tools/[id]/toggle
 * Toggles isActive on a tool in the tool_settings collection.
 * The slug is used as the stable identifier (tools are static-data based).
 * Body: { slug: string, isActive: boolean }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const claims = isAdmin(req);
  if (!claims) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  try {
    const { slug, isActive } = await req.json();
    if (!slug || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing slug or isActive' }, { status: 400 });
    }

    const db = await getDatabase();
    await db.collection('tool_settings').updateOne(
      { slug },
      {
        $set: { slug, isActive, updatedAt: new Date(), updatedBy: claims.id },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, slug, isActive });
  } catch (error) {
    console.error('Toggle tool error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
