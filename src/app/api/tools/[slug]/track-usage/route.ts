import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!slug) {
    return NextResponse.json({ error: 'Missing tool slug' }, { status: 400 });
  }
  
  try {
    const db = await getDatabase();
    
    // Try to find existing tool first
    let existingTool = await db.collection('tools').findOne({ slug });
    
    if (existingTool) {
      // Update existing tool
      await db.collection('tools').updateOne(
        { slug },
        { $inc: { usage: 1 } }
      );
      return NextResponse.json({ success: true, usage: (existingTool.usage || 0) + 1 });
    } else {
      // Create new tool
      const toolName = slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const newTool = {
        name: toolName,
        slug: slug,
        usage: 1,
        createdAt: new Date()
      };
      
      await db.collection('tools').insertOne(newTool);
      return NextResponse.json({ success: true, usage: 1 });
    }
  } catch (e) {
    console.error('Usage tracking error:', e);
    // Don't fail the main request if usage tracking fails
    return NextResponse.json({ success: true, usage: 0 });
  }
} 