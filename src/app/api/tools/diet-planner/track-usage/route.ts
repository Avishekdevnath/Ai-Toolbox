import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Create a new usage record that matches the ToolUsage model schema
    await db.collection('toolusages').insertOne({
      userId: 'anonymous', // For now, use anonymous since we don't have user auth
      toolSlug: 'diet-planner',
      toolName: 'Diet Planner',
      usageType: 'generate',
      metadata: {
        action: 'generate_diet_plan',
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