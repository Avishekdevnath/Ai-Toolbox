import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';
import { getEnhancedUserId } from '@/lib/userTracking';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    const userId = getEnhancedUserId(request);
    
    // Create a new usage record that matches the ToolUsage model schema
    await db.collection('toolusages').insertOne({
      userId: userId,
      toolSlug: 'swot-analysis',
      toolName: 'SWOT Analysis',
      usageType: 'generate',
      metadata: {
        action: 'generate_swot_analysis',
        timestamp: new Date(),
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
        userAgent: request.headers.get('user-agent') || ''
      },
      userAgent: request.headers.get('user-agent') || '',
      ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, userId });
  } catch (error) {
    console.error('Usage tracking error:', error);
    return NextResponse.json({ success: false });
  }
} 