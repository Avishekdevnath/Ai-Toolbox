import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const client = await connectToDatabase();
    const db = client.db();
    // Find the SWOT tool by name (or use a unique identifier if available)
    const result = await db.collection('tools').findOneAndUpdate(
      { name: 'SWOT Analysis' },
      { $inc: { usage: 1 } },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return NextResponse.json({ error: 'SWOT tool not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, usage: result.value.usage });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 });
  }
} 