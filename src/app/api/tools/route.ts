import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

/**
 * GET /api/tools
 * Public endpoint — returns slugs of tools explicitly deactivated by admin.
 * Tools not present in the DB are treated as active (default open).
 */
export async function GET() {
  try {
    const db = await getDatabase();
    const disabled = await db
      .collection('tool_settings')
      .find({ isActive: false })
      .project({ slug: 1, _id: 0 })
      .toArray();

    const disabledSlugs = disabled.map((d: any) => d.slug as string);
    return NextResponse.json({ disabledSlugs });
  } catch (error) {
    console.error('Error fetching tool status:', error);
    return NextResponse.json({ disabledSlugs: [] });
  }
}
