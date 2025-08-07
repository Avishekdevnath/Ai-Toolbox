import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Create a new usage record that matches the ToolUsage model schema
    await db.collection('toolusages').insertOne({
      userId: 'anonymous',
      toolSlug: 'resume-reviewer',
      toolName: 'Resume Reviewer',
      usageType: 'generate',
      metadata: {
        action: 'review_resume',
        timestamp: new Date()
      },
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
} 