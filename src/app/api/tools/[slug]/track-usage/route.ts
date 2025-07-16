import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing tool slug' }, { status: 400 });
  }
  try {
    const client = await connectToDatabase();
    const db = client.db();
    // Find the tool by slug (or name if slug is not available)
    const result = await db.collection('tools').findOneAndUpdate(
      { $or: [ { slug }, { name: { $regex: new RegExp(`^${slug.replace(/-/g, ' ')}$`, 'i') } } ] },
      { $inc: { usage: 1 } },
      { returnDocument: 'after' }
    );
    if (!result.value) {
      return NextResponse.json({ error: 'Tool not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, usage: result.value.usage });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to increment usage' }, { status: 500 });
  }
} 