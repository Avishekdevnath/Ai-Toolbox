import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Track age calculator usage
    await db.collection('tool_usage').updateOne(
      { toolName: 'age-calculator' },
      {
        $inc: { usageCount: 1 },
        $set: { lastUsed: new Date() }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
} 